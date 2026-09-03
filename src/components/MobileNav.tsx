"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavItem {
  href: string;
  label: string;
  icon: string;
}

export default function MobileNav({ items }: { items: MobileNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-3xl border bg-white/85 px-2 py-2 shadow-2xl backdrop-blur-xl"
        style={{ borderColor: "rgba(228,232,240,0.8)", boxShadow: "0 20px 40px -12px rgba(79,70,229,0.35)" }}>
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 transition-all"
              style={active
                ? { background: "#eef2ff", color: "#6366f1" }
                : { background: "transparent", color: "#9aa3b9" }}
            >
              {active && (
                <span
                  className="absolute -top-2 h-1 w-6 rounded-full"
                  style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
                />
              )}
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
