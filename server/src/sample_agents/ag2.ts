import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { OpenAIRequest, createMessagesArray } from "../../lib/Utils";
import {
  server_port,
  network_url,
  MAX_RETRIES,
  MAX_RESPONSE_TOKENS,
} from "../../lib/Constants";
import { ChatMessages } from "../../lib/Types";
import { Agent2SystemPrompt } from "../Prompts";

const app: Express = express();
const port: number = 3112;

app.use(bodyParser.json());

let actionLog: string[] = [];
let gameLog: string[] = [];
let summary: string = "";
let messages: ChatMessages = [];

app.post("/chat/", async (req: Request, res: Response) => {
  gameLog.push(req.body.actionRequest);

  ({ messages, summary, gameLog, actionLog } = await createMessagesArray(
    Agent2SystemPrompt,
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

app.listen(port, () => console.log(`Agent listening on port ${port}!`));

const serverUrl: string = `http://${network_url}:${server_port}`;

let retries = 0;

const joinServer = () => {
  axios
    .post(`${serverUrl}/join`, {
      name: "Morgana Blackstone",
      url: `http://${network_url}:${port}/chat/`,
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
        setTimeout(joinServer, 10000); // Retry after 10 seconds
      }
    });
};

joinServer();
