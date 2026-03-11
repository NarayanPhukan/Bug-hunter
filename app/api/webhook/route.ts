// app/api/webhook/route.ts
// FIX 6: Background analysis dispatched via Inngest (never killed by serverless).
// FIX 3: Rate limited per IP.
// FIX 4: Zod-validated webhook payload.
// FIX 8: Webhook deduplication via DB unique constraint + delivered flag check.

import { NextRequest, NextResponse }  from "next/server";
import { prisma }                     from "@/lib/prisma";
import { verifyWebhookSignature }     from "@/lib/github";
import { inngest }                    from "@/lib/inngest";
import { checkRateLimit }             from "@/lib/ratelimit";
import { parseBody, WebhookPushPayloadSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rateLimitRes = await checkRateLimit(req, "webhook");
  if (rateLimitRes) return rateLimitRes;

  const rawBody = await req.text();
  const sig     = req.headers.get("x-hub-signature-256") ?? "";
  const event   = req.headers.get("x-github-event")      ?? "";

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] GITHUB_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event !== "push") {
    return NextResponse.json({ ok: true, skipped: event });
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: payload, error: validationError } = parseBody(WebhookPushPayloadSchema, rawPayload);
  if (validationError) return validationError;

  const branch   = payload.ref.replace("refs/heads/", "");
  const repoGhId = payload.repository.id;

  const repo = await prisma.repository.findUnique({
    where:   { githubId: repoGhId },
    include: { user: { select: { id: true } } },
  });

  if (!repo || !repo.active) {
    return NextResponse.json({ ok: true, skipped: "repo not tracked" });
  }

  const dispatched: string[] = [];
  const commits = payload.commits ?? [];

  for (const ghCommit of commits.slice(0, 10)) {
    if (ghCommit.message.startsWith("Merge ")) continue;

    const commit = await prisma.commit.upsert({
      where:  { repositoryId_sha: { repositoryId: repo.id, sha: ghCommit.id } },
      create: {
        repositoryId: repo.id,
        sha:          ghCommit.id,
        message:      ghCommit.message.slice(0, 500),
        authorName:   ghCommit.author?.name     ?? "Unknown",
        authorEmail:  ghCommit.author?.email    ?? "",
        authorLogin:  ghCommit.author?.username ?? null,
        branch,
        url:          ghCommit.url ?? null,
        riskLevel:    "PENDING",
      },
      update: {},
    });

    if (commit.riskLevel !== "PENDING") continue;

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

    dispatched.push(commit.sha.slice(0, 7));
  }

  return NextResponse.json({ ok: true, dispatched });
}