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
  const { messages, isStreaming, activeToolCalls, sendMessage, stopStreaming, clearMessages } =
    useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeToolCalls]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/70">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">CycloneGPT</h2>
          <p className="text-[10px] text-slate-500">
            AI cyclone intelligence agent
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="text-[10px] px-2 py-1 rounded bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🌀</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                CycloneGPT
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                Ask me anything about North Indian Ocean cyclones — tracks,
                intensity, satellite analysis, and predictions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <ToolCallDisplay toolCalls={activeToolCalls} />
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white/70">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a cyclone..."
            rows={1}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 shadow-sm"
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
