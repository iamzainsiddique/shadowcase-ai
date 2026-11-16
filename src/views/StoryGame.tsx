// MODE A: Story Game. Visual-novel-style scam scenarios, each playable from several perspectives,
// driven entirely by shared/story.ts. Works with no AI key: everything is written in advance.
import { useEffect, useState } from "react";
import { ALL_STORY_CLUES, CHARACTERS, ENDINGS, getScenario, getStory, plainName, resolveEnding, resolveNode, fill, STORIES, type Safety, type StoryClue, type StoryDef, type StoryLine } from "../../shared/story";
import { choose, collectClue, cluesSeen, currentEnding, findChoice, getNode, initialState, nextVariant, rewindTo, scoreStory, storyVars, type StoryState } from "../../shared/storyEngine";
import { TACTIC_EXPLAINERS, TACTIC_LABELS, type Tactic } from "../../shared/types";
import { ClickableText } from "../components/ClickableText";
import { ReadingBar, Readable, SpeakButton } from "../components/SpeakButton";
import { EasyHint, ScoreBar, Tip } from "../components/ui";
import { Avatar, InspectorVale } from "../components/Avatar";
import { SceneArt } from "../components/SceneArt";
import { HelpCard } from "../components/HelpCard";
import { ShareButton } from "../components/ShareButton";
import { stopSpeaking, useAutoRead, type SpeechItem } from "../speech";
import { useSettings } from "../settings";
import { DIFFICULTY } from "../components/DifficultyChoice";
import { markPlayed, setLastScenario, type PlayRequest } from "../share";
import { ScenarioPicker, PERSPECTIVE_ICON, PERSPECTIVE_NAME } from "./ScenarioPicker";
import { TrickBreakdown } from "./TrickBreakdown";

const SAFETY_STYLE: Record<Safety, string> = {
  safe: "border-safe/60 bg-safe/10",
  risky: "border-caution/60 bg-caution/10",
  dangerous: "border-danger/60 bg-danger/10",
};
const SAFETY_TEXT: Record<Safety, { label: string; cls: string; icon: string }> = {
  safe: { label: "Safer choice", cls: "text-safe", icon: "✅" },
  risky: { label: "Risky choice", cls: "text-caution", icon: "⚠️" },
  dangerous: { label: "Dangerous choice", cls: "text-danger", icon: "❌" },
};
const TONE_STYLE = { good: "text-safe border-safe/60", mixed: "text-caution border-caution/60", bad: "text-danger border-danger/60" };
/** Seconds between dialogue lines appearing (animation only; turned off by Reduce Motion / Easy View). */
const LINE_GAP = 0.9;
const FIRST_LINE = 0.4;

/** Ids linking each piece of a scene to its read-aloud item, so it can be highlighted while read. */
const sceneIds = (nodeId: string) => ({
  line: (i: number) => `${nodeId}-line-${i}`,
  message: `${nodeId}-message`,
  question: `${nodeId}-question`,
  choice: (i: number) => `${nodeId}-choice-${i}`,
  ending: `${nodeId}-ending`,
  lesson: `${nodeId}-lesson`,
});

/** Endings reachable in one story (for "Endings found: 2/4"). */
function endingsOf(story: StoryDef): string[] {
  const seen = new Set<string>();
  const found = new Set<string>();
  const walk = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const n = getNode(id);
    if (n.ending) found.add(n.ending);
    n.choices?.forEach((c) => walk(c.next));
  };
  walk(story.start);
  return [...found];
}

type Screen = { kind: "pick" } | { kind: "intro"; storyId: string } | { kind: "play" } | { kind: "tricks"; scenarioId: string; variant: number };

