import WebSocket from "ws";
import { BroadcastMessage } from "../server/lib/websocketManager";
import config from "./config.json";


const ws = new WebSocket(`ws://${config.server_url}`);

ws.on("open", () => {
  console.log("Connected to the WebSocket server.");
});

ws.on("message", (message: string) => {
  // convert string to json object of type BroadcastMessage
  const broadcastMessage: BroadcastMessage = JSON.parse(message);
  console.log(`${broadcastMessage.name}: ${broadcastMessage.message}`);
});

ws.on("error", (error: Error) => {
  console.error(`WebSocket error: ${error.message}`);
});

ws.on("close", () => {
  console.log("Disconnected from the WebSocket server.");
});
