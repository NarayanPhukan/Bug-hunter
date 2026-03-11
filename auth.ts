// auth.ts
// FIX 1: GitHub access tokens are AES-256-GCM encrypted before storage.
// FIX 5: session.user.id is properly typed (see types/next-auth.d.ts).

import NextAuth          from "next-auth";
import GitHub            from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma }        from "@/lib/prisma";
import { encrypt }       from "@/lib/crypto";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId:     process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    // FIX 5: Expose user.id on the session (properly typed in types/next-auth.d.ts)
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "github" && account.access_token && user.id) {
        // FIX 1: Encrypt before storage
        const encryptedToken = encrypt(account.access_token);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubToken: encryptedToken,
            githubLogin: (user as { login?: string }).login ?? undefined,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    error:  "/",
  },
  // Explicit session strategy for NextAuth v5
  session: { strategy: "database" },
});
