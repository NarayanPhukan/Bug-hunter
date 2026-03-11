"use client";
// components/dashboard/AddRepoModal.tsx

import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";

interface GHRepo {
  id: number; fullName: string; owner: string; name: string;
  description?: string; private: boolean; language?: string; stars: number;
}

export default function AddRepoModal({ onClose }: { onClose: () => void }) {
  const router           = useRouter();
  const [repos,    setRepos]    = useState<GHRepo[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [adding,   setAdding]   = useState<number | null>(null);
  const [error,    setError]    = useState("");

  useEffect(() => {
    fetch("/api/repos/github")
      .then(r => r.json())
      .then(d => { setRepos(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setError("Failed to load repos"); setLoading(false); });
  }, []);

  async function addRepo(repo: GHRepo) {
    setAdding(repo.id);
    setError("");
    try {
      const res = await fetch("/api/repos", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ githubId: repo.id, owner: repo.owner, name: repo.name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to add repo");
      }
      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e.message);
      setAdding(null);
    }
  }

  const filtered = repos.filter(r =>
    r.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bg2 border border-border rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-sm font-bold text-green tracking-widest">ADD REPOSITORY</h2>
            <p className="text-dim text-xs font-sans mt-0.5">Select a GitHub repo to monitor</p>
          </div>
          <button onClick={onClose} className="text-dim hover:text-textmain text-xl leading-none">×</button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-border">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search repos..."
            autoFocus
            className="w-full bg-bg3 border border-border2 rounded px-3 py-2 text-sm text-textmain font-mono outline-none focus:border-green/50 placeholder:text-dim"
          />
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {loading && (
            <div className="py-8 text-center text-dim text-xs">
              <span className="animate-spin-slow inline-block mr-2">◌</span> Loading repos...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-8 text-center text-dim text-xs font-sans">No repos found</div>
          )}
          {filtered.map(r => (
            <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-bg3 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-textmain font-sans font-medium">{r.fullName}</span>
                  {r.private && (
                    <span className="text-[9px] border border-border2 text-dim px-1.5 rounded font-mono">PRIVATE</span>
                  )}
                </div>
                <div className="text-[10px] text-dim mt-0.5 truncate font-sans">
                  {r.description || "No description"} · {r.language || "Unknown"}
                </div>
              </div>
              <button
                onClick={() => addRepo(r)}
                disabled={adding === r.id}
                className="ml-4 flex-shrink-0 text-[10px] bg-green/10 border border-green/40 hover:bg-green/20 text-green px-3 py-1.5 rounded font-mono tracking-widest transition-all disabled:opacity-50"
              >
                {adding === r.id ? "ADDING..." : "TRACK"}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="px-6 py-3 border-t border-border text-xs text-red font-mono">⚠ {error}</div>
        )}

        <div className="px-6 py-3 border-t border-border text-[10px] text-dim font-sans">
          A webhook will be registered on the repo to receive push events in real-time.
        </div>
      </div>
    </div>
  );
}
