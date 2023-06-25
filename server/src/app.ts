import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import WebSocket, { Server as WebSocketServer } from "ws";
import axios from "axios";
import { OpenAIRequest } from "./openAIChatRequest";
import { WorldState } from "./prompts";
import { formatActionsToString } from "./utils";
import { server_port } from "./constants";

const app = express();

app.use(bodyParser.json());

app.listen(server_port, () =>
  console.log(`AgentWorld server listening on port ${server_port}!`)
);

interface User {
  name: string;
  url: string;
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

  users.push({ name, url });

  if (users.length === 2) {
    startGame();
  }

  res.status(200).json({ message: "Joined successfully." });
});

const wss = new WebSocketServer({ port: 8080 });

const broadcast = (message: string) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const startGame = async () => {
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

        broadcast(`${user.name}: ${response.data.action}`);

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
              )}\n\nRespond with relevant json data regarding the state of the world.`,
            },
          ],
        });
        broadcast(`Server: ${serverResponse}`);
        actions.push({ user: "server", action: serverResponse });
        if (actions.length > 20) {
          actions.shift(); // Keep the array size to a maximum of 20 elements
        }
      } catch (error) {
        users.splice(i, 1);
        i--;
        console.log(`User ${user.name} has died.`);
        broadcast(`User ${user.name} has died.`);
      }
    }
  }
  console.log("Game over.");
};

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});
