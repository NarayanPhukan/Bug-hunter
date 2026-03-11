// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "BugHunter — AI-Powered Commit Analysis",
  description: "Predict bugs before they reach production. AI analysis on every git commit.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title:       "BugHunter — AI-Powered Commit Analysis",
    description: "Predict bugs before they reach production.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
