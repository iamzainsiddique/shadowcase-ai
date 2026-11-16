// Small shared UI pieces so every screen looks and behaves the same.
import { useId, useState, type ReactNode } from "react";
import { useSettings } from "../settings";

/** "?" button that shows a short explanation on hover, focus or tap. */
export function Tip({ text, label = "What does this mean?" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="grid h-7 w-7 place-items-center rounded-full border border-electric-400/60 text-sm font-bold text-electric-400 hover:bg-electric-500/15 focus:outline-none focus-visible:ring-4 focus-visible:ring-electric-400/60"
      >
        ?
      </button>
      {open && (
        <span id={id} role="tooltip" className="absolute left-1/2 top-9 z-50 w-64 -translate-x-1/2 rounded-xl border border-ink-600 bg-ink-900 p-3 text-sm font-normal normal-case tracking-normal text-slate-100 shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

/** Extra plain-language help that only appears in Easy View. */
export function EasyHint({ children }: { children: ReactNode }) {
  const { effective } = useSettings();
  if (!effective.easyMode) return null;
  return (
    <p className="rounded-xl border-2 border-electric-400 bg-electric-500/10 p-4 text-lg">
      <span aria-hidden>👉 </span>
      {children}
    </p>
  );
}

export function Loading({ text = "Working on it…" }: { text?: string }) {
  return (
    <p role="status" className="flex items-center gap-3 text-violet-400">
      <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
      {text}
    </p>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/60 bg-danger/10 p-4">
      <p className="text-danger">
        <span aria-hidden>⚠️ </span>
        {message}
      </p>
      {onRetry && (
        <button className="btn-ghost !min-h-[40px] !py-1.5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Step progress bar: "Step 2 of 5". */
export function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div>
      <p className="mb-1 text-sm text-slate-300">
        {label}: {current} of {total}
      </p>
      <div className="h-2.5 rounded-full bg-ink-700" role="progressbar" aria-label={label} aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
        <div className="h-2.5 rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-all" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

/** One row of a detective score: label, points, bar, and a plain-English "how this was worked out". */
export function ScoreBar({ label, part }: { label: string; part: { points: number; max: number; why: string } }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-slate-300">
          {part.points}/{part.max}
        </span>
      </div>
      <div className="h-3 rounded-full bg-ink-700" role="progressbar" aria-label={label} aria-valuenow={part.points} aria-valuemin={0} aria-valuemax={part.max}>
        <div className="h-3 rounded-full bg-gradient-to-r from-electric-500 to-violet-500" style={{ width: `${(part.points / part.max) * 100}%` }} />
      </div>
      <p className="mt-1 text-sm text-slate-400">{part.why}</p>
    </div>
  );
}
