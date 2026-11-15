// STORY GAME: all scenarios, perspectives and characters in one registry.
// The whole Story Game runs from this data, with no AI key needed.
// Every person, bank, company, phone number and web address in the stories is fictional.
import type { Character, CharacterId, Ending, Scenario, StoryDef, StoryNode } from "./storyTypes";
import { MIDNIGHT, MIDNIGHT_ENDINGS, MIDNIGHT_NODES, MIDNIGHT_STORIES } from "./scenarios/midnight";
import { SAFE_ACCOUNT, SAFE_ACCOUNT_ENDINGS, SAFE_ACCOUNT_NODES, SAFE_ACCOUNT_STORIES } from "./scenarios/safeAccount";
import { PARCEL, PARCEL_ENDINGS, PARCEL_NODES, PARCEL_STORIES } from "./scenarios/parcel";
import { ROMANCE, ROMANCE_ENDINGS, ROMANCE_NODES, ROMANCE_STORIES } from "./scenarios/romance";
import { INVESTMENT, INVESTMENT_ENDINGS, INVESTMENT_NODES, INVESTMENT_STORIES } from "./scenarios/investment";
import { NEW_NUMBER, NEW_NUMBER_ENDINGS, NEW_NUMBER_NODES, NEW_NUMBER_STORIES } from "./scenarios/newNumber";
import { TAX, TAX_ENDINGS, TAX_NODES, TAX_STORIES } from "./scenarios/tax";
import { COURIER, COURIER_ENDINGS, COURIER_NODES, COURIER_STORIES } from "./scenarios/courier";

export * from "./storyTypes";

export const CHARACTERS: Record<CharacterId, Character> = {
  narrator: { name: "Narrator", role: "", color: "#64748b" },
  arthur: { name: "Arthur", role: "Retired bus driver, 78", color: "#2fa8ff" },
  caller: { name: "Unknown caller", role: "Says he's your grandson", color: "#ff7a8a", scammer: true },
  grant: { name: "“Mr Grant”", role: "Says he's a solicitor", color: "#ff7a8a", scammer: true },
  helen: { name: "Helen", role: "Arthur's daughter", color: "#5fe3a1" },
  jamie: { name: "Jamie", role: "Arthur's real grandson", color: "#5fe3a1" },
  priya: { name: "Priya", role: "Neighbour", color: "#5fe3a1" },
  okafor: { name: "Ms Okafor", role: "Bank fraud adviser", color: "#9a7bff" },
  nadia: { name: "Nadia", role: "Nurse, 41", color: "#2fa8ff" },
  bankcaller: { name: "“Bank fraud team”", role: "Says he's from your bank", color: "#ff7a8a", scammer: true },
  leo: { name: "Leo", role: "Student, 19", color: "#2fa8ff" },
  zara: { name: "Zara", role: "Leo's flatmate", color: "#5fe3a1" },
  brenda: { name: "Brenda", role: "Retired teacher, 62", color: "#2fa8ff" },
  mark: { name: "“Mark”", role: "Online match, says he's an army doctor", color: "#ff7a8a", scammer: true },
  chris: { name: "Chris", role: "Brenda's son", color: "#5fe3a1" },
  kofi: { name: "Kofi", role: "Delivery driver, 29", color: "#2fa8ff" },
  ray: { name: "“Coach Ray”", role: "Runs a 'VIP trading' group", color: "#ff7a8a", scammer: true },
  ama: { name: "Ama", role: "Kofi's sister", color: "#5fe3a1" },
  sue: { name: "Sue", role: "Office manager, 58", color: "#2fa8ff" },
  tom: { name: "Tom", role: "Sue's husband", color: "#5fe3a1" },
  fakeella: { name: "“Ella” (new number)", role: "Says she's Sue's daughter", color: "#ff7a8a", scammer: true },
  ella: { name: "Ella", role: "Sue's real daughter", color: "#5fe3a1" },
  raj: { name: "Raj", role: "Self-employed plumber, 45", color: "#2fa8ff" },
  mina: { name: "Mina", role: "Raj's daughter, 17", color: "#5fe3a1" },
  taxcaller: { name: "“Tax Office caller”", role: "Says he's from the tax office", color: "#ff7a8a", scammer: true },
  doreen: { name: "Doreen", role: "Retired nurse, 81", color: "#2fa8ff" },
  fakecop: { name: "“DC Harris”", role: "Says he's a police detective", color: "#ff7a8a", scammer: true },
  bello: { name: "Mr Bello", role: "Bank branch cashier", color: "#9a7bff" },
};

