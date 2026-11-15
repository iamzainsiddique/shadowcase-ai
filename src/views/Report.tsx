// Final detective report. The score measures learning objectives (clues, verdict, safe choices,
// reflection) — it is NOT an AI confidence score.
import { useEffect, useState } from "react";
import { ALL_CLUES, CASE_001, findOption, scoreCase } from "../../shared/case";
import { TACTIC_LABELS, type ReportResult, type Tactic } from "../../shared/types";
import { getReport } from "../api";
import { ErrorBox, Loading, ScoreBar } from "../components/ui";
import { useAutoRead } from "../speech";
import type { Choice } from "./Investigation";

function rank(total: number) {
  if (total >= 85) return "Chief Inspector";
  if (total >= 65) return "Senior Detective";
  if (total >= 40) return "Detective";
  return "Trainee Detective";
}

interface Props {
  choices: Choice[];
  found: string[];
  verdictCorrect: boolean;
  rewindsUsed: number;
  rewoundDecisions: string[];
  onRestart: () => void;
  onScanner: () => void;
}

export function Report({ choices, found, verdictCorrect, rewindsUsed, rewoundDecisions, onRestart, onScanner }: Props) {
  const [ai, setAi] = useState<ReportResult | null>(null);
  const [error, setError] = useState("");
  const score = scoreCase(choices, found, verdictCorrect, rewoundDecisions);

  useEffect(() => {
    getReport({ choices, cluesFound: found, verdictCorrect, rewindsUsed }).then(setAi, (e) => setError((e as Error).message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Read the score and lessons together once the lessons have loaded (or the score alone if they failed).
  useAutoRead(
    [`Case closed. Your detective score is ${score.total} out of 100.`, ...(ai ? ["Your personal safety lessons.", ...ai.lessons, ai.closing] : [])],
    `report-${ai ? "lessons" : "error"}`,
    !!ai || !!error,
  );

  const foundTactics = [...new Set(ALL_CLUES.filter((c) => found.includes(c.id)).map((c) => c.tactic))] as Tactic[];
  const missed = ALL_CLUES.filter((c) => !found.includes(c.id));

  const bars = [
    ["Clues spotted", score.clues],
    ["Correct verdict", score.verdict],
    ["Safe decisions", score.decisions],
    ["Learning from mistakes", score.reflection],
  ] as const;

  return (
    <section className="space-y-6 animate-rise">
      <div className="card grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="text-center">
          <p className="eyebrow">Detective score</p>
          <p className="font-display text-7xl font-bold bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">{score.total}</p>
          <p className="text-slate-400">out of 100</p>
          <p className="chip mt-2 border border-violet-500/50 bg-violet-500/15 text-violet-400">{rank(score.total)}</p>
        </div>
        <div className="space-y-3">
          <h1 className="h2">Case closed: {CASE_001.title}</h1>
          {bars.map(([label, part]) => (
            <ScoreBar key={label} label={label} part={part} />
          ))}
          <p className="text-sm text-slate-400">Score is based on learning goals, not an AI confidence rating.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="h2 mb-3">Your decisions</h2>
          <ol className="space-y-3">
            {choices.map((c) => {
              const { decision, option } = findOption(c.decisionId, c.optionId);
              const safer = decision?.options.find((o) => o.safety === "safe");
              return (
                <li key={c.decisionId} className="rounded-xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-sm text-slate-400">{decision?.title}</p>
                  <p className="font-semibold">
                    {option?.safety === "safe" ? "✅" : option?.safety === "risky" ? "⚠️" : "❌"} {option?.label}
                  </p>
                  {option?.safety !== "safe" && <p className="mt-1 text-sm"><span className="text-safe">Safer alternative:</span> {safer?.label}</p>}
                  {option?.safety !== "safe" && <p className="mt-1 text-sm text-slate-400">Possible consequence: {option?.outcome}</p>}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="h2 mb-3">Clues & tactics</h2>
            <p>
              You found <strong>{found.length}</strong> of {ALL_CLUES.length} clues.
            </p>
            <p className="mt-2 font-semibold">Manipulation tactics you identified:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {foundTactics.length ? foundTactics.map((t) => <span key={t} className="chip border border-safe/40 text-safe">{TACTIC_LABELS[t]}</span>) : <span className="text-slate-400">None yet — that's okay, now you know what to look for.</span>}
            </div>
            {missed.length > 0 && (
              <>
                <p className="mt-3 font-semibold">Clues you missed:</p>
                <ul className="mt-1 list-disc pl-5 text-sm text-slate-300">
                  {missed.map((c) => (
                    <li key={c.id}>
                      “{c.text}” — {TACTIC_LABELS[c.tactic]}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="card border-violet-500/40 p-5" aria-live="polite">
            <h2 className="h2 mb-1">Your personal safety lessons</h2>
            <p className="mb-3 text-sm text-slate-400">{ai ? (ai.mode === "live-ai" ? "Written for you by live AI" : "Demo mode: template-based, not live AI") : ""}</p>
            {!ai && !error && <Loading text="Writing your lessons…" />}
            {error && <ErrorBox message={error} />}
            {ai && (
              <>
                <ul className="space-y-2">
                  {ai.lessons.map((l, i) => (
                    <li key={i} className="rounded-lg bg-ink-900 p-3">💡 {l}</li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold text-electric-400">{ai.closing}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" onClick={onRestart}>Replay the case</button>
        <button className="btn-ghost" onClick={onScanner}>Try the message scanner (demo) →</button>
        <button className="btn-ghost" onClick={() => window.print()}>Print my report</button>
      </div>
    </section>
  );
}
