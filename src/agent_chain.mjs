import { model, vectorStore } from "./index.mjs";
import { createAgent, dynamicSystemPromptMiddleware } from "langchain";

function toPlainText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(c => c?.text ?? "").join("\n");
  if (content && typeof content === "object" && "content" in content) {
    return toPlainText(content.content);
  }
  return String(content ?? "");
}

const agent = createAgent({
  model,
  tools: [],
  middleware: [
    dynamicSystemPromptMiddleware(async (state) => {
      const lastMsg = state.messages[state.messages.length - 1];
      const lastQuery = toPlainText(lastMsg?.content);

      const retrievedDocs = await vectorStore.similaritySearch(lastQuery, 2);
      const docsContent = retrievedDocs.map(d => d.pageContent).join("\n\n");

      return `You are a helpful assistant. Use the following context in your response:\n\n${docsContent}`;
    }),
  ],
});

const inputMessage = `What is Task Decomposition?`;
const chainInputs = { messages: [{ role: "user", content: inputMessage }] };

const stream = await agent.stream(chainInputs, { streamMode: "values" });

for await (const step of stream) {
  const last = step.messages.at(-1);
  const text = toPlainText(last?.content);
  if (text) console.log(text);
}
console.log("\n-----");
