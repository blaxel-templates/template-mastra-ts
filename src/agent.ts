import { blModel, blTools } from "@blaxel/sdk";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface Stream {
  write: (data: string) => void;
  end: () => void;
}

export default async function agent(
  input: string,
  stream: Stream
): Promise<void> {
  const agent = new Agent({
    name: "blaxel-agent-mastra",
    model: await blModel("sandbox-openai").ToMastra(),
    tools: {
      ...(await blTools(["blaxel-search"]).ToMastra()),
      weatherTool: createTool({
        id: "weatherTool",
        description: "Get the weather in a specific city",
        inputSchema: z.object({
          city: z.string(),
        }),
        outputSchema: z.object({
          weather: z.string(),
        }),
        execute: async ({ context }) => {
          return { weather: `The weather in ${context.city} is sunny` };
        },
      }),
    },
    instructions: "If the user ask for the weather, use the weather tool.",
  });

  const response = await agent.stream([{ role: "user", content: input }]);

  for await (const delta of response.textStream) {
    stream.write(delta);
  }
  stream.end();
}
