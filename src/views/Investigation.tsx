// Case 001 — the full detective journey:
// briefing → evidence board (Detective Mode) → Scammer's Playbook → 3 decisions with AI Rewind → report.
import React, { useState } from "react";
import { CASE_001, ALL_CLUES, type Clue, type Evidence, type Safety } from "../../shared/case";
import { TACTIC_EXPLAINERS, TACTIC_LABELS, type RewindResult, type ScanResult, type Tactic } from "../../shared/types";
import { rewind, scanMessage } from "../api";
import { Highlight } from "../components/Highlight";
import { splitEvidence } from "../components/ClickableText";
import { Readable, SpeakButton } from "../components/SpeakButton";
import { ErrorBox, Loading } from "../components/ui";
import { useAutoRead } from "../speech";
import { Report } from "./Report";

type Stage = "briefing" | "evidence" | "playbook" | "decisions" | "report";
const STAGES: { id: Stage; label: string }[] = [
  { id: "briefing", label: "Briefing" },
  { id: "evidence", label: "Evidence" },
  { id: "playbook", label: "Playbook" },
  { id: "decisions", label: "Decisions" },
  { id: "report", label: "Report" },
];

export interface Choice {
  decisionId: string;
  optionId: string;
}

export function Investigation({ onScanner }: { onScanner: () => void }) {
  const [stage, setStage] = useState<Stage>("briefing");
  const [found, setFound] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [rewindsUsed, setRewindsUsed] = useState(0);
  /** Decisions the player compared with AI Rewind (used for the "learning from mistakes" score). */
  const [rewound, setRewound] = useState<string[]>([]);

  const goto = (s: Stage) => {
    setStage(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const restart = () => {
    setFound([]);
    setVerdict(null);
    setChoices([]);
    setRewindsUsed(0);
    setRewound([]);
    goto("briefing");
  };

  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="space-y-8">
      <nav aria-label="Investigation progress">
        <ol className="flex flex-wrap gap-2">
          {STAGES.map((s, i) => (
            <li key={s.id} className={`chip border ${i === stageIndex ? "border-electric-400 bg-electric-500/15 text-electric-400" : i < stageIndex ? "border-safe/40 text-safe" : "border-ink-600 text-slate-400"}`} aria-current={i === stageIndex ? "step" : undefined}>
              {i < stageIndex ? "✓ " : `${i + 1}. `}
              {s.label}
            </li>
          ))}
        </ol>
      </nav>

      {stage === "briefing" && <Briefing onNext={() => goto("evidence")} />}
      {stage === "evidence" && <EvidenceBoard found={found} setFound={setFound} verdict={verdict} setVerdict={setVerdict} onNext={() => goto("playbook")} />}
      {stage === "playbook" && <Playbook found={found} onNext={() => goto("decisions")} />}
      {stage === "decisions" && (
        <Decisions
          onRewind={(id) => {
            setRewindsUsed((n) => n + 1);
            setRewound((r) => (r.includes(id) ? r : [...r, id]));
          }}
          onDone={(c) => {
            setChoices(c);
            goto("report");
          }}
        />
      )}
      {stage === "report" && <Report choices={choices} found={found} verdictCorrect={verdict === CASE_001.isScam} rewindsUsed={rewindsUsed} rewoundDecisions={rewound} onRestart={restart} onScanner={onScanner} />}
    </div>
  );
}

// ---------------- Briefing ----------------
function Briefing({ onNext }: { onNext: () => void }) {
  const c = CASE_001;
  useAutoRead([{ text: `Case file 001: ${c.title}. ${c.tagline}`, id: "c1-briefing" }, { text: c.briefing, id: "c1-briefing" }], "case001-briefing");
  return (
    <section className="grid gap-6 animate-rise lg:grid-cols-[1.4fr_1fr]">
      <div className="card space-y-4 p-6">
        <p className="eyebrow">Case file 001</p>
        <h1 className="h1">{c.title}</h1>
        <p className="text-xl text-slate-300">{c.tagline}</p>
        <Readable id="c1-briefing" className="p-1">
          <p className="text-lg">{c.briefing}</p>
        </Readable>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary text-lg" onClick={onNext}>Examine the evidence →</button>
          <SpeakButton id="c1-briefing" text={c.briefing} />
        </div>
      </div>
      <div className="card space-y-3 p-6">
        <p className="eyebrow">Person in this case</p>
        <p className="font-display text-xl font-bold">{c.victim}</p>
        <p className="text-slate-300">Fictional character. Lives alone, careful with money, uses her bank's app a few times a month.</p>
        <hr className="border-ink-600" />
        <p className="eyebrow">Your mission</p>
        <ul className="list-disc space-y-1 pl-5 text-slate-200">
          <li>Click on anything suspicious in the evidence.</li>
          <li>Decide whether this is a scam.</li>
          <li>Make Margaret's three decisions — and rewind them.</li>
        </ul>
      </div>
    </section>
  );
}

// ---------------- Detective Mode: evidence board ----------------
const KIND_ICON: Record<Evidence["kind"], string> = { sms: "💬", call: "📞", email: "✉️", alert: "🔔" };

function EvidenceCard({ ev, found, onFind, onMiss }: { ev: Evidence; found: string[]; onFind: (c: Clue) => void; onMiss: () => void }) {
  const [ai, setAi] = useState<ScanResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const pieces = splitEvidence(ev.body, ev.clues);

  const askAi = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      setAi(await scanMessage(`From: ${ev.from}\n${ev.body}`));
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <article className="card flex flex-col p-5" aria-labelledby={`${ev.id}-t`}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p id={`${ev.id}-t`} className="font-display text-lg font-bold">
            <span aria-hidden>{KIND_ICON[ev.kind]} </span>
            {ev.title}
          </p>
          <p className="text-sm text-slate-400">
            From {ev.from} · {ev.time}
          </p>
        </div>
        <span className="chip border border-ink-600 text-slate-300">
          {ev.clues.filter((c) => found.includes(c.id)).length} found
        </span>
      </header>
      <p className="rounded-xl border border-ink-600 bg-ink-900 p-4 text-lg leading-relaxed">
        {pieces.map((p, i) => {
          const isFound = p.clue && found.includes(p.clue.id);
          return (
            <span key={i}>
              <button
                type="button"
                onClick={() => (p.clue ? onFind(p.clue) : onMiss())}
                className={`rounded px-0.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 ${isFound ? "bg-danger/25 ring-1 ring-danger/60" : "hover:bg-electric-500/15"}`}
              >
                {p.text}
              </button>{" "}
            </span>
          );
        })}
      </p>
      <ul className="mt-3 space-y-2" aria-live="polite">
        {ev.clues
          .filter((c) => found.includes(c.id))
          .map((c) => (
            <li key={c.id} className="animate-rise rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm">
              <strong className="text-danger">{TACTIC_LABELS[c.tactic]}:</strong> {c.explanation}
            </li>
          ))}
      </ul>

      <div className="mt-auto pt-4">
        {!ai && (
          <button className="btn-ghost w-full" onClick={askAi} disabled={aiLoading}>
            {aiLoading ? "AI partner is analysing…" : "🤖 Ask the AI partner to analyse this"}
          </button>
        )}
        {aiLoading && <div className="mt-2"><Loading text="The AI partner is reading this evidence…" /></div>}
        {aiError && <div className="mt-2"><ErrorBox message={aiError} onRetry={askAi} /></div>}
        {ai && (
          <div className="animate-rise space-y-2 rounded-xl border border-violet-500/40 bg-violet-500/10 p-4">
            <p className="text-sm font-semibold text-violet-400">AI partner {ai.mode === "demo" && "(demo mode — rule-based, not live AI)"}</p>
            <p>{ai.summary}</p>
            {ai.indicators.length > 0 && (
              <p className="text-sm text-slate-300">
                <Highlight text={ev.body} phrases={ai.indicators.map((i) => i.quote)} className="rounded bg-violet-500/30 px-0.5 text-white" />
              </p>
            )}
            <ul className="list-disc pl-5 text-sm text-slate-300">
              {ai.indicators.map((i, k) => (
                <li key={k}>
                  <strong>{TACTIC_LABELS[i.tactic] ?? i.tactic}</strong>: {i.explanation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function EvidenceBoard(props: { found: string[]; setFound: React.Dispatch<React.SetStateAction<string[]>>; verdict: boolean | null; setVerdict: (v: boolean) => void; onNext: () => void }) {
  const { found, setFound, verdict, setVerdict, onNext } = props;
  const [feedback, setFeedback] = useState("");
  const total = ALL_CLUES.length;

  const onFind = (c: Clue) => {
    setFound((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
    setFeedback(`Clue found: ${TACTIC_LABELS[c.tactic]}.`);
  };
  const onMiss = () => setFeedback("Nothing suspicious in that part. Keep looking.");

  return (
    <section className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Detective mode</p>
          <h1 className="h2">The evidence board</h1>
          <p className="max-w-2xl text-lg text-slate-300">Click on any words that look suspicious. One piece of evidence is genuine — can you tell which?</p>
        </div>
        <div className="card px-5 py-3 text-center">
          <p className="text-sm text-slate-400">Clues found</p>
          <p className="font-display text-3xl font-bold text-electric-400">
            {found.length}
            <span className="text-lg text-slate-400">/{total}</span>
          </p>
        </div>
      </div>
      <p aria-live="polite" className="min-h-[1.5rem] font-semibold text-electric-400">{feedback}</p>

      <div className="grid gap-5 lg:grid-cols-2">
        {CASE_001.evidence.map((ev) => (
          <EvidenceCard key={ev.id} ev={ev} found={found} onFind={onFind} onMiss={onMiss} />
        ))}
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="h2">Your verdict</h2>
        <p className="text-lg">Based on the evidence, is Margaret being targeted by a scam?</p>
        <div className="flex flex-wrap gap-3">
          <button className={verdict === true ? "btn-primary" : "btn-ghost"} aria-pressed={verdict === true} onClick={() => setVerdict(true)}>Yes, this is a scam</button>
          <button className={verdict === false ? "btn-primary" : "btn-ghost"} aria-pressed={verdict === false} onClick={() => setVerdict(false)}>No, it's genuine</button>
        </div>
        {verdict !== null && (
          <div className="animate-rise space-y-3" aria-live="polite">
            <p className={`text-lg font-semibold ${verdict === CASE_001.isScam ? "text-safe" : "text-caution"}`}>
              {verdict === CASE_001.isScam ? "Correct. The text, the call and the email are all part of one scam." : "Not this time. The text, the call and the email are all part of one scam."}
            </p>
            <p className="text-slate-300">
              The <strong>Northbridge app notification</strong> was the genuine message: it came inside the official app, didn't ask for anything, and told Margaret to use the app or the number on her card.
            </p>
            <button className="btn-primary" onClick={onNext}>Open the Scammer's Playbook →</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------- Scammer's Playbook ----------------
function Playbook({ found, onNext }: { found: string[]; onNext: () => void }) {
  const byTactic = new Map<Tactic, Clue[]>();
  for (const c of ALL_CLUES) byTactic.set(c.tactic, [...(byTactic.get(c.tactic) ?? []), c]);

  return (
    <section className="space-y-6 animate-rise">
      <div>
        <p className="eyebrow">The scammer's playbook</p>
        <h1 className="h2">How the trap was built</h1>
        <p className="max-w-2xl text-lg text-slate-300">Every scam uses the same few tricks. Here's how each one appeared in this case. Tricks you spotted are marked ✓.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...byTactic.entries()].map(([tactic, clues]) => {
          const spotted = clues.some((c) => found.includes(c.id));
          return (
            <article key={tactic} className={`card p-5 ${spotted ? "border-safe/40" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold">{TACTIC_LABELS[tactic]}</h2>
                <span className={`chip border ${spotted ? "border-safe/50 text-safe" : "border-caution/50 text-caution"}`}>{spotted ? "✓ Spotted" : "Missed"}</span>
              </div>
              <p className="mt-2 text-slate-300">{TACTIC_EXPLAINERS[tactic]}</p>
              <ul className="mt-3 space-y-1">
                {clues.map((c) => (
                  <li key={c.id} className="text-sm">
                    <span className="text-danger">“{c.text}”</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
      <p className="text-slate-400">This playbook is here to help you recognise and resist these tricks — not to teach anyone to use them.</p>
      <button className="btn-primary text-lg" onClick={onNext}>Step into Margaret's shoes →</button>
    </section>
  );
}

// ---------------- Victim perspective + AI Rewind ----------------
const SAFETY_STYLE: Record<Safety, string> = {
  safe: "border-safe/50 bg-safe/10 text-safe",
  risky: "border-caution/50 bg-caution/10 text-caution",
  dangerous: "border-danger/50 bg-danger/10 text-danger",
};
const SAFETY_LABEL: Record<Safety, string> = { safe: "Safer choice", risky: "Risky", dangerous: "Dangerous" };

function Decisions({ onDone, onRewind }: { onDone: (choices: Choice[]) => void; onRewind: (decisionId: string) => void }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [rewinding, setRewinding] = useState(false);
  const [rewindResult, setRewindResult] = useState<RewindResult | null>(null);
  const [altId, setAltId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const decision = CASE_001.decisions[index];
  const option = decision.options.find((o) => o.id === picked);
  const alt = decision.options.find((o) => o.id === altId);

  // Auto read-aloud (when switched on): the scene, then the outcome, then the AI Rewind comparison.
  // Items carry ids so the part being read is highlighted on screen.
  const did = `c1-${decision.id}`;
  useAutoRead(
    [
      { text: `${decision.title}. ${decision.scene}`, id: `${did}-scene` },
      ...(decision.line ? [{ text: `${decision.speaker} says:`, id: `${did}-line` }, { text: decision.line, role: "case_caller" as const, id: `${did}-line` }] : []),
      { text: "What should Margaret do?", id: `${did}-q` },
      ...decision.options.map((o, i) => ({ text: `Option ${i + 1}: ${o.label}`, id: `${did}-opt-${i}` })),
    ],
    `d-${decision.id}`,
    !picked,
  );
  useAutoRead(option ? [{ text: `You chose: ${option.label}. One possible outcome: ${option.outcome}`, id: `${did}-outcome` }] : [], `o-${decision.id}-${picked}`, !!option && !rewindResult);
  useAutoRead(
    rewindResult ? [{ text: rewindResult.comparison, id: `${did}-rewind` }, { text: `Why it's safer: ${rewindResult.whySafer}`, id: `${did}-rewind` }, { text: `Key lesson: ${rewindResult.keyLesson}`, id: `${did}-rewind` }] : [],
    `r-${decision.id}-${altId}-${rewindResult ? 1 : 0}`,
    !!rewindResult,
  );

  const choose = (id: string) => {
    setPicked(id);
    setChoices((c) => [...c, { decisionId: decision.id, optionId: id }]);
  };

  const doRewind = async (id: string) => {
    if (!picked) return;
    setAltId(id);
    setLoading(true);
    setError("");
    onRewind(decision.id);
    try {
      setRewindResult(await rewind(decision.id, picked, id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setPicked(null);
    setRewinding(false);
    setRewindResult(null);
    setAltId(null);
    if (index + 1 < CASE_001.decisions.length) {
      setIndex(index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else onDone(choices);
  };

  return (
    <section className="space-y-6 animate-rise" key={decision.id}>
      <div>
        <p className="eyebrow">
          Victim perspective · {index + 1} of {CASE_001.decisions.length}
        </p>
        <h1 className="h2">{decision.title}</h1>
      </div>

      <div className="card space-y-4 p-6">
        <Readable id={`${did}-scene`} className="p-1">
          <p className="text-xl">{decision.scene}</p>
        </Readable>
        {decision.line && (
          <Readable id={`${did}-line`}>
            <blockquote className="rounded-xl border-l-4 border-violet-500 bg-ink-900 p-4 text-lg italic">
              <span className="not-italic font-semibold text-violet-400">{decision.speaker}: </span>“{decision.line}”
            </blockquote>
          </Readable>
        )}
        <SpeakButton id={`${did}-scene`} text={`${decision.scene} ${decision.line ?? ""}`} />
      </div>

      {!picked && (
        <fieldset className="space-y-3">
          <legend className="mb-2 w-full">
            <Readable id={`${did}-q`} className="inline-block px-2 py-1 text-lg font-semibold">What should Margaret do?</Readable>
          </legend>
          {decision.options.map((o, i) => (
            <Readable key={o.id} id={`${did}-opt-${i}`}>
              <button onClick={() => choose(o.id)} className="btn-ghost w-full !justify-start text-left text-lg">
                {o.label}
              </button>
            </Readable>
          ))}
        </fieldset>
      )}

      {option && (
        <div className="space-y-4 animate-rise" aria-live="polite">
          <Readable id={`${did}-outcome`} className={`card border p-5 ${SAFETY_STYLE[option.safety]}`}>
            <p className="text-sm font-semibold uppercase tracking-wider">{SAFETY_LABEL[option.safety]} · one possible outcome</p>
            <p className="mt-1 text-lg font-semibold text-white">You chose: {option.label}</p>
            <p className="mt-2 text-lg text-slate-100">{option.outcome}</p>
            <p className="mt-2 text-sm text-slate-300">Simulated for learning. Real situations can unfold differently.</p>
          </Readable>

          {!rewinding && (
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => setRewinding(true)}>⏪ Rewind & try another choice</button>
              <button className="btn-ghost" onClick={next}>{index + 1 < CASE_001.decisions.length ? "Continue →" : "See my detective report →"}</button>
            </div>
          )}

          {rewinding && (
            <div className="card space-y-4 border-violet-500/40 p-5">
              <p className="eyebrow !text-violet-400">AI Rewind — the butterfly effect engine</p>
              <p className="text-lg">Time rewinds to the same moment. What if Margaret chose differently?</p>
              <div className="grid gap-3">
                {decision.options
                  .filter((o) => o.id !== picked)
                  .map((o) => (
                    <button key={o.id} disabled={loading} onClick={() => doRewind(o.id)} className={`btn-ghost w-full !justify-start text-left ${altId === o.id ? "!border-violet-400" : ""}`}>
                      {o.label}
                    </button>
                  ))}
              </div>
              {loading && <Loading text="Comparing both timelines…" />}
              {error && <ErrorBox message={error} onRetry={() => altId && doRewind(altId)} />}
              {rewindResult && alt && <Readable id={`${did}-rewind`}><RewindView result={rewindResult} original={option} alternative={alt} /></Readable>}
              {rewindResult && (
                <button className="btn-primary" onClick={next}>{index + 1 < CASE_001.decisions.length ? "Continue →" : "See my detective report →"}</button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function RewindView({ result, original, alternative }: { result: RewindResult; original: { id: string; label: string; safety: Safety }; alternative: { id: string; label: string; safety: Safety } }) {
  const col = (title: string, o: typeof original, path: string) => (
    <div className={`rounded-xl border p-4 ${SAFETY_STYLE[o.safety]}`}>
      <p className="text-sm font-semibold uppercase tracking-wider">
        {title} {result.saferOptionId === o.id && "· safer"}
      </p>
      <p className="mt-1 font-semibold text-white">{o.label}</p>
      <p className="mt-2 text-slate-100">{path}</p>
    </div>
  );
  return (
    <div className="space-y-4 animate-rise">
      <p className="text-sm text-slate-400">
        {result.mode === "live-ai" ? "Comparison written by live AI. These are possibilities, not predictions." : "Demo mode: scripted comparison, not live AI. These are possibilities, not predictions."}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {col("Original timeline", original, result.originalPath)}
        {col("Rewound timeline", alternative, result.alternativePath)}
      </div>
      <p className="text-lg">{result.comparison}</p>
      <p className="text-lg">
        <strong className="text-safe">Why it's safer: </strong>
        {result.whySafer}
      </p>
      <p className="rounded-xl border border-electric-400/40 bg-electric-500/10 p-4 text-lg font-semibold">💡 {result.keyLesson}</p>
    </div>
  );
}
