import { create } from "zustand";
import type { ChatMessage, ToolCall } from "@/lib/types";
import { streamChat } from "@/lib/api";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeToolCalls: ToolCall[];
  abortFn: (() => void) | null;

  sendMessage: (text: string) => void;
  stopStreaming: () => void;
  clearMessages: () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  activeToolCalls: [],
  abortFn: null,

  sendMessage: (text: string) => {
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      toolCalls: [],
    };

    set((state) => ({
      messages: [...state.messages, userMsg, assistantMsg],
      isStreaming: true,
      activeToolCalls: [],
    }));

    const abort = streamChat(
      text,
      (token) => {
        set((state) => {
          const msgs = [...state.messages];
          const last = msgs[msgs.length - 1];
          if (last.role === "assistant") {
            msgs[msgs.length - 1] = {
              ...last,
              content: last.content + token,
            };
          }
          return { messages: msgs };
        });
      },
      (name, input) => {
        const tc: ToolCall = {
          id: uid(),
          name,
          input,
          output: "",
          status: "running",
        };
        set((state) => ({
          activeToolCalls: [...state.activeToolCalls, tc],
        }));
      },
      (name, output) => {
        set((state) => ({
          activeToolCalls: state.activeToolCalls.map((tc) =>
            tc.name === name && tc.status === "running"
              ? { ...tc, output, status: "completed" as const }
              : tc,
          ),
        }));
      },
      () => {
        set((state) => ({
          isStreaming: false,
          abortFn: null,
          messages: state.messages.map((m, i) =>
            i === state.messages.length - 1 && m.role === "assistant"
              ? { ...m, toolCalls: state.activeToolCalls }
              : m,
          ),
        }));
      },
      (err) => {
        set((state) => ({
          isStreaming: false,
          abortFn: null,
          messages: state.messages.map((m, i) =>
            i === state.messages.length - 1 && m.role === "assistant"
              ? { ...m, content: state.messages[i].content || `Error: ${err.message}` }
              : m,
          ),
        }));
      },
    );

    set({ abortFn: abort });
  },

  stopStreaming: () => {
    const { abortFn } = get();
    abortFn?.();
    set({ isStreaming: false, abortFn: null });
  },

  clearMessages: () => set({ messages: [], activeToolCalls: [] }),
}));
