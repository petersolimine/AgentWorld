import axios, { AxiosError } from "axios";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

/*
This function will take 2 params. 
1. The collection name
2. Bool value to reset the collection or not
returns a client
*/
export const initChroma = async (
  collection_names: string[],
  reset: boolean
) => {
  const client = new ChromaClient();

  if (reset) await client.reset();

  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY || "",
  });

  // iterate through each
  for (let collection_name of collection_names) {
    try {
      await client.createCollection({
        name: collection_name,
        embeddingFunction: embedder,
      });
      console.log("Collection created: ", collection_name);
    } catch (e) {
      console.log("Collection already exists: ", collection_name);
    }
  }
  return client;
};

export function formatActionsToString(
  actionsArray: Array<{ user: string; action: any }>
): string {
  return actionsArray.map((item) => `${item.user}: ${item.action}`).join("\n");
}

// lib/OpenAIRequest.ts
export interface OpenAIRequestPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
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
