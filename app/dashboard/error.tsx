"use client";
// app/dashboard/error.tsx
// FIX 14: Catches unhandled errors in dashboard routes instead of crashing.

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    // Log to error tracking (Sentry etc.) in production
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="text-4xl text-red">⚠</div>
      <div>
        <h2 className="font-display text-lg font-bold text-red tracking-widest mb-2">
          SYSTEM ERROR
        </h2>
        <p className="text-dim text-sm font-sans max-w-md">
          {error.message || "An unexpected error occurred. This has been logged."}
        </p>
        {error.digest && (
          <p className="text-[10px] text-dim font-mono mt-2">Error ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-green/10 border border-green/40 text-green text-xs font-mono px-5 py-2.5 rounded tracking-widest hover:bg-green/20 transition-colors"
        >
          ↺ RETRY
        </button>
        <a
          href="/dashboard"
          className="border border-border text-dim text-xs font-mono px-5 py-2.5 rounded tracking-widest hover:border-border2 transition-colors"
        >
          ← DASHBOARD
        </a>
      </div>
    </div>
  );
}
