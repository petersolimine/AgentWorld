import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
  console.log("Connected to the WebSocket server.");
});

ws.on("message", (message: string) => {
  console.log(`Received broadcasted message: ${message}`);
});

ws.on("error", (error: Error) => {
  console.error(`WebSocket error: ${error.message}`);
});

ws.on("close", () => {
  console.log("Disconnected from the WebSocket server.");
});
