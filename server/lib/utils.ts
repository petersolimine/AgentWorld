import axios, { AxiosError } from "axios";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

export function formatActionsToString(
  actionsArray: Array<{ user: string; action: any }>
): string {
  if (actionsArray.length === 0) return "";
  return actionsArray.map((item) => `${item.user}: ${item.action}`).join("\n");
}

// lib/OpenAIRequest.ts
export interface OpenAIRequestPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
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
    console.log(text);
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
