// app/dashboard/billing/page.tsx
import { auth }    from "@/auth";
import { redirect } from "next/navigation";
import Link        from "next/link";

// ── Plan config ───────────────────────────────────────────────────────────────
// In production: fetch the user's plan from your DB
// e.g. const user = await prisma.user.findUnique({ where: { id: session.user.id } })
// For now, defaults to free

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    badge: "badge-free",
    limits: { repos: 3, commits: 50 },
    features: ["3 repositories", "50 commits / month", "7-day history", "GitHub status checks"],
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "/ month",
    badge: "badge-pro",
    limits: { repos: Infinity, commits: 1000 },
    features: ["Unlimited repos", "1,000 commits / month", "90-day history", "Slack alerts", "Email digest", "Advanced analytics"],
    current: false,
    highlight: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$39",
    period: "/ month",
    badge: "badge-team",
    limits: { repos: Infinity, commits: Infinity },
    features: ["Everything in Pro", "Unlimited commits", "365-day history", "5 seats (+ $8/extra)", "Full analytics + exports", "API access", "Priority support"],
    current: false,
  },
];

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Mock usage for display — replace with real DB query
  const usage = { repos: 1, commits: 12, plan: "free", periodEnd: "April 11, 2026" };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Billing & Plans</h1>
        <p className="text-text3 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current usage */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-text">Current usage</h2>
          <div className="flex items-center gap-2 text-xs text-text3">
            <span className="font-mono">Resets {usage.periodEnd}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Repos */}
          <div className="bg-bg3 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text2">Repositories</span>
              <span className="text-sm font-semibold text-text">{usage.repos} / 3</span>
            </div>
            <div className="h-1.5 bg-bg4 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo rounded-full transition-all"
                style={{ width: `${(usage.repos / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Commits */}
          <div className="bg-bg3 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text2">Commits analyzed</span>
              <span className="text-sm font-semibold text-text">{usage.commits} / 50</span>
            </div>
            <div className="h-1.5 bg-bg4 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((usage.commits / 50) * 100, 100)}%`,
                  background: usage.commits / 50 > 0.8 ? "#f97316" : "#6366f1",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="font-semibold text-text mb-4">Choose a plan</h2>
        <div className="grid gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 transition-all ${
                plan.current
                  ? "border-indigo/40 bg-indigo/5"
                  : plan.highlight
                  ? "border-border2 bg-bg2 hover:border-indigo/30 hover:shadow-card-hover"
                  : "border-border bg-bg2 hover:border-border2"
              }`}
            >
              {plan.current && (
                <div className="absolute -top-2.5 left-5 bg-indigo text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  CURRENT PLAN
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan.badge}`}>
                      {plan.name}
                    </span>
                    <span className="font-display text-xl font-bold text-text">{plan.price}</span>
                    <span className="text-text3 text-sm">{plan.period}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                    {plan.features.map(f => (
                      <span key={f} className="text-xs text-text3 flex items-center gap-1">
                        <span className="text-green">✓</span> {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ml-6 flex-shrink-0">
                  {plan.current ? (
                    <span className="text-sm text-text3 font-medium">Active</span>
                  ) : (
                    <button className={`text-sm font-semibold px-5 py-2 rounded-lg transition-all ${
                      plan.highlight
                        ? "bg-indigo hover:bg-indigo3 text-white hover:shadow-glow-indigo"
                        : "border border-border2 hover:border-border3 text-text2 hover:text-text"
                    }`}>
                      {plan.id === "free" ? "Downgrade" : "Upgrade"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-text mb-4">Billing history</h2>
        <div className="flex flex-col items-center justify-center py-8 text-text3">
          <div className="text-3xl mb-3 opacity-30">◎</div>
          <div className="text-sm">No invoices yet</div>
          <div className="text-xs mt-1 opacity-60">Invoices appear here after your first payment</div>
        </div>
      </div>

      {/* Pricing link */}
      <div className="text-center text-sm">
        <Link href="/pricing" className="text-indigo2 hover:text-indigo underline underline-offset-4 transition-colors">
          View full plan comparison →
        </Link>
      </div>
    </div>
  );
}
