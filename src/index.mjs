import "dotenv/config";
import { initChatModel } from "langchain";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

const model = await initChatModel("gpt-4.1");

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large"
});

const vectorStore = new MemoryVectorStore(embeddings);

export { model, vectorStore, embeddings }; 
