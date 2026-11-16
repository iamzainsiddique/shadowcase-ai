// First-time tutorial. Interactive: the player taps a real clue and makes (and rewinds) a practice decision.
// Completion is remembered on this device so returning players aren't shown it again.
import { useEffect, useRef, useState } from "react";
import { useSettings } from "../settings";
import { ClickableText } from "./ClickableText";
import { Progress } from "./ui";
import { SpeakButton } from "./SpeakButton";
import { VoiceChoice } from "./VoiceChoice";
import { AudienceChoice } from "./AudienceChoice";
import { speechAvailable, useAutoRead, useSpeech } from "../speech";

// The tutorial opens every time the app is opened, unless the player ticks
// "Don't show this when I open the app". It can always be replayed with ❓ Help.
const HIDE_KEY = "shadowcase.tutorialHideAtStart";

/** The tutorial opens every time the page is opened or reloaded, unless "Don't show" is ticked. */
export function tutorialDone(): boolean {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}
function markDone() {}
function hiddenAtStart() {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}
function setHiddenAtStart(hide: boolean) {
  try {
    if (hide) localStorage.setItem(HIDE_KEY, "1");
    else localStorage.removeItem(HIDE_KEY);
  } catch {}
}

const SAMPLE = "Congratulations! You've won £500. Pay a £2 delivery fee within 1 hour to claim your prize.";
const SAMPLE_CLUES = [
  { id: "t-won", text: "You've won £500", explain: "A prize you never entered for is bait." },
  { id: "t-hour", text: "within 1 hour", explain: "A short deadline stops you from checking." },
];

const PRACTICE = [
  { id: "pay", label: "Pay the £2 fee to get the prize", safe: false, outcome: "The 'fee' page asks for your card details. Scammers could now use your card for much bigger payments." },
  { id: "ignore", label: "Delete the message and don't reply", safe: true, outcome: "Nothing happens, and that's a good thing. Your money and details stay safe." },
];

type StepId = "welcome" | "investigate" | "decide" | "rewind" | "modes" | "comfort";
const STEPS: StepId[] = ["welcome", "investigate", "decide", "rewind", "modes", "comfort"];
const TITLES: Record<StepId, string> = {
  welcome: "Welcome, detective",
  investigate: "1. Look for clues",
  decide: "2. Make a decision",
  rewind: "3. Rewind and compare",
  modes: "4. Two ways to play",
  comfort: "5. Make it comfortable",
};

/** What gets read aloud for each step (when "Read aloud automatically" is on, or the 🔊 button is pressed). */
const STEP_READ: Record<StepId, string> = {
  welcome: "Welcome, detective. SHADOWCASE AI helps you learn to spot money scams by solving made-up cases. You'll look for clues, make choices, see what could happen, and rewind to try again. Nothing here is real, so it's a safe place to practise. This is an educational demonstration, not a tool for real-life situations. If something is happening to you for real, contact your bank and official services. Press Next to continue, or Skip tutorial.",
  investigate: `Step 1. Look for clues. Scammers leave clues in their words. Tap the parts of this message that seem suspicious. The message says: ${SAMPLE}`,
  decide: "Step 2. Make a decision. Each choice can lead to different consequences. What would you do with that message? Option 1: Pay the £2 fee to get the prize. Option 2: Delete the message and don't reply.",
  rewind: "Step 3. Rewind and compare. Rewind lets you go back to a decision and pick something else, then compare what happens.",
  modes: "Step 4. Two ways to play. The Story Game lets you live eight different scams, as the person targeted or as their family or bank, and discover different endings. No AI needed. AI Detective lets you investigate with an AI partner, or practise with the message scanner. Switch any time with the buttons at the top. The Home button always brings you back to the start.",
  comfort: "Step 5. Make it comfortable. You can turn on Easy Mode for bigger text and simpler screens, and Read aloud automatically, so every new message is read out to you. If it's off, press the speaker button on any message to hear it. You can also choose a female or male voice for the assistant.",
};

