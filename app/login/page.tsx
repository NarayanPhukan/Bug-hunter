// app/login/page.tsx
import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import Link         from "next/link";
import SignInButton from "@/components/SignInButton";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left panel — branding ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-border">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{ background: "radial-gradient(ellipse at 20% 50%, #6366f1 0%, transparent 60%)" }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo flex items-center justify-center">
            <span className="font-display text-base font-bold text-white">BH</span>
          </div>
          <div>
            <div className="font-display font-bold text-text text-lg">BugHunter</div>
            <div className="text-text3 text-xs font-mono">v2.4.1</div>
          </div>
        </div>

        {/* Quotes / social proof */}
        <div className="relative z-10 space-y-6">
          <div className="p-5 rounded-2xl bg-bg2/80 border border-border backdrop-blur">
            <p className="text-text2 text-sm leading-relaxed mb-3">
              "BugHunter caught a race condition in our payment service before it even hit staging.
              Saved us from a really bad Friday night."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo/30 flex items-center justify-center text-indigo2 text-xs font-bold">AK</div>
              <div>
                <div className="text-xs font-semibold text-text">Alex K.</div>
                <div className="text-[10px] text-text3">Senior Engineer</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {[
              { label: "Commits analyzed", val: "1.2M+" },
              { label: "Bugs prevented",   val: "94k+"  },
              { label: "Teams protected",  val: "2,400+" },
            ].map(s => (
              <div key={s.label} className="flex-1 p-3 rounded-xl bg-bg3/60 border border-border text-center">
                <div className="font-display text-lg font-bold text-text">{s.val}</div>
                <div className="text-[10px] text-text3 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10">
          <div className="space-y-3 text-sm text-text3">
            {[
              "Real-time analysis on every push",
              "GitHub commit status checks",
              "CRITICAL → SAFE risk scoring",
              "No code stored, ever",
            ].map(f => (
              <div key={f} className="flex items-center gap-2">
                <span className="text-indigo2 text-xs">◆</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — auth form ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-sm animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
              <span className="font-display text-sm font-bold text-white">BH</span>
            </div>
            <span className="font-display font-bold text-text">BugHunter</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-text mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-text3 text-sm text-center mb-8">
            Sign in to your BugHunter account
          </p>

          {/* Auth card */}
          <div className="bg-bg2 border border-border rounded-2xl p-8 shadow-card">

            <SignInButton />

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-center text-[11px] text-text3 leading-relaxed">
                By signing in, you agree to our{" "}
                <a href="#" className="text-indigo2 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-indigo2 hover:underline">Privacy Policy</a>.
                <br />
                We only request read access to your repos.
              </p>
            </div>
          </div>

          {/* Plan reminder */}
          <div className="mt-6 p-4 rounded-xl bg-indigo/5 border border-indigo/15">
            <div className="flex items-start gap-3">
              <span className="text-indigo2 text-base mt-0.5">◈</span>
              <div>
                <div className="text-xs font-semibold text-text mb-1">Free plan includes</div>
                <div className="text-[11px] text-text3 space-y-0.5">
                  <div>✓ 3 repositories</div>
                  <div>✓ 50 commits/month</div>
                  <div>✓ GitHub status checks</div>
                  <div>✓ No credit card required</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-text3 hover:text-text2 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
