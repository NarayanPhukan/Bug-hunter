// lib/prisma.ts
// FIX 2: Uses Neon serverless HTTP adapter in production to avoid connection
// exhaustion on serverless/edge — no persistent TCP connections needed.

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (
    process.env.DATABASE_URL?.includes("neon.tech") &&
    process.env.NODE_ENV === "production"
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { neon }       = require("@neondatabase/serverless");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaNeon } = require("@prisma/adapter-neon");
      const sql            = neon(process.env.DATABASE_URL!);
      const adapter        = new PrismaNeon(sql);
      return new PrismaClient({
        adapter,
        log: ["error"],
      } as ConstructorParameters<typeof PrismaClient>[0]);
    } catch {
      // Adapter not installed — fall through to standard client
    }
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
