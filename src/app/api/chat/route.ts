import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage, toUIMessageStream, createUIMessageStreamResponse } from "ai";
import fs from "fs";
import path from "path";

// Read once at module load (server startup / warm instance), not per-request.
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "skills", "analyzer.md"),
  "utf-8"
);

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-5"),
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages)
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream
    })
  });
}
