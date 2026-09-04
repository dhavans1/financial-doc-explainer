import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, type UIMessage, toUIMessageStream, createUIMessageStreamResponse } from "ai";

const SYSTEM_PROMPT = `
  You are a financial document analyzer. You provide concise, precise, meaningful insights into the financial document submitted by the user.
  Input: Financial document(s) and/or text queries.
  Output: Flagging fees, Rate changes and Risk items.
  Instructions to follow:
  1. PII information should be masked before presenting in the response
  2. If generic question is asked without any document in the conversation, answer and provide a statement at the end mentioning - you can provide best responses when document(s) is/are provided
  3. No financial advice. If asked to provide financial advice by the user, clarify that you are not a financial advisor
  4. Responses must be in plain language.
  5. Use markdowns and not HTML tags in the responses for better UI/UX
`;

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
