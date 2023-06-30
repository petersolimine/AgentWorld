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

async function runConversation() {
  const worldState = {
    ElvenForest: {
      description:
        "A lush, enchanted forest where the ancient elves live among the towering trees.",
      objects: ["elven bow", "enchanted stream", "ancient tree of knowledge"],
      goNorth: "SilverMountain",
      goEast: "FeyGrove",
      goSouth: "PortalCrossroads",
      goWest: "null",
    },
    SilverMountain: {
      description:
        "A majestic mountain range with snow-capped peaks and home to the dwarves.",
      objects: ["mithril ore", "dwarven axe", "silver dragon"],
      goNorth: "null",
      goEast: "SkyTemple",
      goSouth: "ElvenForest",
      goWest: "DarkSwamps",
    },
    FeyGrove: {
      description:
        "A grove bathed in perpetual twilight and inhabited by magical fey creatures.",
      objects: ["fairy dust", "wishing well", "unicorn"],
      goNorth: "SkyTemple",
      goEast: "null",
      goSouth: "CrystalCaves",
      goWest: "ElvenForest",
    },
    PortalCrossroads: {
      description:
        "A mystical clearing with portals leading to unknown dimensions.",
      objects: ["runestone", "guardian golem", "ancient portals"],
      goNorth: "ElvenForest",
      goEast: "CrystalCaves",
      goSouth: "null",
      goWest: "HauntedGraveyard",
    },
    DarkSwamps: {
      description:
        "Gloomy swamps, rumored to be haunted by spirits and home to dangerous creatures.",
      objects: ["witch's brew", "swamp monster", "ghost lantern"],
      goNorth: "null",
      goEast: "SilverMountain",
      goSouth: "HauntedGraveyard",
      goWest: "null",
    },
    SkyTemple: {
      description:
        "A floating temple high in the clouds, said to be where the gods convene.",
      objects: ["cloud sword", "oracle", "golden harp"],
      goNorth: "null",
      goEast: "ocean_of_angels",
      goSouth: "FeyGrove",
      goWest: "SilverMountain",
    },
    sword_of_domacles:
      "The sword of domacles is hidden behind a rock in the elven forrest",
    rainbow: "a rainbow has appeared above the ocean of angels",
    ocean_of_angels:
      "the ocean of angels is undergoing a major storm. Two ships are stranded at sea, the weather might get better soon",
    sword_of_elders:
      "Brom Ironfist is wielding the sword of elders while his ship is stranded at sea in a storm in the ocean of angels. He is fighting his captain in a battle to the death. The sword is capable of killing any dwarf, but is unusable against dragons. ",
  };

  const recentAction =
    "Brom Ironfist yells at the sky, 'damn you, lord comable!' and then hurls his sword with all his might. The sword flies west for miles and miles, landing at the base of a temple. He prepares to be stabbed in the heart.";

  const messages = [
    {
      role: "user",
      content:
        FunctionRequestPreamble +
        JSON.stringify(worldState) +
        `\nHere is the recent action:\n`,
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
              "The ID of the item/location to update. You can only update existing items.",
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

runConversation();
