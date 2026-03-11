// app/page.tsx
import { auth }   from "@/auth";
import { redirect } from "next/navigation";
import SignInButton from "@/components/SignInButton";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="relative min-h-screen bg-bg flex flex-col items-center justify-center overflow-hidden scanlines">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #00ff88 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 border-2 border-green rounded-lg flex items-center justify-center animate-glow-green"
          >
            <span className="font-display text-2xl font-black text-green">BH</span>
          </div>
          <div className="text-left">
            <h1 className="font-display text-3xl font-black text-green tracking-widest">
              BUGHUNTER
            </h1>
            <p className="text-dim text-xs tracking-[4px]">AI COMMIT GUARDIAN</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="max-w-xl">
          <h2 className="text-2xl font-sans font-semibold text-textmain leading-tight mb-3">
            Catch bugs <span className="text-green">before</span> they hit production
          </h2>
          <p className="text-dim text-sm leading-relaxed font-sans">
            BugHunter monitors every commit to your GitHub repos and uses Claude AI
            to predict bugs, security issues, and regressions — before your CI even runs.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="grid grid-cols-3 gap-4 text-xs w-full max-w-lg">
          {[
            { icon: "⬡", label: "GitHub Webhooks",    desc: "Real-time on every push" },
            { icon: "◈", label: "Claude AI Analysis", desc: "Semantic diff understanding" },
            { icon: "⊕", label: "Risk Scoring",       desc: "CRITICAL → SAFE in seconds" },
          ].map(f => (
            <div
              key={f.label}
              className="border border-border rounded-lg p-4 bg-bg2 flex flex-col gap-2"
            >
              <span className="text-green text-lg">{f.icon}</span>
              <span className="text-textmain font-semibold font-sans">{f.label}</span>
              <span className="text-dim">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Sign in */}
        <SignInButton />

        <p className="text-dim text-xs">
          Connects to GitHub OAuth · No code stored · Analysis via Anthropic API
        </p>
      </div>

      {/* Bottom terminal line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-dim text-xs font-mono">
        <span className="text-green">root@bughunter</span>:<span className="text-blue">~</span>$ waiting for connection
        <span className="animate-blink text-green"> █</span>
      </div>
    </main>
  );
}
