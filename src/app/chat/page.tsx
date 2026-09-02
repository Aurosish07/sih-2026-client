"use client";

import Link from "next/link";
import ChatPanel from "@/components/chat/ChatPanel";

const NAV_LINKS = [
  { href: "/", label: "Storms" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/monitor", label: "Monitor" },
  { href: "/live", label: "Live" },
  { href: "/chat", label: "Chat", active: true },
];

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen" style={{ background: "linear-gradient(135deg,#eef0f8 0%,#f0f2f7 100%)" }}>
      {/* Funky top accent bar */}
      <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981)" }} />

      {/* Nav */}
      <nav className="shrink-0 border-b px-6 py-3" style={{ background: "rgba(255,255,255,0.9)", borderColor: "#e4e8f0", backdropFilter: "blur(12px)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-base shadow-md" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              🌀
            </div>
            <Link href="/" className="font-bold text-lg hover:opacity-80 transition" style={{ color: "#1a2035" }}>
              CycloneGPT
            </Link>
            <span className="hidden sm:inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "#eef2ff", color: "#6366f1" }}>
              AI
            </span>
          </div>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="rounded-full px-3 py-1.5 text-sm font-medium transition-all"
                style={l.active ? { background: "#eef2ff", color: "#6366f1" } : { color: "#5a6380" }}>
                {l.label}
              </Link>
            ))}
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
