import { useState } from "react";
import { TACTICS, TACTIC_LABELS, type ScanResult, type Tactic, type Verdict } from "../../shared/types";
import { scanMessage } from "../api";
import { Highlight } from "../components/Highlight";
import { SpeakButton } from "../components/SpeakButton";
import { ErrorBox, Loading, Tip } from "../components/ui";
import { useAutoRead } from "../speech";

const EXAMPLES = [
  "Rapid Parcel Service: your package is on hold due to an unpaid £1.99 fee. Pay within 24 hours at rps-delivery-update.com or it will be returned.",
  "Mum it's me, I dropped my phone in the sink, this is my new number. Can you help me pay a bill urgently? Don't tell dad, I'll explain later x",
  "Northbridge Bank: Your monthly statement is now ready. Log in through the Northbridge app to view it. We will never ask for your PIN or passcode.",
];

/** A bigger, mixed pool for "🎲 Random example": scams of different kinds and genuine messages. All fictional. */
const RANDOM_POOL = [
  ...EXAMPLES,
  "TAX OFFICE: You are due a tax refund of £326.40. Claim within 24 hours: tax-refund-claim.info/verify",
  "This is DC Harris from Westmere Police. Your card has been used for fraud. Withdraw £4,000 in cash and a courier will collect it as evidence. Don't tell the bank staff.",
  "Congratulations! You've won a £500 supermarket voucher. Just pay £2.99 postage to claim your prize: prize-claim-centre.net",
  "Hi, Coach Ray here 🚀 Our VIP members are making 40% a week, guaranteed. Deposit £250 today, only 5 places left!",
  "My darling, my bank account is frozen here on the base. I need £3,000 for a flight home. Please don't tell your son, he won't understand us.",
  "Northbridge Bank fraud team: your account is at risk. Move your savings to a new safe account today. Don't speak to branch staff.",
  "ViewNest: your account is suspended. Update your payment details now: viewnest-billing-help.com",
  "Riverside GP Surgery: reminder of your appointment on Tuesday at 10:20 with Dr Shah. To cancel, please call the surgery.",
  "Hillcrest Pharmacy: your prescription is ready to collect.",
  "Your energy supplier: your new bill is ready. Log in to your account through our app to view it.",
  "BoxHopper: your parcel will arrive tomorrow between 9am and 1pm. Track it in the shop's app.",
];


const VERDICT_STYLE: Record<Verdict, { label: string; cls: string }> = {
  likely_scam: { label: "Likely scam", cls: "bg-danger/15 text-danger border-danger/50" },
  suspicious: { label: "Suspicious — be careful", cls: "bg-caution/15 text-caution border-caution/50" },
  likely_legitimate: { label: "No common warning signs found", cls: "bg-safe/15 text-safe border-safe/50" },
  unclear: { label: "Not enough information", cls: "bg-slate-500/15 text-slate-300 border-slate-500/50" },
};

