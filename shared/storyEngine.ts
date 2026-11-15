// Story engine: pure functions over the story data (no React), so it is easy to test.
import { DEFAULT_STORY, ENDINGS, NODES, START_NODE, getStory, scenarioOf, type Safety, type StoryChoice, type StoryNode } from "./story";

export interface HistoryEntry {
  nodeId: string;
  choiceId: string;
  /** Notebook contents just before this choice, so Rewind can restore them. */
  cluesBefore: string[];
}

export interface StoryState {
  /** Which story (scenario + perspective) is being played. */
  storyId: string;
  /** Which set of details (amounts, names, places) this playthrough uses. */
  variant: number;
  nodeId: string;
  history: HistoryEntry[];
  clues: string[];
  rewinds: number;
  endingsFound: string[];
  /** The ending reached before the latest rewind, used to compare timelines. */
  previousEnding: string | null;
  /** Risky or dangerous choices made in this playthrough, including ones later rewound. */
  mistakes: number;
  /** How many of those mistakes the player went back and undid with Rewind. */
  mistakesUndone: number;
}

export const initialState = (storyId: string = DEFAULT_STORY, variant = 0): StoryState => ({
  storyId,
  variant,
  nodeId: storyId === DEFAULT_STORY ? START_NODE : getStory(storyId).start,
  history: [],
  clues: [],
  rewinds: 0,
  endingsFound: [],
  previousEnding: null,
  mistakes: 0,
  mistakesUndone: 0,
});

export const getNode = (id: string): StoryNode => {
  const node = NODES[id];
  if (!node) throw new Error(`Unknown story node: ${id}`);
  return node;
};

export function findChoice(nodeId: string, choiceId: string): StoryChoice | undefined {
  return getNode(nodeId).choices?.find((c) => c.id === choiceId);
}

export function collectClue(state: StoryState, clueId: string): StoryState {
  const node = getNode(state.nodeId);
  if (!node.clues?.some((c) => c.id === clueId) || state.clues.includes(clueId)) return state;
  return { ...state, clues: [...state.clues, clueId] };
}

export function choose(state: StoryState, choiceId: string): StoryState {
  const choice = findChoice(state.nodeId, choiceId);
  if (!choice) throw new Error(`Choice ${choiceId} is not available at ${state.nodeId}`);
  const nextNode = getNode(choice.next);
  const endingsFound = nextNode.ending && !state.endingsFound.includes(nextNode.ending) ? [...state.endingsFound, nextNode.ending] : state.endingsFound;
  return {
    ...state,
    nodeId: choice.next,
    history: [...state.history, { nodeId: state.nodeId, choiceId, cluesBefore: state.clues }],
    endingsFound,
    mistakes: state.mistakes + (choice.safety === "safe" ? 0 : 1),
  };
}

/** Go back to the decision at history[index] and choose again. Endings discovered are kept. */
export function rewindTo(state: StoryState, index: number): StoryState {
  const entry = state.history[index];
  if (!entry) return state;
  const current = getNode(state.nodeId);
  // Every risky/dangerous choice from this point on is being undone.
  const undone = state.history.slice(index).filter((h) => findChoice(h.nodeId, h.choiceId)?.safety !== "safe").length;
  return {
    ...state,
    nodeId: entry.nodeId,
    history: state.history.slice(0, index),
    clues: entry.cluesBefore,
    rewinds: state.rewinds + 1,
    mistakesUndone: state.mistakesUndone + undone,
    previousEnding: current.ending ?? state.previousEnding,
  };
}

export const currentEnding = (state: StoryState) => {
  const id = getNode(state.nodeId).ending;
  return id ? ENDINGS[id] : null;
};

/** The details ({amount}, {courier}…) used in this playthrough. */
export function storyVars(state: Pick<StoryState, "storyId" | "variant">): Record<string, string> {
  const variants = scenarioOf(state.storyId).variants;
  return variants[state.variant % variants.length] ?? {};
}

