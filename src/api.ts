// Small fetch helpers. All AI work happens on the server; no keys live in the browser.
//
// The public online demo (GitHub Pages) has no server. It is built with VITE_STATIC_DEMO=1 and then runs
// the same clearly labelled demo mode (rule-based, not live AI) directly in the browser.
import type { Mode, ReportInput, ReportResult, RewindResult, ScanResult } from "../shared/types";
import { analyzeWithRules } from "../server/rules";
import { demoReport, demoRewind } from "../shared/demo";

export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "1";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}

export const getStatus = async (): Promise<Mode | "offline"> => {
  if (STATIC_DEMO) return "demo";
  try {
    const res = await fetch("/api/status");
    if (!res.ok) return "offline";
    return (await res.json()).mode;
  } catch {
    return "offline";
  }
};

export const scanMessage = async (message: string): Promise<ScanResult> => {
  if (!STATIC_DEMO) return post<ScanResult>("/api/scan", { message });
  const text = message.trim();
  if (!text) throw new Error("Please paste a message to scan.");
  if (text.length > 4000) throw new Error("That message is too long (max 4,000 characters).");
  return analyzeWithRules(text);
};

export const rewind = async (decisionId: string, originalId: string, alternativeId: string): Promise<RewindResult> => {
  if (!STATIC_DEMO) return post<RewindResult>("/api/rewind", { decisionId, originalId, alternativeId });
  const r = demoRewind(decisionId, originalId, alternativeId);
  if (!r) throw new Error("Unknown decision.");
  return r;
};

export const getReport = async (input: ReportInput): Promise<ReportResult> => (STATIC_DEMO ? demoReport(input) : post<ReportResult>("/api/report", input));
