// 1-minute scam check, taken before and after playing, to show progress.
// Results are saved only in this browser.
import { useState } from "react";
import { QUIZ_AFTER, QUIZ_BEFORE, type QuizResult } from "../../shared/quiz";
import { Readable, SpeakButton } from "./SpeakButton";
import { Progress } from "./ui";
import { useAutoRead } from "../speech";

const KEY = "shadowcase.quiz";
export interface QuizStore {
  before?: QuizResult;
  after?: QuizResult;
}

export function loadQuiz(): QuizStore {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
function saveQuiz(q: QuizStore) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {}
}

/** Which check to offer next: the "before" check first, then the "after" one. */
export const nextQuizPhase = (): "before" | "after" => (loadQuiz().before ? "after" : "before");

export function Quiz({ phase, onClose }: { phase: "before" | "after"; onClose: () => void }) {
  const items = phase === "before" ? QUIZ_BEFORE : QUIZ_AFTER;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const item = items[i];
  const answered = answers.length > i;
  const right = answered && answers[i] === item.isScam;

  useAutoRead(
    done ? [] : answered ? [{ text: `${right ? "Correct." : "Not quite."} ${item.why}`, id: `quiz-why-${item.id}` }] : [{ text: `From ${item.from}: ${item.text}. Scam, or safe?`, id: `quiz-${item.id}` }],
    `quiz-${phase}-${i}-${answered}`,
  );

  const answer = (isScam: boolean) => setAnswers((a) => [...a.slice(0, i), isScam]);
  const next = () => {
    if (i + 1 < items.length) return setI(i + 1);
    const correct = answers.filter((a, k) => a === items[k].isScam).length;
    const store = loadQuiz();
    store[phase] = { correct, total: items.length, at: new Date().toISOString() };
    saveQuiz(store);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="quiz-title" className="card w-full max-w-xl space-y-5 p-6 animate-rise">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{phase === "before" ? "Before you play" : "After playing"}</p>
            <h2 id="quiz-title" className="h2">🧠 1-minute scam check</h2>
          </div>
          <button className="btn-ghost !min-h-[44px] !px-3 text-sm" onClick={onClose}>Close</button>
        </div>
        {done ? <QuizResultView phase={phase} onClose={onClose} /> : (
          <>
            <Progress current={i + 1} total={items.length} label="Question" />
            <Readable id={`quiz-${item.id}`} className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
              <p className="text-sm text-slate-400">💬 From: {item.from}</p>
              <p className="mt-1 text-lg leading-relaxed">{item.text}</p>
            </Readable>
            <SpeakButton id={`quiz-${item.id}`} text={`From ${item.from}: ${item.text}`} />
            {!answered ? (
              <div className="grid grid-cols-2 gap-3">
                <button className="btn !min-h-[64px] border-2 border-danger/60 bg-danger/10 text-lg" onClick={() => answer(true)}>🚩 Scam</button>
                <button className="btn !min-h-[64px] border-2 border-safe/60 bg-safe/10 text-lg" onClick={() => answer(false)}>✅ Safe</button>
              </div>
            ) : (
              <Readable id={`quiz-why-${item.id}`} className={`rounded-xl border-2 p-4 ${right ? "border-safe/60 bg-safe/10" : "border-caution/60 bg-caution/10"}`}>
                <p className="text-lg font-semibold">{right ? "✅ Correct!" : "Not quite."} It's {item.isScam ? "a scam" : "safe"}.</p>
                <p className="mt-1 text-lg">{item.why}</p>
              </Readable>
            )}
            {answered && <button className="btn-primary w-full text-lg" onClick={next}>{i + 1 < items.length ? "Next →" : "See my result"}</button>}
          </>
        )}
      </div>
    </div>
  );
}

function QuizResultView({ phase, onClose }: { phase: "before" | "after"; onClose: () => void }) {
  const q = loadQuiz();
  const pct = (r?: QuizResult) => (r ? Math.round((r.correct / r.total) * 100) : 0);
  const mine = q[phase]!;
  return (
    <div className="space-y-4" aria-live="polite">
      <p className="text-center font-display text-6xl font-bold text-electric-400">{mine.correct}/{mine.total}</p>
      {phase === "before" ? (
        <p className="text-lg">Nice start! Now play a story or two, then take the check again (different messages) to see how you've improved.</p>
      ) : q.before ? (
        <div className="space-y-2 text-lg">
          <p>Before: <strong>{q.before.correct}/{q.before.total}</strong> ({pct(q.before)}%) → After: <strong>{mine.correct}/{mine.total}</strong> ({pct(mine)}%)</p>
          <p className="font-semibold text-safe">
            {pct(mine) > pct(q.before) ? `You improved by ${pct(mine) - pct(q.before)} percentage points. 🎉` : pct(mine) === pct(q.before) ? "Same score as before. Every story you play adds another trick to spot." : "A tricky set! Each explanation you saw is another trick you can now spot. Try another story and check again."}
          </p>
        </div>
      ) : (
        <p className="text-lg">Well done!</p>
      )}
      <p className="text-sm text-slate-400">A quick self-check with 5 different messages each time, not a scientific test. Saved only in this browser.</p>
      <button className="btn-primary w-full" onClick={onClose}>Done</button>
    </div>
  );
}
