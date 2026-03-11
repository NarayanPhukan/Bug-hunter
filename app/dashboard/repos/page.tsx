// app/dashboard/repos/page.tsx
import { auth }   from "@/auth";
import { prisma } from "@/lib/prisma";
import ReposClient from "@/components/dashboard/ReposClient";

export const dynamic = "force-dynamic";

export default async function ReposPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const repos = await prisma.repository.findMany({
    where:   { userId: session.user.id, active: true },
    include: {
      _count: { select: { commits: true } },
      commits: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { riskLevel: true, createdAt: true, message: true, authorName: true, sha: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <ReposClient repos={JSON.parse(JSON.stringify(repos))} />;
}
