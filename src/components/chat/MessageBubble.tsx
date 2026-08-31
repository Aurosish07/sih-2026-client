"use client";

import type { ChatMessage } from "@/lib/types";
import { formatTime } from "@/lib/formatters";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-orange-600 text-white"
            : "bg-white text-slate-800 border border-slate-200"
        }`}
      >
        {!isUser && (
          <div className="text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">
            CycloneGPT
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content || (
            <span className="text-slate-400 italic">Thinking...</span>
          )}
        </div>
        <div
          className={`text-[10px] mt-1 ${
            isUser ? "text-orange-200/50" : "text-slate-400"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
