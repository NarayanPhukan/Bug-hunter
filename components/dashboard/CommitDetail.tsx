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
      <div className="bg-bg2 border border-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-4">
            <div
              className="mt-0.5 text-[9px] font-bold px-2 py-1 rounded border tracking-widest font-mono flex-shrink-0"
              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
            >
              {commit.riskLevel}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[10px] text-blue bg-bg px-1.5 py-0.5 rounded border border-border">
                  {shortSha(commit.sha)}
                </code>
                <span className="text-dim text-xs font-sans">{commit.repository?.fullName}</span>
              </div>
              <p className="text-sm text-textmain font-sans font-medium leading-snug">{commit.message}</p>
              <div className="flex gap-4 mt-1.5 text-[10px] text-dim">
                <span>{commit.authorName}</span>
                <span>{commit.filesChanged} files changed</span>
                <span>+{commit.additions} / -{commit.deletions}</span>
                <span>{timeAgo(commit.createdAt)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-dim hover:text-textmain text-xl leading-none ml-4">×</button>
        </div>

        {/* Recommendation banner */}
        {commit.recommendation && (
          <div
            className="px-6 py-2.5 flex items-center gap-3 text-xs font-mono border-b border-border flex-shrink-0"
            style={{ background: cfg.bg, borderColor: cfg.border + "66" }}
          >
            <span style={{ color: cfg.color }}>▶</span>
            <span className="text-textmain">{commit.recommendation}</span>
            {commit.confidence != null && (
              <span className="ml-auto" style={{ color: cfg.color }}>
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
              className="px-5 py-2.5 text-[10px] font-mono tracking-widest border-b-2 transition-colors"
              style={{
                borderBottomColor: tab === t ? cfg.color : "transparent",
                color: tab === t ? cfg.color : "#5a7090",
              }}
            >
              {t.toUpperCase()}
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
                  <div className="text-4xl text-green">✓</div>
                  <div className="text-green font-display font-bold tracking-widest">SAFE TO DEPLOY</div>
                  <div className="text-dim text-xs font-sans max-w-xs">
                    No significant bugs, security issues, or regressions detected in this commit.
                  </div>
                </div>
              )}

              {bugs.length > 0 && (
                <div>
                  <div className="text-[10px] text-dim tracking-widest mb-3">── PREDICTED BUGS ({bugs.length})</div>
                  <div className="space-y-3">
                    {bugs.map((bug, i) => {
                      const sev = getRiskConfig(bug.severity.toUpperCase());
                      return (
                        <div
                          key={i}
                          className="border rounded-lg p-4"
                          style={{ borderColor: sev.border, background: sev.bg }}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{CATEGORY_ICON[bug.category] || "◈"}</span>
                              <span className="text-sm font-sans font-semibold" style={{ color: sev.color }}>
                                {bug.title}
                              </span>
                            </div>
                            <span
                              className="text-[9px] border px-2 py-0.5 rounded font-mono tracking-widest flex-shrink-0"
                              style={{ color: sev.color, borderColor: sev.border }}
                            >
                              {bug.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-textmain font-sans leading-relaxed">{bug.description}</p>
                          {(bug.file || bug.line) && (
                            <div className="flex gap-3 mt-2 text-[10px] text-dim font-mono">
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
                  <div className="text-[10px] text-dim tracking-widest mb-3">── AFFECTED SYSTEMS</div>
                  <div className="flex flex-wrap gap-2">
                    {systems.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs border px-3 py-1.5 rounded font-sans"
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
                  <div className="text-[10px] text-dim tracking-widest mb-3">── FILES CHANGED</div>
                  <div className="space-y-1">
                    {commit.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-bg px-3 py-2 rounded border border-border font-mono">
                        <span className="text-textmain">{f.filename}</span>
                        <div className="flex gap-3 text-[10px]">
                          <span className="text-green">+{f.additions}</span>
                          <span className="text-red">-{f.deletions}</span>
                          <span className="text-dim capitalize">{f.status}</span>
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
                    <div className="flex items-center justify-between px-3 py-2 bg-bg3 border border-border rounded-t text-[10px] font-mono">
                      <span className="text-textmain">{f.filename}</span>
                      <div className="flex gap-3">
                        <span className="text-green">+{f.additions}</span>
                        <span className="text-red">-{f.deletions}</span>
                      </div>
                    </div>
                    <div className="border border-t-0 border-border rounded-b overflow-x-auto">
                      {f.patch ? (
                        f.patch.split("\n").map((line: string, li: number) => {
                          const cls = line.startsWith("+") ? "diff-add"
                            : line.startsWith("-") ? "diff-del"
                            : line.startsWith("@@") ? "diff-hunk"
                            : "diff-meta";
                          return (
                            <div key={li} className={`${cls} px-3 py-0.5 text-[11px] font-mono whitespace-pre`}>
                              {line || " "}
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-3 text-dim text-xs">No patch available</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-dim text-xs text-center py-8 font-sans">
                  File diff data not available — commit was received via webhook without detailed patches
                </div>
              )}
            </div>
          )}

          {/* ── RAW TAB ── */}
          {tab === "raw" && (
            <div>
              <div className="text-[10px] text-dim tracking-widest mb-3">── RAW CLAUDE RESPONSE</div>
              <pre className="text-xs text-textmain font-mono bg-bg p-4 rounded border border-border overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {commit.analysisRaw || "No raw response stored"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
