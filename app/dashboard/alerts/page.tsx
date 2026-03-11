// app/dashboard/alerts/page.tsx
import { auth }   from "@/auth";
import { prisma } from "@/lib/prisma";
import AlertsClient from "@/components/dashboard/AlertsClient";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const alerts = await prisma.commit.findMany({
    where: {
      repository: { userId: session.user.id, active: true },
      riskLevel: { in: ["CRITICAL", "HIGH"] },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      repository: { select: { fullName: true, owner: true, name: true } },
      files: { select: { filename: true, status: true, additions: true, deletions: true, patch: true }, take: 10 },
    },
  });

  return <AlertsClient alerts={JSON.parse(JSON.stringify(alerts))} />;
}
