// app/api/analyze/route.ts
// FIX 3: Rate limited (20/min per user) — prevents Anthropic bill explosion.
// FIX 4: Zod validated.
// FIX 1: Token decrypted before use.
// FIX 6: Uses Inngest for durable execution.

import { NextRequest, NextResponse }    from "next/server";
import { auth }                         from "@/auth";
import { prisma }                       from "@/lib/prisma";
import { getCommitDetail }              from "@/lib/github";
import { checkRateLimit }               from "@/lib/ratelimit";
import { parseBody, AnalyzeSchema }     from "@/lib/schemas";
import { safeDecryptToken }             from "@/lib/utils";
import { inngest }                      from "@/lib/inngest";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX 3: Strict rate limit for manual analysis
  const rl = await checkRateLimit(req, "analyze", session.user.id);
  if (rl) return rl;

  // FIX 4: Validate body
  let rawBody: unknown;
  try { rawBody = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: body, error } = parseBody(AnalyzeSchema, rawBody);
  if (error) return error;
  const { repoId, sha } = body;

  const repo = await prisma.repository.findFirst({
    where:   { id: repoId, userId: session.user.id },
    include: { user: { select: { githubToken: true, id: true } } },
  });
  if (!repo) return NextResponse.json({ error: "Repo not found" }, { status: 404 });

  // FIX 1: Decrypt token
  const token = safeDecryptToken(repo.user.githubToken!);

  // Ensure commit record exists
  let commit = await prisma.commit.findUnique({
    where: { repositoryId_sha: { repositoryId: repo.id, sha } },
  });

  if (!commit) {
    let detail;
    try {
      detail = await getCommitDetail(token, repo.owner, repo.name, sha);
    } catch {
      return NextResponse.json({ error: "SHA not found in repo" }, { status: 404 });
    }
    commit = await prisma.commit.create({
      data: {
        repositoryId: repo.id,
        sha,
        message:     detail.commit.message.slice(0, 500),
        authorName:  detail.commit.author?.name  || "Unknown",
        authorEmail: detail.commit.author?.email || "",
        authorLogin: detail.author?.login ?? null,
        riskLevel:   "PENDING",
      },
    });
  } else {
    // Reset to PENDING so Inngest re-runs it
    await prisma.commit.update({
      where: { id: commit.id },
      data:  { riskLevel: "PENDING", analyzedAt: null },
    });
  }

  // FIX 6: Dispatch durable Inngest job
  await inngest.send({
    name: "commit/analyze",
    data: {
      commitId:     commit.id,
      commitSha:    commit.sha,
      commitMsg:    commit.message,
      repoId:       repo.id,
      repoOwner:    repo.owner,
      repoName:     repo.name,
      repoFullName: repo.fullName,
      userId:       repo.user.id,
    },
  });

  return NextResponse.json({ ok: true, commitId: commit.id, status: "queued" });
}
