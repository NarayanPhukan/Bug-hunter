// app/dashboard/page.tsx
import { auth }   from "@/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch user's repos with last commit info
  const repos = await prisma.repository.findMany({
    where:   { userId: session.user.id, active: true },
    include: {
      _count:  { select: { commits: true } },
      commits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { riskLevel: true, createdAt: true, message: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch recent commits across all repos
  const recentCommits = await prisma.commit.findMany({
    where:   { repository: { userId: session.user.id, active: true } },
    orderBy: { createdAt: "desc" },
    take:    30,
    include: {
      repository: { select: { fullName: true, owner: true, name: true } },
      files:      { select: { filename: true, status: true }, take: 5 },
    },
  });

  // Risk breakdown totals
  const riskCounts = await prisma.commit.groupBy({
    by:    ["riskLevel"],
    where: { repository: { userId: session.user.id, active: true } },
    _count: { riskLevel: true },
  });

  // Daily stats (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dailyStats = await prisma.dailyStats.findMany({
    where:   {
      repository: { userId: session.user.id, active: true },
      date: { gte: sevenDaysAgo },
    },
    orderBy: { date: "asc" },
  });

  return (
    <DashboardClient
      user={session.user}
      repos={JSON.parse(JSON.stringify(repos))}
      recentCommits={JSON.parse(JSON.stringify(recentCommits))}
      riskCounts={riskCounts}
      dailyStats={JSON.parse(JSON.stringify(dailyStats))}
    />
  );
}
