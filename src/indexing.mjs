import { vectorStore } from "./index.mjs";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const loader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  { selector: "p" }
);

const docs = await loader.load();
console.log("1. Loading documents");
console.log(`Total characters: ${docs[0].pageContent.length}`);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const allSplits = await splitter.splitDocuments(docs);
console.log("2. Splitting documents");
console.log(`Split blog post into ${allSplits.length} sub-documents.`);

const subset = allSplits.slice(0, 10);
await vectorStore.addDocuments(subset);
console.log("3. Added to in-memory vector store");
