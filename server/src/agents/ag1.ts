import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { OpenAIRequest } from "../../lib/utils";
import { Agent1SystemPrompt } from "../prompts";
import { formatActionsToString } from "../../lib/utils";
import {
  server_port,
  network_url,
  MAX_RETRIES,
  MAX_RESPONSE_TOKENS,
} from "../../lib/constants";

const app: Express = express();
const port: number = 3111;

app.use(bodyParser.json());

app.post("/chat/", async (req: Request, res: Response) => {
  // make a chat request to OpenAI with the information about state of the world
  // and the action that the other agent took

  const text = await OpenAIRequest({
    model: "gpt-4",
    messages: [
      { role: "system", content: Agent1SystemPrompt },
      {
        role: "user",
        content:
          "Here is the context of your current situation. Use it to briefly describe your next action in the first person:\n" +
          req.body.request_action_prompt,
      },
    ],
    max_tokens: MAX_RESPONSE_TOKENS,
    temperature: 1,
  });
  res.status(200).json({ action: text });
});

app.listen(port, () => console.log(`Agent listening on port ${port}!`));

const serverUrl: string = `http://${network_url}:${server_port}`;

let retries = 0;

const joinServer = () => {
  axios
    .post(`${serverUrl}/join`, {
      name: "Thalos The Mystic",
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
