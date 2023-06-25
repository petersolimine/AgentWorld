import fetch from "node-fetch";
global.fetch = fetch;

import { ChromaClient } from "chromadb";
const chroma = new ChromaClient("http://localhost:8000");
