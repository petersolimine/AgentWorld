import { ChromaClient, Collection, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

export const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY || "",
});

/*
This function will take 2 params. 
1. The collection name
2. Bool value to reset the collection or not
returns a client
*/
import {chroma_url, isDocker } from "./constants";

export const client = new ChromaClient({ path: `http://${chroma_url}:8000` });

export const retrieveCollection = async (
  collection_name: string
): Promise<Collection> => {
  return await client.getCollection({
    name: collection_name,
    embeddingFunction: embedder,
  });
};

export const initChroma = async (
  collection_names: string[],
  reset: boolean
) => {
  if (reset) {
    console.log("Resetting ChromaDB...");
    await client.reset();
    console.log("ChromaDB reset.");
  }

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

export async function initializeWorldState(
  client: ChromaClient,
  collection_name: string,
  WorldState: any
) {
  // Create arrays to hold ids and documents
  let ids = [];
  let documents = [];

  // Iterate over each property in the WorldState object
  for (let key in WorldState) {
    if (WorldState.hasOwnProperty(key)) {
      ids.push(key); // Add key to ids array
      documents.push(WorldState[key]); // Add document to documents array
    }
  }

  // get the collection
  let collection = await client.getCollection({
    name: collection_name,
    embeddingFunction: embedder,
  });

  // Add the items to the collection
  try {
    await collection.upsert({ ids: ids, documents: documents });
  } catch (e) {
    console.log("Error adding items to collection: ", e);
  }

  console.log("All WorldState items added to the collection.");
}


export async function initChromaWithRetry(collections: string[], reset: boolean, attempts = 50, delay = 5000) {
  try {
    return await initChroma(collections, reset);
  } catch (error) {
    console.error(`Chroma not running yet. Retrying in 5s. Attempts left: ${attempts}`, error);
    if (attempts === 0) throw error; // If no attempts left, throw error
    await new Promise(res => setTimeout(res, delay)); // Wait for 'delay' ms
    return initChromaWithRetry(collections, reset, attempts - 1, delay);
  }
}
