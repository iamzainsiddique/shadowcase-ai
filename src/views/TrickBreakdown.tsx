// "How the trick works": steps through a scammer's script so people can recognise it.
// It explains what each line is designed to do and how to beat it. It never puts the player in the
// scammer's shoes and never gives instructions that would help someone run a scam.
import { useState } from "react";
import { CHARACTERS, fill, type Scenario } from "../../shared/story";
import { TACTIC_LABELS } from "../../shared/types";
import { Avatar } from "../components/Avatar";
import { ReadingBar, Readable } from "../components/SpeakButton";
import { SceneArt } from "../components/SceneArt";
import { EasyHint, Progress } from "../components/ui";
import { useAutoRead, type SpeechItem } from "../speech";

const STAGES = ["Hook", "Build trust", "Create panic", "Cut you off", "Take the money"] as const;

export function TrickBreakdown({ scenario, vars, onPlay, onBack }: { scenario: Scenario; vars: Record<string, string>; onPlay: (storyId: string) => void; onBack: () => void }) {
  const [i, setI] = useState(0);
  const steps = scenario.trick;
  const done = i >= steps.length;
  const step = steps[Math.min(i, steps.length - 1)];
  const line = fill(step.line, vars);
  const who = step.speaker === "narrator" ? "The message" : CHARACTERS[step.speaker].name.replace(/[“”]/g, "");
  const ids = { line: `trick-${i}-line`, purpose: `trick-${i}-purpose`, defence: `trick-${i}-defence` };
  const items: SpeechItem[] = done
    ? []
    : [
        { text: `${who} says: ${line}`, id: ids.line, role: step.speaker === "narrator" ? "assistant" : step.speaker },
        { text: `What this is designed to do: ${fill(step.purpose, vars)}`, id: ids.purpose },
        { text: `How to beat it: ${fill(step.defence, vars)}`, id: ids.defence },
      ];
  const key = `trick-${scenario.id}-${i}`;
  useAutoRead(items, key);

  return (
    <section className="space-y-5 animate-rise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">How the trick works · {scenario.title}</p>
          <h1 className="h2">{scenario.scamType}</h1>
        </div>
        <button className="btn-ghost" onClick={onBack}>← All scams</button>
      </div>
      <p className="rounded-xl border border-caution/50 bg-caution/10 p-4 text-lg">
        🛡️ This shows the scammer's script <strong>so you can recognise it</strong>. Every step ends with how to beat it.
      </p>

      {!done ? (
        <>
          <Progress current={i + 1} total={steps.length} label="Step" />
          <ol className="flex flex-wrap gap-2" aria-label="Stages of the scam">
            {STAGES.map((s) => (
              <li key={s} className={`chip border ${s === step.stage ? "border-danger bg-danger/15 text-danger" : "border-ink-600 text-slate-400"}`}>{s}</li>
            ))}
          </ol>
          <ReadingBar items={items} queueId={key} label="this step" />
          <div className="card space-y-4 p-5" key={key}>
            <Readable id={ids.line} className="flex items-start gap-3 p-2">
              {step.speaker === "narrator" ? <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink-700 text-2xl" aria-hidden>💬</span> : <Avatar id={step.speaker} size={56} />}
              <div>
                <p className="text-sm font-semibold text-danger">{who} · {TACTIC_LABELS[step.tactic]}</p>
                <p className="mt-1 text-xl italic">“{line}”</p>
              </div>
            </Readable>
            <Readable id={ids.purpose} className="rounded-xl border border-danger/40 bg-danger/10 p-4">
              <p className="font-semibold text-danger">🎯 What this line is designed to do</p>
              <p className="mt-1 text-lg">{fill(step.purpose, vars)}</p>
            </Readable>
            <Readable id={ids.defence} className="rounded-xl border border-safe/50 bg-safe/10 p-4">
              <p className="font-semibold text-safe">🛡️ How to beat it</p>
              <p className="mt-1 text-lg">{fill(step.defence, vars)}</p>
            </Readable>
          </div>
          <EasyHint>Press “Next step” to see the next part of the script.</EasyHint>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
            <button className="btn-primary" onClick={() => setI(i + 1)}>{i + 1 < steps.length ? "Next step →" : "Finish"}</button>
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <div className="scene-in">
            <SceneArt art="reported" />
          </div>
          <div className="card space-y-3 p-6">
            <h2 className="h2 !text-2xl">The pattern to remember</h2>
            <p className="text-lg">Almost every scam follows the same steps: <strong>hook you, win your trust, make you panic, cut you off from help, then take the money.</strong></p>
            <ul className="space-y-2 text-lg">
              {steps.map((s, k) => (
                <li key={k} className="rounded-lg bg-ink-900 p-3">🛡️ {fill(s.defence, vars)}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => onPlay(scenario.stories[0])}>Now try it as the person targeted →</button>
            <button className="btn-ghost" onClick={() => setI(0)}>⏮ Watch again</button>
            <button className="btn-ghost" onClick={onBack}>← All scams</button>
          </div>
        </div>
      )}
    </section>
  );
}
