import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UIMessage } from "ai";
import Home from "./page";

const sendMessage = vi.fn();
const chatState: { messages: UIMessage[]; status: string; error: Error | undefined } = {
  messages: [],
  status: "ready",
  error: undefined,
};

// Stub the chat hook so tests cover the page's own logic without network calls.
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({ ...chatState, sendMessage, clearError: vi.fn() }),
}));

const pdf = () => new File(["%PDF-1.4"], "statement.pdf", { type: "application/pdf" });
const sendButton = () => screen.getByRole("button", { name: "Send" });
const textbox = () => screen.getByRole("textbox", { name: "Ask about financial documents" });
const fileInput = () => screen.getByLabelText("Attach a financial document");

describe("Home", () => {
  beforeEach(() => {
    sendMessage.mockClear();
    chatState.messages = [];
    chatState.status = "ready";
    chatState.error = undefined;
  });

  describe("send button", () => {
    it("is disabled with no input", () => {
      render(<Home />);
      expect(sendButton()).toBeDisabled();
    });

    it("stays disabled for whitespace-only text", async () => {
      render(<Home />);
      await userEvent.type(textbox(), "   ");
      expect(sendButton()).toBeDisabled();
    });

    it("enables once text is entered", async () => {
      render(<Home />);
      await userEvent.type(textbox(), "What is APR?");
      expect(sendButton()).toBeEnabled();
    });

    it("enables once a file is attached", async () => {
      render(<Home />);
      await userEvent.upload(fileInput(), pdf());
      expect(sendButton()).toBeEnabled();
    });

    it("is disabled while a response is streaming", async () => {
      chatState.status = "streaming";
      render(<Home />);
      await userEvent.type(textbox(), "What is APR?");
      expect(sendButton()).toBeDisabled();
    });
  });

  describe("submitting", () => {
    it("sends only text when no file is attached", async () => {
      render(<Home />);
      await userEvent.type(textbox(), "  What is APR?  ");
      await userEvent.click(sendButton());

      expect(sendMessage).toHaveBeenCalledWith({ text: "What is APR?" });
      expect(textbox()).toHaveValue("");
    });

    it("sends only files when there is no text", async () => {
      render(<Home />);
      await userEvent.upload(fileInput(), pdf());
      await userEvent.click(sendButton());

      expect(sendMessage).toHaveBeenCalledOnce();
      const arg = sendMessage.mock.calls[0][0];
      expect(arg).not.toHaveProperty("text");
      expect(arg.files[0].name).toBe("statement.pdf");
    });

    it("sends text and files together when both are present", async () => {
      render(<Home />);
      await userEvent.upload(fileInput(), pdf());
      await userEvent.type(textbox(), "Explain the fees");
      await userEvent.click(sendButton());

      const arg = sendMessage.mock.calls[0][0];
      expect(arg.text).toBe("Explain the fees");
      expect(arg.files[0].name).toBe("statement.pdf");
    });

    it("submits on Enter but not on Shift+Enter", async () => {
      render(<Home />);
      await userEvent.type(textbox(), "line one{Shift>}{Enter}{/Shift}");
      expect(sendMessage).not.toHaveBeenCalled();

      await userEvent.type(textbox(), "{Enter}");
      expect(sendMessage).toHaveBeenCalledWith({ text: "line one" });
    });
  });

  it("shows the attached file and lets the user remove it", async () => {
    render(<Home />);
    await userEvent.upload(fileInput(), pdf());
    expect(screen.getByText("statement.pdf")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Remove uploaded document" }));

    expect(screen.queryByText("statement.pdf")).not.toBeInTheDocument();
    expect(sendButton()).toBeDisabled();
  });

  it("hides empty user text bubbles", () => {
    chatState.messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "   " }] },
      { id: "2", role: "user", parts: [{ type: "text", text: "Real question" }] },
    ];
    const { container } = render(<Home />);

    expect(screen.getByText("Real question")).toBeInTheDocument();
    expect(container.querySelectorAll("p.break-words")).toHaveLength(1);
  });

  it("shows an error alert", () => {
    chatState.error = new Error("Rate limited");
    render(<Home />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong: Rate limited");
  });
});
