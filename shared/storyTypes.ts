// Types for the Story Game's scenarios. Kept separate so scenario files can import them without cycles.
import type { Tactic } from "./types";

export type CharacterId =
  | "narrator"
  // The Midnight Call
  | "arthur"
  | "caller"
  | "grant"
  | "helen"
  | "jamie"
  | "priya"
  | "okafor"
  // The Safe Account
  | "nadia"
  | "bankcaller"
  // The Parcel Text
  | "leo"
  | "zara"
  // The Perfect Match
  | "brenda"
  | "mark"
  | "chris"
  // The VIP Group
  | "kofi"
  | "ray"
  | "ama"
  // Hi Mum, New Number
  | "sue"
  | "tom"
  | "fakeella"
  | "ella"
  // The Tax Refund
  | "raj"
  | "mina"
  | "taxcaller"
  // The Courier
  | "doreen"
  | "fakecop"
  | "bello";

export interface Character {
  name: string;
  role: string;
  color: string;
  /** Scammers are drawn as shadowy silhouettes and never glamorised. */
  scammer?: boolean;
}

export interface StoryClue {
  id: string;
  /** Exact phrase inside a line or message (after filling in {details}); players tap it to add it to their notebook. */
  text: string;
  tactic: Tactic;
  explanation: string;
}

export type Safety = "safe" | "risky" | "dangerous";

export interface StoryChoice {
  id: string;
  label: string;
  next: string;
  safety: Safety;
  /** Inspector Vale's plain-language explanation shown straight after the decision. */
  feedback: string;
  saferAlternative?: string;
}

export interface StoryLine {
  speaker: CharacterId;
  text: string;
}

export type SceneArtId =
  | "living_room"
  | "phone_call"
  | "phone_tension"
  | "text_message"
  | "supermarket"
  | "bank_call"
  | "family_call"
  | "kitchen_night"
  | "kitchen_loss"
  | "spoofed_call"
  | "safe_account"
  | "bank_desk"
  | "parcel_text"
  | "fake_website"
  | "romance_chat"
  | "investment_ad"
  | "investment_crash"
  | "money_gone"
  | "family_talk"
  | "reported"
  | "phone_message"
  | "cash_handover";

export interface StoryNode {
  id: string;
  scene: string;
  /** Which illustration to show for this scene. */
  art: SceneArtId;
  lines: StoryLine[];
  /** A message the player can inspect (text, chat, advert). */
  message?: { from: string; text: string };
  clues?: StoryClue[];
  choices?: StoryChoice[];
  ending?: string;
}

export interface Ending {
  id: string;
  title: string;
  tone: "good" | "mixed" | "bad";
  summary: string;
  consequences: string[];
  lesson: string;
}

export type PerspectiveKind = "victim" | "family" | "bank";

/** One playable story: a scenario seen through one person's eyes. */
export interface StoryDef {
  id: string;
  scenarioId: string;
  perspective: PerspectiveKind;
  /** Who you play. */
  you: CharacterId;
  /** e.g. "Play as Helen, Arthur's daughter" */
  label: string;
  intro: string;
  start: string;
  /** The question above the choices, e.g. "What should Arthur do?" */
  question: string;
  /** Characters shown on the intro screen. */
  cast: CharacterId[];
}

/** One step of "How the trick works": what a scammer line is designed to do, and how to beat it. */
export interface TrickStep {
  stage: "Hook" | "Build trust" | "Create panic" | "Cut you off" | "Take the money";
  speaker: CharacterId;
  line: string;
  tactic: Tactic;
  purpose: string;
  defence: string;
}

export interface Scenario {
  id: string;
  title: string;
  icon: string;
  scamType: string;
  tagline: string;
  /** Cover illustration. */
  art: SceneArtId;
  /** Story ids for each perspective, victim first. */
  stories: string[];
  trick: TrickStep[];
  /**
   * Sets of details that change between playthroughs (amounts, places, company names), so the same
   * scam is never told exactly the same way twice. Text uses {key} placeholders.
   */
  variants: Record<string, string>[];
}
