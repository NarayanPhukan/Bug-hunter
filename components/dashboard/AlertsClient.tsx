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
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Alerts</h1>
        <p className="text-text3 text-sm mt-0.5">
          {critical.length} critical · {high.length} high risk commits requiring attention
        </p>
      </div>

      {alerts.length === 0 && (
        <div className="bg-bg2 border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-3xl">✓</div>
          <div className="font-display text-base font-bold text-green">All clear</div>
          <p className="text-text3 text-sm">No critical or high risk commits detected</p>
        </div>
      )}

      {critical.length > 0 && (
        <section>
          <div className="text-xs font-semibold text-red mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse-red" /> Critical alerts ({critical.length})
          </div>
          <div className="space-y-3">
            {critical.map(a => <AlertCard key={a.id} commit={a} onClick={() => setSelected(a)} />)}
          </div>
        </section>
      )}

      {high.length > 0 && (
        <section>
          <div className="text-xs font-semibold text-orange mb-3 flex items-center gap-2">
            <span className="text-orange">⚠</span> High risk ({high.length})
          </div>
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
      className="bg-bg2 border rounded-2xl p-5 cursor-pointer hover:border-border2 transition-all"
      style={{ borderColor: cfg.border,
        animation: commit.riskLevel === "CRITICAL" ? "pulse-red 2s infinite" : "none" }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-3">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5"
            style={{ color: cfg.color, background: cfg.bg }}
          >{commit.riskLevel}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <code className="text-[11px] text-cyan font-mono">{shortSha(commit.sha)}</code>
              <span className="text-text3 text-[11px]">{commit.repository?.fullName}</span>
            </div>
            <p className="text-sm text-text font-medium">{commit.message}</p>
            <p className="text-text3 text-xs mt-0.5">{commit.authorName} · {timeAgo(commit.createdAt)}</p>
          </div>
        </div>
        <span className="text-text3 text-sm self-center">›</span>
      </div>

      {commit.recommendation && (
        <div className="text-xs mb-3 flex items-center gap-2" style={{ color: cfg.color }}>
          <span>▶</span>
          <span className="text-text2">{commit.recommendation}</span>
        </div>
      )}

      {bugs.length > 0 && (
        <div className="space-y-2">
          {bugs.slice(0, 3).map((b: any, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs bg-bg3/50 rounded-xl px-3 py-2.5">
              <span className="text-[10px] mt-0.5" style={{ color: cfg.color }}>⚠</span>
              <div>
                <span className="font-semibold text-text">{b.title}</span>
                <span className="text-text3 ml-2">{b.description?.slice(0, 80)}...</span>
              </div>
            </div>
          ))}
          {bugs.length > 3 && (
            <p className="text-[11px] text-text3 pl-2">+{bugs.length - 3} more issues</p>
          )}
        </div>
      )}

      {systems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {systems.map((s: string, i: number) => (
            <span key={i} className="text-[10px] border px-2.5 py-1 rounded-lg"
              style={{ color: cfg.color, borderColor: cfg.border + "66" }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
