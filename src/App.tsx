import { useEffect, useState } from "react";
import type { Mode } from "../shared/types";
import { getStatus } from "./api";
import { SettingsPanel } from "./components/SettingsPanel";
import { StopReadingButton } from "./components/SpeakButton";
import { DemoNotice } from "./components/DemoNotice";
import { VisibleContext, stopSpeaking } from "./speech";
import { Tutorial, tutorialDone } from "./components/Tutorial";
import { useSettings } from "./settings";
import { AiDetective, type DetectiveTab } from "./views/AiDetective";
import { Home } from "./views/Home";
import { StoryGame } from "./views/StoryGame";
import { Quiz, nextQuizPhase } from "./components/Quiz";
import { readPlayHash, surprise, type PlayRequest } from "./share";

export type View = "home" | "story" | "detective";

export default function App() {
  // A share link (#play=scenario:perspective) opens straight into that scenario.
  const [request, setRequest] = useState<(PlayRequest & { nonce: number }) | undefined>(() => {
    const r = readPlayHash();
    return r ? { ...r, nonce: 1 } : undefined;
  });
  const [view, setView] = useState<View>(() => (readPlayHash() ? "story" : "home"));
  const [quiz, setQuiz] = useState<"before" | "after" | null>(null);
  const [tab, setTab] = useState<DetectiveTab>("case");
  const [mode, setMode] = useState<Mode | "offline" | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => !tutorialDone());
  /** Pop-up pointing at ❓ Help, so people always know where the tutorial is. Shown when the app opens
   *  without the tutorial, and again each time the tutorial is closed. */
  const [helpHint, setHelpHint] = useState(() => tutorialDone());
  useEffect(() => {
    if (!helpHint) return;
    const t = window.setTimeout(() => setHelpHint(false), 12000);
    return () => window.clearTimeout(t);
  }, [helpHint]);
  const [showSettings, setShowSettings] = useState(false);
  const { settings } = useSettings();

  useEffect(() => void getStatus().then(setMode), []);
  useEffect(() => {
    const onHash = () => {
      const r = readPlayHash();
      if (r) playRequest(r);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const playRequest = (r: PlayRequest) => {
    setRequest((old) => ({ ...r, nonce: (old?.nonce ?? 0) + 1 }));
    setView("story");
    window.scrollTo({ top: 0 });
  };
  const openQuiz = () => setQuiz(nextQuizPhase());

  const go = (v: View, t?: DetectiveTab) => {
    stopSpeaking();
    setView(v);
    if (t) setTab(t);
    window.scrollTo({ top: 0 });
  };

  const modeBtn = (v: View, label: string) => (
    <button
      onClick={() => go(v)}
      aria-current={view === v ? "page" : undefined}
      className={`btn !min-h-[44px] flex-1 !px-3 !py-2 md:flex-none md:whitespace-nowrap ${view === v ? (v === "story" ? "bg-electric-500 text-ink-950" : "bg-violet-500 text-ink-950") : "text-slate-200 hover:bg-ink-700"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn-primary">Skip to content</a>
      <header className="sm:sticky top-0 z-40 border-b border-ink-600/70 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <button onClick={() => go("home")} className="btn-ghost !min-h-[48px] !px-4" aria-label="Home: choose how to play" aria-current={view === "home" ? "page" : undefined}>
            🏠 <span className="font-bold">Home</span>
          </button>
          <span className="hidden items-center gap-2 font-display text-lg font-bold tracking-wide md:flex" aria-hidden>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric-500 to-violet-500 text-ink-950">◉</span>
            SHADOWCASE<span className="text-electric-400">AI</span>
          </span>
          <nav aria-label="Choose mode" className="order-last flex w-full items-center gap-1 rounded-xl border border-ink-600 bg-ink-800 p-1 md:order-none md:mx-auto md:w-auto">
            {modeBtn("story", "🎭 Story Game")}
            {modeBtn("detective", "🤖 AI Detective")}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button className="btn-ghost !min-h-[44px] !px-3" onClick={() => setShowSettings(true)} aria-haspopup="dialog">
              Aa <span>Display</span>
              {settings.easyMode && <span className="chip !px-2 !py-0 bg-electric-500 text-ink-950">Easy</span>}
            </button>
            <span className="relative">
              <button
                className={`btn-ghost !min-h-[44px] !px-3 ${helpHint ? "!border-caution ring-2 ring-caution" : ""}`}
                onClick={() => {
                  setHelpHint(false);
                  setShowTutorial(true);
                }}
                aria-haspopup="dialog"
              >
                ❓ <span>Help</span>
              </button>
              {helpHint && !showTutorial && (
                <div role="status" className="help-hint absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border-2 border-caution bg-ink-900 p-4 text-left shadow-2xl">
                  <span aria-hidden className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l-2 border-t-2 border-caution bg-ink-900" />
                  <p className="font-semibold text-white">👆 The tutorial is here</p>
                  <p className="mt-1 text-slate-200">Press <strong>❓ Help</strong> any time to see how SHADOWCASE AI works.</p>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-primary !min-h-[40px] !py-1.5 text-sm" onClick={() => { setHelpHint(false); setShowTutorial(true); }}>Show me now</button>
                    <button className="btn-ghost !min-h-[40px] !py-1.5 text-sm" onClick={() => setHelpHint(false)}>Got it</button>
                  </div>
                </div>
              )}
            </span>
          </div>
        </div>
      </header>
      <DemoNotice />

      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        {view === "home" && <Home onStory={() => go("story")} onSurprise={() => playRequest(surprise())} onQuiz={openQuiz} onDetective={(t) => go("detective", t)} onTutorial={() => setShowTutorial(true)} />}
        {/* Both modes stay mounted (just hidden) so switching modes never loses the player's progress. */}
        <div hidden={view !== "story"}>
          <VisibleContext.Provider value={view === "story" && !showTutorial && !quiz}>
            <StoryGame onAiMode={() => go("detective", "case")} onQuiz={openQuiz} request={request} />
          </VisibleContext.Provider>
        </div>
        <div hidden={view !== "detective"}>
          <VisibleContext.Provider value={view === "detective" && !showTutorial && !quiz}>
            <AiDetective tab={tab} setTab={setTab} mode={mode} />
          </VisibleContext.Provider>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-slate-400">
        <p>
          <strong>Educational demonstration only.</strong> SHADOWCASE AI is a prototype for learning about scams. It is not intended for real-life situations and does not provide financial, legal or security advice. It cannot tell you for certain whether a real message is a scam. If something is happening to you for real, contact your bank using the number on your card and official services (in the UK: 159, Report Fraud on 0300 123 2040, Police Scotland on 101, or forward scam texts to 7726).
        </p>
        <p className="mt-2">
          All people, banks, companies, celebrities, phone numbers and web addresses in the stories, cases and quiz are invented, and any resemblance to real ones is coincidental. Illustrations and stories are original to this project. Fonts: Inter and Space Grotesk (SIL Open Font License).
        </p>
      </footer>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onTutorial={() => {
            setShowSettings(false);
            setShowTutorial(true);
          }}
        />
      )}
      {quiz && <Quiz phase={quiz} onClose={() => setQuiz(null)} />}
      <StopReadingButton />
      {showTutorial && <Tutorial onClose={() => { setShowTutorial(false); setHelpHint(true); }} onStory={() => go("story")} onDetective={() => go("detective", "case")} />}
    </div>
  );
}
