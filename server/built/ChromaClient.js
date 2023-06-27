"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chromadb_1 = require("chromadb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting the process...");
        // Connect to Chroma backend
        const client = new chromadb_1.ChromaClient();
        console.log("Connected to Chroma backend");
        // Reset the database
        yield client.reset();
        console.log("Database reset");
        // Initialize the OpenAI Embedding Function with the API key
        const embedder = new chromadb_1.OpenAIEmbeddingFunction({
            openai_api_key: process.env.OPENAI_API_KEY || "",
        });
        console.log("OpenAI Embedding Function initialized");
        // Creating a collection with OpenAI embedding function
        let collection = yield client.createCollection({
            name: "my_collection",
            embeddingFunction: embedder,
        });
        console.log("Collection created");
        // Adding data to the collection
        yield collection.add({
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
        const result = yield collection.query({
            queryTexts: ["lorem"],
            nResults: 1,
            where: { chapter: "3" },
        });
        console.log("Queried the collection");
        console.log(result);
        // Deleting data from the collection
        yield collection.delete({
            ids: ["id1", "id2"],
            where: { chapter: "3" },
        });
        console.log("Data deleted from the collection");
        // Deleting the collection
        yield client.deleteCollection({ name: "my_collection" });
        console.log("Collection deleted");
    });
}
main().catch((error) => console.error(error));
