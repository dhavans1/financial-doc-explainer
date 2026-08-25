"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  return (
    <main className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Doc Explainer</h1>

      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role === "user" ? "You" : "Claude"}:</strong>{" "}
            {message.parts.map((part, i) =>
              part.type === "text" ? <span key={i}>{part.text}</span> : null
            )}
          </div>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="border border-red-300 bg-red-50 text-red-800 rounded px-3 py-2 text-sm"
        >
          Something went wrong: {error.message}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() === "") return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          className="border rounded px-3 py-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something to Claude"
        />
        <button
          type="submit"
          disabled={status !== "ready"}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
