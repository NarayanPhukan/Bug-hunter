// app/page.tsx
import { auth }        from "@/auth";
import { redirect }    from "next/navigation";
import Link            from "next/link";
import SignInButton    from "@/components/SignInButton";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">

      {/* ── Background ───────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-20"
          style={{ background: "radial-gradient(ellipse at center top, #6366f1 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] opacity-10"
          style={{ background: "radial-gradient(ellipse at bottom right, #22d3ee 0%, transparent 70%)" }} />
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
            <span className="font-display text-sm font-bold text-white">BH</span>
          </div>
          <span className="font-display text-base font-bold text-text tracking-tight">BugHunter</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-text2 font-medium">
          <a href="#features"  className="hover:text-text transition-colors">Features</a>
          <a href="#how"       className="hover:text-text transition-colors">How it works</a>
          <Link href="/pricing" className="hover:text-text transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-text2 hover:text-text font-medium transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-indigo"
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 bg-indigo/10 border border-indigo/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo2 animate-blink" />
          Powered by Claude Sonnet · Live on GitHub
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-100 font-display text-5xl md:text-7xl font-extrabold text-text leading-[1.05] tracking-tight mb-6 max-w-4xl">
          Catch bugs{" "}
          <span className="text-shimmer">before</span>
          <br />they hit production
        </h1>

        {/* Sub */}
        <p className="animate-fade-up delay-200 text-lg text-text2 max-w-xl leading-relaxed mb-10">
          BugHunter watches every commit to your GitHub repos and uses AI to predict
          bugs, security issues, and regressions — in seconds, automatically.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:shadow-glow-indigo hover:-translate-y-0.5"
          >
            Start for free
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-2 border border-border2 hover:border-border3 text-text2 hover:text-text font-medium px-8 py-3.5 rounded-xl text-sm transition-all"
          >
            View pricing
          </Link>
        </div>

        {/* Social proof */}
        <div className="animate-fade-up delay-400 flex items-center gap-6 text-xs text-text3">
          <span className="flex items-center gap-1.5">
            <span className="text-green">✓</span> Free plan forever
          </span>
          <span className="w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="text-green">✓</span> No credit card required
          </span>
          <span className="w-px h-4 bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="text-green">✓</span> 2-minute setup
          </span>
        </div>
      </section>

      {/* ── Dashboard preview ─────────────────────────────── */}
      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-border overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-bg3 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red/40" />
              <div className="w-3 h-3 rounded-full bg-yellow/40" />
              <div className="w-3 h-3 rounded-full bg-green/40" />
              <div className="ml-4 flex-1 bg-bg4 rounded-md px-3 py-1 text-[11px] text-text3 font-mono">
                bug-hunter-lac.vercel.app/dashboard
              </div>
            </div>
            {/* Mock dashboard */}
            <div className="bg-bg2 p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Commits", val: "1,284", color: "text-text" },
                  { label: "Critical Issues", val: "3", color: "text-red" },
                  { label: "High Risk", val: "12", color: "text-orange" },
                  { label: "Safe Rate", val: "94.2%", color: "text-green" },
                ].map(s => (
                  <div key={s.label} className="bg-bg3 border border-border rounded-xl p-4">
                    <div className="text-xs text-text3 mb-1">{s.label}</div>
                    <div className={`text-2xl font-bold font-display ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>
              {/* Fake commit list */}
              <div className="space-y-2">
                {[
                  { sha: "a3f9c12", msg: "feat: add user authentication flow", risk: "SAFE",     color: "text-green",  bg: "bg-green/10" },
                  { sha: "b7e2d45", msg: "fix: resolve payment processing race condition", risk: "HIGH",     color: "text-orange", bg: "bg-orange/10" },
                  { sha: "c1a8f67", msg: "refactor: update database schema migrations", risk: "MEDIUM",   color: "text-yellow", bg: "bg-yellow/10" },
                  { sha: "d4b3e89", msg: "chore: remove unused API endpoint handlers", risk: "CRITICAL", color: "text-red",    bg: "bg-red/10" },
                ].map(c => (
                  <div key={c.sha} className="flex items-center gap-4 bg-bg4 border border-border rounded-lg px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-text3 w-16 flex-shrink-0">{c.sha}</span>
                    <span className="flex-1 text-text2 truncate">{c.msg}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.color} ${c.bg} flex-shrink-0`}>{c.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
              Everything you need to ship with confidence
            </h2>
            <p className="text-text2 max-w-lg mx-auto">
              BugHunter integrates into your existing workflow in minutes and starts protecting your codebase immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⬡",
                title: "GitHub Webhooks",
                desc: "Every push to any branch triggers instant analysis. No CI changes, no new workflows — just add your repo and go.",
                color: "text-indigo2",
                border: "border-indigo/20",
                bg: "bg-indigo/5",
              },
              {
                icon: "◈",
                title: "Claude AI Analysis",
                desc: "We don't just lint your code. Claude reads the full diff, understands context, and predicts actual runtime bugs.",
                color: "text-cyan",
                border: "border-cyan/20",
                bg: "bg-cyan/5",
              },
              {
                icon: "⊕",
                title: "Risk Scoring",
                desc: "Every commit gets a CRITICAL → SAFE score with a specific recommendation. No noise, no guessing.",
                color: "text-green",
                border: "border-green/20",
                bg: "bg-green/5",
              },
              {
                icon: "◉",
                title: "GitHub Status Checks",
                desc: "BugHunter posts a commit status directly to GitHub. Block merges on CRITICAL commits automatically.",
                color: "text-orange",
                border: "border-orange/20",
                bg: "bg-orange/5",
              },
              {
                icon: "▦",
                title: "Team Alerts",
                desc: "Get notified the moment a high-risk commit lands. Slack and email integrations on Pro and Team plans.",
                color: "text-indigo2",
                border: "border-indigo/20",
                bg: "bg-indigo/5",
              },
              {
                icon: "◎",
                title: "Trend Analytics",
                desc: "Track your team's risk profile over time. See which engineers ship the safest code and where to focus reviews.",
                color: "text-cyan",
                border: "border-cyan/20",
                bg: "bg-cyan/5",
              },
            ].map(f => (
              <div
                key={f.title}
                className={`rounded-xl border ${f.border} ${f.bg} p-6 hover:shadow-card-hover transition-all group`}
              >
                <div className={`text-2xl mb-4 ${f.color}`}>{f.icon}</div>
                <h3 className="font-display font-semibold text-text mb-2">{f.title}</h3>
                <p className="text-text3 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how" className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-text mb-4">Up and running in 2 minutes</h2>
          <p className="text-text2 mb-16">No code changes. No new CI steps. Just connect and go.</p>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo via-cyan to-green opacity-30 hidden sm:block" />

            <div className="space-y-8">
              {[
                { n: "1", title: "Sign in with GitHub",       desc: "One click. We request only the minimum permissions needed to read your repos and post commit statuses." },
                { n: "2", title: "Add a repository",          desc: "Pick any repo from your GitHub account. BugHunter registers a webhook automatically — nothing else needed." },
                { n: "3", title: "Push a commit",             desc: "The moment you push, BugHunter fetches the diff and sends it to Claude for analysis. Usually done in under 30 seconds." },
                { n: "4", title: "See your risk score",       desc: "The result appears on your dashboard and as a GitHub commit status check — CRITICAL, HIGH, MEDIUM, LOW, or SAFE." },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-6 text-left">
                  <div className="w-11 h-11 rounded-xl bg-indigo/15 border border-indigo/30 flex items-center justify-center flex-shrink-0 font-display font-bold text-indigo2">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-semibold text-text mb-1">{s.title}</div>
                    <div className="text-text3 text-sm leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing preview ───────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-text mb-4">Simple, transparent pricing</h2>
          <p className="text-text2 mb-12">Start free. Upgrade when you need more.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "For solo devs and side projects",
                features: ["3 repositories", "50 commits/month", "7-day history", "GitHub status checks"],
                cta: "Get started",
                badge: "badge-free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$12",
                period: "/month",
                desc: "For professional developers",
                features: ["Unlimited repos", "1,000 commits/month", "90-day history", "Slack alerts", "Priority analysis"],
                cta: "Start Pro trial",
                badge: "badge-pro",
                highlight: true,
              },
              {
                name: "Team",
                price: "$39",
                period: "/month",
                desc: "For engineering teams",
                features: ["Everything in Pro", "Unlimited commits", "365-day history", "5 seats included", "Analytics & reports", "API access"],
                cta: "Start Team trial",
                badge: "badge-team",
                highlight: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 text-left transition-all ${
                  plan.highlight
                    ? "border-indigo/50 bg-indigo/5 shadow-glow-indigo"
                    : "border-border bg-bg2"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 ${plan.badge}`}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-3xl font-bold text-text">{plan.price}</span>
                  <span className="text-text3 text-sm">{plan.period}</span>
                </div>
                <p className="text-text3 text-sm mb-6">{plan.desc}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text2">
                      <span className="text-green text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-all ${
                    plan.highlight
                      ? "bg-indigo hover:bg-indigo3 text-white hover:shadow-glow-indigo"
                      : "border border-border2 hover:border-border3 text-text2 hover:text-text"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <Link href="/pricing" className="text-sm text-indigo2 hover:text-indigo underline underline-offset-4 transition-colors">
            Compare all features →
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-text mb-4">
            Stop shipping bugs.<br />
            <span className="text-gradient">Start shipping confidence.</span>
          </h2>
          <p className="text-text2 mb-8">
            Join developers who never push to production blind.
          </p>
          <SignInButton />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">BH</span>
          </div>
          <span className="font-medium">BugHunter</span>
          <span>·</span>
          <span>AI-Powered Commit Analysis</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-text2 transition-colors">Pricing</Link>
          <Link href="/login"   className="hover:text-text2 transition-colors">Sign in</Link>
          <span className="font-mono text-xs">v2.4.1</span>
        </div>
      </footer>

    </div>
  );
}
