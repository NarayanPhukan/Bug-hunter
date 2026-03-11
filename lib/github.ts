// lib/github.ts
// FIX 12: Retry logic on GitHub API calls (handles 502/503/429 from GitHub).
// FIX: Timing-safe webhook signature verification using timingSafeEqual.

import { Octokit }        from "@octokit/rest";
import { createHmac, timingSafeEqual } from "crypto";

/** Build an Octokit instance with automatic retry on transient errors */
export function getOctokit(token: string) {
  return new Octokit({
    auth:    token,
    // Octokit's built-in retry plugin handles 429 and 5xx automatically
    retry:   { doNotRetry: [400, 401, 403, 404, 422] },
    request: { timeout: 15000 },
  });
}

/** Retry wrapper for non-Octokit async calls */
async function withRetry<T>(
  fn:       () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      // Don't retry on auth or not-found errors
      if (status && [400, 401, 403, 404, 422].includes(status)) throw e;
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastErr;
}

/** List repos the authenticated user has access to */
export async function listUserRepos(token: string) {
  const octokit = getOctokit(token);
  return withRetry(async () => {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort:     "updated",
      per_page: 50,
      visibility: "all",
    });
    return data;
  });
}

/** Fetch a single repo */
export async function getRepo(token: string, owner: string, repo: string) {
  const octokit = getOctokit(token);
  return withRetry(async () => {
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  });
}

/** Fetch recent commits for a repo */
export async function getRecentCommits(
  token:   string,
  owner:   string,
  repo:    string,
  sha?:    string,
  perPage = 10
) {
  const octokit = getOctokit(token);
  return withRetry(async () => {
    const { data } = await octokit.repos.listCommits({
      owner, repo,
      sha:      sha || undefined,
      per_page: perPage,
    });
    return data;
  });
}

/** Fetch commit detail with diff */
export async function getCommitDetail(
  token: string,
  owner: string,
  repo:  string,
  sha:   string
) {
  const octokit = getOctokit(token);
  return withRetry(async () => {
    const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });
    return data;
  });
}

/** Register a push webhook on the repo */
export async function createWebhook(
  token:      string,
  owner:      string,
  repo:       string,
  webhookUrl: string,
  secret:     string
) {
  const octokit = getOctokit(token);
  const { data } = await octokit.repos.createWebhook({
    owner, repo,
    config: {
      url:          webhookUrl,
      content_type: "json",
      secret,
      insecure_ssl: "0",
    },
    events: ["push"],
    active: true,
  });
  return data;
}

/** Delete a webhook */
export async function deleteWebhook(
  token:  string,
  owner:  string,
  repo:   string,
  hookId: number
) {
  const octokit = getOctokit(token);
  await octokit.repos.deleteWebhook({ owner, repo, hook_id: hookId });
}

/** Set a GitHub commit status (non-fatal: logs but doesn't throw) */
export async function setCommitStatus(
  token:       string,
  owner:       string,
  repo:        string,
  sha:         string,
  state:       "error" | "failure" | "pending" | "success",
  description: string,
  targetUrl?:  string
) {
  const octokit = getOctokit(token);
  await withRetry(() =>
    octokit.repos.createCommitStatus({
      owner, repo, sha,
      state,
      description: description.slice(0, 140),
      context:    "BugHunter / AI Analysis",
      target_url: targetUrl,
    })
  );
}

/**
 * Verify GitHub webhook HMAC-SHA256 signature.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyWebhookSignature(
  payload:   string,
  signature: string,
  secret:    string
): boolean {
  if (!signature.startsWith("sha256=")) return false;
  try {
    const expected = Buffer.from(
      "sha256=" + createHmac("sha256", secret).update(payload).digest("hex")
    );
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
