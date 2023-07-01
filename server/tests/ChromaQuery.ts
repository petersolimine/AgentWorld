/*
The purpose of this is to give a means of exploring the embeddings space created by the game engine

to run, cd into /server/ and run `npx ts-node tests/ChromaQuery.ts`

then, in the terminal, enter a collection name ('world') and a query.

The query will be used to search the collection for similar documents.
*/

import readline from "readline";
import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

const client = new ChromaClient();
console.log("Connected to Chroma backend");

// Initialize the OpenAI Embedding Function with the API key
const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY || "",
});
console.log("OpenAI Embedding Function initialized");

// The async function to execute the user's query
async function executeQuery(collectionName: string, queryText: string) {
  // Fetching the collection
  let collection = await client.getCollection({
    name: collectionName,
    embeddingFunction: embedder,
  });

  if (!collection) {
    console.log("No collection found");
    return;
  }

  console.log("Collection fetched");

  // Querying the collection
  const result = await collection.query({
    queryTexts: [queryText],
    nResults: 5,
  });

  console.log("Queried the collection");

  if (result.documents.length > 0 && result.distances !== null) {
    for (let i = 0; i < result.documents[0].length; i++) {
      console.log(`${result.ids[0][i]}. distance: ${result.distances[0][i]}`);
      console.log(`${result.documents[0][i]}`);
    }
  } else {
    console.log("No results found");
  }
}

// Creating readline interface for taking user inputs
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Continuous loop for taking user inputs
async function main() {
  while (true) {
    const collectionName = await new Promise<string>((resolve) =>
      rl.question("Enter collection name: ", resolve)
    );
    const query = await new Promise<string>((resolve) =>
      rl.question("Enter query: ", resolve)
    );
    await executeQuery(collectionName, query);
  }
}

main().catch((error) => console.error(error));
