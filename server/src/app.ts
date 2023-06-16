import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import WebSocket, { Server as WebSocketServer } from "ws";
import axios from "axios";
import Deque from "collections/deque";

const app = express();
const port = 3123;

app.use(bodyParser.json());

app.listen(port, () =>
  console.log(`AgentWorld server listening on port ${port}!`)
);

interface User {
  name: string;
  url: string;
}

const clients = new Set<WebSocket>();
const users: User[] = [];
const actions = new Deque<{ user: string; action: any }>([], 20);

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
          { actions: actions.toArray() },
          { timeout: 15000 }
        );
        actions.push({ user: user.name, action: response.data.action });

        console.log(
          `Received action from ${user.name}: ${response.data.action}`
        );
        process.stdout.write("Enter response to the action: ");

        const serverResponse = await new Promise<string>((resolve) => {
          const listener = (data: Buffer) => {
            process.stdin.removeListener("data", listener);
            resolve(data.toString().trim());
          };
          process.stdin.addListener("data", listener);
        });

        broadcast(
          `Action: ${response.data.action} | Server Response: ${serverResponse}`
        );
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
