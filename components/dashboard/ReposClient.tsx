"use client";
// components/dashboard/ReposClient.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo, shortSha, getRiskConfig } from "@/lib/utils";
import AddRepoModal from "./AddRepoModal";

export default function ReposClient({ repos }: { repos: any[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  async function removeRepo(id: string) {
    if (!confirm("Stop monitoring this repo and remove its webhook?")) return;
    setRemoving(id);
    await fetch(`/api/repos?id=${id}`, { method: "DELETE" });
    router.refresh();
    setRemoving(null);
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-textmain tracking-wider">REPOSITORIES</h1>
          <p className="text-dim text-xs mt-1 font-sans">{repos.length} repo{repos.length !== 1 ? "s" : ""} under surveillance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-green/10 border border-green/40 hover:bg-green/20 text-green text-xs font-mono px-4 py-2 rounded transition-all tracking-widest"
        >⊕ ADD REPO</button>
      </div>

      {repos.length === 0 && (
        <div className="bg-bg2 border border-border rounded-xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="text-4xl text-border2">⬡</div>
          <div className="font-display text-sm text-dim tracking-widest">NO REPOS TRACKED</div>
          <p className="text-dim text-xs font-sans max-w-xs">
            Connect a GitHub repository to start monitoring commits for bugs
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 bg-green/10 border border-green/40 hover:bg-green/20 text-green text-xs font-mono px-5 py-2.5 rounded tracking-widest"
          >⊕ ADD YOUR FIRST REPO</button>
        </div>
      )}

      <div className="grid gap-4">
        {repos.map((r: any) => {
          const recentCommits = r.commits || [];
          const criticalCount = recentCommits.filter((c: any) => c.riskLevel === "CRITICAL").length;
          const highCount     = recentCommits.filter((c: any) => c.riskLevel === "HIGH").length;

          return (
            <div key={r.id} className="bg-bg2 border border-border rounded-xl p-5 hover:border-border2 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-green text-xl mt-0.5">⬡</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={`https://github.com/${r.fullName}`}
                        target="_blank" rel="noreferrer"
                        className="text-textmain font-sans font-semibold hover:text-green transition-colors"
                      >{r.fullName}</a>
                      {r.private && (
                        <span className="text-[9px] border border-border2 text-dim px-1.5 rounded font-mono">PRIVATE</span>
                      )}
                    </div>
                    <p className="text-dim text-xs font-sans">{r.description || "No description"}</p>
                    <div className="flex gap-4 mt-1.5 text-[10px] text-dim">
                      {r.language && <span>{r.language}</span>}
                      <span>{r._count.commits} commits analyzed</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.webhookActive ? (
                    <span className="text-[9px] text-green border border-green/30 bg-green/10 px-2 py-1 rounded font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green inline-block animate-blink" />
                      WEBHOOK LIVE
                    </span>
                  ) : (
                    <span className="text-[9px] text-yellow border border-yellow/30 bg-yellow/10 px-2 py-1 rounded font-mono">
                      NO WEBHOOK
                    </span>
                  )}
                  <button
                    onClick={() => removeRepo(r.id)}
                    disabled={removing === r.id}
                    className="text-[10px] text-dim hover:text-red border border-border hover:border-red/30 px-2.5 py-1 rounded font-mono transition-colors"
                  >
                    {removing === r.id ? "..." : "REMOVE"}
                  </button>
                </div>
              </div>

              {/* Risk summary */}
              {(criticalCount > 0 || highCount > 0) && (
                <div className="flex gap-2 mb-4">
                  {criticalCount > 0 && (
                    <span className="text-[10px] bg-red/10 border border-red/30 text-red px-2.5 py-1 rounded font-mono animate-pulse-red">
                      ☠ {criticalCount} CRITICAL
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="text-[10px] bg-yellow/10 border border-yellow/30 text-yellow px-2.5 py-1 rounded font-mono">
                      ⚠ {highCount} HIGH
                    </span>
                  )}
                </div>
              )}

              {/* Recent commits */}
              {recentCommits.length > 0 && (
                <div className="border border-border rounded-lg divide-y divide-border bg-bg">
                  {recentCommits.slice(0, 4).map((c: any) => {
                    const cfg = getRiskConfig(c.riskLevel);
                    return (
                      <div key={c.sha} className="flex items-center gap-3 px-3 py-2 text-xs">
                        <span
                          className="text-[9px] border px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                          style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}
                        >{c.riskLevel}</span>
                        <code className="text-[10px] text-blue flex-shrink-0">{shortSha(c.sha)}</code>
                        <span className="text-textmain font-sans truncate">{c.message}</span>
                        <span className="text-dim text-[10px] flex-shrink-0 ml-auto">{timeAgo(c.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && <AddRepoModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