/** Display name without decorative quotes, e.g. for "Hear Mr Grant". */
export const plainName = (id: CharacterId) => CHARACTERS[id].name.replace(/[“”]/g, "");

export const SCENARIOS: Scenario[] = [MIDNIGHT, SAFE_ACCOUNT, PARCEL, ROMANCE, INVESTMENT, NEW_NUMBER, TAX, COURIER];

export const STORIES: Record<string, StoryDef> = Object.fromEntries(
  [...MIDNIGHT_STORIES, ...SAFE_ACCOUNT_STORIES, ...PARCEL_STORIES, ...ROMANCE_STORIES, ...INVESTMENT_STORIES, ...NEW_NUMBER_STORIES, ...TAX_STORIES, ...COURIER_STORIES].map((s) => [s.id, s]),
);

const NODE_SETS = [MIDNIGHT_NODES, SAFE_ACCOUNT_NODES, PARCEL_NODES, ROMANCE_NODES, INVESTMENT_NODES, NEW_NUMBER_NODES, TAX_NODES, COURIER_NODES];
const ENDING_SETS = [MIDNIGHT_ENDINGS, SAFE_ACCOUNT_ENDINGS, PARCEL_ENDINGS, ROMANCE_ENDINGS, INVESTMENT_ENDINGS, NEW_NUMBER_ENDINGS, TAX_ENDINGS, COURIER_ENDINGS];

/** Ids that appear in more than one scenario file (should always be empty; checked by the tests). */
export const DUPLICATE_IDS = [...NODE_SETS, ...ENDING_SETS].flatMap((set, i, all) =>
  Object.keys(set).filter((k) => all.some((other, j) => j !== i && (i < NODE_SETS.length) === (j < NODE_SETS.length) && k in other)),
);

export const NODES: Record<string, StoryNode> = Object.assign({}, ...NODE_SETS);
export const ENDINGS: Record<string, Ending> = Object.assign({}, ...ENDING_SETS);

/** The original Story Game start (Arthur, The Midnight Call). */
export const START_NODE = "start";
export const DEFAULT_STORY = "midnight_victim";

export const ALL_STORY_CLUES = Object.values(NODES).flatMap((n) => n.clues ?? []);

export const SCENE_ART_IDS = [
  "living_room", "phone_call", "phone_tension", "text_message", "supermarket", "bank_call", "family_call", "kitchen_night", "kitchen_loss",
  "spoofed_call", "safe_account", "bank_desk", "parcel_text", "fake_website", "romance_chat", "investment_ad", "investment_crash", "money_gone", "family_talk", "reported", "phone_message", "cash_handover",
] as const;

export const getStory = (id: string): StoryDef => STORIES[id] ?? STORIES[DEFAULT_STORY];
export const getScenario = (id: string): Scenario => SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
export const scenarioOf = (storyId: string) => getScenario(getStory(storyId).scenarioId);

/** Fill {placeholders} with this playthrough's details. Unknown placeholders are left as they are. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}

/** A scene with every piece of text filled in for this playthrough. */
export function resolveNode(node: StoryNode, vars: Record<string, string>): StoryNode {
  const f = (t: string) => fill(t, vars);
  return {
    ...node,
    scene: f(node.scene),
    lines: node.lines.map((l) => ({ ...l, text: f(l.text) })),
    message: node.message && { from: f(node.message.from), text: f(node.message.text) },
    clues: node.clues?.map((c) => ({ ...c, text: f(c.text), explanation: f(c.explanation) })),
    choices: node.choices?.map((c) => ({ ...c, label: f(c.label), feedback: f(c.feedback), saferAlternative: c.saferAlternative && f(c.saferAlternative) })),
  };
}

export function resolveEnding(e: Ending, vars: Record<string, string>): Ending {
  const f = (t: string) => fill(t, vars);
  return { ...e, title: f(e.title), summary: f(e.summary), lesson: f(e.lesson), consequences: e.consequences.map(f) };
}
