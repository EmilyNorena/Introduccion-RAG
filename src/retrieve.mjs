import { vectorStore } from "./index.mjs";
import * as z from "zod";
import { tool } from "@langchain/core/tools";

const retrieveSchema = z.object({ query: z.string() });

const retrieve = tool(
  async ({ query }) => {
    const docs = await vectorStore.similaritySearch(query, 2);
    if (!docs?.length) return "No matching documents found.";
    const serialized = docs.map(
      (d) => `Source: ${d.metadata?.source ?? "unknown"}\nContent: ${d.pageContent.slice(0, 300)}...`
    ).join("\n");
    return serialized;
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content",
  }
);

export { retrieve };
