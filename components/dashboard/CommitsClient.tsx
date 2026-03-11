"use client";
// components/dashboard/CommitsClient.tsx

import { useState }          from "react";
import { useRouter }         from "next/navigation";
import { shortSha, timeAgo, getRiskConfig } from "@/lib/utils";
import CommitDetail          from "./CommitDetail";

interface Props {
  commits:       any[];
  total:         number;
  page:          number;
  pages:         number;
  repos:         { id: string; fullName: string }[];
  currentRepoId?: string;
  currentRisk?:  string;
}

const RISKS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE", "PENDING"];

const RISK_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  ALL:      { color: "#818cf8", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.3)" },
  CRITICAL: { color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.3)" },
  HIGH:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.3)" },
  MEDIUM:   { color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.3)" },
  LOW:      { color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.3)" },
  SAFE:     { color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)" },
  PENDING:  { color: "#475569", bg: "rgba(71,85,105,0.08)", border: "rgba(71,85,105,0.3)" },
};

export default function CommitsClient({ commits, total, page, pages, repos, currentRepoId, currentRisk }: Props) {
  const router               = useRouter();
  const [selected, setSelected] = useState<any>(null);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.repoId) sp.set("repoId", params.repoId);
    if (params.risk && params.risk !== "ALL") sp.set("risk", params.risk);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    router.push(`/dashboard/commits?${sp.toString()}`);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Commits</h1>
          <p className="text-text3 text-sm mt-0.5">{total.toLocaleString()} commits analyzed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={currentRepoId || ""}
          onChange={e => navigate({ repoId: e.target.value, risk: currentRisk || "ALL" })}
          className="input-base max-w-[240px] text-sm py-2"
        >
          <option value="">All Repositories</option>
          {repos.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
        </select>

        <div className="flex gap-1.5">
          {RISKS.map(r => {
            const riskColor = RISK_COLORS[r] || RISK_COLORS.PENDING;
            const active = (currentRisk || "ALL") === r;
            return (
              <button
                key={r}
                onClick={() => navigate({ repoId: currentRepoId || "", risk: r })}
                className="text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all"
                style={{
                  color:       active ? riskColor.color : "#475569",
                  borderColor: active ? riskColor.border : "#1e2d45",
                  background:  active ? riskColor.bg : "transparent",
                }}
              >{r}</button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg2 border border-border rounded-2xl overflow-hidden">
        <div className="grid text-[10px] text-text3 font-semibold uppercase tracking-wider px-5 py-3 border-b border-border bg-bg3/50"
          style={{ gridTemplateColumns: "80px 1fr 140px 80px 80px 60px" }}>
          <span>Risk</span>
          <span>Commit</span>
          <span>Repo</span>
          <span>Author</span>
          <span>Files</span>
          <span>Time</span>
        </div>

        <div className="divide-y divide-border">
          {commits.length === 0 && (
            <div className="py-12 text-center text-text3 text-sm">No commits found</div>
          )}
          {commits.map((c: any) => {
            const cfg  = getRiskConfig(c.riskLevel);
            const bugs = Array.isArray(c.predictedBugs) ? c.predictedBugs : [];
            return (
              <div
                key={c.id}
                className="grid px-5 py-3.5 hover:bg-bg3 cursor-pointer transition-colors items-center text-sm"
                style={{ gridTemplateColumns: "80px 1fr 140px 80px 80px 60px" }}
                onClick={() => setSelected(c)}
              >
                <span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >{c.riskLevel}</span>
                </span>
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-[11px] text-cyan font-mono">{shortSha(c.sha)}</code>
                    {bugs.length > 0 && (
                      <span className="text-[10px] text-red font-semibold">⚠ {bugs.length}</span>
                    )}
                  </div>
                  <p className="text-text truncate text-xs">{c.message}</p>
                </div>
                <span className="text-text3 text-xs truncate">{c.repository?.fullName}</span>
                <span className="text-text3 text-xs truncate">{c.authorName}</span>
                <span className="text-text3 text-xs">{c.filesChanged}</span>
                <span className="text-text3 text-xs">{timeAgo(c.createdAt)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-text3">
          <span>Page {page} of {pages} · {total} total</span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => navigate({ repoId: currentRepoId || "", risk: currentRisk || "ALL", page: String(page - 1) })}
                className="btn-ghost text-xs px-4 py-2"
              >← Prev</button>
            )}
            {page < pages && (
              <button
                onClick={() => navigate({ repoId: currentRepoId || "", risk: currentRisk || "ALL", page: String(page + 1) })}
                className="btn-ghost text-xs px-4 py-2"
              >Next →</button>
            )}
          </div>
        </div>
      )}

      {selected && <CommitDetail commit={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
