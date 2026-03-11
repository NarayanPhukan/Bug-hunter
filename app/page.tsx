// app/page.tsx
import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-bg overflow-hidden">

      {/* ── Background ───────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,92,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-15"
          style={{ background: "radial-gradient(ellipse at center top, #7c5cfc 0%, transparent 65%)" }}
        />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-8"
          style={{ background: "radial-gradient(circle at center, #34d399 0%, transparent 65%)" }}
        />
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="text-[15px] font-semibold text-text tracking-tight">BugHunter</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="text-[13px] text-text2 hover:text-text transition-colors hidden sm:block">
            Pricing
          </Link>
          {session ? (
            <Link href="/dashboard" className="text-[13px] font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-indigo">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[13px] text-text2 hover:text-text transition-colors">
                Sign in
              </Link>
              <Link href="/login" className="text-[13px] font-semibold bg-indigo hover:bg-indigo3 text-white px-4 py-2 rounded-lg transition-all hover:shadow-glow-indigo">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative z-10 pt-28 pb-20 px-6 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-indigo/8 border border-indigo/15 rounded-full px-4 py-1.5 text-xs font-medium text-indigo2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-green" />
            Trusted by 2,400+ engineering teams
          </div>

          <h1 className="text-5xl md:text-[72px] font-extrabold text-text mb-6 max-w-3xl mx-auto leading-[1.08] tracking-tight">
            Catch bugs before
            <br />
            <span className="text-shimmer">they ship</span>
          </h1>

          <p className="text-text2 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            AI-powered analysis on every commit. BugHunter finds security holes, logic errors, and regressions so you don&apos;t have to.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/login"
              className="flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all hover:shadow-glow-indigo">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Start free with GitHub
            </Link>
            <Link href="/pricing"
              className="text-sm text-text2 hover:text-text px-6 py-3 transition-colors">
              View pricing →
            </Link>
          </div>
        </div>

        {/* ── Live preview ──────────────────────────────────── */}
        <div className="mt-20 max-w-2xl mx-auto animate-fade-up delay-200">
          <div className="bg-bg2 border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg3/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green/50" />
              </div>
              <span className="text-[11px] text-text3 font-mono ml-2">BugHunter Analysis</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-blink" />
                <span className="text-[10px] text-text3 font-mono">LIVE</span>
              </div>
            </div>
            <div className="p-4 space-y-2.5 text-left font-mono text-[12px]">
              <div className="flex items-center gap-3 text-text3">
                <span>$</span>
                <span className="text-text2">git push origin feat/payment-refactor</span>
              </div>
              <div className="flex items-start gap-3 bg-red/[0.04] border border-red/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red/10 text-red flex-shrink-0 mt-0.5">CRITICAL</span>
                <div>
                  <span className="text-text text-[12px]">Race condition in concurrent payment processing</span>
                  <div className="text-text3 mt-1 text-[11px]">📄 src/payments/processor.ts · L142 · 94% confidence</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-orange/[0.04] border border-orange/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange/10 text-orange flex-shrink-0 mt-0.5">HIGH</span>
                <div>
                  <span className="text-text text-[12px]">Missing null check on refund amount</span>
                  <div className="text-text3 mt-1 text-[11px]">📄 src/payments/refund.ts · L89 · 87% confidence</div>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green/[0.04] border border-green/10 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green/10 text-green flex-shrink-0 mt-0.5">SAFE</span>
                <div>
                  <span className="text-text text-[12px]">3 other files — no issues</span>
                  <div className="text-text3 mt-1 text-[11px]">✓ Tests pass · ✓ No regressions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="relative z-10 py-14 border-y border-border bg-bg2/40">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "1.2M+", label: "Commits analyzed" },
            { val: "94k+",  label: "Bugs prevented" },
            { val: "2,400+", label: "Teams protected" },
            { val: "< 30s",  label: "Avg analysis time" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-text tracking-tight">{s.val}</div>
              <div className="text-xs text-text3 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-text mb-4 tracking-tight">
              Everything you need to ship safely
            </h2>
            <p className="text-text2 max-w-md mx-auto text-[15px]">
              Plug in your repos. Let AI catch what code review misses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🧠", title: "AI bug prediction",     desc: "Claude Sonnet analyzes every diff for logic bugs, security holes, and race conditions." },
              { icon: "🎯", title: "Risk scoring",          desc: "SAFE → CRITICAL risk levels with confidence scores on every commit." },
              { icon: "⚡", title: "Real-time webhooks",    desc: "Analysis starts the instant you push. Results in under 30 seconds." },
              { icon: "✅", title: "GitHub status checks",  desc: "Commit statuses posted directly to your PRs. Block risky merges." },
              { icon: "📊", title: "Analytics dashboard",   desc: "Track risk trends and bug distribution across all repositories." },
              { icon: "🔒", title: "Zero code storage",     desc: "Diffs analyzed in memory and discarded. Your source code is never stored." },
            ].map((f) => (
              <div key={f.title} className="bg-bg2 border border-border rounded-xl p-5 hover:border-border2 transition-all group">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold text-text mb-1.5">{f.title}</h3>
                <p className="text-text3 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-text mb-14 text-center tracking-tight">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Connect your repo",    desc: "Sign in with GitHub. Select repos to monitor. Webhook installed automatically." },
              { step: "02", title: "Push your code",       desc: "Every push triggers AI analysis. Claude reads the diff and flags potential bugs." },
              { step: "03", title: "Ship with confidence",  desc: "Review issues in your dashboard. See status checks on every PR." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo/10 border border-indigo/15 mb-4">
                  <span className="text-sm font-bold text-indigo2">{s.step}</span>
                </div>
                <h3 className="text-sm font-semibold text-text mb-2">{s.title}</h3>
                <p className="text-text3 text-[13px] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="relative z-10 py-20 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-5">
          {[
            { quote: "BugHunter caught a race condition in our payment service before it hit staging. Saved us from a bad Friday night.",
              name: "Alex K.", role: "Senior Engineer", initials: "AK" },
            { quote: "We integrated it in 5 minutes. It finds things our entire team misses in review. Like a senior engineer on every PR.",
              name: "Maria L.", role: "CTO, Launchpad", initials: "ML" },
          ].map((t) => (
            <div key={t.name} className="bg-bg2 border border-border rounded-xl p-5">
              <p className="text-text2 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo/15 border border-indigo/20 flex items-center justify-center text-indigo2 text-xs font-bold">{t.initials}</div>
                <div>
                  <div className="text-xs font-semibold text-text">{t.name}</div>
                  <div className="text-[11px] text-text3">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-6 border-t border-border">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text mb-4 tracking-tight">
            Start catching bugs today
          </h2>
          <p className="text-text2 text-[15px] mb-8">
            Free plan includes 3 repos, 50 commits/month. No credit card required.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo3 text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all hover:shadow-glow-indigo">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Get started free
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-8 py-5 flex items-center justify-between text-[13px] text-text3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">B</span>
          </div>
          <span>BugHunter</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="hover:text-text2 transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-text2 transition-colors">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}