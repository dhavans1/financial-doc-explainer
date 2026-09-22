"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [input, setInput] = useState("");
  const [fileList, setFileList] = useState<FileList | undefined>(undefined);
  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" })
  });
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="w-full max-w-2xl min-h-screen mx-auto flex flex-col gap-4 bg-linear-0 from-blue-400 
      via-blue-200 to-blue-400">
      <div className="w-full max-w-2xl left-0 right-0 mx-auto text-xl font-semibold text-center h-30 
        bg-blue-950 flex items-center justify-center border-blue-950 bg-linear-to-b from-blue-950 
        to-blue-800 sticky top-0 z-10">
        <h1>Doc Explainer</h1>
      </div>

      <div className="flex flex-col gap-3 p-6 overflow-hidden">
        {messages.map((message) => (
          <div key={message.id} className="text-left">
            <span className="sr-only">{message.role === "user" ? "You" : "Claude"}:</span>
            {message.parts.map((part, i) => {
              if (part.type === "text")
                return (
                  message.role === "assistant" ?
                  <div key={i} className="prose-sm prose-invert
                    w-fit max-w-3/4 mr-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl rounded-bl-none 
                    bg-linear-to-r/oklch from-blue-900 to-blue-800
                  ">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div> : 
                  <p key={i} className="w-fit max-w-3/4 ml-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl 
                    rounded-br-none bg-linear-to-r/oklch from-blue-900 to-blue-800 break-words">
                    {part.text}
                  </p>
                )
              else if (part.type === "file")
                return (
                  <div key={i} className="gap-2 bg-blue-900 w-fit ml-auto m-2 mr-0 p-1 pl-3 pr-3 border-blue-900 
                    rounded-xl text-white">
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
          className="flex flex-col items-center border border-red-300 bg-red-50 text-red-800 rounded 
          px-3 py-2 text-sm m-auto"
        >
          <span>Something went wrong: {error?.message ?? "An unknown error occurred."}</span>
          <button type="button" 
            className="ml-2 text-red-800 hover:text-black hover:bg-red-200 p-1 m-2 border rounded" 
            onClick={() => {clearError(); userInputRef.current?.focus();}}
            aria-label="Close error alert">
            Close
          </button>
        </div>
      )}

      <div className="sticky bottom-0 z-10 mt-auto">
      
        {/* Uploaded files */}
        <div className="z-10 pr-6 mb-1">
          {
            fileList && fileList.length > 0 && (
              <div className="flex flex-row gap-2 bg-blue-950/80 backdrop-blur p-2 rounded-lg border border-blue-900 w-fit ml-auto ">
                <span aria-label="file attachment icon">📎</span>
                <span aria-label={`Attached file: ${fileList[0].name}`}>{fileList[0].name}</span>
                <button
                  id="clear-file"
                  type="button"
                  onClick={() => {
                    setFileList(undefined);
                    userInputRef.current?.focus();
                    if(fileInputRef.current) fileInputRef.current.value = ""
                  }}
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
            if(fileInputRef.current) fileInputRef.current.value = ""
          }}
          className="w-full flex gap-2 p-6 items-end max-w-2xl bg-blue-950/80 backdrop-blur"
        >
          {/* File upload */}
          <input 
            id="file-upload"
            ref={fileInputRef}
            className="sr-only peer"
            type="file"
            accept=".pdf"
            aria-label="Attach a financial document"
            onChange={(e) => setFileList(e.target.files ?? undefined)}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center justify-center bg-blue-950 h-10 w-10 rounded-full shrink-0
            peer-focus-visible:ring-2 peer-focus-visible:ring-white"
          >
            📎
          </label>

          {/* Text input */}
          <textarea
            id="user-input-textarea"
            ref={userInputRef}
            className="w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-blue-100 text-black 
              p-3 text-sm focus:border-blue-500 focus:outline-none field-sizing-content min-h-10"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about financial documents..."
          />

          <button
            id="send-btn"
            type="submit"
            disabled={status !== "ready" && status !== "error"}
            className="bg-blue-950 text-white px-4 py-2 rounded-2xl disabled:opacity-50 hover:cursor-pointer 
              hover:bg-blue-900 h-10"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
