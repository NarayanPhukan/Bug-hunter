# 🐛 BugHunter — AI-Powered Commit Analysis

> Catch bugs **before** they hit production. Claude AI analyzes every git commit diff and predicts bugs, security vulnerabilities, and regressions in real-time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUGHUNTER STACK                          │
├────────────────┬────────────────┬───────────────────────────────┤
│   FRONTEND     │    BACKEND     │          AI / DATA            │
│                │                │                               │
│  Next.js 15    │  Next.js API   │  Claude Sonnet (Anthropic)    │
│  App Router    │  Routes        │  Diff analysis + bug predict  │
│  Tailwind CSS  │                │                               │
│  Recharts      │  NextAuth v5   │  PostgreSQL (via Prisma)      │
│  Framer Motion │  GitHub OAuth  │  Neon / Supabase / Railway    │
│                │                │                               │
│                │  Webhook recv  │  GitHub API (Octokit)         │
│                │  + verif.      │  Commits, diffs, statuses     │
└────────────────┴────────────────┴───────────────────────────────┘
```

## Data Flow

```
Dev pushes commit
      ↓
GitHub sends webhook → POST /api/webhook
      ↓
Signature verified (HMAC-SHA256)
      ↓
Commit stored in PostgreSQL (PENDING)
      ↓
GitHub commit diff fetched (Octokit)
      ↓
Diff sent to Claude Sonnet API
      ↓
Structured JSON analysis returned:
  - riskLevel: CRITICAL|HIGH|MEDIUM|LOW|SAFE
  - predictedBugs: [{title, description, severity, file, line}]
  - affectedSystems: ["Auth", "Payments", ...]
  - recommendation: "BLOCK DEPLOY"
  - confidence: 87
      ↓
Results saved to DB
      ↓
GitHub commit status updated (✓/✗)
      ↓
Dashboard shows analysis in real-time
```

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo>
cd bug-hunter
npm install
```

### 2. Database (PostgreSQL)

Create a free PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app).

```bash
# Copy env template
cp .env.example .env.local

# Fill in DATABASE_URL, then push schema
npx prisma db push
npx prisma generate
```

### 3. GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy **Client ID** and **Client Secret** → `.env.local`

### 4. Anthropic API Key

Get your key from [console.anthropic.com](https://console.anthropic.com) → `.env.local`

### 5. Environment Variables

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="openssl rand -base64 32"
AUTH_URL="http://localhost:3000"
AUTH_GITHUB_ID="your_oauth_client_id"
AUTH_GITHUB_SECRET="your_oauth_client_secret"
GITHUB_TOKEN="ghp_..."          # PAT for webhook creation
GITHUB_WEBHOOK_SECRET="random_string"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 6. Run Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Update AUTH_URL to your production URL
# Update GitHub OAuth callback URL to production URL
```

For webhooks to work in production, your app needs a **public URL**.
GitHub webhooks cannot reach `localhost` — use Vercel, Railway, or `ngrok` for local testing:

```bash
# Local webhook testing with ngrok
npx ngrok http 3000
# Use the ngrok URL as AUTH_URL
```

---

## Features

| Feature | Description |
|---|---|
| 🔐 GitHub OAuth | Sign in with GitHub, repos fetched automatically |
| ⬡ Repo Management | Add/remove repos, webhooks registered automatically |
| 🪝 Real-time Webhooks | Every push triggers instant analysis |
| 🤖 Claude AI | Semantic diff understanding, not just static analysis |
| 📊 Risk Scoring | CRITICAL / HIGH / MEDIUM / LOW / SAFE |
| 🔴 GitHub Statuses | Commit status set automatically (✓/✗ in PR checks) |
| 📈 Analytics | 7-day trends, risk breakdown charts |
| 🚨 Alerts Page | Dedicated view for CRITICAL + HIGH issues |
| 🗄 PostgreSQL | Full history, paginated commit browser |

---

## Project Structure

```
bug-hunter/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts      ← GitHub webhook receiver
│   │   ├── repos/route.ts        ← Add/list/remove repos
│   │   ├── repos/github/route.ts ← List user's GitHub repos
│   │   ├── commits/route.ts      ← Query commits
│   │   ├── analyze/route.ts      ← Manual re-analysis
│   │   └── auth/[...nextauth]/   ← NextAuth handler
│   ├── dashboard/
│   │   ├── page.tsx              ← Overview (server)
│   │   ├── commits/page.tsx      ← Commit browser
│   │   ├── repos/page.tsx        ← Repo management
│   │   └── alerts/page.tsx       ← Critical alerts
│   ├── page.tsx                  ← Landing / sign-in
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── DashboardShell.tsx    ← Sidebar + layout
│   │   ├── DashboardClient.tsx   ← Main overview
│   │   ├── CommitDetail.tsx      ← Full analysis modal
│   │   ├── AddRepoModal.tsx      ← Repo picker
│   │   ├── CommitsClient.tsx     ← Commit browser
│   │   ├── ReposClient.tsx       ← Repo manager
│   │   └── AlertsClient.tsx      ← Alerts view
│   └── SignInButton.tsx
├── lib/
│   ├── prisma.ts                 ← DB client singleton
│   ├── github.ts                 ← GitHub API helpers
│   ├── analyzer.ts               ← Claude AI analysis engine
│   └── utils.ts                  ← Helpers, risk colors
├── prisma/
│   └── schema.prisma             ← Full DB schema
└── auth.ts                       ← NextAuth configuration
```

---

## Extending BugHunter

**Add Slack notifications:**
```typescript
// In analyzeInBackground(), after analysis:
if (analysis.riskLevel === "CRITICAL") {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: "POST",
    body: JSON.stringify({
      text: `🚨 CRITICAL: ${commit.message} in ${repo.fullName}`,
    }),
  });
}
```

**Block PR merges:**
Set commit status to `failure` for CRITICAL commits — GitHub can enforce this via branch protection rules requiring the `BugHunter / AI Analysis` status to pass.

**Email alerts:**
Add `nodemailer` or use Resend API on CRITICAL/HIGH risk commits.

---

Made with Claude AI · Next.js 15 · PostgreSQL · GitHub API
# Bug-hunter
