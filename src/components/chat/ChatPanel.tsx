"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import MessageBubble from "./MessageBubble";
import ToolCallDisplay from "./ToolCallDisplay";

const SUGGESTIONS = [
  "What's happening with Cyclone Amphan?",
  "Show me the track of Cyclone Biparjoy",
  "Analyze satellite imagery for the latest storm",
  "What are the recent observations for Cyclone Fani?",
  "Predict the next stage for the current cyclone",
];

export default function ChatPanel() {
  const { messages, isStreaming, activeToolCalls, sendMessage, stopStreaming, clearMessages } = useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeToolCalls]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#f8f9ff" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ background: "#ffffff", borderColor: "#e4e8f0", boxShadow: "0 2px 8px rgba(99,102,241,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            🌀
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1a2035" }}>CycloneGPT</h2>
            <p className="text-[10px] font-medium" style={{ color: "#8b95b0" }}>AI cyclone intelligence agent</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" }}>
            <span className="h-1.5 w-1.5 rounded-full pulse-live" style={{ background: "#10b981" }} />
            Online
          </span>
        </div>
        <button onClick={clearMessages}
          className="rounded-xl border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
          style={{ background: "#f4f6fb", borderColor: "#e4e8f0", color: "#5a6380" }}>
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 slide-in-up">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-xl" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899)" }}>
                🌀
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#1a2035" }}>CycloneGPT</h3>
              <p className="text-sm max-w-xs" style={{ color: "#5a6380" }}>
                Ask me anything about North Indian Ocean cyclones — tracks, intensity, satellite analysis, and AI predictions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                  style={{ background: "#ffffff", borderColor: "#c7d2fe", color: "#6366f1", boxShadow: "0 2px 8px rgba(99,102,241,0.1)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ToolCallDisplay toolCalls={activeToolCalls} />
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t shrink-0" style={{ background: "#ffffff", borderColor: "#e4e8f0" }}>
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about a cyclone..."
            rows={1}
            className="flex-1 rounded-2xl border px-4 py-3 text-sm resize-none outline-none transition-all"
            style={{ background: "#f4f6fb", borderColor: input ? "#c7d2fe" : "#e4e8f0", color: "#1a2035", boxShadow: input ? "0 0 0 3px rgba(99,102,241,0.12)" : "none" }}
          />
          {isStreaming ? (
            <button onClick={stopStreaming}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
              ⏹ Stop
            </button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              Send ↑
            </button>
          )}
        </div>
        <div className="mt-2 text-[10px] text-center" style={{ color: "#c4c9dc" }}>
          Powered by StormSense AI · North Indian Ocean Basin
        </div>
      </div>
    </div>
  );
}
