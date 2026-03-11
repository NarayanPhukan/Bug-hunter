// app/api/repos/route.ts
// FIX 3: Rate limited per user.
// FIX 1: Tokens decrypted before use (never returned to client raw).
// FIX 4: Zod validation on POST body.

import { NextRequest, NextResponse }  from "next/server";
import { auth }                       from "@/auth";
import { prisma }                     from "@/lib/prisma";
import { listUserRepos, createWebhook, deleteWebhook } from "@/lib/github";
import { checkRateLimit }             from "@/lib/ratelimit";
import { parseBody, AddRepoSchema }   from "@/lib/schemas";
import { safeDecryptToken }           from "@/lib/utils";

export const dynamic = "force-dynamic";

/** GET /api/repos */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  const repos = await prisma.repository.findMany({
    where:   { userId: session.user.id, active: true },
    include: {
      _count:  { select: { commits: true } },
      commits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { riskLevel: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(repos);
}

/** POST /api/repos */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  // FIX 4: Validate body
  let rawBody: unknown;
  try { rawBody = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: body, error } = parseBody(AddRepoSchema, rawBody);
  if (error) return error;
  const { githubId, owner, name } = body;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.githubToken) return NextResponse.json({ error: "No GitHub token. Re-authenticate." }, { status: 400 });

  // FIX 1: Decrypt token before using
  const token = safeDecryptToken(user.githubToken);

  // Repo already tracked by this user?
  const existing = await prisma.repository.findFirst({
    where: { githubId, userId: session.user.id },
  });
  if (existing) {
    await prisma.repository.update({ where: { id: existing.id }, data: { active: true } });
    return NextResponse.json(existing);
  }

  // Validate repo exists in user's account
  const ghRepos = await listUserRepos(token);
  const ghRepo  = ghRepos.find(r => r.id === githubId);
  if (!ghRepo) return NextResponse.json({ error: "Repo not found or no access" }, { status: 404 });

  // Register webhook
  const appUrl     = process.env.AUTH_URL || "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/webhook`;
  let webhookId: number | undefined;

  try {
    const hook = await createWebhook(
      token, owner, name,
      webhookUrl,
      process.env.GITHUB_WEBHOOK_SECRET!
    );
    webhookId = hook.id;
  } catch (e) {
    console.warn("[repos] Webhook creation failed:", e);
  }

  const repo = await prisma.repository.create({
    data: {
      userId:        session.user.id,
      githubId:      ghRepo.id,
      owner:         ghRepo.owner.login,
      name:          ghRepo.name,
      fullName:      ghRepo.full_name,
      description:   ghRepo.description ?? null,
      private:       ghRepo.private,
      language:      ghRepo.language ?? null,
      webhookId:     webhookId ?? null,
      webhookActive: !!webhookId,
    },
  });

  return NextResponse.json(repo, { status: 201 });
}

/** DELETE /api/repos?id=xxx */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id || !/^[a-z0-9]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const repo = await prisma.repository.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!repo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (repo.webhookId && user?.githubToken) {
    const token = safeDecryptToken(user.githubToken);
    await deleteWebhook(token, repo.owner, repo.name, repo.webhookId).catch(() => {});
  }

  await prisma.repository.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
