"use client";
// components/dashboard/AlertsClient.tsx

import { useState } from "react";
import { shortSha, timeAgo, getRiskConfig } from "@/lib/utils";
import CommitDetail from "./CommitDetail";

export default function AlertsClient({ alerts }: { alerts: any[] }) {
  const [selected, setSelected] = useState<any>(null);

  const critical = alerts.filter(a => a.riskLevel === "CRITICAL");
  const high     = alerts.filter(a => a.riskLevel === "HIGH");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-xl font-bold text-textmain tracking-wider">ALERTS</h1>
        <p className="text-dim text-xs mt-1 font-sans">
          {critical.length} critical · {high.length} high risk commits requiring attention
        </p>
      </div>

      {alerts.length === 0 && (
        <div className="bg-bg2 border border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl text-green">✓</div>
          <div className="font-display text-sm text-green tracking-widest">ALL CLEAR</div>
          <p className="text-dim text-xs font-sans">No critical or high risk commits detected</p>
        </div>
      )}

      {critical.length > 0 && (
        <section>
          <div className="text-[10px] text-red tracking-widest mb-3 flex items-center gap-2">
            <span className="animate-blink">●</span> CRITICAL ALERTS ({critical.length})
          </div>
          <div className="space-y-3">
            {critical.map(a => <AlertCard key={a.id} commit={a} onClick={() => setSelected(a)} />)}
          </div>
        </section>
      )}

      {high.length > 0 && (
        <section>
          <div className="text-[10px] text-yellow tracking-widest mb-3">⚠ HIGH RISK ({high.length})</div>
          <div className="space-y-3">
            {high.map(a => <AlertCard key={a.id} commit={a} onClick={() => setSelected(a)} />)}
          </div>
        </section>
      )}

      {selected && <CommitDetail commit={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AlertCard({ commit, onClick }: { commit: any; onClick: () => void }) {
  const cfg  = getRiskConfig(commit.riskLevel);
  const bugs = Array.isArray(commit.predictedBugs) ? commit.predictedBugs : [];
  const systems = Array.isArray(commit.affectedSystems) ? commit.affectedSystems : [];

  return (
    <div
      className="border rounded-xl p-5 cursor-pointer hover:brightness-110 transition-all animate-slide-in"
      style={{ background: cfg.bg, borderColor: cfg.border,
        animation: commit.riskLevel === "CRITICAL" ? "pulse-red 2s infinite" : "none" }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <div
            className="text-[9px] border px-2 py-1 rounded font-mono tracking-widest flex-shrink-0 mt-0.5"
            style={{ color: cfg.color, borderColor: cfg.border }}
          >{commit.riskLevel}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <code className="text-[10px] text-blue">{shortSha(commit.sha)}</code>
              <span className="text-dim text-[10px]">{commit.repository?.fullName}</span>
            </div>
            <p className="text-sm text-textmain font-sans font-medium">{commit.message}</p>
            <p className="text-dim text-xs font-sans mt-0.5">{commit.authorName} · {timeAgo(commit.createdAt)}</p>
          </div>
        </div>
        <span className="text-dim text-sm self-center">›</span>
      </div>

      {commit.recommendation && (
        <div className="text-xs font-mono mb-3" style={{ color: cfg.color }}>
          ▶ {commit.recommendation}
        </div>
      )}

      {bugs.length > 0 && (
        <div className="space-y-2">
          {bugs.slice(0, 3).map((b: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs bg-bg/40 rounded px-3 py-2">
              <span className="text-[10px] mt-0.5" style={{ color: cfg.color }}>⚠</span>
              <div>
                <span className="font-sans font-medium text-textmain">{b.title}</span>
                <span className="text-dim ml-2 font-sans">{b.description?.slice(0, 80)}...</span>
              </div>
            </div>
          ))}
          {bugs.length > 3 && (
            <p className="text-[10px] text-dim font-sans pl-2">+{bugs.length - 3} more issues</p>
          )}
        </div>
      )}

      {systems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {systems.map((s: string, i: number) => (
            <span key={i} className="text-[9px] border px-2 py-0.5 rounded font-sans"
              style={{ color: cfg.color, borderColor: cfg.border + "66" }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
