import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
dotenv.config();

interface FunctionArgs {
  item: string;
  new_value: string;
}

export async function updateDatabase({ item, new_value }: FunctionArgs) {
  // your database update logic here
  console.log(`Update ${item} with new value: ${new_value}`);
}

export interface OpenAIRequestPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  functions?: Array<{
    name: string;
    description: string;
    parameters: any;
  }>;
  function_call?: string;
}

export async function OpenAIRequest(
  payload: OpenAIRequestPayload
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

      return await OpenAIRequest(payload);
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

async function runConversation() {
  const worldState = {
    elven_forest:
      "Jane and randy are in the forest, starting a fire. They are preparing to cook dinner",
    sword_of_domacles:
      "The sword of domacles is hidden behind a rock in the elven forrest",
    rainbow: "a rainbow has appeared above the ocean of angels",
    ocean_of_angels:
      "the ocean of angels is undergoing a major storm. Two ships are stranded at sea, the weather might get better soon",
    sword_of_elders:
      "Brom Ironfist is wielding the sword of elders while his ship is stranded at sea in a storm in the ocean of angels. He is fighting his captain in a battle to the death. The sword is capable of killing any dwarf, but is unusable against dragons. ",
  };

  const recentAction =
    "Brom Ironfist yells at the sky, 'damn you, lord comable!' and then hurls his sword into the ocean. He prepares to be stabbed in the heart.";

  const messages = [
    {
      role: "user",
      content:
        `You are roleplaying as a sophisticated AI. Your role is to manage a dynamic virtual world, reacting to the players' actions. Given the state of the world and the most recent action of the players, your task is to assess how these actions have affected the state of the world, and then rewrite the state accordingly using the available functions. Only change items or locations in the world that have been affected by the recent actions. Here's the current state of the world:\n` +
        JSON.stringify(worldState) +
        `\nAnd here's the most recent action:\n`,
    },
    { role: "user", content: recentAction },
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
              "The name of the item/location to update. You can only update existing items.",
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

  const response = await OpenAIRequest({
    model: "gpt-4-0613",
    messages,
    functions,
    function_call: "auto",
  });

  console.log(response);
}

runConversation();
