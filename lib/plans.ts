// lib/plans.ts
// Plan configuration and limit enforcement logic.
// Import this wherever you need to check if a user can do something.

export type PlanId = "free" | "pro" | "team";

export interface Plan {
  id:          PlanId;
  name:        string;
  price:       number;   // monthly USD
  repoLimit:   number;   // max tracked repos (Infinity = unlimited)
  commitLimit: number;   // max commits analyzed per month (Infinity = unlimited)
  historyDays: number;   // days of commit history retained
  seats:       number;   // team seats (Infinity = unlimited)
  features: {
    slackAlerts:     boolean;
    emailDigest:     boolean;
    advancedAnalytics: boolean;
    apiAccess:       boolean;
    prioritySupport: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id:          "free",
    name:        "Free",
    price:       0,
    repoLimit:   3,
    commitLimit: 50,
    historyDays: 7,
    seats:       1,
    features: {
      slackAlerts:      false,
      emailDigest:      false,
      advancedAnalytics: false,
      apiAccess:        false,
      prioritySupport:  false,
    },
  },
  pro: {
    id:          "pro",
    name:        "Pro",
    price:       12,
    repoLimit:   Infinity,
    commitLimit: 1000,
    historyDays: 90,
    seats:       1,
    features: {
      slackAlerts:      true,
      emailDigest:      true,
      advancedAnalytics: true,
      apiAccess:        false,
      prioritySupport:  false,
    },
  },
  team: {
    id:          "team",
    name:        "Team",
    price:       39,
    repoLimit:   Infinity,
    commitLimit: Infinity,
    historyDays: 365,
    seats:       5,
    features: {
      slackAlerts:      true,
      emailDigest:      true,
      advancedAnalytics: true,
      apiAccess:        true,
      prioritySupport:  true,
    },
  },
};

export function getPlan(id: PlanId): Plan {
  return PLANS[id] ?? PLANS.free;
}

/** Check if a user can add another repo */
export async function canAddRepo(userId: string, plan: PlanId): Promise<{ allowed: boolean; reason?: string }> {
  const { prisma } = await import("@/lib/prisma");
  const p = getPlan(plan);

  if (p.repoLimit === Infinity) return { allowed: true };

  const count = await prisma.repository.count({
    where: { userId, active: true },
  });

  if (count >= p.repoLimit) {
    return {
      allowed: false,
      reason:  `Your ${p.name} plan allows ${p.repoLimit} repositor${p.repoLimit === 1 ? "y" : "ies"}. Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

/** Check if a user can analyze more commits this month */
export async function canAnalyzeCommit(userId: string, plan: PlanId): Promise<{ allowed: boolean; reason?: string }> {
  const { prisma } = await import("@/lib/prisma");
  const p = getPlan(plan);

  if (p.commitLimit === Infinity) return { allowed: true };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const count = await prisma.commit.count({
    where: {
      repository: { userId },
      createdAt:  { gte: startOfMonth },
      riskLevel:  { notIn: ["PENDING", "FAILED"] },
    },
  });

  if (count >= p.commitLimit) {
    return {
      allowed: false,
      reason:  `You've used all ${p.commitLimit} commit analyses for this month on the ${p.name} plan. Upgrade to continue.`,
    };
  }

  return { allowed: true };
}

/** Get current month usage for a user */
export async function getMonthlyUsage(userId: string): Promise<{ repos: number; commits: number }> {
  const { prisma } = await import("@/lib/prisma");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [repos, commits] = await Promise.all([
    prisma.repository.count({ where: { userId, active: true } }),
    prisma.commit.count({
      where: {
        repository: { userId },
        createdAt:  { gte: startOfMonth },
        riskLevel:  { notIn: ["PENDING", "FAILED"] },
      },
    }),
  ]);

  return { repos, commits };
}
