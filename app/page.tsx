// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-bg overflow-hidden">

      {/* ── Background effects ────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center top, #6366f1 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-10"
          style={{
            background:
              "radial-gradient(circle at center, #22d3ee 0%, transparent 60%)",
          }}
        />
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
            <span className="font-display text-sm font-bold text-white">
              BH
            </span>
          </div>
          <span className="font-display text-base font-bold text-text">
            BugHunter
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm text-text2 hover:text-text transition-colors hidden sm:block"
          >
            Pricing
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-indigo"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-text2 hover:text-text transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-indigo"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero section ──────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-indigo/10 border border-indigo/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-green" />
            Now analyzing 1.2M+ commits
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-text mb-6 max-w-4xl mx-auto leading-[1.1]">
            Predict bugs{" "}
            <span className="text-shimmer">before they ship</span>
          </h1>

          <p className="text-text2 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered commit analysis that catches security holes, logic bugs,
            and regressions before they reach production. Plug in your repo and
            let AI guard every push.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-glow-indigo"
            >
              Start free — no credit card
              <span className="text-xs opacity-60">→</span>
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 border border-border2 hover:border-border3 text-text2 hover:text-text text-sm font-medium px-8 py-3.5 rounded-xl transition-all"
            >
              View pricing
            </Link>
          </div>
        </div>

        {/* Hero visual — live analysis preview */}
        <div className="mt-16 max-w-3xl mx-auto animate-fade-up delay-300">
          <div className="bg-bg2 border border-border rounded-2xl shadow-card overflow-hidden">
            {/* Mock terminal header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-bg3/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green/60" />
              </div>
              <span className="text-[10px] text-text3 font-mono ml-2">
                BugHunter — Live Analysis
              </span>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-blink" />
                <span className="text-[10px] text-text3 font-mono">
                  CLAUDE SONNET
                </span>
              </div>
            </div>
            {/* Mock analysis output */}
            <div className="p-5 space-y-3 text-left font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-text3">$</span>
                <span className="text-text2">
                  git push origin feat/payment-refactor
                </span>
              </div>
              <div className="flex items-start gap-3 bg-red/5 border border-red/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red/10 text-red border border-red/20 flex-shrink-0 mt-0.5">
                  CRITICAL
                </span>
                <div>
                  <span className="text-text">
                    Race condition in concurrent payment processing
                  </span>
                  <div className="text-text3 mt-1">
                    📄 src/payments/processor.ts · L142–158 · confidence: 94%
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-orange/5 border border-orange/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange/10 text-orange border border-orange/20 flex-shrink-0 mt-0.5">
                  HIGH
                </span>
                <div>
                  <span className="text-text">
                    Missing null check on refund amount could throw at runtime
                  </span>
                  <div className="text-text3 mt-1">
                    📄 src/payments/refund.ts · L89 · confidence: 87%
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green/5 border border-green/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green/10 text-green border border-green/20 flex-shrink-0 mt-0.5">
                  SAFE
                </span>
                <div>
                  <span className="text-text">
                    3 other files analyzed — no issues detected
                  </span>
                  <div className="text-text3 mt-1">
                    ✓ Updated tests pass · ✓ No regressions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="relative z-10 py-12 border-y border-border bg-bg2/50">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "1.2M+", label: "Commits analyzed" },
            { val: "94k+",  label: "Bugs prevented" },
            { val: "2,400+", label: "Teams protected" },
            { val: "< 30s",  label: "Avg analysis time" },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-bold text-text">
                {s.val}
              </div>
              <div className="text-xs text-text3 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo/10 border border-indigo/20 rounded-full px-4 py-1.5 text-xs font-medium text-indigo2 mb-4">
              Features
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4">
              Your AI-powered safety net
            </h2>
            <p className="text-text2 max-w-lg mx-auto">
              Every commit analyzed in seconds. Every bug caught before it
              reaches your users.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "🧠",
                title: "AI bug prediction",
                desc: "Claude Sonnet analyzes every diff for logic bugs, security holes, race conditions, and more.",
              },
              {
                icon: "🎯",
                title: "Risk scoring",
                desc: "Every commit gets a risk level from SAFE to CRITICAL with confidence percentages.",
              },
              {
                icon: "⚡",
                title: "Real-time webhooks",
                desc: "Analysis starts the instant you push. Results appear in your dashboard within seconds.",
              },
              {
                icon: "✅",
                title: "GitHub status checks",
                desc: "Commit statuses posted directly to your PRs. Block risky merges automatically.",
              },
              {
                icon: "📊",
                title: "Analytics dashboard",
                desc: "Track risk trends, team health, and bug distribution across all your repositories.",
              },
              {
                icon: "🔒",
                title: "Zero code storage",
                desc: "Your code is never stored. Diffs are analyzed in memory and discarded immediately.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-bg2 border border-border rounded-2xl p-6 hover:border-indigo/30 transition-all hover:shadow-glow-indigo"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display text-base font-bold text-text mb-2">
                  {f.title}
                </h3>
                <p className="text-text3 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan/10 border border-cyan/20 rounded-full px-4 py-1.5 text-xs font-medium text-cyan mb-4">
              How it works
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text">
              Three steps to safer code
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect your repo",
                desc: "Sign in with GitHub and select which repositories to monitor. We install a webhook automatically.",
              },
              {
                step: "02",
                title: "Push your code",
                desc: "Every push triggers instant AI analysis. Claude reads the diff and identifies potential bugs.",
              },
              {
                step: "03",
                title: "Ship with confidence",
                desc: "Review flagged issues in your dashboard. Get GitHub status checks on every commit.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 mb-5">
                  <span className="font-display text-sm font-bold text-indigo2">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-text mb-2">
                  {s.title}
                </h3>
                <p className="text-text3 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl font-bold text-text">
              Trusted by engineers at every scale
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote:
                  "BugHunter caught a race condition in our payment service before it even hit staging. Saved us from a really bad Friday night.",
                name: "Alex K.",
                role: "Senior Engineer",
                initials: "AK",
              },
              {
                quote:
                  "We integrated it in under 5 minutes. The AI finds things our entire team misses in code review. It's like having a senior engineer on every PR.",
                name: "Maria L.",
                role: "CTO, Launchpad",
                initials: "ML",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-bg2 border border-border rounded-2xl p-6"
              >
                <p className="text-text2 text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo/20 border border-indigo/30 flex items-center justify-center text-indigo2 text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-text">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-text3">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4">
            Stop shipping bugs.{" "}
            <span className="text-gradient">Start shipping confidence.</span>
          </h2>
          <p className="text-text2 mb-8">
            Free plan includes 3 repos, 50 commits/month, and full AI analysis.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-glow-indigo"
            >
              Get started free →
            </Link>
            <Link
              href="/pricing"
              className="border border-border2 hover:border-border3 text-text2 hover:text-text text-sm font-medium px-8 py-3.5 rounded-xl transition-all"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-8 py-6 flex items-center justify-between text-sm text-text3">
        <Link
          href="/"
          className="flex items-center gap-2 hover:text-text2 transition-colors"
        >
          <div className="w-5 h-5 rounded bg-indigo flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">BH</span>
          </div>
          BugHunter
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="hover:text-text2 transition-colors"
          >
            Pricing
          </Link>
          <Link href="/login" className="hover:text-text2 transition-colors">
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}