// app/dashboard/commits/page.tsx
import { auth }   from "@/auth";
import { prisma } from "@/lib/prisma";
import CommitsClient from "@/components/dashboard/CommitsClient";

export const dynamic = "force-dynamic";

export default async function CommitsPage({ searchParams }: { searchParams: { repoId?: string; risk?: string; page?: string }}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const page   = parseInt(searchParams.page || "1");
  const limit  = 25;
  const repoId = searchParams.repoId;
  const risk   = searchParams.risk;

  const where: any = {
    repository: { userId: session.user.id, active: true },
    ...(repoId ? { repositoryId: repoId } : {}),
    ...(risk && risk !== "ALL" ? { riskLevel: risk } : {}),
  };

  const [commits, total, repos] = await Promise.all([
    prisma.commit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        repository: { select: { fullName: true, owner: true, name: true } },
        files: { select: { filename: true, status: true, additions: true, deletions: true, patch: true }, take: 10 },
      },
    }),
    prisma.commit.count({ where }),
    prisma.repository.findMany({
      where: { userId: session.user.id, active: true },
      select: { id: true, fullName: true },
    }),
  ]);

  return (
    <CommitsClient
      commits={JSON.parse(JSON.stringify(commits))}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      repos={repos}
      currentRepoId={repoId}
      currentRisk={risk}
    />
  );
}