export function Tutorial({ onClose, onStory, onDetective }: { onClose: () => void; onStory: () => void; onDetective: () => void }) {
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [clueMsg, setClueMsg] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [rewound, setRewound] = useState(false);
  const { settings, update } = useSettings();
  const [hideAtStart, setHide] = useState(hiddenAtStart);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const id = STEPS[step];

  useEffect(() => headingRef.current?.focus(), [step]);

  const finish = (then?: () => void) => {
    markDone();
    onClose();
    then?.();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  useAutoRead([{ text: STEP_READ[id], id: `tut-${id}` }], id);
  const reading = useSpeech().currentId === `tut-${id}`;

  const picked = PRACTICE.find((p) => p.id === choice);
  const other = PRACTICE.find((p) => p.id !== choice);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="tut-title" className={`card reading-target w-full max-w-2xl space-y-5 p-6 animate-rise ${reading ? "is-reading" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Progress current={step + 1} total={STEPS.length} label="Tutorial step" />
          </div>
          <button className="btn-ghost !min-h-[44px] !px-3 text-sm" onClick={() => finish()}>Skip tutorial</button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            className="h-5 w-5 accent-electric-500"
            checked={hideAtStart}
            onChange={(e) => {
              setHide(e.target.checked);
              setHiddenAtStart(e.target.checked);
            }}
          />
          Don't show this tutorial when I open the app (you can always open it with ❓ Help)
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="tut-title" ref={headingRef} tabIndex={-1} className="h2 focus:outline-none">
            {TITLES[id]}
          </h2>
          <SpeakButton id={`tut-${id}`} text={STEP_READ[id]} label="Read this step" />
        </div>

        {id === "welcome" && (
          <div className="space-y-3 text-lg">
            <p className="text-5xl" aria-hidden>🕵️‍♀️</p>
            <p>
              <strong>SHADOWCASE AI</strong> helps you learn to spot money scams by solving made-up cases, like a detective.
            </p>
            <p>You'll look for clues, make choices, see what <em>could</em> happen, and rewind to try again. Nothing here is real, so it's a safe place to practise.</p>
            <p className="rounded-xl border border-caution/50 bg-caution/10 p-3 text-base">⚠️ This is an <strong>educational demonstration</strong>, not a tool for real-life situations. If something is happening to you for real, contact your bank and official services.</p>
            <AudienceChoice />
            <p className="text-slate-300">This short tour takes about a minute. You can skip it at any time.</p>
          </div>
        )}

        {id === "investigate" && (
          <div className="space-y-3 text-lg">
            <p>Scammers leave clues in their words. <strong>Tap the parts of this message that seem suspicious.</strong></p>
            <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
              <p className="text-sm text-slate-400">💬 Text message from an unknown number</p>
              <p className="mt-1 leading-relaxed">
                <ClickableText
                  text={SAMPLE}
                  clues={SAMPLE_CLUES}
                  found={found}
                  onFind={(c) => {
                    setFound((f) => (f.includes(c.id) ? f : [...f, c.id]));
                    setClueMsg(`✅ Good eye! ${c.explain}`);
                  }}
                  onMiss={() => setClueMsg("Nothing suspicious in that part. Try another bit.")}
                />
              </p>
            </div>
            <p aria-live="polite" className="min-h-[1.5rem] font-semibold text-electric-400">{clueMsg}</p>
            <p className="text-slate-300">Clues found: {found.length} of {SAMPLE_CLUES.length}</p>
          </div>
        )}

        {id === "decide" && (
          <div className="space-y-3 text-lg">
            <p>In each case you choose what to do. Each choice can lead to different consequences. <strong>Try it: what would you do with that message?</strong></p>
            {!picked ? (
              <div className="space-y-2">
                {PRACTICE.map((p) => (
                  <button key={p.id} className="btn-ghost w-full !justify-start text-left" onClick={() => setChoice(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <Outcome option={picked} />
            )}
            <p className="text-sm text-slate-300">Outcomes are possibilities to learn from, not predictions.</p>
          </div>
        )}

        {id === "rewind" && (
          <div className="space-y-3 text-lg">
            <p>
              <strong>Rewind</strong> lets you go back to a decision and pick something else, then compare what happens. In AI Detective mode, an AI explains the difference.
            </p>
            {!picked ? (
              <p className="text-caution">Go back one step and make a practice choice first.</p>
            ) : !rewound ? (
              <>
                <Outcome option={picked} />
                <button className="btn-primary" onClick={() => setRewound(true)}>⏪ Rewind and try the other choice</button>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Outcome option={picked} title="Your first choice" />
                {other && <Outcome option={other} title="After rewinding" />}
              </div>
            )}
          </div>
        )}

        {id === "modes" && (
          <div className="space-y-3 text-lg">
            <p>There are two ways to play. You can switch any time with the buttons at the top of the screen.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-electric-400/50 bg-electric-500/10 p-4">
                <p className="font-display text-xl font-bold">🎭 Story Game</p>
                <p>Live 8 different scams as the person targeted, or as their family or bank. Talk to characters and discover different endings. No AI needed. Best place to start.</p>
              </div>
              <div className="rounded-xl border border-violet-400/50 bg-violet-500/10 p-4">
                <p className="font-display text-xl font-bold">🤖 AI Detective</p>
                <p>Investigate with an AI partner, or practise with the message scanner (an educational demo).</p>
              </div>
            </div>
            <p className="text-slate-300">The <strong>🏠 Home</strong> button always brings you back to the start.</p>
          </div>
        )}

        {id === "comfort" && (
          <div className="space-y-3 text-lg">
            <p>Choose what makes SHADOWCASE comfortable for you.</p>
            <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-600 bg-ink-900 p-4">
              <span>
                <span className="block font-semibold">⭐ Easy Mode</span>
                <span className="block text-sm text-slate-300">Largest text, strong colours, no animations, extra tips.</span>
              </span>
              <input type="checkbox" role="switch" aria-label="Easy Mode" className="h-6 w-6 shrink-0 accent-electric-500" checked={settings.easyMode} onChange={(e) => update({ easyMode: e.target.checked })} />
            </label>
            {speechAvailable() && (
              <label className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-600 bg-ink-900 p-4">
                <span>
                  <span className="block font-semibold">🔊 Read aloud automatically</span>
                  <span className="block text-sm text-slate-300">
                    <strong>On:</strong> every new message and story line is read out as soon as it appears. <strong>Off:</strong> press the 🔊 button on a message to hear it.
                  </span>
                </span>
                <input type="checkbox" role="switch" aria-label="Read aloud automatically" className="h-6 w-6 shrink-0 accent-electric-500" checked={settings.autoRead} onChange={(e) => update({ autoRead: e.target.checked })} />
              </label>
            )}
            {speechAvailable() && (
              <div className="rounded-xl border border-ink-600 bg-ink-900 p-4">
                <VoiceChoice />
                <p className="mt-2 text-sm text-slate-300">In the Story Game, each character also has their own voice to suit their age.</p>
              </div>
            )}
            <p className="text-slate-300">You can change these later under <strong>“Aa Display”</strong>, and replay this tutorial any time with the <strong>❓ Help</strong> button.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-ink-600 pt-4">
          <button className="btn-ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-primary ml-auto" onClick={() => setStep((s) => s + 1)}>
              Next →
            </button>
          ) : (
            <div className="ml-auto flex flex-wrap gap-3">
              <button className="btn-ghost" onClick={() => finish(onDetective)}>Go to AI Detective</button>
              <button className="btn-primary" onClick={() => finish(onStory)}>Start the Story Game →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Outcome({ option, title }: { option: (typeof PRACTICE)[number]; title?: string }) {
  return (
    <div className={`rounded-xl border-2 p-4 ${option.safe ? "border-safe/60 bg-safe/10" : "border-danger/60 bg-danger/10"}`}>
      {title && <p className="text-sm font-semibold uppercase">{title}</p>}
      <p className={`font-semibold ${option.safe ? "text-safe" : "text-danger"}`}>{option.safe ? "✅ Safer choice" : "❌ Risky choice"}</p>
      <p className="font-semibold">{option.label}</p>
      <p className="mt-1">{option.outcome}</p>
    </div>
  );
}
