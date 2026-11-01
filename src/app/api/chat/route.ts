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
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body as { messages?: UIMessage[] })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages must be a non-empty array" }, { status: 400 });
  }

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
