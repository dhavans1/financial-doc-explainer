"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [input, setInput] = useState("");
  const [fileList, setFileList] = useState<FileList | undefined>(undefined);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" })
  });

  return (
    <main className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-center">Doc Explainer</h1>

      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role === "user" ? "You" : "Claude"}:</strong>{" "}
            {message.parts.map((part, i) => {
              if (part.type !== "text") return null;
              return (
                message.role === "assistant" ?
                 <div key={i} className="prose prose-invert max-w-none inline">
                  <ReactMarkdown>{part.text}</ReactMarkdown>
                 </div> : 
                <span key={i}>{part.text}</span>
              )
            })}
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


      {/* Uploaded files */}
      <div>
        {
          fileList && fileList.length > 0 && (
            <div className="flex flex-row gap-2">
              <span>📎</span>
              <span>{fileList[0].name}</span>
              <button
                id="clear-file"
                type="button"
                onClick={() => setFileList(undefined)}
                className="cursor-pointer"
                aria-label="Remove uploaded document"
              >
                🗑️
              </button>
            </div>
          )
        }
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() === "" && !fileList) return;
          sendMessage({ text: input , files: fileList });
          setInput("");
          setFileList(undefined);
        }}
        className="flex gap-2"
      >
        {/* File upload */}
        <input 
          id="file-upload"
          className="hidden"
          type="file"
          accept=".pdf"
          onChange={(e) => setFileList(e.target.files ?? undefined)}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex items-center justify-center"
          aria-label="Attach a financial document"
        >
          📎
        </label>

        {/* Text input */}
        <input
          className="border rounded px-3 py-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about financial documents..."
        />

        <button
          type="submit"
          disabled={status !== "ready"}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 hover:cursor-pointer hover:bg-gray-800"
        >
          Send
        </button>
      </form>
    </main>
  );
}
