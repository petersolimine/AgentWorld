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

      // create a collection of information that should be shared with the user
      // 1. The relevant elements of the world state
      // 2. The actions of previous users IF relevant
      // we will not send the user's own actions to them, because they should know what they did

      // first, ask if any of the actions are relevant to the user (i.e. if they are in the same room)
      // before doing that, we need to know where the user is
      // we can retrieve that from their last move
      // so maybe we start by querying world state with the agents last move,
      // then, we use that information + the list of new actions to construct a prompt to the Server:
      /* "Here is the past action that a user took: {last_action}. Relevant information about the virtual world: {relevant information}, 
        With that in mind, summarize the most recent actions that other user's have taken. The summary will be given to the user, 
        so you must NOT include information that is irrelevant. Only include information that is directly relevant to the user, 
        such as if someone interacted with an object or said something directly to the user. Your output should be a concise summary in the format of a story."*/
      // Once we have the summary, feed it to the user and await the response.
      /*
        Once the user replies:
        1. Embed the user's response.
        2. Query the world_state collection for most relevant items, locations, etc
        3. Construct a prompt with those and the user action, i.e. :
        Here is the action that the user took. Here is some relavant information below. Which, if any, of these items, locations, or places needs to be updated based on the user's action?
        // this should probably be a formatted output with OpenAI functions.
        Parse the response, update the necessary items.
        */

      /*
        ACTIONABLE GAME PLAN:
        ____________
        STEP 0: Embed the state of the world
        DONE?
        -------------
        STEP 1: <insert preamble>
        Here is <CHARACTER>'s previous action: <INSERT PREV ACTION> 
        and here's a list of every action that has been taken since. <INSERT LIST>
        Review the list for information that is relevant to <CHARACTER>. Consider the current state of the world, and only provide a summary of 
        of things that are directly relevant to <CHARACTER>. Write the summary as if the actions are unfolding, in the order that they happened 
        (e.g. "Player1 began running at you, but Player2 stopped them. Moments later, Player5 shouted 'lorem ipsum'").
        This summary will be provided to the character as their perspective on the world. Do not include information that does not pertain to <CHARACTER>. 
        Here is some potentially important information about the state of the world. You can use this information help determine what might be relevant:

        <insert state of the world, queried from the character's previous action> <trim this list based on context length>
        
        Now, write the summary for <CHARACTER>
        DONE?
        -------------

        From the above, we now have a concise summary of past actions. 

        OPTIONAL STEP 1.5: Run a query to get more world information that would be useful to the user. 
        -------------

        STEP 2: Pass the summary to the agent, await a response.
        DONE

        -------------

        STEP 3: When the response is received:
                3A:  Store it in the actions array
                DONE?
                3B:  Query Chroma for relevant items, locations, etc 
                3C:  MAKE FUNCTION CALL with UPSERT

        REPEAT

        */

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
        temperature: 0.8,
      });

      broadcast({
        message: `${actionRequest}`,
        name: `ACTION REQUEST TO ${user.name}:`,
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
