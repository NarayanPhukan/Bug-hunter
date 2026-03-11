// types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:          string;
      plan:        "free" | "pro" | "team";
      githubLogin?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    plan?:        "free" | "pro" | "team";
    githubLogin?: string | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    plan?:        "free" | "pro" | "team";
    githubLogin?: string | null;
  }
}
