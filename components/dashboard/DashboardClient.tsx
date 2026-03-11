"use client";
// components/dashboard/DashboardClient.tsx

import { useState }     from "react";
import Link             from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import CommitDetail     from "./CommitDetail";
import AddRepoModal     from "./AddRepoModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Usage {
  repos:       number;
  commits:     number;
  repoLimit:   number | null;
  commitLimit: number | null;
  plan:        string;
}

interface Props {
  user:          { name?: string | null; image?: string | null };
  repos:         any[];
  recentCommits: any[];
  riskCounts:    { riskLevel: string; _count: { riskLevel: number } }[];
  dailyStats:    any[];
  usage:         Usage;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const RISK_CFG = {
  CRITICAL: { color: "#f43f5e", bg: "bg-red/10",    text: "text-red",    label: "CRITICAL" },
  HIGH:     { color: "#f97316", bg: "bg-orange/10",  text: "text-orange", label: "HIGH"     },
  MEDIUM:   { color: "#eab308", bg: "bg-yellow/10",  text: "text-yellow", label: "MEDIUM"   },
  LOW:      { color: "#22d3ee", bg: "bg-cyan/10",    text: "text-cyan",   label: "LOW"      },
  SAFE:     { color: "#22c55e", bg: "bg-green/10",   text: "text-green",  label: "SAFE"     },
  PENDING:  { color: "#475569", bg: "bg-text3/10",   text: "text-text3",  label: "PENDING"  },
  FAILED:   { color: "#475569", bg: "bg-text3/10",   text: "text-text3",  label: "FAILED"   },
} as const;

function getRisk(r: string) {
  return RISK_CFG[r as keyof typeof RISK_CFG] ?? RISK_CFG.PENDING;
}

function timeAgo(date: string) {
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function shortSha(sha: string) { return sha.slice(0, 7); }

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent = "text-text",
}: {
  label: string; value: string | number; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-bg2 border border-border rounded-2xl p-5">
      <div className="text-xs font-medium text-text3 mb-2">{label}</div>
      <div className={`font-display text-3xl font-bold mb-1 ${accent}`}>{value}</div>
      {sub && <div className="text-xs text-text3">{sub}</div>}
    </div>
  );
}

// ── Usage meter ───────────────────────────────────────────────────────────────

