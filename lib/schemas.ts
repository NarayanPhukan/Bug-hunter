// lib/schemas.ts
// FIX 4: Zod validation for all API route inputs.
// All request bodies / query params are validated here before touching the DB.

import { z } from "zod";

// ── Repository ────────────────────────────────────────────────────────────────

export const AddRepoSchema = z.object({
  githubId: z.number().int().positive(),
  owner:    z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
  name:     z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.-]+$/),
});
export type AddRepoInput = z.infer<typeof AddRepoSchema>;

// ── Analyze ───────────────────────────────────────────────────────────────────

export const AnalyzeSchema = z.object({
  repoId: z.string().cuid(),
  sha:    z.string().regex(/^[a-f0-9]{7,40}$/, "Must be a valid git SHA"),
});
export type AnalyzeInput = z.infer<typeof AnalyzeSchema>;

// ── Commits query ─────────────────────────────────────────────────────────────

const VALID_RISK = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE", "PENDING", "FAILED", "ALL"] as const;

export const CommitsQuerySchema = z.object({
  repoId: z.string().cuid().optional(),
  risk:   z.enum(VALID_RISK).optional().default("ALL"),
  page:   z.coerce.number().int().min(1).max(1000).optional().default(1),
});
export type CommitsQuery = z.infer<typeof CommitsQuerySchema>;

// ── Webhook payload (partial — we validate the parts we use) ──────────────────

export const WebhookPushPayloadSchema = z.object({
  ref:        z.string(),
  repository: z.object({
    id: z.number().int().positive(),
  }),
  commits: z.array(
    z.object({
      id:      z.string().regex(/^[a-f0-9]{40}$/),
      message: z.string().max(10000),
      author:  z.object({
        name:     z.string().max(200).optional(),
        email:    z.string().max(200).optional(),
        username: z.string().max(100).optional(),
      }).optional(),
      url: z.string().url().optional(),
    })
  ).optional().default([]),
}).passthrough(); // allow extra fields from GitHub

export type WebhookPushPayload = z.infer<typeof WebhookPushPayloadSchema>;

// ── Helper: parse + return 400 on failure ────────────────────────────────────

import { NextResponse } from "next/server";

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data:   unknown
): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      data:  null,
      error: NextResponse.json(
        {
          error:  "Validation error",
          issues: result.error.issues.map(i => ({
            path:    i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      ),
    };
  }
  return { data: result.data, error: null };
}
