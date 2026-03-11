// lib/inngest.ts
// FIX 6: Inngest client for durable background job execution.
// Solves the critical "serverless kills background tasks" problem.
// Inngest ensures analyzeCommit always runs to completion, with retries.

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id:   "bug-hunter",
  name: "BugHunter",
});

// ── Event type definitions ────────────────────────────────────────────────────

export type Events = {
  "commit/analyze": {
    data: {
      commitId:    string;
      commitSha:   string;
      commitMsg:   string;
      repoId:      string;
      repoOwner:   string;
      repoName:    string;
      repoFullName:string;
      userId:      string;
    };
  };
};