function UsageMeter({
  label, used, limit, plan,
}: {
  label: string; used: number; limit: number | null; plan: string;
}) {
  if (limit === null) {
    return (
      <div className="bg-bg2 border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text3">{label}</span>
          <span className="text-xs text-text2 font-semibold">{used.toLocaleString()} <span className="text-text3 font-normal">/ ∞</span></span>
        </div>
        <div className="h-1.5 bg-bg4 rounded-full">
          <div className="h-full w-full bg-indigo/30 rounded-full" />
        </div>
        <div className="text-[11px] text-text3 mt-2">Unlimited on your plan</div>
      </div>
    );
  }

  const pct     = Math.min((used / limit) * 100, 100);
  const isWarn  = pct >= 80;
  const barColor = pct >= 95 ? "#f43f5e" : pct >= 80 ? "#f97316" : "#6366f1";

  return (
    <div className={`bg-bg2 border rounded-2xl p-5 ${isWarn ? "border-orange/30" : "border-border"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text3">{label}</span>
        <span className={`text-xs font-semibold ${isWarn ? "text-orange" : "text-text2"}`}>
          {used.toLocaleString()} <span className="text-text3 font-normal">/ {limit.toLocaleString()}</span>
        </span>
      </div>
      <div className="h-1.5 bg-bg4 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {isWarn && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-orange">{Math.round(pct)}% used — upgrade for more</span>
          <Link href="/dashboard/billing" className="text-[11px] text-indigo2 hover:underline">Upgrade →</Link>
        </div>
      )}
      {!isWarn && <div className="text-[11px] text-text3 mt-2">{Math.round(pct)}% of monthly limit used</div>}
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  const cfg = getRisk(risk);
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.text} ${cfg.bg} flex-shrink-0`}>
      {cfg.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardClient({
  user, repos, recentCommits, riskCounts, dailyStats, usage,
}: Props) {
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [showAddRepo,    setShowAddRepo]     = useState(false);

  // ── Stats derived from data ───────────────────────────────────────────────
  const totalCommits = riskCounts.reduce((s, r) => s + r._count.riskLevel, 0);
  const criticalCount = riskCounts.find(r => r.riskLevel === "CRITICAL")?._count.riskLevel ?? 0;
  const highCount     = riskCounts.find(r => r.riskLevel === "HIGH")?._count.riskLevel ?? 0;
  const safeCount     = riskCounts.find(r => r.riskLevel === "SAFE")?._count.riskLevel ?? 0;
  const lowCount      = riskCounts.find(r => r.riskLevel === "LOW")?._count.riskLevel ?? 0;
  const safeRate      = totalCommits > 0
    ? Math.round(((safeCount + lowCount) / totalCommits) * 100)
    : 0;

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = dailyStats.map((d: any) => ({
    date:     new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    critical: d.critical,
    high:     d.high,
    medium:   d.medium,
    safe:     d.safe + d.low,
    total:    d.totalCommits,
  }));

  const riskBarData = [
    { label: "CRITICAL", count: criticalCount,                                                                       color: "#f43f5e" },
    { label: "HIGH",     count: highCount,                                                                            color: "#f97316" },
    { label: "MEDIUM",   count: riskCounts.find(r => r.riskLevel === "MEDIUM")?._count.riskLevel ?? 0,               color: "#eab308" },
    { label: "LOW",      count: lowCount,                                                                             color: "#22d3ee" },
    { label: "SAFE",     count: safeCount,                                                                            color: "#22c55e" },
  ];

  // ── Empty state ───────────────────────────────────────────────────────────
  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-3xl">⬡</div>
        <div>
          <h2 className="font-display text-xl font-bold text-text mb-2">No repositories yet</h2>
          <p className="text-text3 text-sm max-w-sm">
            Connect a GitHub repo and BugHunter will analyze every commit automatically.
          </p>
        </div>
        <button
          onClick={() => setShowAddRepo(true)}
          className="flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-glow-indigo"
        >
          + Add your first repository
        </button>
        {showAddRepo && <AddRepoModal onClose={() => setShowAddRepo(false)} />}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Overview</h1>
          <p className="text-text3 text-sm mt-0.5">
            {repos.length} repo{repos.length !== 1 ? "s" : ""} monitored · live analysis
          </p>
        </div>
        <button
          onClick={() => setShowAddRepo(true)}
          className="flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-glow-indigo"
        >
          + Add Repo
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total commits"   value={totalCommits.toLocaleString()} sub="all time"           accent="text-text"   />
        <StatCard label="Critical issues" value={criticalCount}                  sub="need attention"     accent="text-red"    />
        <StatCard label="High risk"       value={highCount}                      sub="review recommended" accent="text-orange" />
        <StatCard label="Safe rate"       value={`${safeRate}%`}                 sub="safe + low commits" accent="text-green"  />
      </div>

      {/* ── Usage meters ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <UsageMeter
          label="Repositories"
          used={usage.repos}
          limit={usage.repoLimit}
          plan={usage.plan}
        />
        <UsageMeter
          label="Commits analyzed this month"
          used={usage.commits}
          limit={usage.commitLimit}
          plan={usage.plan}
        />
      </div>

      {/* ── Charts ───────────────────────────────────────── */}
      {chartData.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Area chart — 7 day trend */}
          <div className="lg:col-span-2 bg-bg2 border border-border rounded-2xl p-5">
            <div className="text-sm font-semibold text-text mb-4">7-day commit trend</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSafe"     x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1220", border: "1px solid #1e2d45", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area type="monotone" dataKey="safe"     stroke="#22c55e" fill="url(#gSafe)"     strokeWidth={2} name="Safe/Low" />
                <Area type="monotone" dataKey="critical" stroke="#f43f5e" fill="url(#gCritical)" strokeWidth={2} name="Critical" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart — risk distribution */}
          <div className="bg-bg2 border border-border rounded-2xl p-5">
            <div className="text-sm font-semibold text-text mb-4">Risk distribution</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={riskBarData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0d1220", border: "1px solid #1e2d45", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "rgba(99,102,241,0.05)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Commits">
                  {riskBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Recent commits ────────────────────────────────── */}
      <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="text-sm font-semibold text-text">Recent commits</div>
          <Link
            href="/dashboard/commits"
            className="text-xs text-indigo2 hover:text-indigo transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentCommits.length === 0 && (
            <div className="px-5 py-10 text-center text-text3 text-sm">
              No commits yet. Push to a tracked repo to start.
            </div>
          )}
          {recentCommits.slice(0, 10).map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedCommit(c)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-bg3 transition-colors text-left group"
            >
              <span className="font-mono text-[11px] text-text3 w-14 flex-shrink-0 group-hover:text-indigo2 transition-colors">
                {shortSha(c.sha)}
              </span>
              <span className="flex-1 text-sm text-text2 truncate group-hover:text-text transition-colors">
                {c.message}
              </span>
              <span className="text-[11px] text-text3 flex-shrink-0 hidden sm:block">
                {c.repository?.fullName}
              </span>
              <span className="text-[11px] text-text3 flex-shrink-0 w-16 text-right">
                {timeAgo(c.createdAt)}
              </span>
              <RiskBadge risk={c.riskLevel} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Repos overview ────────────────────────────────── */}
      <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="text-sm font-semibold text-text">Monitored repositories</div>
          <Link href="/dashboard/repos" className="text-xs text-indigo2 hover:text-indigo transition-colors">
            Manage →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {repos.map((r: any) => {
            const lastCommit = r.commits?.[0];
            const cfg        = lastCommit ? getRisk(lastCommit.riskLevel) : null;
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text truncate">{r.fullName}</span>
                    {r.private && (
                      <span className="text-[10px] text-text3 border border-border2 px-1.5 py-0.5 rounded-full">private</span>
                    )}
                  </div>
                  <div className="text-xs text-text3 mt-0.5">
                    {r._count.commits} commit{r._count.commits !== 1 ? "s" : ""}
                    {r.language && ` · ${r.language}`}
                  </div>
                </div>
                {cfg && lastCommit && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-text3 hidden sm:block">{timeAgo(lastCommit.createdAt)}</span>
                    <RiskBadge risk={lastCommit.riskLevel} />
                  </div>
                )}
                {!lastCommit && (
                  <span className="text-xs text-text3 flex-shrink-0">No commits yet</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {selectedCommit && (
        <CommitDetail commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
      )}
      {showAddRepo && (
        <AddRepoModal onClose={() => setShowAddRepo(false)} />
      )}
    </div>
  );
}
