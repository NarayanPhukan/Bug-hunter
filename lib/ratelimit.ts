// lib/ratelimit.ts
// FIX 3: Per-IP and per-user rate limiting using Upstash Redis.
// Falls back to a simple in-memory Map when UPSTASH_REDIS_REST_URL is not set (local dev).

import { NextRequest, NextResponse } from "next/server";

// ── In-memory fallback (dev only) ────────────────────────────────────────────
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now    = Date.now();
  const entry  = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }
  if (entry.count >= limit) return false; // blocked
  entry.count++;
  return true; // allowed
}

// ── Upstash-backed limiter ────────────────────────────────────────────────────
async function upstashRateLimit(
  key:      string,
  limit:    number,
  windowMs: number
): Promise<boolean> {
  const url   = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  const windowSec = Math.ceil(windowMs / 1000);

  // Use Redis INCR + EXPIRE pattern
  const incrRes = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: count } = await incrRes.json() as { result: number };

  if (count === 1) {
    // First request in window — set expiry
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSec}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return count <= limit;
}

// ── Public API ────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  /** Max requests per window */
  limit:    number;
  /** Window size in milliseconds */
  windowMs: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  webhook:  { limit: 60,  windowMs: 60_000  }, // 60 req/min per IP (GitHub sends bursts)
  api:      { limit: 120, windowMs: 60_000  }, // 120 req/min per user
  analyze:  { limit: 20,  windowMs: 60_000  }, // 20 manual analyses/min per user
  auth:     { limit: 10,  windowMs: 60_000  }, // 10 auth attempts/min per IP
};

export type RateLimitBucket = keyof typeof LIMITS;

/**
 * Check rate limit for a request.
 * Returns a 429 NextResponse if blocked, or null if allowed.
 */
export async function checkRateLimit(
  req:    NextRequest,
  bucket: RateLimitBucket,
  userId?: string
): Promise<NextResponse | null> {
  const cfg    = LIMITS[bucket];
  const ip     = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
               ?? req.headers.get("x-real-ip")
               ?? "unknown";

  // Key: bucket + user-id (authenticated) or IP (anonymous)
  const key = `rl:${bucket}:${userId ?? ip}`;

  let allowed: boolean;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      allowed = await upstashRateLimit(key, cfg.limit, cfg.windowMs);
    } catch {
      // Redis unavailable — fail open (allow request, log warning)
      console.warn("[ratelimit] Upstash unavailable, failing open for key:", key);
      allowed = true;
    }
  } else {
    // Dev fallback
    allowed = memoryRateLimit(key, cfg.limit, cfg.windowMs);
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After":       String(Math.ceil(cfg.windowMs / 1000)),
          "X-RateLimit-Limit": String(cfg.limit),
        },
      }
    );
  }

  return null;
}
