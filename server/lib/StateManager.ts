import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { FunctionRequestPreamble } from "../src/prompts";
dotenv.config();

interface FunctionArgs {
  item: string;
  new_value: string;
}

export async function updateDatabase({ item, new_value }: FunctionArgs) {
  // chroma update
  console.log(`Update ${item} with new value: ${new_value}`);
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
  worldStateIds,
  worldStateDocuments,
  recentAction,
}: {
  worldStateIds: string[];
  worldStateDocuments: (string | null)[];
  recentAction: string;
}) {
  // systematically remove items from the list until there are fewer than N charcters, for context window limit
  // 1 token is ~4 chars. max tokens is 8,192
  const max_token_allocation = 7000 * 4;
  while (worldStateDocuments.join("\n").length > max_token_allocation) {
    // remove the last ID
    worldStateIds.pop();
    // remove the corresponding document
    worldStateDocuments.pop();
  }

  // Combine worldStateIds and worldStateDocuments into one big string
  const combinedDocuments = worldStateIds
    .map((id, index) => `${id}: ${worldStateDocuments[index]}`)
    .join("\n");

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
  ];

  const response = await OpenAIFuncRequest({
    model: "gpt-4-0613",
    messages,
    functions,
    function_call: "auto",
  });

  console.log(response);
}
