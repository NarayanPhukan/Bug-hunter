// app/dashboard/page.tsx
import { auth }           from "@/auth";
import { prisma }         from "@/lib/prisma";
import { getPlan }        from "@/lib/plans";
import DashboardClient    from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const plan   = session.user.plan ?? "free";
  const planCfg = getPlan(plan);

  // ── Parallel data fetch ───────────────────────────────
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [repos, recentCommits, riskCounts, dailyStats, monthlyCommitCount] =
    await Promise.all([
      // Repos
      prisma.repository.findMany({
        where:   { userId, active: true },
        include: {
          _count:  { select: { commits: true } },
          commits: {
            orderBy: { createdAt: "desc" },
            take:    1,
            select:  { riskLevel: true, createdAt: true, message: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      // Recent commits across all repos
      prisma.commit.findMany({
        where:   { repository: { userId, active: true } },
        orderBy: { createdAt: "desc" },
        take:    30,
        include: {
          repository: { select: { fullName: true, owner: true, name: true } },
          files:      { select: { filename: true, status: true }, take: 5 },
        },
      }),

      // Risk distribution
      prisma.commit.groupBy({
        by:    ["riskLevel"],
        where: { repository: { userId, active: true } },
        _count: { riskLevel: true },
      }),

      // 7-day chart data
      prisma.dailyStats.findMany({
        where: {
          repository: { userId },
          date:       { gte: sevenDaysAgo },
        },
        orderBy: { date: "asc" },
      }),

      // Monthly usage for plan meter
      prisma.commit.count({
        where: {
          repository: { userId, active: true },
          createdAt:  { gte: startOfMonth },
          riskLevel:  { notIn: ["PENDING", "FAILED"] },
        },
      }),
    ]);

  const usage = {
    repos:        repos.length,
    commits:      monthlyCommitCount,
    repoLimit:    planCfg.repoLimit   === Infinity ? null : planCfg.repoLimit,
    commitLimit:  planCfg.commitLimit === Infinity ? null : planCfg.commitLimit,
    plan,
  };

  return (
    <DashboardClient
      user={session.user}
      repos={JSON.parse(JSON.stringify(repos))}
      recentCommits={JSON.parse(JSON.stringify(recentCommits))}
      riskCounts={riskCounts}
      dailyStats={JSON.parse(JSON.stringify(dailyStats))}
      usage={usage}
    />
  );
}
