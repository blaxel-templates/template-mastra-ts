import { blModel } from "@blaxel/mastra";
import { Agent } from "@mastra/core/agent";

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
    instructions: "If the user ask for the weather, use the weather tool.",
    model: await blModel("sandbox-openai"),
    // tools: await blTools(["blaxel-search"]),
  });

  const response = await agent.stream(
    [{ role: "user", content: input }],
  );

  for await (const delta of response.textStream) {
    stream.write(delta);
  }
  stream.end();
}
