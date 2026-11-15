// Copy a link to a scenario so it can be sent to family or friends.
import { useState } from "react";
import { shareUrl, type PlayRequest } from "../share";

export function ShareButton({ request, label = "🔗 Share this scenario" }: { request: PlayRequest; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "show">("idle");
  const url = shareUrl(request);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("show");
    }
  };
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" className="btn-ghost" onClick={copy}>
        {state === "copied" ? "✓ Link copied" : label}
      </button>
      {state === "show" && <input readOnly value={url} onFocus={(e) => e.target.select()} className="rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm" aria-label="Link to share" />}
      {state !== "idle" && <span className="text-sm text-slate-400">The link only says which scenario to open. Nothing personal is shared.</span>}
    </span>
  );
}
