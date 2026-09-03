"use client";

import ChatPanel from "@/components/chat/ChatPanel";
import MobileNav from "@/components/MobileNav";

const NAV_ITEMS = [
  { href: "/", label: "Storms", icon: "◌" },
  { href: "/monitor", label: "Monitor", icon: "◎" },
  { href: "/live", label: "Live", icon: "●" },
  { href: "/chat", label: "Chat", icon: "◇" },
];

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen relative" style={{ background: "linear-gradient(135deg,#eef0f8 0%,#f0f2f7 100%)" }}>
      {/* Funky top accent bar */}
      <div className="h-1 w-full shrink-0" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981)" }} />

      <div className="flex-1 min-h-0 pb-2 lg:pb-0">
        <ChatPanel />
      </div>

      <MobileNav items={NAV_ITEMS} />
    </div>
  );
}
