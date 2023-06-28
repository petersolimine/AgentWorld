import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Starting the process...");

  // Connect to Chroma backend
  const client = new ChromaClient();
  console.log("Connected to Chroma backend");

  // Reset the database
  await client.reset();
  console.log("Database reset");

  // Initialize the OpenAI Embedding Function with the API key
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY || "",
  });
  console.log("OpenAI Embedding Function initialized");

  // Creating a collection with OpenAI embedding function
  let collection = await client.createCollection({
    name: "my_collection",
    embeddingFunction: embedder,
  });
  console.log("Collection created");

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
  console.log("Data added to the collection");

  // Querying a collection
  const result = await collection.query({
    queryTexts: ["lorem"],
    nResults: 1,
    where: { chapter: "3" },
  });
  console.log("Queried the collection");
  console.log(result);

  // Deleting data from the collection
  await collection.delete({
    ids: ["id1", "id2"],
    where: { chapter: "3" },
  });
  console.log("Data deleted from the collection");

  // Deleting the collection
  await client.deleteCollection({ name: "my_collection" });
  console.log("Collection deleted");
}

main().catch((error) => console.error(error));
