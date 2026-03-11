// app/api/commits/route.ts
// FIX 3: Rate limited per user.
// FIX 4: Query params validated with Zod.

import { NextRequest, NextResponse }       from "next/server";
import { auth }                            from "@/auth";
import { prisma }                          from "@/lib/prisma";
import { checkRateLimit }                  from "@/lib/ratelimit";
import { parseBody, CommitsQuerySchema }   from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  // FIX 4: Validate query params
  const { searchParams } = new URL(req.url);
  const { data: query, error } = parseBody(CommitsQuerySchema, {
    repoId: searchParams.get("repoId") ?? undefined,
    risk:   searchParams.get("risk")   ?? undefined,
    page:   searchParams.get("page")   ?? undefined,
  });
  if (error) return error;

  const { repoId, risk, page } = query;
  const limit = 20;

  // Verify user owns the repo if filtering by it
  if (repoId) {
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, userId: session.user.id },
    });
    if (!repo) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where: Parameters<typeof prisma.commit.findMany>[0]["where"] = {
    repository: { userId: session.user.id, active: true },
    ...(repoId                         ? { repositoryId: repoId }                                           : {}),
    ...(risk && risk !== "ALL"         ? { riskLevel: risk as "CRITICAL"|"HIGH"|"MEDIUM"|"LOW"|"SAFE" }     : {}),
  };

  const [commits, total] = await Promise.all([
    prisma.commit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        repository: { select: { fullName: true, owner: true, name: true } },
        files:      { select: { filename: true, status: true, additions: true, deletions: true }, take: 10 },
      },
    }),
    prisma.commit.count({ where }),
  ]);

  return NextResponse.json({
    commits,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
