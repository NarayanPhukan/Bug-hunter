// types/next-auth.d.ts
// FIX 5: Augment NextAuth types so session.user.id is always string (not undefined).

import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:          string;
      githubLogin?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    githubLogin?: string | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    githubLogin?: string | null;
  }
}
