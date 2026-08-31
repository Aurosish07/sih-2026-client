"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";

export function useChat() {
  const { messages, isStreaming, activeToolCalls, sendMessage, stopStreaming, clearMessages } =
    useChatStore();

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isStreaming) return;
      sendMessage(text);
    },
    [sendMessage, isStreaming],
  );

  return {
    messages,
    isStreaming,
    activeToolCalls,
    send,
    stop: stopStreaming,
    clear: clearMessages,
  };
}
