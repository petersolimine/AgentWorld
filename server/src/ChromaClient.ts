import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Connect to Chroma backend
  const client = new ChromaClient();

  // Reset the database
  await client.reset();

  // Initialize the OpenAI Embedding Function with the API key
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY || "",
  });

  // Creating a collection with OpenAI embedding function
  let collection = await client.createCollection({
    name: "my_collection",
    embeddingFunction: embedder,
  });
  console.log("here");

  // Adding data to the collection
  await collection.add({
    ids: ["id1", "id2", "id3", "id4"],
    metadatas: [
      { chapter: "3", verse: "16" },
      { chapter: "3", verse: "5" },
      { chapter: "2", verse: "5" },
      { chapter: "1", verse: "6" },
    ],
    documents: ["lorem ipsum...", "doc2", "doc5", "doc6"],
  });
  console.log("here2");

  // Querying a collection
  const result = await collection.query({
    queryTexts: ["lorem"],
    nResults: 1,
    where: { chapter: "3" },
  });

  console.log(result);

  // Deleting data from the collection
  await collection.delete({
    ids: ["id1", "id2"],
    where: { chapter: "3" },
  });

  // Deleting the collection
  await client.deleteCollection({ name: "my_collection" });
}

main().catch((error) => console.error(error));
