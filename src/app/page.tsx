"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [input, setInput] = useState("");
  const [fileList, setFileList] = useState<FileList | undefined>(undefined);
  const { messages, sendMessage, status, error, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: ({ message }) => {
      setAnnouncement(
        message.parts.filter(p => p.type === "text").map(p => p.text).join(" ")
      );
    },
  });
  const userInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [showScrollDown, setShowScrollDown] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const check = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      setShowScrollDown(distanceFromBottom > 200);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    const observer = new ResizeObserver(check);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const isNotProcessing = status === "ready" || status === "error";
  const isValidInputPresent = input.trim() !== "" || (fileList && fileList.length > 0);
  const canSend = isValidInputPresent && isNotProcessing;

  return (
    <main className="w-full max-w-2xl min-h-screen mx-auto flex flex-col gap-4 bg-linear-0 from-blue-400 
      via-blue-200 to-blue-400">
      <header className="w-full max-w-2xl left-0 right-0 mx-auto text-center text-white p-6 
        bg-blue-950 flex flex-col items-center justify-center border-blue-950 bg-linear-to-b from-blue-950 
        to-blue-600 sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Doc Explainer</h1>
        <p className="text-sm font-normal text-white/80 pt-2">
          Ask questions about financial documents - loan agreement, credit card statement, or benefit notice
        </p>
        {/* Disclaimer: For screen reader users only */}
        <p className="sr-only">
          Not a financial advisor — this tool explains document content only.
        </p>
      </header>

      <div className="flex flex-col gap-3 p-6 overflow-hidden">
        {messages.map((message) => (
          <div key={message.id} className="text-left">
            <span className="sr-only">{message.role === "user" ? "You" : "Claude"}:</span>
            {message.parts.map((part, i) => {
              if (part.type === "text")
                return (
                  message.role === "assistant" ?
                  <div key={i} className="prose prose-sm prose-invert prose-chat
                    w-fit max-w-[85%] sm:max-w-3/4 mr-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl rounded-bl-none 
                    bg-linear-to-r/oklch from-blue-900 to-blue-800
                  ">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div> : 
                  part.text.trim() !== "" &&
                  <p key={i} className="
                    w-fit max-w-[85%] sm:max-w-3/4 ml-auto bg-blue-200 p-2 border border-blue-900 rounded-2xl 
                    rounded-br-none bg-linear-to-r/oklch from-blue-900 to-blue-800 break-words">
                    {part.text}
                  </p>
                )
              else if (part.type === "file")
                return (
                  <div key={i} 
                    className="gap-2 bg-blue-900 w-fit max-w-[85%] sm:max-w-3/4 
                    ml-auto m-2 mr-0 p-1 pl-3 pr-3 border-blue-900 rounded-xl text-white"
                    role="img"
                    aria-label={`Attached file: ${part.filename}`}
                  >
                    <span>📎</span>&nbsp;
                    <span>{part.filename}</span>
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
        {/* Scroll down button */}
        {showScrollDown && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to latest message"
            className="flex items-center justify-center h-10 w-10 mb-1 mr-6 ml-auto rounded-full bg-blue-950 text-white
              hover:bg-blue-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-white backdrop-blur"
          >
            <span aria-hidden="true">↓</span>
          </button>
        )}

        {/* Uploaded files */}
        <div className="z-10 pr-6 mb-1 max-w-[85%] sm:max-w-3/4 ml-auto flex">
          {
            fileList && fileList.length > 0 && (
              <div className="flex flex-row gap-2 bg-blue-950/80 backdrop-blur p-2 rounded-lg border border-blue-900 w-full ml-auto ">
                <span aria-hidden="true">📎</span>
                <span><span className="sr-only">Attached file: </span>{fileList[0].name}</span>
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

        <div className="bg-blue-950/80 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSend) return;
              sendMessage({ text: input , files: fileList });
              setInput("");
              setFileList(undefined);
              if(fileInputRef.current) fileInputRef.current.value = ""
            }}
            className="w-full flex gap-2 p-6 pb-3 items-end max-w-2xl"
            ref={formRef}
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
            <label htmlFor="user-input-textarea" className="sr-only">
              Ask about financial documents
            </label>
            <textarea
              id="user-input-textarea"
              ref={userInputRef}
              className="w-full resize-none overflow-hidden rounded-lg border border-gray-300 bg-blue-50 text-black 
                p-3 text-sm focus:border-blue-500 focus:outline-none field-sizing-content min-h-10"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about financial documents..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!canSend) return;
                  formRef.current?.requestSubmit();
                }
              }}
              aria-describedby="textarea-description"
            />

            <button
              id="send-btn"
              type="submit"
              disabled={!canSend}
              className="bg-blue-950 text-white px-4 py-2 rounded-2xl disabled:opacity-50 enabled:hover:cursor-pointer 
                enabled:hover:bg-blue-900 h-10"
            >
              Send
            </button>
          </form>

          {/* Disclaimer: For non-screen reader users only */}
          <p className="text-xs text-center text-white/80 px-6 pb-6" aria-hidden="true">
            Not a financial advisor — this tool explains document content only.
          </p>
        </div>

        <span className="sr-only" id="textarea-description">
          Press Enter to send. Press Shift and Enter for a new line.
        </span>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </main>
  );
}
