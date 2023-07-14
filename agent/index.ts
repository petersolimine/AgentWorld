import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import ngrok from "ngrok";
import { OpenAIRequest, createMessagesArray } from "../server/lib/Utils";
import {
  network_url,
  MAX_RETRIES,
  MAX_RESPONSE_TOKENS,
} from "../server/lib/Constants";
import { ChatMessages } from "../server/lib/Types";
import config from "./config.json";

const app: Express = express();
const port: number = config.port;

app.use(bodyParser.json());

let actionLog: string[] = [];
let gameLog: string[] = [];
let summary: string = "";
let messages: ChatMessages = [];

app.post("/chat/", async (req: Request, res: Response) => {
  gameLog.push(req.body.actionRequest);
  console.log('Message Received from Game Engine:', req.body.actionRequest);

  ({ messages, summary, gameLog, actionLog } = await createMessagesArray(
    config.character_description,
    gameLog,
    actionLog,
    summary
  ));

  const text = await OpenAIRequest({
    model: "gpt-4",
    messages,
    max_tokens: MAX_RESPONSE_TOKENS,
    temperature: 1,
  });

  actionLog.push(text);
  res.status(200).json({ action: text });
});

try{
  app.listen(port, () => console.log(`Agent listening on port ${port}!`));
} catch (e: any) {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${port} is in use, edit the value of "port" in config.json and retry.`);
  } else {
    console.log(e);
  }
}

const serverUrl: string = config.server_url

let retries = 0;

const joinServer = (chatUrl: string) => {
  axios
    .post(`${serverUrl}/join`, {
      name: config.character_name,
      url: chatUrl,
    })
    .then((res) => console.log(res.data))
    .catch((error) => {
      console.error(
        `Failed to join server: ${
          error.response && error.response.data
            ? error.response.data.error
            : error
        }`
      );

      if (retries < MAX_RETRIES) {
        retries++;
        setTimeout(() => joinServer(chatUrl), 10000); // Retry after 10 seconds
      }
    });
};

(async () => {
  let url;
  if (config.external_server) {
    url = await ngrok.connect(port);
  } else {
    url = `http://${network_url}:${port}`;
  }
  console.log('agent URL:', url)
  joinServer(`${url}/chat/`);
})();
