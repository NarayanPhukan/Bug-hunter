// app/api/inngest/route.ts
// Inngest's HTTP handler — receives function execution requests from Inngest Cloud.
// In dev, Inngest Dev Server hits this endpoint directly.

import { serve }            from "inngest/next";
import { inngest }          from "@/lib/inngest";
import { analyzeCommitFn }  from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client:    inngest,
  functions: [analyzeCommitFn],
});
