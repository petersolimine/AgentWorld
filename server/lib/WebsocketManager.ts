import WebSocket, { Server as WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
export const clients = new Set<WebSocket>();

type broadcastMessage = {
  message: string;
  name: string;
  color: string;
};

export const broadcast = (info: broadcastMessage) => {
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

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});
