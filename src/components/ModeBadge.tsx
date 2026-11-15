import type { Mode } from "../../shared/types";

// Always tells the user honestly whether they are seeing live AI or scripted demo content.
export function ModeBadge({ mode }: { mode: Mode | "offline" | null }) {
  if (!mode) return null;
  if (mode === "offline")
    return <span className="chip bg-danger/15 text-danger border border-danger/40">● API server not reachable — run "npm run dev"</span>;
  return mode === "live-ai" ? (
    <span className="chip bg-safe/15 text-safe border border-safe/40" title="Responses are generated live by Claude">● Live AI</span>
  ) : (
    <span className="chip bg-caution/15 text-caution border border-caution/40" title="No AI key configured: results use simple rules and scripted text">
      ● Demo mode (rule-based, not live AI)
    </span>
  );
}
