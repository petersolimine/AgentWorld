import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { FunctionRequestPreamble } from "../src/prompts";
import { retrieveCollection } from "./ChromaHelpers";
import { WORLD_STATE_COLLECTION_NAME } from "./constants";
import { Collection } from "chromadb";

dotenv.config();

interface FunctionArgs {
  item: string;
  new_value: string;
}

export async function updateDatabase({ item, new_value }: FunctionArgs) {
  if (!new_value) return;
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
    console.log("updating collection failed with error:", e.message);
  }

  // TODO Broadcast this
  console.log(`Update ${item} with new value: ${new_value}`);
}

export async function addToDatabase({ item, new_value }: FunctionArgs) {
  try {
    let collection = await retrieveCollection(WORLD_STATE_COLLECTION_NAME);
    // we don't use upsert here because it means the model didn't have the right context, so we want to fail rather than overwrite an existing item
    await collection.add({
      ids: [item],
      documents: [new_value],
    });
  } catch (e) {
    console.log("Adding to collection failed with error:", e);
  }

  // TODO Broadcast this
  console.log(`Added ${item} with value: ${new_value}`);
}

export interface OpenAIFuncRequestPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  functions?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  function_call?: string;
}

export async function OpenAIFuncRequest(
  payload: OpenAIFuncRequestPayload
): Promise<string> {
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

    if (data.choices[0].message.function_call) {
      const function_name = data.choices[0].message.function_call.name;
      const function_args: FunctionArgs = JSON.parse(
        data.choices[0].message.function_call.arguments
      );

      const available_functions: {
        [key: string]: (args: FunctionArgs) => Promise<void>;
      } = {
        updateDatabase,
      };

      // actually call the function
      await available_functions[function_name](function_args);
      payload.messages.push(data.choices[0].message);

      return await OpenAIFuncRequest(payload);
    }

    return data.choices[0].message.content;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log(axiosError.response);
    throw new Error(
      `Error in OpenAI API request: ${axiosError.response?.data}`
    );
  }
}

export async function findAndUpdateWorldInformation({
  recentAction,
  collection,
}: {
  recentAction: string;
  collection: Collection;
}) {
  const combinedDocuments = await getStateOfTheWorld({
    available_tokens: 7000,
    query_text: recentAction,
    collection: collection,
    num_results: 50,
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
              "The new value (full description) for the item or location. Include all relevant information. Remove information only if it is no longer accurate or relevant due to the recent actions. The new value is a comprehensive description reflecting the current state.",
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
              "The full description for the item or location. Include all relevant information. The  value is a comprehensive description reflecting the current state.",
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

  console.log(response);
}

export async function getStateOfTheWorld({
  available_tokens,
  query_text,
  collection,
  num_results = 50,
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
