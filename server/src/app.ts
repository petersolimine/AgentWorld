import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { OpenAIRequest, delay } from "../lib/utils";
import {
  GenerateRequestNextActionPrompt,
  WorldState,
  WorldStatePreamble,
} from "./prompts";
import { formatActionsToString } from "../lib/utils";
import { server_port, colors } from "../lib/constants";
import {
  initChroma,
  initializeWorldState,
  embedder,
} from "../lib/ChromaHelpers";
import { broadcast, clients } from "../lib/WebsocketManager";
import { findAndUpdateWorldInformation } from "../lib/StateManager";
import { QueryResponse } from "chromadb/dist/main/types";

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

function getPreviousAction(user: User) {
  for (let j = actions.length - 1; j >= 0; j--) {
    if (actions[j].user === user.name) {
      return actions[j].action;
    }
  }
  return `User ${user.name} has not made any actions yet.`;
}

function getOtherPlayersActions(user: User) {
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

  if (users.length === 2) {
    startGame();
  }

  res.status(200).json({ message: "Joined successfully." });
});

const startGame = async () => {
  // delay 20 seconds so that docker-compose can finish building
  console.log("Starting game in 30 seconds...");
  await delay(30000);
  // initialize chroma with the collection names that we will use (return value is a client)
  const chroma_client = await initChroma(["world", "actions"], true);

  const actions_collection = await chroma_client.getCollection({
    name: "actions",
    embeddingFunction: embedder,
  });
  const world_collection = await chroma_client.getCollection({
    name: "world",
    embeddingFunction: embedder,
  });

  // for every item in WorldState, insert it into the 'world' collection
  await initializeWorldState(chroma_client, "world", WorldState);

  let counter = 0;
  while (users.length > 1) {
    for (let i = 0; i < users.length; i++) {
      counter += 1;
      const user = users[i];

      // Assemble the prompt to send to the player
      const request_action_prompt = GenerateRequestNextActionPrompt(
        user.name,
        getPreviousAction(user),
        getOtherPlayersActions(user)
      );
      console.log(`request_action_prompt: ${request_action_prompt}`);

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
        max_tokens: 150,
        temperature: 0.5,
      });

      broadcast({
        message: `${actionRequest}`,
        name: `ACTION REQUEST TO ${user.name}`,
        color: "rgba(175, 179, 153, 0.6)",
      });

      try {
        const response = await axios.post(
          user.url,
          { actionRequest },
          { timeout: 15000 }
        );
        actions.push({ user: user.name, action: response.data.action });

        // add action to chromadb
        await actions_collection.add({
          ids: [counter.toString()],
          metadatas: [{ user: user.name }],
          documents: [response.data.action],
        });

        // get relevant worldstate items from chromadb
        const relevantWorldStateQueryResult = await world_collection.query({
          // here we retrieve 50 items. They are filtered in StateManager if this proves to be too long.
          nResults: 50,
          queryTexts: [response.data.action],
        });

        // update world state if necessary
        await findAndUpdateWorldInformation({
          worldStateIds: relevantWorldStateQueryResult.ids[0],
          worldStateDocuments: relevantWorldStateQueryResult.documents[0],
          recentAction: response.data.action,
        });

        if (actions.length > 100) {
          actions.shift(); // Keep the array size to a maximum of 100 elements
        }

        broadcast({
          message: response.data.action,
          name: user.name,
          color: user.color,
        });

        // NOW: UPDATE WORLD ACCORDINGLY!!

        /*

        const serverResponse = await OpenAIRequest({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: WorldState },
            {
              role: "user",
              content: `Received action from ${user.name}: ${
                response.data.action
              }. Here is information about previous actions, which may be relevant:\n${formatActionsToString(
                actions
              )}\n\nRespond to the player with information about the result of their action.`,
            },
          ],
        });

        broadcast({
          message: serverResponse,
          name: "Server",
          color: "rgba(175, 179, 153, 0.6)",
        });

        actions.push({ user: "server", action: serverResponse });

        */

        if (actions.length > 100) {
          actions.shift(); // Keep the array size to a maximum of 100 elements
        }
      } catch (error) {
        users.splice(i, 1);
        i--;
        console.log(`User ${user.name} has died.`);
        broadcast({
          message: `User ${user.name} has died.`,
          name: "Server",
          color: "rgba(175, 179, 153, 0.6)",
        });
      }
    }
  }
  console.log("Game over.");
};
