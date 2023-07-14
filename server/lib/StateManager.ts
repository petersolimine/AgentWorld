import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { FunctionRequestPreamble } from "../src/Prompts";
import { retrieveCollection } from "./ChromaHelpers";
import { WORLD_STATE_COLLECTION_NAME } from "./Constants";
import { ChatMessages } from "./Types";
import { Collection } from "chromadb";
import { broadcast } from "./WebsocketManager";
import axiosRetry from 'axios-retry';

// Add retry logic to axios
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay, 
  retryCondition: (error: AxiosError) => error.response?.status === 502, 
  onRetry: (retryCount: number, error: AxiosError) => {
    console.error(`Retrying OpenAI API request due to error: ${error}. Retry count: ${retryCount}`);
  }
});

dotenv.config();

interface FunctionArgs {
  item: string;
  new_value: string;
}

export async function updateDatabase({ item, new_value }: FunctionArgs) {
  if (!new_value) return;
  // start a timer to see how long each step takes
  const start = Date.now();
  try {
    let collection = await retrieveCollection(WORLD_STATE_COLLECTION_NAME);
    // using upsert here means that it's possible to add new items to the collection if they don't already exist
    await collection.upsert({
      ids: [item],
      documents: [new_value],
    });
  } catch (e) {
    // may not want to ignore this, we'll see
    // @ts-ignore
  }

  broadcast({
    is_server: true,
    name: "$",
    message: `Update ${item} with new value: ${new_value}`,
    color: "green",
  });

}

export async function addToDatabase({ item, new_value }: FunctionArgs) {
  const start = Date.now();
  try {
    let collection = await retrieveCollection(WORLD_STATE_COLLECTION_NAME);
    // we don't use upsert here because it means the model didn't have the right context, so we want to fail rather than overwrite an existing item
    await collection.add({
      ids: [item],
      documents: [new_value],
    });

  } catch (e) {
  }

  broadcast({
    is_server: true,
    name: "$",
    message: `Add ${item} with value: ${new_value}`,
    color: "green",
  });
}

export interface OpenAIFuncRequestPayload {
  model: string;
  messages: ChatMessages;
  functions?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  function_call?: string;
}

export async function OpenAIFuncRequest(
  payload: OpenAIFuncRequestPayload,
  maxDepth: number = 15 // Add a maximum depth to prevent infinite recursion
): Promise<string> {
  if (maxDepth <= 0) {
    console.log('Max recursion depth reached, stopping...');
    return '';
  }

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
        },
        timeout: 30000, // Wait for 30 seconds
      }
      );
      
    const data = res.data;

    if (data.choices[0].message.function_call) {
      const function_name = data.choices[0].message.function_call.name;
      const function_args: FunctionArgs = JSON.parse(
        data.choices[0].message.function_call.arguments
      );

      const available_functions: {
        [key: string]: (args: FunctionArgs) => Promise<void>;
      } = {
        updateDatabase,
        addToDatabase,
      };

      try {
        await available_functions[function_name](function_args);
        payload.messages.push(data.choices[0].message);
      } catch (e) {
        throw new Error(`Error with OpenAI Functions API: ${e}`);
      }
      return await OpenAIFuncRequest(payload, maxDepth - 1); // Decrease maximum depth by one
    }

    return data.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error in OpenAI API request: ${error}`);
  }
}


export async function findAndUpdateWorldInformation({
  recentAction,
  collection,
}: {
  recentAction: string;
  collection: Collection;
}) {
  try {
    const combinedDocuments = await getStateOfTheWorld({
      available_tokens: 7000,
      query_text: recentAction,
      collection: collection,
      num_results: 30,
    });

    const messages = [
      {
        role: "user",
        content:
          FunctionRequestPreamble +
          combinedDocuments +
          `\n\nHere is the recent action:\n` +
          recentAction,
      },
    ];

    const functions = [
      {
        name: "updateDatabase",
        description: "Updates a field in the world state",
        parameters: {
          type: "object",
          properties: {
            item: {
              type: "string",
              description:
                "The ID of the item/location to update in snake_case. You can only update existing items.",
            },
            new_value: {
              type: "string",
              description:
                "The new value (full physical description) for the item or location. Include all relevant information. Remove information only if it is no longer accurate or relevant due to the recent actions. The new value is a comprehensive description reflecting the current state.",
            },
          },
          required: ["item", "new_value"],
        },
      },
      {
        name: "addToDatabase",
        description: "Add a new field in the world state",
        parameters: {
          type: "object",
          properties: {
            item: {
              type: "string",
              description:
                "The ID of the item/location to create, in snake_case. You can only add if the item doesnt already exist.",
            },
            new_value: {
              type: "string",
              description:
                "The full, physicsl description for the item or location. Include all relevant information. The  value is a comprehensive description reflecting the current state of that thing.",
            },
          },
          required: ["item", "new_value"],
        },
      },
    ];

    const response = await OpenAIFuncRequest({
      model: "gpt-4-0613",
      messages,
      functions,
      function_call: "auto",
    });
    console.log(response + '\nreturning' || "no res. returning.");
    return 
  } catch (e) {
    console.log("Error in findAndUpdateWorldInformation", e);
  }
}

export async function getStateOfTheWorld({
  available_tokens,
  query_text,
  collection,
  num_results = 20,
}: {
  available_tokens: number;
  query_text: string;
  collection: Collection;
  num_results: number;
}): Promise<string> {
  const relevantWorldStateQueryResult = await collection.query({
    // here we retrieve 50 items. They are filtered down.
    nResults: num_results,
    queryTexts: [query_text],
  });

  const worldStateIds = relevantWorldStateQueryResult.ids[0];
  const worldStateDocuments = relevantWorldStateQueryResult.documents[0];

  // filter down to make sure there are fewer than available_tokens, i.e. length < available_tokens*4
  const max_char_allocation = available_tokens * 4;
  while (worldStateDocuments.join("\n").length > max_char_allocation) {
    // remove the last ID
    worldStateIds.pop();
    // remove the corresponding document
    worldStateDocuments.pop();
  }

  // Combine worldStateIds and worldStateDocuments into one big string
  const combinedDocuments = worldStateIds
    .map((id, index) => `${id}: ${worldStateDocuments[index]}`)
    .join("\n");

  return combinedDocuments;
}
