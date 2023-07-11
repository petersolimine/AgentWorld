import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { OpenAIRequest, delay } from "../lib/utils";
import {
  GenerateRequestNextActionPrompt,
  WorldState,
  WorldStatePreamble,
} from "./prompts";
import {
  server_port,
  colors,
  WORLD_STATE_COLLECTION_NAME,
  ACTIONS_COLLECTION_NAME,
  MAX_RESPONSE_TOKENS,
  RESET_CHROMA_ON_START
} from "../lib/constants";
import {
  initChroma,
  initializeWorldState,
  embedder,
} from "../lib/ChromaHelpers";
import { broadcast, clients } from "../lib/WebsocketManager";
import {
  findAndUpdateWorldInformation,
  getStateOfTheWorld,
} from "../lib/StateManager";

const app = express();

app.use(bodyParser.json());

app.listen(server_port, () =>
  console.log(`AgentWorld server listening on port ${server_port}!`)
);

interface User {
  name: string;
  url: string;
  color: string;
}

const users: User[] = [];
const actions: { user: string; action: any }[] = [];

function getPreviousAction(user: User): string {
  for (let j = actions.length - 1; j >= 0; j--) {
    if (actions[j].user === user.name) {
      return actions[j].action;
    }
  }
  return ``;
}

function getOtherPlayersActions(user: User): string {
  let otherPlayersActions = "";
  let counter = 0;
  for (let j = actions.length - 1; j >= 0; j--) {
    if (actions[j].user !== user.name) {
      otherPlayersActions += `${actions[j].user}: ${actions[j].action}\n`;
      counter++;
      if (counter >= users.length) {
        break;
      }
    } else {
      break;
    }
  }
  return otherPlayersActions;
}

app.post("/join", (req: Request, res: Response) => {
  const { name, url } = req.body;

  if (users.find((user) => user.name === name || user.url === url)) {
    return res.status(400).json({ error: "Name or URL is already in use." });
  }

  if (users.length >= 10) {
    return res.status(400).json({ error: "Server is full, cannot join." });
  }

  users.push({ name, url, color: colors[users.length - 1] });
  console.log(`assigned color ${colors[users.length - 1]} to ${name}`);

  broadcast({
    is_server: true,
    name: "",
    message: `${name} has joined the game.`,
    color: colors[users.length - 1],
  });

  if (users.length === 2) {
    startGame();
  }

  res.status(200).json({ message: "Joined successfully." });
});

const startGame = async () => {
  // delay 20 seconds so that docker-compose can finish building
  broadcast({
    is_server: true,
    name: "",
    message: `Starting game in 30 seconds...`,
    color: "red",
  });
  await delay(30000);
  // initialize chroma with the collection names that we will use (return value is a client)
  const chroma_client = await initChroma(
    [WORLD_STATE_COLLECTION_NAME, "actions"],
    RESET_CHROMA_ON_START
  );

  const actions_collection = await chroma_client.getCollection({
    name: ACTIONS_COLLECTION_NAME,
    embeddingFunction: embedder,
  });
  const world_collection = await chroma_client.getCollection({
    name: WORLD_STATE_COLLECTION_NAME,
    embeddingFunction: embedder,
  });

  broadcast({
    is_server: true,
    name: "",
    message: `Initializing worldstate in chromadb...`,
    color: "red",
  });

  // for every item in WorldState, insert it into the 'world' collection
  await initializeWorldState(
    chroma_client,
    WORLD_STATE_COLLECTION_NAME,
    WorldState
  );

  let counter = 0;
  while (users.length > 1) {
    for (let i = 0; i < users.length; i++) {
      counter += 1;
      const user = users[i];

      const previous_action: string = getPreviousAction(user);
      const other_actions: string = getOtherPlayersActions(user);

      // calculate available tokens in prompt (8k limit - 500 for the preamble, 1000 for response, - 1 token per 4 chars in other injected strings)
      // there is some noise here, for example the character name, so we will just estimate and leave some buffer
      const available_tokens =
        7000 - previous_action.length / 4 - other_actions.length / 4 - 500;

      const world_state = await getStateOfTheWorld({
        available_tokens: available_tokens,
        query_text: previous_action + "\n" + other_actions,
        collection: world_collection,
        num_results: 20,
      });

      broadcast({
        is_server: true,
        name: "",
        message: `Composing prompt for ${user.name}...`,
        color: user.color,
      });

      // Assemble the prompt to send to the player
      const request_action_prompt = GenerateRequestNextActionPrompt(
        user.name,
        previous_action,
        other_actions,
        world_state
      );

      // use the prompt:
      const actionRequest = await OpenAIRequest({
        model: "gpt-4",
        messages: [
          { role: "system", content: WorldStatePreamble },
          {
            role: "user",
            content: request_action_prompt,
          },
        ],
        max_tokens: MAX_RESPONSE_TOKENS,
        temperature: 0.5,
      });

      broadcast({
        is_server: true,
        name: "",
        message: `Requesting action from ${user.name}...\n ${actionRequest}`,
        color: user.color,
      });

      try {
        const response = await axios.post(
          user.url,
          { actionRequest },
          { timeout: 90000 }
        );
        actions.push({ user: user.name, action: response.data.action });

        broadcast({
          is_server: false,
          message: response.data.action,
          name: user.name,
          color: user.color,
        });

        // add action to chromadb
        broadcast({
          is_server: true,
          name: "",
          message: `adding action from ${user.name} to ChromaDB actions collection...`,
          color: user.color,
        });
        await actions_collection.add({
          ids: [counter.toString()],
          metadatas: [{ user: user.name }],
          documents: [response.data.action],
        });

        broadcast({
          is_server: true,
          name: "",
          message: `Finding and updating world state elements from ChromaDB world collection...`,
          color: user.color,
        });

        // update world state if necessary
        await findAndUpdateWorldInformation({
          collection: world_collection,
          recentAction: `${user.name}: ${response.data.action}`
        });

        if (actions.length > 100) {
          actions.shift(); // Keep the array size to a maximum of 100 elements
        }
      } catch (error) {
        users.splice(i, 1);
        i--;
        console.log("NOT DEAD: ", error);
        console.log(`User ${user.name} has died.`);
        broadcast({
          is_server: true,
          message: `User ${user.name} has died.`,
          name: "Server",
          color: "red",
        });
      }
    }
  }
  console.log("Game over.");
};
