// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge }               from "tailwind-merge";
import { safeDecrypt }           from "./crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date | string): string {
  const d   = typeof date === "string" ? new Date(date) : date;
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60)    return `${sec}s ago`;
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** Decrypt a stored GitHub token — handles both encrypted and legacy plaintext */
export function safeDecryptToken(stored: string): string {
  return safeDecrypt(stored);
}

export const RISK_CONFIG = {
  CRITICAL: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   label: "CRITICAL", pulse: true  },
  HIGH:     { color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)",  label: "HIGH",     pulse: true  },
  MEDIUM:   { color: "#eab308", bg: "rgba(234,179,8,0.06)",   border: "rgba(234,179,8,0.2)",   label: "MEDIUM",   pulse: false },
  LOW:      { color: "#22d3ee", bg: "rgba(34,211,238,0.06)",  border: "rgba(34,211,238,0.2)",  label: "LOW",      pulse: false },
  SAFE:     { color: "#22c55e", bg: "rgba(34,197,94,0.06)",   border: "rgba(34,197,94,0.2)",   label: "SAFE",     pulse: false },
  PENDING:  { color: "#5a5a72", bg: "rgba(90,90,114,0.06)",   border: "rgba(90,90,114,0.15)",  label: "PENDING",  pulse: false },
  FAILED:   { color: "#5a5a72", bg: "rgba(90,90,114,0.06)",   border: "rgba(90,90,114,0.15)",  label: "FAILED",   pulse: false },
} as const;

export type RiskLevel = keyof typeof RISK_CONFIG;

export function getRiskConfig(risk: string) {
  return RISK_CONFIG[risk as RiskLevel] ?? RISK_CONFIG.PENDING;
}

export function githubCommitStatusFromRisk(risk: string): "success" | "failure" | "error" | "pending" {
  switch (risk) {
    case "SAFE":     return "success";
    case "LOW":      return "success";
    case "MEDIUM":   return "failure";
    case "HIGH":     return "error";
    case "CRITICAL": return "error";
    default:         return "pending";
  }
}
