// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamText } from "ai";
import { POST } from "./route";

// Never call the real model: the guards exist to stop bad requests before they reach Anthropic.
vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => "mock-model"),
}));

vi.mock("ai", async (importOriginal) => ({
  ...(await importOriginal<typeof import("ai")>()),
  streamText: vi.fn(() => ({ stream: "mock-stream" })),
  toUIMessageStream: vi.fn(() => "mock-ui-stream"),
  createUIMessageStreamResponse: vi.fn(() => new Response("ok")),
}));

const post = (body: string) =>
  POST(new Request("http://localhost/api/chat", { method: "POST", body }));

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.mocked(streamText).mockClear();
  });

  it("rejects malformed JSON with 400", async () => {
    const res = await post("{not json");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON" });
    expect(streamText).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", {}],
    ["not an array", { messages: "hello" }],
    ["empty", { messages: [] }],
    ["null body", null],
  ])("rejects %s messages with 400", async (_, body) => {
    const res = await post(JSON.stringify(body));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "messages must be a non-empty array" });
    expect(streamText).not.toHaveBeenCalled();
  });

  it("streams a response for valid messages", async () => {
    const res = await post(
      JSON.stringify({
        messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "What is APR?" }] }],
      })
    );

    expect(res.status).toBe(200);
    expect(streamText).toHaveBeenCalledOnce();
    const args = vi.mocked(streamText).mock.calls[0][0];
    expect(args.instructions).toEqual(expect.any(String));
    expect(args.messages).toHaveLength(1);
  });
});
