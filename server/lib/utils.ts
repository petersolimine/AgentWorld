import axios, { AxiosError } from "axios";
import { MAX_RESPONSE_TOKENS } from "./constants";
import { ChatMessages } from "./types";

import dotenv from "dotenv";
dotenv.config();

const SUMMARY_PREAMBLE =
  "Below is a summary of everything that has happened in the past, for context\n";

export const createMessagesArray = async (
  systemPrompt: string,
  gameLog: string[],
  actionLog: string[],
  summary: string
) => {
  const messages = [{ role: "system", content: systemPrompt }];
  const summary_to_insert =
    summary.length > 1 ? summary + "\n" : "No previous events.";

  if (messages.length > 0) {
    messages.push({
      role: "user",
      content: SUMMARY_PREAMBLE + summary_to_insert,
    });
  }
  const MAX_TOKEN_ALLOCATION = 7000 - MAX_RESPONSE_TOKENS - summary.length * 4;

  for (let i = 0; i < gameLog.length; i++) {
    messages.push({ role: "user", content: gameLog[i] });
    if (actionLog[i]) {
      messages.push({ role: "assistant", content: actionLog[i] });
    }
  }

  if (totalMessagesLength(messages) > MAX_TOKEN_ALLOCATION * 4) {
    console.log(
      "total messages length (in chars): ",
      totalMessagesLength(messages),
      "> max token allocation of",
      MAX_TOKEN_ALLOCATION * 4
    );
    // Need to start removing messages from the beginning of the array and adding them to the summary
    // start from index 2, because index 0 is the system prompt and index 1 is the summary
    let i = 2;
    let combined_removed = "";
    while (totalMessagesLength(messages) > MAX_TOKEN_ALLOCATION * 4) {
      const game_log = messages[i].content;
      let action_log = ""; // Default to empty string if not exist
      if (messages[i + 1]) {
        // Check if message[i + 1] exist
        action_log = messages[i + 1].content;
      }
      combined_removed += game_log + "\n" + action_log + "\n\n";
      messages.splice(i, 2);
      // remove from the gameLog or actionLog array
      gameLog.shift();
      if (actionLog.length > 0) {
        // Check if actionLog has elements before shifting
        actionLog.shift();
      }
      i += 2;
    }
    // get the new summary
    summary = await updateSummary(summary, combined_removed);
    // update the messages array
    messages[1].content = SUMMARY_PREAMBLE + summary;
  }

  return { messages, summary, gameLog, actionLog };
};

const updateSummary = async (
  summary: string,
  removed: string
): Promise<string> => {
  const summary_preamble =
    summary.length > 0
      ? "Your job is to update the below summary based on the recent events that have transpired. Here is the summary you will update:\n" +
        summary
      : "Your job is to write a summary of the below events that have transpired:";
  const messages = [
    {
      role: "system",
      content:
        "You are an advanced AI that writes and updates summaries. You take two inputs, a summary and a list of dialogue that may have an impact on the summary. Your job is to look at the recent dialogue, and update the summary accordingly. To do so, you must respond with the entire summary and with no other output. Do not produce any output other than the updated summary. It should read very similar to the original summary that you received.",
    },
    {
      role: "user",
      content:
        summary_preamble +
        "\n\n" +
        "Below is the recent dialogue that you must include in the summary. Include information that seems important, and leave out information that seems unimportant. The updated summary should be roughly the same length as the original. Dialogue:\n" +
        removed,
    },
  ];
  // TODO remove. Just make sure this works first
  console.log(
    "Updating summary, prompt:\n",
    messages[1].content
  );
  return await OpenAIRequest({
    model: "gpt-4",
    messages,
    max_tokens: 1000,
    temperature: 0.4,
  });
};

const totalMessagesLength = (messages: ChatMessages): number => {
  return messages.reduce((acc, message) => acc + message.content.length, 0);
};

// lib/OpenAIRequest.ts
export interface OpenAIRequestPayload {
  model: string;
  messages: ChatMessages;
  max_tokens?: number;
  temperature?: number;
}

export async function OpenAIRequest(payload: OpenAIRequestPayload) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
      }
    );

    const data = res.data;
    const text = data.choices[0].message.content;
    // console.log(text);
    return text;
  } catch (error) {
    const axiosError = error as AxiosError;
    // log the error response
    console.log(axiosError.response);
    // convert the response to a string and throw an error
    throw new Error(
      `Error in OpenAI API request: ${axiosError.response?.data}`
    );
  }
}

// used for blocking JS threads so that docker can build
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
