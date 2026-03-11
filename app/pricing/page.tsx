// app/pricing/page.tsx
import Link from "next/link";
import { auth } from "@/auth";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    desc: "Perfect for solo devs and side projects. No credit card required.",
    badge: "badge-free",
    highlight: false,
    cta: "Get started free",
    ctaHref: "/login",
    features: {
      "Repositories":         "3",
      "Commits / month":      "50",
      "History":              "7 days",
      "AI analysis":          "✓",
      "GitHub status checks": "✓",
      "Risk scoring":         "✓",
      "Slack alerts":         "—",
      "Email digest":         "—",
      "Analytics":            "Basic",
      "API access":           "—",
      "Team seats":           "1",
      "Priority support":     "—",
    },
  },
  {
    name: "Pro",
    price: 12,
    period: "/ month",
    desc: "For professionals who ship daily and need reliable protection.",
    badge: "badge-pro",
    highlight: true,
    cta: "Start 14-day trial",
    ctaHref: "/login?plan=pro",
    features: {
      "Repositories":         "Unlimited",
      "Commits / month":      "1,000",
      "History":              "90 days",
      "AI analysis":          "✓",
      "GitHub status checks": "✓",
      "Risk scoring":         "✓",
      "Slack alerts":         "✓",
      "Email digest":         "✓",
      "Analytics":            "Advanced",
      "API access":           "—",
      "Team seats":           "1",
      "Priority support":     "Email",
    },
  },
  {
    name: "Team",
    price: 39,
    period: "/ month",
    desc: "For engineering teams who want full visibility across every repo.",
    badge: "badge-team",
    highlight: false,
    cta: "Start 14-day trial",
    ctaHref: "/login?plan=team",
    features: {
      "Repositories":         "Unlimited",
      "Commits / month":      "Unlimited",
      "History":              "365 days",
      "AI analysis":          "✓",
      "GitHub status checks": "✓",
      "Risk scoring":         "✓",
      "Slack alerts":         "✓",
      "Email digest":         "✓",
      "Analytics":            "Full + exports",
      "API access":           "✓",
      "Team seats":           "5 (+ $8/extra)",
      "Priority support":     "Priority chat",
    },
  },
];

const FEATURE_ROWS = [
  "Repositories",
  "Commits / month",
  "History",
  "AI analysis",
  "GitHub status checks",
  "Risk scoring",
  "Slack alerts",
  "Email digest",
  "Analytics",
  "API access",
  "Team seats",
  "Priority support",
];

