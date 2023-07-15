import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { OpenAIRequest, createMessagesArray } from "../../lib/utils";
import {
  server_port,
  network_url,
  MAX_RETRIES,
  MAX_RESPONSE_TOKENS,
} from "../../lib/constants";
import { ChatMessages } from "../../lib/types";
import { Agent4SystemPrompt } from "../prompts";

const app: Express = express();
const port: number = 3114;

app.use(bodyParser.json());

let actionLog: string[] = [];
let gameLog: string[] = [];
let summary: string = "";
let messages: ChatMessages = [];

app.post("/chat/", async (req: Request, res: Response) => {
  gameLog.push(req.body.actionRequest);

  ({ messages, summary, gameLog, actionLog } = await createMessagesArray(
    Agent4SystemPrompt,
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
      name: "Elara Moonshade",
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