export function StoryGame({ onAiMode, onQuiz, request }: { onAiMode: () => void; onQuiz: () => void; request?: PlayRequest & { nonce: number } }) {
  const [screen, setScreen] = useState<Screen>({ kind: "pick" });
  const [state, setState] = useState<StoryState>(initialState);
  /** After a decision we pause to show Inspector Vale's explanation before moving on. */
  const [showFeedback, setShowFeedback] = useState(false);
  const [notice, setNotice] = useState("");

  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });
  // Moving to another screen (picker, intro, trick breakdown) stops any reading from the last one.
  useEffect(() => stopSpeaking(), [screen.kind]);

  const open = (r: PlayRequest) => {
    setLastScenario(r.scenarioId);
    if (r.view === "tricks") setScreen({ kind: "tricks", scenarioId: r.scenarioId, variant: nextVariant(getScenario(r.scenarioId).stories[0]) });
    else setScreen({ kind: "intro", storyId: r.view });
    top();
  };
  // Opened from a share link, the home page or "Surprise me".
  useEffect(() => {
    if (request) open(request);
  }, [request?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (storyId: string) => {
    // Keep endings discovered in this story; pick new details so the replay isn't word-for-word the same.
    setState((s) => ({ ...initialState(storyId, nextVariant(storyId, s.storyId === storyId ? s.variant : undefined)), endingsFound: s.storyId === storyId ? s.endingsFound : [] }));
    setShowFeedback(false);
    setNotice("");
    setScreen({ kind: "play" });
    top();
  };

  const story = getStory(state.storyId);
  const vars = storyVars(state);
  const node = resolveNode(getNode(state.nodeId), vars);
  const { settings } = useSettings();
  const difficulty = settings.difficulty ?? "medium";
  // Hard: answers appear in a shuffled (but stable) order, so the safe answer isn't always in the same place.
  const hash = (t: string) => [...t].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7);
  const choices = node.choices && difficulty === "hard" ? [...node.choices].sort((a, b) => hash(a.id + state.rewinds) - hash(b.id + state.rewinds)) : node.choices;
  const rawEnding = currentEnding(state);
  const ending = rawEnding ? resolveEnding(rawEnding, vars) : null;
  const lastEntry = state.history[state.history.length - 1];
  const lastChoice = lastEntry ? resolveNode(getNode(lastEntry.nodeId), vars).choices?.find((c) => c.id === lastEntry.choiceId) : undefined;
  const playing = screen.kind === "play";

  useEffect(() => {
    if (playing && ending) markPlayed(state.storyId);
  }, [playing, ending?.id, state.storyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read the new scene aloud (automatically if the player switched that on, or with the ▶ button).
  // Each character's line is read in their own voice; narration and options use the assistant voice.
  const ids = sceneIds(state.nodeId);
  const sceneTexts: SpeechItem[] = [
    ...node.lines.map((l, i): SpeechItem => ({ text: l.text, role: l.speaker, id: ids.line(i) })),
    ...(node.message ? [{ text: `Message from ${node.message.from}.`, id: ids.message }, { text: node.message.text, id: ids.message }] : []),
    ...(choices ? [{ text: story.question, id: ids.question }, ...choices.map((c, i) => ({ text: `Option ${i + 1}: ${c.label}`, id: ids.choice(i) }))] : []),
    ...(ending ? [{ text: `Ending: ${ending.title}. ${ending.summary}`, id: ids.ending }, { text: `Lesson: ${ending.lesson}`, id: ids.lesson }] : []),
  ];
  const sceneKey = `scene-${state.storyId}-${state.nodeId}-${state.rewinds}-${state.history.length}`;
  useAutoRead(sceneTexts, sceneKey, playing && !showFeedback);
  const feedbackTexts: SpeechItem[] = lastChoice
    ? [
        { text: `${SAFETY_TEXT[lastChoice.safety].label}. ${lastChoice.feedback}`, role: "vale", id: "fb-main" },
        ...(lastChoice.saferAlternative ? [{ text: `A safer option: ${lastChoice.saferAlternative}`, role: "vale" as const, id: "fb-safer" }] : []),
      ]
    : [];
  const feedbackKey = `fb-${state.storyId}-${state.history.length}-${state.rewinds}`;
  useAutoRead(feedbackTexts, feedbackKey, playing && showFeedback);

  if (screen.kind === "pick") return <ScenarioPicker onPick={open} />;
  if (screen.kind === "tricks") {
    const sc = getScenario(screen.scenarioId);
    return <TrickBreakdown scenario={sc} vars={sc.variants[screen.variant % sc.variants.length]} onPlay={start} onBack={() => setScreen({ kind: "pick" })} />;
  }
  if (screen.kind === "intro") return <StoryIntro story={getStory(screen.storyId)} onStart={() => start(screen.storyId)} onBack={() => setScreen({ kind: "pick" })} onTricks={() => open({ scenarioId: getStory(screen.storyId).scenarioId, view: "tricks" })} />;

  const onFind = (clue: StoryClue) => {
    setState((s) => collectClue(s, clue.id));
    setNotice(`Added to your notebook: ${TACTIC_LABELS[clue.tactic]}.`);
  };
  const onMiss = () => setNotice("Nothing suspicious there. Keep looking.");

  const pick = (choiceId: string) => {
    setState((s) => choose(s, choiceId));
    // Hard mode: no feedback until the end (the ending screen explains every decision).
    setShowFeedback(difficulty !== "hard");
    setNotice("");
  };

  const rewind = (index: number) => {
    setState((s) => rewindTo(s, index));
    setShowFeedback(false);
    setNotice("⏪ Time rewound. Make a different choice and see how the story changes.");
    top();
  };

  const totalEndings = endingsOf(story).length;
  const scenario = getScenario(story.scenarioId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">
              {scenario.icon} {scenario.title} · {PERSPECTIVE_ICON[story.perspective]} Playing as {plainName(story.you)}
            </p>
            <h1 className="h2">{scenario.scamType}</h1>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="chip border border-ink-600 text-slate-300">{DIFFICULTY[difficulty].icon} {DIFFICULTY[difficulty].label}</span>
            <span className="chip border border-ink-600 text-slate-300">Decisions made: {state.history.length}</span>
            <span className="chip border border-ink-600 text-slate-300">Endings found: {state.endingsFound.length}/{totalEndings}</span>
            <button className="chip border border-ink-600 text-slate-300 hover:border-electric-400" onClick={() => setScreen({ kind: "pick" })}>← All scams</button>
          </div>
        </div>

        {/* Feedback from Inspector Vale after every decision */}
        {showFeedback && lastChoice && (
          <section className={`card animate-rise space-y-3 border-2 p-5 ${SAFETY_STYLE[lastChoice.safety]}`} aria-live="polite">
            <div className="flex items-center gap-3">
              <InspectorVale size={64} />
              <div>
                <p className="font-semibold">Inspector Vale</p>
                <p className={`text-sm font-semibold ${SAFETY_TEXT[lastChoice.safety].cls}`}>
                  {SAFETY_TEXT[lastChoice.safety].icon} {SAFETY_TEXT[lastChoice.safety].label}
                </p>
              </div>
            </div>
            <p className="text-lg">
              You chose: <strong>{lastChoice.label}</strong>
            </p>
            <Readable id="fb-main" className="p-1">
              <p className="text-lg">{lastChoice.feedback}</p>
            </Readable>
            {lastChoice.saferAlternative && (
              <Readable id="fb-safer" className="p-1">
                <p>
                  <span className="font-semibold text-safe">A safer option: </span>
                  {lastChoice.saferAlternative}
                </p>
              </Readable>
            )}
            <ReadingBar items={feedbackTexts} queueId={feedbackKey} label="Inspector Vale's advice" />
            <div className="flex flex-wrap gap-3 pt-1">
              <button className="btn-primary" onClick={() => { setShowFeedback(false); top(); }}>
                Continue the story →
              </button>
              <button className="btn-ghost" onClick={() => rewind(state.history.length - 1)}>
                ⏪ Rewind this decision
              </button>
              <Tip text="Rewind takes you back to the moment before this decision so you can try a different choice and compare what happens. It's practice: nothing is lost." />
            </div>
          </section>
        )}

        {!showFeedback && (
          <section className="space-y-4 animate-rise" key={sceneKey}>
            <div className="scene-in relative">
              <SceneArt art={node.art} vars={vars} />
              <p className="chip absolute left-3 top-3 border border-violet-500/50 bg-ink-950/80 text-violet-300 backdrop-blur">🎬 {node.scene}</p>
            </div>
            <ReadingBar items={sceneTexts} queueId={sceneKey} />
            <div className="space-y-3">
              {node.lines.map((line, i) => (
                <div key={i} className="line-in" style={{ animationDelay: `${FIRST_LINE + i * LINE_GAP}s` }}>
                  <DialogueLine id={ids.line(i)} line={line} you={story.you} delay={FIRST_LINE + i * LINE_GAP} clues={node.clues ?? []} found={state.clues} onFind={onFind} onMiss={onMiss} />
                </div>
              ))}
            </div>

            {node.message && (
              <div className="line-in mx-auto max-w-md" style={{ animationDelay: `${FIRST_LINE + node.lines.length * LINE_GAP}s` }}>
                <Readable id={ids.message} className="rounded-3xl border-4 border-ink-600 bg-ink-900 p-4">
                  <p className="text-sm text-slate-400">💬 Message from {node.message.from}</p>
                  <p className="mt-2 rounded-2xl rounded-tl-sm bg-ink-700 p-3 text-lg leading-relaxed">
                    <ClickableText text={node.message.text} clues={node.clues ?? []} found={state.clues} onFind={onFind} onMiss={onMiss} />
                  </p>
                </Readable>
              </div>
            )}

            {difficulty === "easy" && node.clues && node.clues.length > 0 && (
              <p className="rounded-xl border border-safe/50 bg-safe/10 p-3 text-lg">
                💡 <strong>Hint:</strong> this scene has <strong>{node.clues.length}</strong> suspicious phrase{node.clues.length === 1 ? "" : "s"} to find. You've found {node.clues.filter((c) => state.clues.includes(c.id)).length}.
              </p>
            )}
            {node.clues && node.clues.length > 0 && <EasyHint>Tap any words that sound suspicious. They go into your detective notebook.</EasyHint>}
            <p aria-live="polite" className="min-h-[1.5rem] font-semibold text-electric-400">{notice}</p>

            {choices && (
              <fieldset className="line-in space-y-3" style={{ animationDelay: `${FIRST_LINE + (node.lines.length + (node.message ? 1 : 0)) * LINE_GAP}s` }}>
                <legend className="mb-1 w-full">
                  <Readable id={ids.question} className="inline-block px-2 py-1 text-lg font-semibold">{story.question}</Readable>
                </legend>
                <EasyHint>Choose one answer. Don't worry about getting it wrong. You can rewind and try again.</EasyHint>
                {choices!.map((c, i) => (
                  <Readable key={c.id} id={ids.choice(i)}>
                    <button onClick={() => pick(c.id)} className="btn-ghost w-full !justify-start text-left text-lg">
                      {c.label}
                    </button>
                  </Readable>
                ))}
              </fieldset>
            )}

            {ending && (
              <div className="line-in" style={{ animationDelay: `${FIRST_LINE + node.lines.length * LINE_GAP}s` }}>
                <StoryEnding ids={ids} state={state} totalEndings={totalEndings} onRewind={rewind} onRestart={() => start(state.storyId)} onPlay={start} onTricks={() => open({ scenarioId: scenario.id, view: "tricks" })} onPick={() => setScreen({ kind: "pick" })} onAiMode={onAiMode} onQuiz={onQuiz} />
              </div>
            )}
          </section>
        )}
      </div>

      <Notebook state={state} vars={vars} hard={difficulty === "hard"} />
    </div>
  );
}

function StoryIntro({ story, onStart, onBack, onTricks }: { story: StoryDef; onStart: () => void; onBack: () => void; onTricks: () => void }) {
  const scenario = getScenario(story.scenarioId);
  return (
    <section className="grid gap-6 animate-rise lg:grid-cols-[1.4fr_1fr]">
      <div className="card space-y-4 p-6">
        <div className="scene-in">
          <SceneArt art={scenario.art} vars={scenario.variants[0]} />
        </div>
        <p className="eyebrow">{scenario.icon} {scenario.scamType}</p>
        <h1 className="h1">{scenario.title}</h1>
        <p className="text-xl text-slate-300">{scenario.tagline}</p>
        <p className="chip border border-electric-400/50 bg-electric-500/10 text-electric-400">
          {PERSPECTIVE_ICON[story.perspective]} {PERSPECTIVE_NAME[story.perspective]}: you play {story.label}
        </p>
        <Readable id={`intro-${story.id}`} className="p-1">
          <p className="text-lg">{story.intro}</p>
        </Readable>
        <ul className="space-y-1 text-lg">
          <li>🔍 Tap suspicious words to collect clues</li>
          <li>🗣️ Choose what {plainName(story.you)} says and does</li>
          <li>⏪ Rewind any decision to see a different path</li>
          <li>🏁 {endingsOf(story).length} possible endings</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary text-lg" onClick={onStart}>Start →</button>
          <SpeakButton id={`intro-${story.id}`} text={story.intro} />
          <button className="btn-ghost" onClick={onTricks}>🔍 How the trick works</button>
          <button className="btn-ghost" onClick={onBack}>← All scams</button>
        </div>
        <p className="text-sm text-slate-400">No AI needed: this story works offline. All people, banks and events are fictional.</p>
      </div>
      <div className="card h-fit space-y-3 p-6">
        <p className="eyebrow">Characters</p>
        {story.cast.map((id) => (
          <div key={id} className="flex items-center gap-3">
            <Avatar id={id} size={56} />
            <div>
              <p className="font-semibold">{CHARACTERS[id].name}{id === story.you ? " (you)" : ""}</p>
              <p className="text-sm text-slate-400">{CHARACTERS[id].role}</p>
            </div>
          </div>
        ))}
        <p className="pt-2 text-sm text-slate-400">Scammers are shown as shadowy “?” figures, because you never really know who is on the other end.</p>
      </div>
    </section>
  );
}

function DialogueLine({ id, line, you, delay = 0, clues, found, onFind, onMiss }: { id: string; line: StoryLine; you: string; delay?: number; clues: StoryClue[]; found: string[]; onFind: (c: StoryClue) => void; onMiss: () => void }) {
  const who = CHARACTERS[line.speaker];
  const lineClues = clues.filter((c) => line.text.includes(c.text));
  if (line.speaker === "narrator") {
    return (
      <Readable id={id} className="py-1">
        <p className="border-l-4 border-ink-600 pl-4 text-lg italic text-slate-300">{line.text}</p>
      </Readable>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <span className="rounded-full p-0.5" style={{ background: who.color }}>
        <Avatar id={line.speaker} size={60} talking talkDelay={delay} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold" style={{ color: who.color }}>{who.name}{line.speaker === you ? " (you)" : ""}</span>
          {who.role && <span className="text-slate-400"> · {who.role}</span>}
        </p>
        <Readable id={id} className="mt-1 rounded-2xl rounded-tl-sm border border-ink-600 bg-ink-900 p-4 text-lg leading-relaxed">
          <ClickableText text={line.text} clues={lineClues} found={found} onFind={onFind} onMiss={onMiss} />
        </Readable>
        <div className="mt-1">
          <SpeakButton id={id} text={line.text} role={line.speaker} label={`Hear ${plainName(line.speaker)}`} />
        </div>
      </div>
    </div>
  );
}

function Notebook({ state, vars, hard = false }: { state: StoryState; vars: Record<string, string>; hard?: boolean }) {
  const found = ALL_STORY_CLUES.filter((c) => state.clues.includes(c.id));
  const seen = cluesSeen(state).length;
  return (
    <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-32" aria-label="Detective notebook">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold">📓 Notebook</p>
        <span className="chip border border-ink-600 text-slate-300">
          {hard ? `${found.length} found` : `${found.length}/${seen} clues`}
        </span>
      </div>
      {found.length === 0 ? (
        <p className="text-slate-400">No clues yet. Tap suspicious words in the conversation to note them here.</p>
      ) : (
        <ul className="space-y-2">
          {found.map((c) => (
            <li key={c.id} className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm">
              <p className="font-semibold text-danger">{TACTIC_LABELS[c.tactic]}</p>
              <p>“{fill(c.text, vars)}”</p>
              <p className="mt-1 text-slate-300">{fill(c.explanation, vars)}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

interface EndingProps {
  ids: ReturnType<typeof sceneIds>;
  state: StoryState;
  totalEndings: number;
  onRewind: (i: number) => void;
  onRestart: () => void;
  onPlay: (storyId: string) => void;
  onTricks: () => void;
  onPick: () => void;
  onAiMode: () => void;
  onQuiz: () => void;
}

function StoryEnding({ ids, state, totalEndings, onRewind, onRestart, onPlay, onTricks, onPick, onAiMode, onQuiz }: EndingProps) {
  const vars = storyVars(state);
  const story = getStory(state.storyId);
  const scenario = getScenario(story.scenarioId);
  const ending = resolveEnding(currentEnding(state)!, vars);
  const score = scoreStory(state);
  const previous = state.previousEnding && state.previousEnding !== ending.id ? resolveEnding(ENDINGS[state.previousEnding], vars) : null;
  const seen = cluesSeen(state);
  const missed = ALL_STORY_CLUES.filter((c) => seen.includes(c.id) && !state.clues.includes(c.id));
  const tactics = [...new Set(ALL_STORY_CLUES.filter((c) => state.clues.includes(c.id)).map((c) => c.tactic))] as Tactic[];
  const missedTactics = [...new Set(missed.map((c) => c.tactic))].filter((t) => !tactics.includes(t));
  const otherViews = scenario.stories.filter((id) => id !== story.id);

  return (
    <div className="space-y-5 pt-2">
      <Readable id={ids.ending} className={`card border-2 p-6 ${TONE_STYLE[ending.tone]}`}>
        <p className="eyebrow">
          Ending {state.endingsFound.indexOf(ending.id) + 1 || ""} · {state.endingsFound.length}/{totalEndings} discovered
        </p>
        <h2 className="h1 !text-3xl sm:!text-4xl">{ending.title}</h2>
        <p className="mt-2 text-lg text-slate-100">{ending.summary}</p>
        <p className="mt-4 font-semibold text-white">Possible consequences (simulated, not a prediction):</p>
        <ul className="mt-1 list-disc space-y-1 pl-6 text-lg text-slate-100">
          {ending.consequences.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <Readable id={ids.lesson} className="mt-4">
          <p className="rounded-xl border border-electric-400/40 bg-electric-500/10 p-4 text-lg font-semibold text-white">💡 {ending.lesson}</p>
        </Readable>
      </Readable>

      {previous && (
        <div className="card space-y-3 border-violet-500/40 p-5">
          <p className="eyebrow !text-violet-400">Timeline comparison</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={`rounded-xl border p-4 ${TONE_STYLE[previous.tone]}`}>
              <p className="text-sm font-semibold uppercase">Before you rewound</p>
              <p className="font-display text-xl font-bold">{previous.title}</p>
              <p className="text-slate-100">{previous.summary}</p>
            </div>
            <div className={`rounded-xl border p-4 ${TONE_STYLE[ending.tone]}`}>
              <p className="text-sm font-semibold uppercase">After you rewound</p>
              <p className="font-display text-xl font-bold">{ending.title}</p>
              <p className="text-slate-100">{ending.summary}</p>
            </div>
          </div>
          <p className="text-lg">One different decision changed how the whole story could end. That's the butterfly effect.</p>
        </div>
      )}

      {/* See the same scam through other eyes */}
      <div className="card space-y-3 border-electric-400/40 p-5">
        <p className="eyebrow">Same scam, different eyes</p>
        <p className="text-lg">Scams affect more than one person. See this one from another side:</p>
        <div className="flex flex-wrap gap-3">
          {otherViews.map((id) => (
            <button key={id} className="btn-primary" onClick={() => onPlay(id)}>
              {PERSPECTIVE_ICON[STORIES[id].perspective]} Play as {STORIES[id].label.split(",")[0]}
            </button>
          ))}
          <button className="btn-ghost" onClick={onTricks}>🔍 How the trick works</button>
        </div>
      </div>

      <div className="card grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="text-center">
          <p className="eyebrow">Detective score</p>
          <p className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text font-display text-7xl font-bold text-transparent">{score.total}</p>
          <p className="text-slate-400">out of 100</p>
        </div>
        <div className="space-y-2">
          {([["Clues spotted", score.clues], ["Decisions", score.decisions], ["Outcome", score.outcome], ["Learning from mistakes", score.reflection]] as const).map(([label, part]) => (
            <ScoreBar key={label} label={label} part={part} />
          ))}
          <details className="text-sm text-slate-400">
            <summary className="cursor-pointer font-semibold text-slate-300">How is this score worked out?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Clues (30):</strong> the share of clues on your path that you tapped. Clues in scenes you didn't visit don't count against you.</li>
              <li><strong>Decisions (40):</strong> the average of the choices on your final path: safe = full marks, risky = half, dangerous = none.</li>
              <li><strong>Outcome (20):</strong> a safe ending 20, a partly-harmful ending 10, a harmful ending 0.</li>
              <li><strong>Learning from mistakes (10):</strong> the share of your risky or dangerous choices that you rewound and changed. No mistakes means full marks.</li>
            </ul>
            <p className="mt-2">Your score measures what you practised, not how confident an AI is.</p>
          </details>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="h2 mb-3 !text-2xl">Your decisions</h3>
          <EasyHint>Tap “Rewind to here” on any decision to go back and try something else.</EasyHint>
          <ol className="mt-3 space-y-3">
            {state.history.map((h, i) => {
              const c = resolveNode(getNode(h.nodeId), vars).choices!.find((x) => x.id === h.choiceId)!;
              return (
                <li key={i} className="rounded-xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-sm text-slate-400">Decision {i + 1} · {fill(getNode(h.nodeId).scene, vars)}</p>
                  <p className="font-semibold">
                    {SAFETY_TEXT[c.safety].icon} {c.label}
                  </p>
                  {c.saferAlternative && (
                    <p className="mt-1 text-sm">
                      <span className="text-safe">Safer alternative:</span> {c.saferAlternative}
                    </p>
                  )}
                  <button className="btn-ghost mt-2 !min-h-[40px] !py-1.5 text-sm" onClick={() => onRewind(i)}>
                    ⏪ Rewind to here
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="h2 mb-2 !text-2xl">Tricks you spotted</h3>
            <div className="flex flex-wrap gap-2">
              {tactics.length ? tactics.map((t) => <span key={t} className="chip border border-safe/40 text-safe">{TACTIC_LABELS[t]}</span>) : <span className="text-slate-400">None noted this time, and that's okay. Now you know what to look for.</span>}
            </div>
            {missed.length > 0 && (
              <>
                <p className="mt-3 font-semibold">Clues you didn't note:</p>
                <ul className="mt-1 list-disc pl-5 text-slate-300">
                  {missed.map((c) => (
                    <li key={c.id}>“{fill(c.text, vars)}” ({TACTIC_LABELS[c.tactic]})</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="card p-5">
            <h3 className="h2 mb-2 !text-2xl">Your safety lessons</h3>
            <ul className="space-y-2">
              <li className="rounded-lg bg-ink-900 p-3">💡 {ending.lesson}</li>
              {missedTactics.slice(0, 2).map((t) => (
                <li key={t} className="rounded-lg bg-ink-900 p-3">💡 {TACTIC_EXPLAINERS[t]}</li>
              ))}
              <li className="rounded-lg bg-ink-900 p-3">💡 Real banks, police and companies never ask you to move money to a “safe account”, pay in gift cards or crypto, share codes, or keep it secret.</li>
            </ul>
          </div>
        </div>
      </div>

      <HelpCard />

      <div className="flex flex-wrap items-start gap-3">
        {state.endingsFound.length < totalEndings && <p className="w-full text-slate-300">There are {totalEndings - state.endingsFound.length} more endings to discover. Rewind a decision to find them.</p>}
        <button className="btn-primary" onClick={onRestart}>Play again (new details)</button>
        <button className="btn-ghost" onClick={onPick}>Choose another scam</button>
        <button className="btn-ghost" onClick={onQuiz}>🧠 Take the 1-minute scam check</button>
        <ShareButton request={{ scenarioId: scenario.id, view: story.id }} />
        <button className="btn-ghost" onClick={onAiMode}>Try AI Detective mode →</button>
        <button className="btn-ghost" onClick={() => window.print()}>Print my report</button>
      </div>
    </div>
  );
}
