"use client";

import type { ChatMessage } from "@/lib/types";
import { formatTime } from "@/lib/formatters";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 slide-in-up`}>
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm shadow-sm" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          🌀
        </div>
      )}
      <div
        className="max-w-[78%] rounded-2xl px-4 py-3 shadow-sm"
        style={isUser ? {
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#ffffff",
          borderRadius: "18px 18px 4px 18px",
        } : {
          background: "#ffffff",
          color: "#1a2035",
          border: "1.5px solid #e4e8f0",
          borderRadius: "4px 18px 18px 18px",
          boxShadow: "0 2px 8px rgba(99,102,241,0.08)",
        }}
      >
        {!isUser && (
          <div className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: "#6366f1" }}>
            CycloneGPT
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content || (
            <span className="italic" style={{ color: isUser ? "rgba(255,255,255,0.6)" : "#8b95b0" }}>Thinking...</span>
          )}
        </div>
        <div className="text-[10px] mt-1.5" style={{ color: isUser ? "rgba(255,255,255,0.5)" : "#8b95b0" }}>
          {formatTime(message.timestamp)}
        </div>
      </div>
      {isUser && (
        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm" style={{ background: "#eef2ff", color: "#6366f1" }}>
          You
        </div>
      )}
    </div>
  );
}
