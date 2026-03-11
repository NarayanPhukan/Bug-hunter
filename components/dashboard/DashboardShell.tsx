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
  plan?:    "free" | "pro" | "team";
}

const NAV_MAIN = [
  { href: "/dashboard",              icon: "⬡", label: "Overview"      },
  { href: "/dashboard/commits",      icon: "◈", label: "Commits"       },
  { href: "/dashboard/repos",        icon: "⊕", label: "Repositories"  },
  { href: "/dashboard/alerts",       icon: "⚠", label: "Alerts"        },
];

const NAV_ACCOUNT = [
  { href: "/dashboard/billing",      icon: "◎", label: "Billing"       },
  { href: "/dashboard/account",      icon: "▦", label: "Account"       },
];

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  free: { label: "FREE",  cls: "badge-free" },
  pro:  { label: "PRO",   cls: "badge-pro"  },
  team: { label: "TEAM",  cls: "badge-team" },
};

export default function DashboardShell({ children, session, plan = "free" }: Props) {
  const pathname       = usePathname();
  const [time, setTime] = useState("");
  const badge          = PLAN_BADGE[plan];

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col border-r border-border bg-bg2 sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm font-bold text-white">BH</span>
          </div>
          <div>
            <div className="font-display text-sm font-bold text-text tracking-tight">BugHunter</div>
            <div className="text-[10px] text-text3 font-mono">v2.4.1</div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <div className="text-[10px] font-semibold text-text3 uppercase tracking-widest px-3 mb-2">
            Analysis
          </div>
          {NAV_MAIN.map(n => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href} href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-indigo/10 text-indigo2 border border-indigo/20"
                    : "text-text3 hover:text-text2 hover:bg-bg3"
                }`}
              >
                <span className={`text-base ${active ? "text-indigo2" : "text-text3"}`}>{n.icon}</span>
                <span className="font-medium">{n.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo2 animate-blink" />}
              </Link>
            );
          })}

          <div className="text-[10px] font-semibold text-text3 uppercase tracking-widest px-3 mt-5 mb-2">
            Settings
          </div>
          {NAV_ACCOUNT.map(n => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href} href={n.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-indigo/10 text-indigo2 border border-indigo/20"
                    : "text-text3 hover:text-text2 hover:bg-bg3"
                }`}
              >
                <span className={`text-base ${active ? "text-indigo2" : "text-text3"}`}>{n.icon}</span>
                <span className="font-medium">{n.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo2 animate-blink" />}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade nudge — only for free plan */}
        {plan === "free" && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-indigo/8 border border-indigo/20">
            <div className="text-xs font-semibold text-indigo2 mb-1">Upgrade to Pro</div>
            <div className="text-[11px] text-text3 mb-2.5 leading-relaxed">
              Unlimited repos, 1k commits/month, Slack alerts.
            </div>
            <Link
              href="/dashboard/billing"
              className="block text-center text-xs font-semibold bg-indigo hover:bg-indigo3 text-white py-1.5 rounded-lg transition-colors"
            >
              View plans →
            </Link>
          </div>
        )}

        {/* User */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-3 mb-2.5">
            {session.user?.image ? (
              <Image
                src={session.user.image} alt="avatar"
                width={30} height={30}
                className="rounded-full border border-border2 flex-shrink-0"
              />
            ) : (
              <div className="w-[30px] h-[30px] rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center flex-shrink-0">
                <span className="text-indigo2 text-xs font-bold">
                  {(session.user?.name || "U")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-text font-semibold truncate">
                {session.user?.name || "User"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-[11px] text-text3 hover:text-red border border-border hover:border-red/30 rounded-lg px-2 py-1.5 transition-all font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg2 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            {/* Page title comes from child routes — use breadcrumb approach */}
            <div className="flex items-center gap-2 text-sm text-text3">
              <span className="text-green animate-blink text-xs">●</span>
              <span className="font-mono text-[11px]">LIVE</span>
              <span className="text-border2 mx-1">·</span>
              <span className="font-mono text-[11px] text-text3">CLAUDE SONNET</span>
              <span className="text-border2 mx-1">·</span>
              <span className="font-mono text-[11px] text-text3">GITHUB WEBHOOK</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono text-[11px] text-text3 tabular-nums">{time}</div>
            <Link
              href="/dashboard/billing"
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${badge.cls}`}
            >
              {badge.label}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
