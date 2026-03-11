// app/api/repos/github/route.ts
// FIX 3: Rate limited per user.
// FIX 1: Token decrypted before use.

import { NextRequest, NextResponse } from "next/server";
import { auth }                      from "@/auth";
import { prisma }                    from "@/lib/prisma";
import { listUserRepos }             from "@/lib/github";
import { checkRateLimit }            from "@/lib/ratelimit";
import { safeDecryptToken }          from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api", session.user.id);
  if (rl) return rl;

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { githubToken: true },
  });
  if (!user?.githubToken) return NextResponse.json({ error: "No GitHub token. Re-authenticate." }, { status: 400 });

  // FIX 1: Decrypt token before calling GitHub API
  const token = safeDecryptToken(user.githubToken);

  try {
    const repos = await listUserRepos(token);
    return NextResponse.json(
      repos.map(r => ({
        id:          r.id,
        fullName:    r.full_name,
        owner:       r.owner.login,
        name:        r.name,
        description: r.description,
        private:     r.private,
        language:    r.language,
        stars:       r.stargazers_count,
        updatedAt:   r.updated_at,
      }))
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[repos/github] GitHub API error:", msg);
    return NextResponse.json({ error: "GitHub API error: " + msg }, { status: 502 });
  }
}
