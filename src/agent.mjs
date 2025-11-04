import { retrieve } from "./retrieve.mjs";
import { model } from "./index.mjs";
import { createAgent } from "langchain";
import { SystemMessage } from "@langchain/core/messages";

const tools = [retrieve];

const systemPrompt = new SystemMessage(
  "You have access to a tool that retrieves context from a blog post. " +
  "Use the tool to help answer user queries."
);

const agent = createAgent({ model, tools, prompt: systemPrompt.content });

const inputMessage = `What is the standard method for Task Decomposition?
Once you get the answer, look up common extensions of that method.`;

const agentInputs = { messages: [{ role: "user", content: inputMessage }] };

console.log("[human]: " + inputMessage);
console.log("-----");

const events = await agent.streamEvents(agentInputs, { version: "v1" });

for await (const evt of events) {
  switch (evt.event) {
    case "on_tool_start":
      console.log("[ai]:");
      console.log("Tools:");
      console.log(`- ${evt.name}(${JSON.stringify(evt.data.input)})`);
      console.log("-----");
      break;

    case "on_tool_end":
      console.log("[tool]:");
      if (typeof evt.data.output === "string") {
        console.log(evt.data.output);
      } else if (evt.data.output?.content) {
        console.log(evt.data.output.content);
      } else {
        console.log(JSON.stringify(evt.data.output, null, 2));
      }
      console.log("-----");
      break;

    case "on_chat_model_stream":
      if (evt.data?.chunk?.content) {
        if (!agent.__printing) {
          console.log("[ai]:");
          agent.__printing = true;
        }
        process.stdout.write(evt.data.chunk.content);
      }
      break;

    case "on_chat_model_end":
      if (agent.__printing) {
        console.log("\n-----");
        agent.__printing = false;
      }
      break;
  }
}
