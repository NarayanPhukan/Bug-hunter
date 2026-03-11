// app/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const plan = session.user.plan ?? "free";
  const planCfg = getPlan(plan);

  // Dates
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // ── Step 1: fetch repos to get IDs ───────────────────
  const repos = await prisma.repository.findMany({
    where: { userId, active: true },
    include: {
      _count: { select: { commits: true } },
      commits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { riskLevel: true, createdAt: true, message: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const repoIds = repos.map((r) => r.id);

  // ── Step 2: everything else in parallel ──────────────
  const [recentCommits, riskCounts, dailyStats, monthlyCommitCount] =
    await Promise.all([
      // Recent commits
      prisma.commit.findMany({
        where: { repositoryId: { in: repoIds } },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          repository: { select: { fullName: true, owner: true, name: true } },
          files: { select: { filename: true, status: true }, take: 5 },
        },
      }),

      // Risk distribution
      prisma.commit.groupBy({
        by: ["riskLevel"],
        where: { repositoryId: { in: repoIds } },
        _count: { riskLevel: true },
      }),

      // 7-day chart data — must use repositoryId per schema
      prisma.dailyStats.findMany({
        where: {
          repositoryId: { in: repoIds },
          date: { gte: sevenDaysAgo },
        },
        orderBy: { date: "asc" },
      }),

      // Monthly commit usage
      prisma.commit.count({
        where: {
          repositoryId: { in: repoIds },
          createdAt: { gte: startOfMonth },
          riskLevel: { notIn: ["PENDING", "FAILED"] },
        },
      }),
    ]);

  const usage = {
    repos: repos.length,
    commits: monthlyCommitCount,
    repoLimit: planCfg.repoLimit === Infinity ? null : planCfg.repoLimit,
    commitLimit: planCfg.commitLimit === Infinity ? null : planCfg.commitLimit,
    plan,
  };

  return (
  <DashboardClient
    repos={repos}
    recentCommits={recentCommits}
    riskCounts={riskCounts}
    dailyStats={dailyStats}
    usage={usage}
    user={session.user}
  />
);
}