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
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Repositories</h1>
          <p className="text-text3 text-sm mt-0.5">{repos.length} repo{repos.length !== 1 ? "s" : ""} under surveillance</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-glow-indigo"
        >+ Add Repo</button>
      </div>

      {repos.length === 0 && (
        <div className="bg-bg2 border border-border rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo/10 border border-indigo/20 flex items-center justify-center text-3xl">⬡</div>
          <div className="font-display text-base font-bold text-text">No repos tracked</div>
          <p className="text-text3 text-sm max-w-xs">
            Connect a GitHub repository to start monitoring commits for bugs
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-glow-indigo"
          >+ Add your first repo</button>
        </div>
      )}

      <div className="grid gap-4">
        {repos.map((r: any) => {
          const recentCommits = r.commits || [];
          const criticalCount = recentCommits.filter((c: any) => c.riskLevel === "CRITICAL").length;
          const highCount     = recentCommits.filter((c: any) => c.riskLevel === "HIGH").length;

          return (
            <div key={r.id} className="bg-bg2 border border-border rounded-2xl p-5 hover:border-border2 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo/10 border border-indigo/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-indigo2 text-sm">⬡</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={`https://github.com/${r.fullName}`}
                        target="_blank" rel="noreferrer"
                        className="text-text font-semibold hover:text-indigo2 transition-colors"
                      >{r.fullName}</a>
                      {r.private && (
                        <span className="text-[10px] border border-border2 text-text3 px-1.5 py-0.5 rounded-full">private</span>
                      )}
                    </div>
                    <p className="text-text3 text-xs">{r.description || "No description"}</p>
                    <div className="flex gap-4 mt-1.5 text-[11px] text-text3">
                      {r.language && <span>{r.language}</span>}
                      <span>{r._count.commits} commits analyzed</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.webhookActive ? (
                    <span className="text-[10px] text-green border border-green/30 bg-green/10 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green inline-block animate-blink" />
                      Webhook live
                    </span>
                  ) : (
                    <span className="text-[10px] text-yellow border border-yellow/30 bg-yellow/10 px-2.5 py-1 rounded-lg font-semibold">
                      No webhook
                    </span>
                  )}
                  <button
                    onClick={() => removeRepo(r.id)}
                    disabled={removing === r.id}
                    className="text-[11px] text-text3 hover:text-red border border-border hover:border-red/30 px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    {removing === r.id ? "..." : "Remove"}
                  </button>
                </div>
              </div>

              {/* Risk summary */}
              {(criticalCount > 0 || highCount > 0) && (
                <div className="flex gap-2 mb-4">
                  {criticalCount > 0 && (
                    <span className="text-[10px] font-semibold bg-red/10 border border-red/20 text-red px-2.5 py-1 rounded-lg">
                      ☠ {criticalCount} Critical
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="text-[10px] font-semibold bg-orange/10 border border-orange/20 text-orange px-2.5 py-1 rounded-lg">
                      ⚠ {highCount} High
                    </span>
                  )}
                </div>
              )}

              {/* Recent commits */}
              {recentCommits.length > 0 && (
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {recentCommits.slice(0, 4).map((c: any) => {
                    const cfg = getRiskConfig(c.riskLevel);
                    return (
                      <div key={c.sha} className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-bg3 transition-colors">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >{c.riskLevel}</span>
                        <code className="text-[11px] text-cyan font-mono flex-shrink-0">{shortSha(c.sha)}</code>
                        <span className="text-text truncate">{c.message}</span>
                        <span className="text-text3 text-[11px] flex-shrink-0 ml-auto">{timeAgo(c.createdAt)}</span>
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
