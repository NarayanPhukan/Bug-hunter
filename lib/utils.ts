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
  CRITICAL: { color: "#ff3355", bg: "rgba(255,51,85,0.1)",   border: "rgba(255,51,85,0.3)",   label: "CRITICAL", pulse: true  },
  HIGH:     { color: "#ff8800", bg: "rgba(255,136,0,0.1)",   border: "rgba(255,136,0,0.3)",   label: "HIGH",     pulse: true  },
  MEDIUM:   { color: "#ffcc00", bg: "rgba(255,204,0,0.08)",  border: "rgba(255,204,0,0.25)",  label: "MEDIUM",   pulse: false },
  LOW:      { color: "#00aaff", bg: "rgba(0,170,255,0.08)",  border: "rgba(0,170,255,0.25)",  label: "LOW",      pulse: false },
  SAFE:     { color: "#00ff88", bg: "rgba(0,255,136,0.08)",  border: "rgba(0,255,136,0.25)",  label: "SAFE",     pulse: false },
  PENDING:  { color: "#5a7090", bg: "rgba(90,112,144,0.08)", border: "rgba(90,112,144,0.2)",  label: "PENDING",  pulse: false },
  FAILED:   { color: "#5a7090", bg: "rgba(90,112,144,0.08)", border: "rgba(90,112,144,0.2)",  label: "FAILED",   pulse: false },
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