/** Pick a different set of details from last time, so replays are never word-for-word the same. */
export function nextVariant(storyId: string, previous?: number, random = Math.random): number {
  const n = scenarioOf(storyId).variants.length;
  if (n <= 1) return 0;
  let v = Math.floor(random() * n);
  if (v === previous) v = (v + 1) % n;
  return v;
}

/** Clues that appeared on the path the player actually took. */
export function cluesSeen(state: StoryState): string[] {
  const nodeIds = [...state.history.map((h) => h.nodeId), state.nodeId];
  return nodeIds.flatMap((id) => getNode(id).clues?.map((c) => c.id) ?? []);
}

const SAFETY_POINTS: Record<Safety, number> = { safe: 1, risky: 0.5, dangerous: 0 };

export interface ScorePart {
  points: number;
  max: number;
  /** Plain-English explanation of how these points were worked out. */
  why: string;
}

/**
 * Learning-based score out of 100 (not an AI confidence score).
 * - Clues (30): share of the clues that came up on your path that you tapped.
 * - Decisions (40): average safety of the choices on your final path (safe 100%, risky 50%, dangerous 0%).
 * - Outcome (20): good ending 20, mixed 10, bad 0.
 * - Learning from mistakes (10): share of your risky/dangerous choices that you rewound and changed.
 *   If you never made one, there was nothing to fix, so you get the full 10.
 */
export function scoreStory(state: StoryState) {
  const seen = cluesSeen(state);
  const spotted = state.clues.filter((c) => seen.includes(c)).length;
  const clues: ScorePart = {
    max: 30,
    points: seen.length ? Math.round((spotted / seen.length) * 30) : 30,
    why: seen.length ? `You tapped ${spotted} of the ${seen.length} clues that came up on your path.` : "No clues came up on your path.",
  };

  const picks = state.history.map((h) => findChoice(h.nodeId, h.choiceId)!);
  const count = (s: Safety) => picks.filter((c) => c.safety === s).length;
  const decisions: ScorePart = {
    max: 40,
    points: picks.length ? Math.round((picks.reduce((s, c) => s + SAFETY_POINTS[c.safety], 0) / picks.length) * 40) : 0,
    why: `${count("safe")} safe, ${count("risky")} risky and ${count("dangerous")} dangerous out of ${picks.length} decision${picks.length === 1 ? "" : "s"} (safe = full marks, risky = half, dangerous = none).`,
  };

  const ending = currentEnding(state);
  const outcome: ScorePart = {
    max: 20,
    points: ending ? { good: 20, mixed: 10, bad: 0 }[ending.tone] : 0,
    why: ending ? { good: "A safe ending: the scam was stopped.", mixed: "Partly safe: the scam was stopped, but some harm was done.", bad: "The scammer got what they wanted." }[ending.tone] : "The story hasn't ended yet.",
  };

  const reflection: ScorePart =
    state.mistakes === 0
      ? { max: 10, points: 10, why: "You made no risky or dangerous choices, so there was nothing to fix." }
      : {
          max: 10,
          points: Math.round((Math.min(state.mistakesUndone, state.mistakes) / state.mistakes) * 10),
          why: `You rewound and changed ${Math.min(state.mistakesUndone, state.mistakes)} of your ${state.mistakes} risky or dangerous choice${state.mistakes === 1 ? "" : "s"}.`,
        };

  return { clues, decisions, outcome, reflection, total: clues.points + decisions.points + outcome.points + reflection.points };
}

/** Every distinct path from the start, for tests: each path is a list of choice ids ending at an ending. */
export function allPaths(nodeId = START_NODE, path: string[] = [], seen = new Set<string>()): { choices: string[]; ending: string }[] {
  const node = getNode(nodeId);
  if (node.ending) return [{ choices: path, ending: node.ending }];
  if (seen.has(nodeId)) throw new Error(`Loop detected at ${nodeId}`);
  const nextSeen = new Set(seen).add(nodeId);
  return (node.choices ?? []).flatMap((c) => allPaths(c.next, [...path, c.id], nextSeen));
}
