import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import WebSocket, { Server as WebSocketServer } from "ws";
import axios from "axios";
import { OpenAIRequest } from "../lib/utils";
import { WorldState } from "./prompts";
import { formatActionsToString } from "../lib/utils";
import { server_port, colors } from "../lib/constants";
import { initChroma } from "../lib/utils";

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

const clients = new Set<WebSocket>();
const users: User[] = [];
const actions: { user: string; action: any }[] = [];

app.post("/join", (req: Request, res: Response) => {
  const { name, url } = req.body;

  if (users.find((user) => user.name === name || user.url === url)) {
    return res.status(400).json({ error: "Name or URL is already in use." });
  }

  if (users.length >= 10) {
    return res.status(400).json({ error: "Server is full, cannot join." });
  }

  // get a random color

  users.push({ name, url, color: colors[users.length - 1] });
  console.log(`assigned color ${colors[users.length - 1]} to ${name}`);

  if (users.length === 2) {
    startGame();
  }

  res.status(200).json({ message: "Joined successfully." });
});

const wss = new WebSocketServer({ port: 8080 });

type broadcastMessage = {
  message: string;
  name: string;
  color: string;
};

const broadcast = (info: broadcastMessage) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          message: info.message,
          name: info.name,
          color: info.color,
        })
      );
    }
  });
};

const startGame = async () => {
  // initialize chroma with the collection names that we will use (return value is a client)
  const chroma_client = await initChroma(["world", "all_moves"], false);

  while (users.length > 1) {
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        const response = await axios.post(
          user.url,
          { actions },
          { timeout: 15000 }
        );
        actions.push({ user: user.name, action: response.data.action });
        if (actions.length > 20) {
          actions.shift(); // Keep the array size to a maximum of 20 elements
        }

        broadcast({
          message: response.data.action,
          name: user.name,
          color: user.color,
        });

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

        if (actions.length > 20) {
          actions.shift(); // Keep the array size to a maximum of 20 elements
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

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});
