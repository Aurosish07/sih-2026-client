"use client";

import Link from "next/link";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/70 px-6 py-3 shrink-0 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl hover:opacity-80">
              🌀
            </Link>
            <Link href="/" className="font-bold text-slate-900 hover:opacity-80">
              CycloneGPT
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/monitor"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Monitor
            </Link>
            <Link
              href="/chat"
              className="text-sm text-orange-600 font-medium"
            >
              Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat fills remaining height */}
      <div className="flex-1 min-h-0">
        <ChatPanel />
      </div>
    </div>
  );
}
