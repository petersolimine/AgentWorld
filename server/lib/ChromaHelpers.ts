import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
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
export const initChroma = async (
  collection_names: string[],
  reset: boolean
) => {
  const client = new ChromaClient({ path: "http://chroma-server:8000" });

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
