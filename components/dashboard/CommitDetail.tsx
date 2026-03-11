"use client";
// components/dashboard/CommitDetail.tsx

import { useState } from "react";
import { shortSha, timeAgo, getRiskConfig } from "@/lib/utils";

interface Bug {
  title: string; description: string;
  severity: string; file?: string; line?: string; category: string;
}

export default function CommitDetail({ commit, onClose }: { commit: any; onClose: () => void }) {
  const [tab, setTab] = useState<"analysis"|"diff"|"raw">("analysis");
  const cfg  = getRiskConfig(commit.riskLevel);
  const bugs: Bug[] = Array.isArray(commit.predictedBugs) ? commit.predictedBugs : [];
  const systems: string[] = Array.isArray(commit.affectedSystems) ? commit.affectedSystems : [];

  const CATEGORY_ICON: Record<string, string> = {
    security: "🔒", logic: "⚙", performance: "⚡",
    auth: "🔑", data: "🗄", api: "🌐", other: "◈",
  };

  return (
    <div className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg2 border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-4">
            <span
              className="mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {commit.riskLevel}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[11px] text-cyan bg-bg3 px-2 py-0.5 rounded-md border border-border font-mono">
                  {shortSha(commit.sha)}
                </code>
                <span className="text-text3 text-xs">{commit.repository?.fullName}</span>
              </div>
              <p className="text-sm text-text font-medium leading-snug">{commit.message}</p>
              <div className="flex gap-4 mt-1.5 text-[11px] text-text3">
                <span>{commit.authorName}</span>
                <span>{commit.filesChanged} files changed</span>
                <span>+{commit.additions} / -{commit.deletions}</span>
                <span>{timeAgo(commit.createdAt)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-text3 hover:text-text text-xl leading-none ml-4 transition-colors">×</button>
        </div>

        {/* Recommendation banner */}
        {commit.recommendation && (
          <div
            className="px-6 py-3 flex items-center gap-3 text-xs border-b border-border flex-shrink-0"
            style={{ background: cfg.bg }}
          >
            <span style={{ color: cfg.color }}>▶</span>
            <span className="text-text">{commit.recommendation}</span>
            {commit.confidence != null && (
              <span className="ml-auto font-semibold" style={{ color: cfg.color }}>
                {commit.confidence}% confidence
              </span>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {(["analysis", "diff", "raw"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-3 text-xs font-semibold border-b-2 transition-colors capitalize"
              style={{
                borderBottomColor: tab === t ? cfg.color : "transparent",
                color: tab === t ? cfg.color : "#475569",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── ANALYSIS TAB ── */}
          {tab === "analysis" && (
            <>
              {bugs.length === 0 && commit.riskLevel === "SAFE" && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-3xl">✓</div>
                  <div className="text-green font-display font-bold text-lg">Safe to deploy</div>
                  <div className="text-text3 text-sm max-w-xs">
                    No significant bugs, security issues, or regressions detected in this commit.
                  </div>
                </div>
              )}

              {bugs.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text3 uppercase tracking-wider mb-3">Predicted bugs ({bugs.length})</div>
                  <div className="space-y-3">
                    {bugs.map((bug, i) => {
                      const sev = getRiskConfig(bug.severity.toUpperCase());
                      return (
                        <div
                          key={i}
                          className="border rounded-xl p-4"
                          style={{ borderColor: sev.border, background: sev.bg }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_ICON[bug.category] || "◈"}</span>
                              <span className="text-sm font-semibold" style={{ color: sev.color }}>
                                {bug.title}
                              </span>
                            </div>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                              style={{ color: sev.color, background: sev.bg }}
                            >
                              {bug.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-text leading-relaxed">{bug.description}</p>
                          {(bug.file || bug.line) && (
                            <div className="flex gap-3 mt-2 text-[11px] text-text3 font-mono">
                              {bug.file && <span>📄 {bug.file}</span>}
                              {bug.line && <span>L{bug.line}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {systems.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text3 uppercase tracking-wider mb-3">Affected systems</div>
                  <div className="flex flex-wrap gap-2">
                    {systems.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs border px-3 py-1.5 rounded-lg"
                        style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files changed */}
              {commit.files?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text3 uppercase tracking-wider mb-3">Files changed</div>
                  <div className="space-y-1">
                    {commit.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-bg3/50 px-4 py-2.5 rounded-xl border border-border font-mono">
                        <span className="text-text">{f.filename}</span>
                        <div className="flex gap-3 text-[11px]">
                          <span className="text-green">+{f.additions}</span>
                          <span className="text-red">-{f.deletions}</span>
                          <span className="text-text3 capitalize">{f.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── DIFF TAB ── */}
          {tab === "diff" && (
            <div>
              {commit.files?.length > 0 ? (
                commit.files.map((f: any, fi: number) => (
                  <div key={fi} className="mb-4">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-bg3 border border-border rounded-t-xl text-[11px] font-mono">
                      <span className="text-text">{f.filename}</span>
                      <div className="flex gap-3">
                        <span className="text-green">+{f.additions}</span>
                        <span className="text-red">-{f.deletions}</span>
                      </div>
                    </div>
                    <div className="border border-t-0 border-border rounded-b-xl overflow-x-auto">
                      {f.patch ? (
                        f.patch.split("\n").map((line: string, li: number) => {
                          const cls = line.startsWith("+") ? "diff-add"
                            : line.startsWith("-") ? "diff-del"
                            : line.startsWith("@@") ? "diff-hunk"
                            : "diff-meta";
                          return (
                            <div key={li} className={`${cls} px-4 py-0.5 text-[11px] font-mono whitespace-pre`}>
                              {line || " "}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-text3 text-xs">No patch available</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-text3 text-sm text-center py-8">
                  File diff data not available — commit was received via webhook without detailed patches
                </div>
              )}
            </div>
          )}

          {/* ── RAW TAB ── */}
          {tab === "raw" && (
            <div>
              <div className="text-xs font-semibold text-text3 uppercase tracking-wider mb-3">Raw Claude response</div>
              <pre className="text-xs text-text font-mono bg-bg3/50 p-4 rounded-xl border border-border overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {commit.analysisRaw || "No raw response stored"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
