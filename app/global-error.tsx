"use client";
// app/global-error.tsx
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#070a0f", color: "#c8d8e8", fontFamily: "monospace", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: 32, color: "#ff3355" }}>⚠</div>
        <h1 style={{ fontFamily: "sans-serif", fontSize: 16, color: "#ff3355" }}>CRITICAL SYSTEM ERROR</h1>
        <p style={{ fontSize: 12, color: "#5a7090" }}>Something went wrong at the application level.</p>
        <button
          onClick={reset}
          style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.4)", color: "#00ff88", padding: "10px 24px", borderRadius: 4, cursor: "pointer", fontSize: 12, letterSpacing: 2 }}
        >RETRY</button>
      </body>
    </html>
  );
}
