// inngest/functions.ts
// FIX 6: The actual analysis background function.
// Inngest handles: retries (up to 3x), timeouts, dead-letter, concurrency limits.
// This replaces the fire-and-forget Promise that was killed by serverless cold starts.

import { inngest }                         from "@/lib/inngest";
import { prisma }                          from "@/lib/prisma";
import { getCommitDetail, setCommitStatus } from "@/lib/github";
import { analyzeCommit }                   from "@/lib/analyzer";
import { githubCommitStatusFromRisk, safeDecryptToken } from "@/lib/utils";
import type { Events }                     from "@/lib/inngest";

export const analyzeCommitFn = inngest.createFunction(
  {
    id:          "analyze-commit",
    name:        "Analyze Commit with AI",
    retries:     3,
    // Limit to 5 concurrent analyses per account to control Anthropic API costs
    concurrency: {
      limit: 5,
      key:   "event.data.userId",
    },
    // Timeout entire function after 4 minutes
    timeouts: { finish: "4m" },
  },
  { event: "commit/analyze" as keyof Events },

  async ({ event, step }) => {
    const {
      commitId, commitSha, commitMsg,
      repoId, repoOwner, repoName, repoFullName, userId,
    } = (event as { data: Events["commit/analyze"]["data"] }).data;

    // ── Step 1: Fetch GitHub token (encrypted in DB) ──────────────────────────
    const token = await step.run("fetch-token", async () => {
      const user = await prisma.user.findUnique({
        where:  { id: userId },
        select: { githubToken: true },
      });
      if (!user?.githubToken) throw new Error("No GitHub token for user");
      return safeDecryptToken(user.githubToken);
    });

    // ── Step 2: Fetch full diff from GitHub ───────────────────────────────────
    const files = await step.run("fetch-diff", async () => {
      const detail = await getCommitDetail(token, repoOwner, repoName, commitSha);

      const fileList = (detail.files || []).map(f => ({
        filename:  f.filename,
        status:    f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch:     f.patch?.slice(0, 8000) ?? undefined,
      }));

      // Save file records + update commit stats in parallel
      if (fileList.length > 0) {
        await prisma.$transaction([
          prisma.commitFile.createMany({
            data: fileList.map(f => ({
              commitId,
              filename:  f.filename,
              status:    f.status,
              additions: f.additions,
              deletions: f.deletions,
              patch:     f.patch ?? null,
            })),
            skipDuplicates: true,
          }),
          prisma.commit.update({
            where: { id: commitId },
            data: {
              filesChanged: fileList.length,
              additions:    detail.stats?.additions ?? 0,
              deletions:    detail.stats?.deletions ?? 0,
              authorAvatar: detail.author?.avatar_url ?? null,
              authorLogin:  detail.author?.login ?? null,
            },
          }),
        ]);
      }

      return fileList;
    });

    // ── Step 3: Run Claude AI analysis ────────────────────────────────────────
    const analysis = await step.run("ai-analysis", async () => {
      return analyzeCommit({
        sha:     commitSha,
        message: commitMsg,
        author:  "Unknown", // we have it in the commit record already
        repo:    repoFullName,
        files,
      });
    });

    // ── Step 4: Persist results + update daily stats ──────────────────────────
    await step.run("save-results", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const riskField = analysis.riskLevel.toLowerCase() as
        "critical" | "high" | "medium" | "low" | "safe";

      await prisma.$transaction([
        prisma.commit.update({
          where: { id: commitId },
          data: {
            riskLevel:       analysis.riskLevel,
            analysisRaw:     analysis.raw,
            predictedBugs:   analysis.predictedBugs,
            affectedSystems: analysis.affectedSystems,
            recommendation:  analysis.recommendation,
            confidence:      analysis.confidence,
            analyzedAt:      new Date(),
          },
        }),
        prisma.dailyStats.upsert({
          where:  { repositoryId_date: { repositoryId: repoId, date: today } },
          create: { repositoryId: repoId, date: today, totalCommits: 1, [riskField]: 1 },
          update: { totalCommits: { increment: 1 }, [riskField]: { increment: 1 } },
        }),
      ]);
    });

    // ── Step 5: Post commit status to GitHub ──────────────────────────────────
    await step.run("post-github-status", async () => {
      const ghState = githubCommitStatusFromRisk(analysis.riskLevel);
      const desc    = `${analysis.riskLevel}: ${analysis.recommendation}`.slice(0, 140);

      await setCommitStatus(token, repoOwner, repoName, commitSha, ghState, desc);
      await prisma.commit.update({
        where: { id: commitId },
        data:  { statusPosted: true },
      });
    });

    return { commitId, riskLevel: analysis.riskLevel, confidence: analysis.confidence };
  }
);
