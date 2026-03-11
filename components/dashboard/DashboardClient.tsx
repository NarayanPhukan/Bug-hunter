"use client";
// components/dashboard/DashboardClient.tsx

import { useState }    from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { timeAgo, shortSha, getRiskConfig } from "@/lib/utils";
import AddRepoModal    from "./AddRepoModal";
import CommitDetail    from "./CommitDetail";

interface Props {
  user:          { name?: string | null; image?: string | null };
  repos:         any[];
  recentCommits: any[];
  riskCounts:    { riskLevel: string; _count: { riskLevel: number } }[];
  dailyStats:    any[];
}

const RISK_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"];

export default function DashboardClient({ user, repos, recentCommits, riskCounts, dailyStats }: Props) {
  const [filter,         setFilter]         = useState("ALL");
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [showAddRepo,    setShowAddRepo]     = useState(false);
  const [commits,        setCommits]         = useState(recentCommits);

  // Aggregated stats
  const totalScanned = riskCounts.reduce((a, b) => a + b._count.riskLevel, 0);
  const critical     = riskCounts.find(r => r.riskLevel === "CRITICAL")?._count.riskLevel || 0;
  const high         = riskCounts.find(r => r.riskLevel === "HIGH")?._count.riskLevel    || 0;
  const safe         = riskCounts.find(r => r.riskLevel === "SAFE")?._count.riskLevel    || 0;
  const bugsCaught   = riskCounts.filter(r => !["SAFE","PENDING","FAILED"].includes(r.riskLevel))
    .reduce((a,b) => a + b._count.riskLevel, 0);

  // Pie chart data
  const pieData = RISK_ORDER.map(r => ({
    name:  r,
    value: riskCounts.find(x => x.riskLevel === r)?._count.riskLevel || 0,
    color: getRiskConfig(r).color,
  })).filter(d => d.value > 0);

  // Area chart — aggregate daily stats by date
  const areaData = (() => {
    const map: Record<string, { date: string; critical: number; high: number; safe: number }> = {};
    dailyStats.forEach(s => {
      const d = new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!map[d]) map[d] = { date: d, critical: 0, high: 0, safe: 0 };
      map[d].critical += s.critical;
      map[d].high     += s.high;
      map[d].safe     += s.safe;
    });
    return Object.values(map);
  })();

  const filteredCommits = commits.filter(c =>
    filter === "ALL" || c.riskLevel === filter
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-textmain tracking-wider">OVERVIEW</h1>
          <p className="text-dim text-xs mt-1 font-sans">
            {repos.length} repo{repos.length !== 1 ? "s" : ""} monitored ·{" "}
            <span className="text-green">{totalScanned} commits analyzed</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddRepo(true)}
          className="flex items-center gap-2 bg-green/10 border border-green/40 hover:bg-green/20 text-green text-xs font-mono px-4 py-2 rounded transition-all tracking-widest"
        >
          <span>⊕</span> ADD REPO
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "COMMITS SCANNED",  value: totalScanned, color: "#c8d8e8", icon: "◈" },
          { label: "BUGS PREDICTED",   value: bugsCaught,   color: "#ff3355", icon: "⚠" },
          { label: "CRITICAL ISSUES",  value: critical,     color: "#ff3355", icon: "☠" },
          { label: "SAFE DEPLOYS",     value: safe,         color: "#00ff88", icon: "✓" },
        ].map(s => (
          <div key={s.label}
            className="bg-bg2 border border-border rounded-lg p-4 hover:border-border2 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-dim text-xs tracking-widest">{s.label}</span>
              <span style={{ color: s.color }} className="text-sm">{s.icon}</span>
            </div>
            <div className="font-display text-3xl font-black" style={{ color: s.color }}>
              {s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="col-span-2 bg-bg2 border border-border rounded-lg p-4">
          <div className="text-[10px] text-dim tracking-widest mb-4">── 7-DAY RISK TREND</div>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={areaData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gcrit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff3355" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff3355" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="ghigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff8800" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff8800" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="gsafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#5a7090", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a7090", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0b0f17", border: "1px solid #243044", borderRadius: 4, fontSize: 11 }}
                  labelStyle={{ color: "#c8d8e8" }}
                />
                <Area type="monotone" dataKey="critical" stroke="#ff3355" fill="url(#gcrit)" strokeWidth={2} />
                <Area type="monotone" dataKey="high"     stroke="#ff8800" fill="url(#ghigh)" strokeWidth={2} />
                <Area type="monotone" dataKey="safe"     stroke="#00ff88" fill="url(#gsafe)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-dim text-xs">
              No data yet — push some commits
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-bg2 border border-border rounded-lg p-4">
          <div className="text-[10px] text-dim tracking-widest mb-4">── RISK BREAKDOWN</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                    dataKey="value" strokeWidth={0}
                  >
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-dim">{d.name}</span>
                    </div>
                    <span style={{ color: d.color }} className="font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-dim text-xs">No data yet</div>
          )}
        </div>
      </div>

      {/* ── Commit feed ────────────────────────────────── */}
      <div className="bg-bg2 border border-border rounded-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="text-[10px] text-dim tracking-widest">── RECENT COMMITS</div>
          <div className="flex gap-2">
            {["ALL", ...RISK_ORDER].map(f => {
              const cfg = f === "ALL" ? null : getRiskConfig(f);
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-[10px] px-2.5 py-1 rounded border transition-all font-mono tracking-wider"
                  style={{
                    borderColor: filter === f ? (cfg?.color || "#00ff88") : "#1a2535",
                    color:       filter === f ? (cfg?.color || "#00ff88") : "#5a7090",
                    background:  filter === f ? (cfg?.bg || "rgba(0,255,136,0.08)") : "transparent",
                  }}
                >{f}</button>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredCommits.length === 0 && (
            <div className="py-12 text-center text-dim text-xs font-sans">
              {commits.length === 0
                ? "Add a repository and push a commit to get started"
                : "No commits match this filter"}
            </div>
          )}
          {filteredCommits.map((c: any) => {
            const cfg = getRiskConfig(c.riskLevel);
            const bugs = Array.isArray(c.predictedBugs) ? c.predictedBugs : [];
            return (
              <div
                key={c.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-bg3 cursor-pointer transition-colors animate-slide-in"
                onClick={() => setSelectedCommit(c)}
              >
                {/* Risk badge */}
                <div
                  className="mt-0.5 flex-shrink-0 text-[9px] font-bold px-2 py-1 rounded border tracking-widest font-mono"
                  style={{
                    color: cfg.color, background: cfg.bg, borderColor: cfg.border,
                    animation: cfg.pulse ? "pulse-red 1.5s infinite" : "none",
                  }}
                >
                  {c.riskLevel}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <code className="text-[10px] text-blue bg-bg px-1.5 py-0.5 rounded border border-border">
                      {shortSha(c.sha)}
                    </code>
                    <span className="text-dim text-[10px]">{c.repository?.fullName}</span>
                    <span className="text-dim text-[10px] ml-auto">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-textmain font-sans truncate">{c.message}</p>
                  <div className="flex items-center gap-4 mt-1 text-[10px] text-dim">
                    <span>{c.authorName}</span>
                    <span>{c.filesChanged} files</span>
                    {bugs.length > 0 && (
                      <span style={{ color: cfg.color }}>
                        {bugs.length} issue{bugs.length !== 1 ? "s" : ""} detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-dim text-xs self-center">›</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Repos quick list ───────────────────────────── */}
      {repos.length > 0 && (
        <div className="bg-bg2 border border-border rounded-lg">
          <div className="px-5 py-3 border-b border-border text-[10px] text-dim tracking-widest">
            ── MONITORED REPOSITORIES
          </div>
          <div className="divide-y divide-border">
            {repos.map((r: any) => {
              const lastCommit = r.commits?.[0];
              const cfg = lastCommit ? getRiskConfig(lastCommit.riskLevel) : null;
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green text-xs">⬡</span>
                    <div>
                      <div className="text-sm text-textmain font-sans">{r.fullName}</div>
                      <div className="text-[10px] text-dim">{r.language || "Unknown"} · {r._count.commits} commits</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cfg && (
                      <span className="text-[9px] border px-2 py-0.5 rounded font-mono"
                        style={{ color: cfg.color, borderColor: cfg.border }}>
                        {lastCommit.riskLevel}
                      </span>
                    )}
                    <span className="text-[10px] text-dim">
                      {r.webhookActive ? (
                        <span className="text-green">● WEBHOOK LIVE</span>
                      ) : (
                        <span className="text-yellow">○ POLLING</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────── */}
      {showAddRepo && <AddRepoModal onClose={() => setShowAddRepo(false)} />}
      {selectedCommit && (
        <CommitDetail commit={selectedCommit} onClose={() => setSelectedCommit(null)} />
      )}
    </div>
  );
}
