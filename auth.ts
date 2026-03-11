// auth.ts
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
        params: { scope: "read:user user:email repo" },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      // Expose plan so DashboardShell can show the right badge without a DB call
      const dbUser = await prisma.user.findUnique({
        where:  { id: user.id },
        select: { plan: true },
      });
      session.user.plan = (dbUser?.plan ?? "free") as "free" | "pro" | "team";
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "github" && account.access_token && user.id) {
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
    signIn: "/login",   // updated: points to dedicated login page
    error:  "/login",
  },
  session: { strategy: "database" },
});
