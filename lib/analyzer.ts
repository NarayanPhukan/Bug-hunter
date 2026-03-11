// lib/analyzer.ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface AnalysisResult {
  riskLevel:       "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
  confidence:      number;
  predictedBugs:   Bug[];
  affectedSystems: string[];
  recommendation:  string;
  summary:         string;
  raw:             string;
}

export interface Bug {
  title:       string;
  description: string;
  severity:    "critical" | "high" | "medium" | "low";
  file?:       string;
  line?:       string;
  category:    "security" | "logic" | "performance" | "auth" | "data" | "api" | "other";
}

interface CommitContext {
  sha:     string;
  message: string;
  author:  string;
  repo:    string;
  files:   Array<{
    filename:  string;
    status:    string;
    additions: number;
    deletions: number;
    patch?:    string;
  }>;
}

/** Build the diff string for Claude (capped to avoid token overflow) */
function buildDiffContext(files: CommitContext["files"]): string {
  let out = "";
  let totalChars = 0;
  const CAP = 12000;

  for (const f of files) {
    const header = `\n### ${f.filename} [${f.status}] +${f.additions}/-${f.deletions}\n`;
    const patch  = f.patch ? f.patch.slice(0, 3000) : "(binary or no diff)";
    const block  = header + patch;
    if (totalChars + block.length > CAP) break;
    out        += block;
    totalChars += block.length;
  }
  return out || "No diff available.";
}

/** Main function — analyze a commit and return structured results */
export async function analyzeCommit(ctx: CommitContext): Promise<AnalysisResult> {
  const diffContext = buildDiffContext(ctx.files);

  const systemPrompt = `You are BugHunter, an expert AI code reviewer specialized in predicting bugs, security vulnerabilities, and regressions BEFORE they reach production.

You analyze git commit diffs and return a structured JSON analysis. Your goal is to find:
- Security vulnerabilities (SQL injection, XSS, auth bypass, secret exposure, etc.)
- Logic bugs (off-by-one errors, null dereferences, race conditions, etc.)
- Breaking changes (API contract changes, DB schema issues, etc.)
- Performance regressions (N+1 queries, missing indexes, unbounded loops, etc.)
- Auth & authorization flaws
- Data integrity issues

ALWAYS respond with valid JSON only. No markdown, no preamble.`;

  const userPrompt = `Analyze this Git commit:

Repository: ${ctx.repo}
SHA: ${ctx.sha.slice(0, 7)}
Author: ${ctx.author}
Commit message: "${ctx.message}"
Files changed: ${ctx.files.length}

Diff:
${diffContext}

Respond ONLY with this JSON structure:
{
  "riskLevel": "CRITICAL|HIGH|MEDIUM|LOW|SAFE",
  "confidence": <0-100 integer>,
  "summary": "<one sentence summary of what this commit does>",
  "recommendation": "<one action: BLOCK DEPLOY | URGENT REVIEW | REVIEW BEFORE DEPLOY | DEPLOY WITH CAUTION | SAFE TO DEPLOY>",
  "predictedBugs": [
    {
      "title": "<short title>",
      "description": "<detailed explanation of the bug and why it's dangerous>",
      "severity": "critical|high|medium|low",
      "file": "<filename or null>",
      "line": "<line range or null>",
      "category": "security|logic|performance|auth|data|api|other"
    }
  ],
  "affectedSystems": ["<system or feature that could break>"]
}

Rules:
- predictedBugs can be empty array if no bugs found
- affectedSystems should list what user-facing features could be impacted
- Be specific and actionable, not generic
- CRITICAL = production-breaking or security exploit possible
- HIGH = likely to cause bugs or data issues
- MEDIUM = could cause problems under certain conditions
- LOW = minor issues, style, potential future problems
- SAFE = no significant issues found`;

  const message = await anthropic.messages.create({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system:     systemPrompt,
    messages:   [{ role: "user", content: userPrompt }],
  });

  const raw = message.content
    .filter(b => b.type === "text")
    .map(b => (b as { type: "text"; text: string }).text)
    .join("");

  // Parse JSON — strip any accidental markdown fences
  const clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(clean) as AnalysisResult;
  parsed.raw = raw;
  return parsed;
}
