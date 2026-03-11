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
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-textmain tracking-wider">COMMITS</h1>
        <p className="text-dim text-xs mt-1 font-sans">{total.toLocaleString()} commits analyzed</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={currentRepoId || ""}
          onChange={e => navigate({ repoId: e.target.value, risk: currentRisk || "ALL" })}
          className="bg-bg2 border border-border text-textmain text-xs rounded px-3 py-2 font-mono outline-none"
        >
          <option value="">All Repositories</option>
          {repos.map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
        </select>

        <div className="flex gap-1.5">
          {RISKS.map(r => {
            const cfg = r === "ALL" ? null : getRiskConfig(r);
            const active = (currentRisk || "ALL") === r;
            return (
              <button
                key={r}
                onClick={() => navigate({ repoId: currentRepoId || "", risk: r })}
                className="text-[9px] px-2.5 py-1 rounded border font-mono tracking-widest transition-all"
                style={{
                  color:       active ? (cfg?.color || "#00ff88") : "#5a7090",
                  borderColor: active ? (cfg?.color || "#00ff88") : "#1a2535",
                  background:  active ? (cfg?.bg    || "rgba(0,255,136,0.08)") : "transparent",
                }}
              >{r}</button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-bg2 border border-border rounded-lg overflow-hidden">
        <div className="grid text-[9px] text-dim tracking-widest px-4 py-2 border-b border-border"
          style={{ gridTemplateColumns: "80px 1fr 140px 80px 80px 60px" }}>
          <span>RISK</span>
          <span>COMMIT</span>
          <span>REPO</span>
          <span>AUTHOR</span>
          <span>FILES</span>
          <span>AGO</span>
        </div>

        <div className="divide-y divide-border">
          {commits.length === 0 && (
            <div className="py-12 text-center text-dim text-xs font-sans">No commits found</div>
          )}
          {commits.map((c: any) => {
            const cfg  = getRiskConfig(c.riskLevel);
            const bugs = Array.isArray(c.predictedBugs) ? c.predictedBugs : [];
            return (
              <div
                key={c.id}
                className="grid px-4 py-3 hover:bg-bg3 cursor-pointer transition-colors items-center text-xs"
                style={{ gridTemplateColumns: "80px 1fr 140px 80px 80px 60px" }}
                onClick={() => setSelected(c)}
              >
                <span>
                  <span
                    className="text-[9px] border px-1.5 py-0.5 rounded font-mono tracking-widest"
                    style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                  >{c.riskLevel}</span>
                </span>
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <code className="text-[10px] text-blue">{shortSha(c.sha)}</code>
                    {bugs.length > 0 && (
                      <span className="text-[9px] text-red">⚠ {bugs.length}</span>
                    )}
                  </div>
                  <p className="text-textmain font-sans truncate text-[11px]">{c.message}</p>
                </div>
                <span className="text-dim font-sans text-[10px] truncate">{c.repository?.fullName}</span>
                <span className="text-dim text-[10px] truncate">{c.authorName}</span>
                <span className="text-dim text-[10px]">{c.filesChanged}</span>
                <span className="text-dim text-[10px]">{timeAgo(c.createdAt)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-xs text-dim">
          <span>Page {page} of {pages} · {total} total</span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => navigate({ repoId: currentRepoId || "", risk: currentRisk || "ALL", page: String(page - 1) })}
                className="px-3 py-1.5 border border-border rounded hover:border-border2 transition-colors font-mono"
              >← PREV</button>
            )}
            {page < pages && (
              <button
                onClick={() => navigate({ repoId: currentRepoId || "", risk: currentRisk || "ALL", page: String(page + 1) })}
                className="px-3 py-1.5 border border-border rounded hover:border-border2 transition-colors font-mono"
              >NEXT →</button>
            )}
          </div>
        </div>
      )}

      {selected && <CommitDetail commit={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
