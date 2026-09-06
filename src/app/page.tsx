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
    <main className="max-w-2xl min-h-screen mx-auto flex flex-col gap-4 rounded-3xl bg-linear-0 from-blue-400 via-blue-200 to-blue-400">
      <div className="fixed w-full max-w-2xl top-0 left-0 right-0 mx-auto text-xl font-semibold text-center h-30 bg-blue-950 flex items-center justify-center border-blue-950 rounded-t-3xl bg-linear-to-b from-blue-950 to-blue-800">
        <h1>Doc Explainer</h1>
      </div>

      <div className="flex flex-col gap-3 p-6 pt-33 overflow-hidden">
        {messages.map((message) => (
          <div key={message.id} className="text-left">
            <span className="sr-only">{message.role === "user" ? "You" : "Claude"}:</span>
            {message.parts.map((part, i) => {
              if (part.type === "text")
                return (
                  message.role === "assistant" ?
                  <div key={i} className="prose-sm prose-invert
                    w-fit max-w-3/4 mr-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl rounded-bl-none bg-linear-to-r/oklch from-blue-900 to-blue-800
                  ">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div> : 
                  <p key={i} className="w-fit max-w-3/4 ml-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl rounded-br-none bg-linear-to-r/oklch from-blue-900 to-blue-800 break-words">
                    {part.text}
                  </p>
                )
              else if (part.type === "file")
                return (
                  <div key={i} className="gap-2 bg-blue-900 w-fit ml-auto m-2 mr-0 p-1 pl-3 pr-3 border-blue-900 rounded-xl text-white">
                    <span aria-label="file attachment icon">📎</span>&nbsp;
                    <span aria-label={`Attached file: ${part.filename}`}>{part.filename}</span>
                  </div>
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
        className="flex gap-2 p-6 items-end"
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
          className="cursor-pointer flex items-center justify-center bg-blue-950 h-8 w-10 rounded-full"
          aria-label="Attach a financial document"
        >
          📎
        </label>

        {/* Text input */}
        <textarea
          className="w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-gray-100 text-black p-3 text-sm focus:border-blue-500 focus:outline-none field-sizing-content min-h-10"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about financial documents..."
        />

        <button
          type="submit"
          disabled={status !== "ready"}
          className="bg-blue-950 text-white px-4 py-2 rounded-2xl disabled:opacity-50 hover:cursor-pointer hover:bg-blue-900 h-10"
        >
          Send
        </button>
      </form>
    </main>
  );
}
