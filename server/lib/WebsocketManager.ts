import WebSocket, { Server as WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });
export const clients = new Set<WebSocket>();

type broadcastMessage = {
  message: string;
  name: string;
  color: string;
  is_server: boolean;
};

export const broadcast = (info: broadcastMessage) => {
  console.log('broadcasting, is_server: ', info.is_server);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          message: info.message,
          name: info.name,
          color: info.color,
          is_server: info.is_server,
        })
      );
    }
  });
};

wss.on("connection", (ws: WebSocket) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});
