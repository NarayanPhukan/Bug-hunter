"use client";
// components/dashboard/DashboardShell.tsx

import { useState, useEffect } from "react";
import { signOut }             from "next-auth/react";
import Image                   from "next/image";
import Link                    from "next/link";
import { usePathname }         from "next/navigation";
import type { Session }        from "next-auth";

interface Props {
  children: React.ReactNode;
  session:  Session;
}

const NAV = [
  { href: "/dashboard",         icon: "⬡", label: "Overview"    },
  { href: "/dashboard/commits", icon: "◈", label: "Commits"     },
  { href: "/dashboard/repos",   icon: "⊕", label: "Repositories" },
  { href: "/dashboard/alerts",  icon: "⚠", label: "Alerts"      },
];

export default function DashboardShell({ children, session }: Props) {
  const pathname  = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="scanlines min-h-screen bg-bg flex">
      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-bg2"
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 border-2 border-green rounded flex items-center justify-center animate-glow-green flex-shrink-0">
            <span className="font-display text-sm font-black text-green">BH</span>
          </div>
          <div>
            <div className="font-display text-xs font-bold text-green tracking-widest">BUGHUNTER</div>
            <div className="text-[9px] text-dim tracking-widest">v2.4.1 LIVE</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href} href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs transition-all ${
                  active
                    ? "bg-green/10 text-green border border-green/30"
                    : "text-dim hover:text-textmain hover:bg-bg3"
                }`}
              >
                <span className={active ? "text-green" : ""}>{n.icon}</span>
                <span className="font-sans font-medium">{n.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green animate-blink" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            {session.user?.image && (
              <Image
                src={session.user.image} alt="avatar"
                width={28} height={28}
                className="rounded border border-border2"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-textmain font-sans font-medium truncate">
                {session.user?.name || "User"}
              </div>
              <div className="text-[10px] text-dim truncate">{session.user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-[10px] text-dim hover:text-red border border-border hover:border-red/30 rounded px-2 py-1.5 transition-colors font-mono tracking-wider"
          >
            DISCONNECT
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg2 sticky top-0 z-50">
          <div className="flex items-center gap-2 text-[10px] text-dim font-mono">
            <span className="text-green animate-blink">●</span>
            <span>LIVE MONITORING</span>
            <span className="text-border2 mx-2">|</span>
            <span className="text-blue">CLAUDE SONNET</span>
            <span className="text-border2 mx-2">|</span>
            <span>GITHUB WEBHOOK</span>
          </div>
          <div className="text-[10px] text-dim font-mono">{time}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
