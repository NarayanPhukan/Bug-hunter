// app/api/commits/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { parseBody, CommitsQuerySchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  const { searchParams } = new URL(req.url);
  const { data: query, error } = parseBody(CommitsQuerySchema, {
    repoId: searchParams.get("repoId") ?? undefined,
    risk: searchParams.get("risk") ?? undefined,
    page: searchParams.get("page") ?? undefined,
  });

  if (error) return error;

  const { repoId, risk, page } = query;
  const safePage = page ?? 1;
  const limit = 20;

  if (repoId) {
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, userId: session.user.id },
    });

    if (!repo)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const where: Prisma.CommitWhereInput = {
    repository: { userId: session.user.id, active: true },
    ...(repoId ? { repositoryId: repoId } : {}),
    ...(risk ? { riskLevel: risk as Prisma.EnumRiskLevelFilter<"Commit"> } : {}),
  };

  const [commits, total] = await Promise.all([
    prisma.commit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * limit,
      take: limit,
      include: {
        repository: { select: { fullName: true, owner: true, name: true } },
        files: {
          select: {
            filename: true,
            status: true,
            additions: true,
            deletions: true,
          },
          orderBy: { additions: "desc" },
          take: 10,
        },
      },
    }),
    prisma.commit.count({ where }),
  ]);

  return NextResponse.json({
    commits,
    total,
    page: safePage,
    pages: Math.ceil(total / limit),
  });
}