export default async function PricingPage() {
  let session = null;
  try { session = await auth(); } catch { /* auth unavailable */ }

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Background ───────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: "linear-gradient(rgba(124,92,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-15"
          style={{ background: "radial-gradient(ellipse at center top, #7c5cfc 0%, transparent 65%)" }} />
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
            <span className="font-display text-sm font-bold text-white">BH</span>
          </div>
          <span className="font-display text-base font-bold text-text">BugHunter</span>
        </Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="text-sm font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-text2 hover:text-text transition-colors px-4 py-2">Sign in</Link>
              <Link href="/login" className="text-sm font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Header ───────────────────────────────────────── */}
      <div className="relative z-10 pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo/10 border border-indigo/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo2 mb-6">
          Simple, transparent pricing
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-text mb-4">
          Plans for every team
        </h1>
        <p className="text-text2 max-w-md mx-auto text-lg">
          Start free. Upgrade when you need more repos, more commits, or team features.
        </p>
      </div>

      {/* ── Plan cards ───────────────────────────────────── */}
      <div className="relative z-10 px-6 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all ${
                plan.highlight
                  ? "border-indigo/50 bg-indigo/5 shadow-glow-indigo"
                  : "border-border bg-bg2"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
                  MOST POPULAR
                </div>
              )}

              <div className={`inline-block w-fit text-xs font-semibold px-2.5 py-1 rounded-full mb-5 ${plan.badge}`}>
                {plan.name}
              </div>

              <div className="mb-1">
                <span className="font-display text-4xl font-extrabold text-text">
                  {plan.price === 0 ? "$0" : `$${plan.price}`}
                </span>
                <span className="text-text3 text-sm ml-1">{plan.period}</span>
              </div>
              <p className="text-text3 text-sm mb-6 leading-relaxed">{plan.desc}</p>

              <Link
                href={plan.ctaHref}
                className={`block text-center text-sm font-semibold py-2.5 rounded-xl mb-8 transition-all ${
                  plan.highlight
                    ? "bg-indigo hover:bg-indigo3 text-white hover:shadow-glow-indigo"
                    : "border border-border2 hover:border-border3 text-text2 hover:text-text"
                }`}
              >
                {plan.cta}
              </Link>

              <div className="flex-1 space-y-3">
                {FEATURE_ROWS.map(row => {
                  const val = plan.features[row as keyof typeof plan.features];
                  const isCheck = val === "✓";
                  const isDash  = val === "—";
                  return (
                    <div key={row} className="flex items-center justify-between text-sm">
                      <span className="text-text3">{row}</span>
                      <span className={`font-medium ${
                        isCheck ? "text-green" :
                        isDash  ? "text-text3 opacity-40" :
                        "text-text2"
                      }`}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full comparison table ─────────────────────────── */}
      <div className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-xl font-bold text-text mb-8 text-center">Full feature comparison</h2>
          <div className="rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-bg3 border-b border-border">
              <div className="px-6 py-4 text-sm font-semibold text-text3">Feature</div>
              {PLANS.map(p => (
                <div key={p.name} className={`px-6 py-4 text-center ${p.highlight ? "bg-indigo/5" : ""}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.badge}`}>{p.name}</span>
                </div>
              ))}
            </div>
            {/* Rows */}
            {FEATURE_ROWS.map((row, i) => (
              <div
                key={row}
                className={`grid grid-cols-4 border-b border-border last:border-0 ${i % 2 === 0 ? "bg-bg2" : "bg-bg"}`}
              >
                <div className="px-6 py-3.5 text-sm text-text3">{row}</div>
                {PLANS.map(p => {
                  const val     = p.features[row as keyof typeof p.features];
                  const isCheck = val === "✓";
                  const isDash  = val === "—";
                  return (
                    <div key={p.name} className={`px-6 py-3.5 text-center text-sm ${p.highlight ? "bg-indigo/[0.03]" : ""}`}>
                      <span className={`font-medium ${isCheck ? "text-green" : isDash ? "text-text3 opacity-30" : "text-text2"}`}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <div className="relative z-10 px-6 pb-24 border-t border-border pt-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-text mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              { q: "Can I upgrade or downgrade at any time?", a: "Yes. Upgrades take effect immediately. Downgrades take effect at the end of your billing period." },
              { q: "What counts as a 'commit'?", a: "Any commit pushed to a tracked repository that BugHunter analyzes. Merge commits are skipped by default." },
              { q: "Is my code stored anywhere?", a: "No. We fetch the diff from GitHub's API, send it to Anthropic for analysis, and discard it. We never store your source code." },
              { q: "What happens when I hit my monthly commit limit?", a: "Analysis pauses for that billing period. Your repos stay connected and resume automatically next month. You can upgrade to Pro or Team to continue immediately." },
              { q: "Do you offer discounts for open source projects?", a: "Yes — open source maintainers get Pro for free. Email us with a link to your public repo." },
            ].map(faq => (
              <div key={faq.q} className="border border-border rounded-xl p-5">
                <div className="font-semibold text-text mb-2 text-sm">{faq.q}</div>
                <div className="text-text3 text-sm leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between text-sm text-text3">
        <Link href="/" className="flex items-center gap-2 hover:text-text2 transition-colors">
          <div className="w-5 h-5 rounded bg-indigo flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">BH</span>
          </div>
          BugHunter
        </Link>
        <Link href="/login" className="hover:text-text2 transition-colors">Sign in →</Link>
      </footer>
    </div>
  );
}