export function Scanner() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Practice mode turns the scanned message into a mini investigation: guess the tactics before seeing the answer.
  const [practice, setPractice] = useState<"off" | "guessing" | "revealed">("off");
  const [guesses, setGuesses] = useState<Tactic[]>([]);

  const scan = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setPractice("off");
    setGuesses([]);
    try {
      setResult(await scanMessage(message));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Auto read-aloud (when switched on): read the verdict and warning signs once the scan finishes.
  useAutoRead(
    result ? [`${VERDICT_STYLE[result.verdict].label}. ${result.summary}`, ...result.indicators.map((i) => `${TACTIC_LABELS[i.tactic] ?? i.tactic}: ${i.explanation}`)] : [],
    `scan-${result ? result.summary : "none"}`,
    !!result && practice !== "guessing",
  );

  const found = new Set(result?.indicators.map((i) => i.tactic));
  const showAnswers = practice !== "guessing";

  return (
    <div className="space-y-8 animate-rise">
      <div className="space-y-2">
        <p className="eyebrow">AI Scam Scanner</p>
        <h1 className="h1">Got a message that feels wrong?</h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Paste it below. We'll point out warning signs, explain why, and suggest safe ways to check. <strong>Remove names, account numbers and codes first</strong> — we never need them.
        </p>
        <p className="max-w-2xl rounded-xl border border-caution/50 bg-caution/10 p-3 text-slate-200">
          ⚠️ <strong>Educational demo.</strong> The scanner can be wrong and can't check senders, links or numbers. Don't rely on it for a real decision. If you're worried about a real message, contact your bank on the number on your card or an official service.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        <label htmlFor="msg" className="flex items-center gap-2 font-semibold">Message to check <Tip text="Paste the words of a text, email or what a caller said. Remove your name, account numbers and any codes first. We never need them." /></label>
        <textarea
          id="msg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="Paste the text, email or what the caller said…"
          className="w-full rounded-xl border border-ink-600 bg-ink-900 p-4 text-lg text-white placeholder:text-slate-500 focus:border-electric-400 focus:outline-none focus:ring-4 focus:ring-electric-400/30"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={!message.trim() || loading} onClick={scan}>
            {loading ? "Analysing…" : "Scan message"}
          </button>
          <span className="text-slate-400">or try an example:</span>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn-ghost !min-h-[40px] !py-1.5 text-sm" onClick={() => setMessage(ex)}>
              Example {i + 1}
            </button>
          ))}
          <button
            className="btn-ghost !min-h-[40px] !py-1.5 text-sm"
            onClick={() => {
              const others = RANDOM_POOL.filter((m) => m !== message);
              setMessage(others[Math.floor(Math.random() * others.length)]);
              setResult(null);
            }}
          >
            🎲 Random example
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {loading && <Loading text="Analysing the message… this can take a few seconds." />}
        {error && <ErrorBox message={error} onRetry={scan} />}

        {result && (
          <div className="space-y-5 animate-rise">
            {practice === "off" && (
              <div className="card flex flex-wrap items-center justify-between gap-3 border-violet-500/40 p-4">
                <p>🕵️ Want to practise? Turn this message into a mini investigation and spot the tricks yourself first.</p>
                <button className="btn-ghost" onClick={() => setPractice("guessing")}>Practise with this message</button>
              </div>
            )}

            {practice === "guessing" && (
              <div className="card space-y-4 p-5">
                <p className="eyebrow">Practice investigation</p>
                <p className="rounded-xl border border-ink-600 bg-ink-900 p-4 text-lg">{message}</p>
                <p className="font-semibold">Which tricks do you think this message uses? Select all that apply.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TACTICS.map((t) => (
                    <label key={t} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-ink-600 bg-ink-900 px-4 py-2 hover:border-electric-400">
                      <input type="checkbox" className="h-5 w-5 accent-electric-500" checked={guesses.includes(t)} onChange={(e) => setGuesses((g) => (e.target.checked ? [...g, t] : g.filter((x) => x !== t)))} />
                      {TACTIC_LABELS[t]}
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={() => setPractice("revealed")}>Reveal the analysis</button>
              </div>
            )}

            {practice === "revealed" && (
              <div className="card p-5">
                <p className="eyebrow mb-2">Your practice result</p>
                <p className="text-lg">
                  You spotted <strong>{guesses.filter((g) => found.has(g)).length}</strong> of <strong>{found.size}</strong> tricks the analysis found
                  {guesses.some((g) => !found.has(g)) && <> (and flagged {guesses.filter((g) => !found.has(g)).length} it didn't — that's fine, being cautious is good)</>}.
                </p>
              </div>
            )}

            {showAnswers && (
              <>
                <div className="card space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`chip border text-base ${VERDICT_STYLE[result.verdict].cls}`}>{VERDICT_STYLE[result.verdict].label}</span>
                    <span className="text-sm text-slate-400">{result.mode === "live-ai" ? "Analysed by live AI" : "Demo mode: simple keyword rules, not live AI"}</span>
                    <SpeakButton text={`${VERDICT_STYLE[result.verdict].label}. ${result.summary}`} />
                  </div>
                  <p className="text-lg">{result.summary}</p>
                  <div className="rounded-xl border border-ink-600 bg-ink-900 p-4 text-lg leading-relaxed">
                    <Highlight text={message} phrases={result.indicators.map((i) => i.quote)} />
                  </div>
                  <p className="text-sm text-slate-400">This is an assessment, not a guarantee. A message with no warning signs can still be a scam.</p>
                </div>

                {result.indicators.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="h2">Evidence</h2>
                    <ul className="grid gap-3 md:grid-cols-2">
                      {result.indicators.map((ind, i) => (
                        <li key={i} className="card p-4">
                          <p className="chip mb-2 border border-violet-500/50 bg-violet-500/15 text-violet-400">{TACTIC_LABELS[ind.tactic] ?? ind.tactic}</p>
                          <p className="font-semibold">“{ind.quote}”</p>
                          <p className="mt-1 text-slate-300">{ind.explanation}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="card p-5">
                  <h2 className="h2 mb-3">How to check safely</h2>
                  <ol className="list-decimal space-y-2 pl-6 text-lg">
                    {result.verificationSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
