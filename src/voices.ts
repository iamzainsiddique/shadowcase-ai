// Voice casting for read-aloud. Pure logic (no React, no DOM) so it can be unit-tested.
//
// Browsers only offer the voices installed on the device. Some of those (old or "character" voices
// such as Fred, Ralph, Grandpa, Rocko) sound robotic or eerie, so by default we only use natural-sounding
// voices and tell characters apart with small, natural pitch and speed changes. Big pitch shifts are
// avoided because they make voices sound creepy.
//
// Casting gives each role the best-scoring voice, where the score favours:
//   natural-sounding voices > the role's preferred voices > voices nobody else uses yet >
//   not sharing a voice with someone in the same scene > British English (the story is set in the UK).

export type Gender = "female" | "male";
import type { CharacterId } from "../shared/storyTypes";

/** Every story character, plus the assistant, Inspector Vale and Case 001's caller. */
export type VoiceRole =
  | "assistant" // tutorial, AI Detective, scanner, reports, story narration
  | CharacterId
  | "vale"
  | "case_caller"; // "Daniel from the Fraud Team" in Case 001

export interface VoiceLike {
  name: string;
  lang: string;
}

export interface Cast {
  voiceName?: string;
  pitch: number;
  rate: number;
}

type Age = "child" | "adult" | "older";
type CharacterRole = Exclude<VoiceRole, "assistant" | "narrator">;

interface RoleSpec {
  gender: Gender;
  age: Age;
  /** Preferred voice names, best first ("name starts with"). Natural voices are listed first. */
  prefer: string[];
  /** Small adjustments on top of the age defaults, to tell characters apart. */
  pitchShift?: number;
  rate: number;
}

const FEMALE_ASSISTANT = ["Microsoft Sonia", "Microsoft Libby", "Google UK English Female", "Serena", "Samantha", "Kate", "Stephanie", "Microsoft Aria", "Microsoft Jenny", "Karen", "Moira", "Microsoft Hazel", "Microsoft Zira"];
const MALE_ASSISTANT = ["Microsoft Ryan", "Google UK English Male", "Daniel", "Oliver", "Jamie", "Microsoft Guy", "Microsoft Andrew", "Rishi", "Microsoft George", "Microsoft David"];

// Order matters: earlier roles get first pick (main characters first).
const SPECS: Record<CharacterRole, RoleSpec> = {
  // Arthur, 78: an older man, slower and a little lower.
  arthur: { gender: "male", age: "older", prefer: ["Arthur", "Grandpa (English (United Kingdom))", "Microsoft George", "Daniel", "Oliver", "Google UK English Male", "Microsoft Ryan", "Rishi"], rate: 0.86 },
  // Jamie, Arthur's real grandson: a child's voice.
  jamie: { gender: "male", age: "child", prefer: ["Microsoft Maisie", "Microsoft Ana", "Karen", "Tessa", "Google US English", "Microsoft Libby", "Fiona"], rate: 1.04 },
  // The caller who claims to be the grandson: young-sounding too, but a different voice, hurried.
  caller: { gender: "male", age: "child", prefer: ["Microsoft Ana", "Microsoft Maisie", "Tessa", "Moira", "Google US English", "Microsoft Aria"], pitchShift: -0.04, rate: 1.1 },
  // Helen, Arthur's daughter (middle-aged).
  helen: { gender: "female", age: "adult", prefer: ["Microsoft Libby", "Serena", "Moira", "Kate", "Google UK English Female", "Fiona", "Karen"], rate: 0.98 },
  // "Mr Grant": smooth, confident, a bit fast.
  grant: { gender: "male", age: "adult", prefer: ["Microsoft Thomas", "Google UK English Male", "Rishi", "Oliver", "Daniel", "Microsoft Guy", "Microsoft David"], pitchShift: -0.05, rate: 1.04 },
  // Inspector Vale, the guide: calm.
  vale: { gender: "female", age: "adult", prefer: ["Microsoft Sonia", "Moira", "Serena", "Tessa", "Kate", "Google UK English Female", "Karen"], rate: 0.95 },
  // Priya, the neighbour.
  priya: { gender: "female", age: "adult", prefer: ["Microsoft Neerja", "Veena", "Isha", "Tessa", "Karen", "Microsoft Libby", "Google UK English Female"], rate: 1.0 },
  // Ms Okafor, bank fraud adviser: calm and professional.
  okafor: { gender: "female", age: "adult", prefer: ["Microsoft Abeo", "Microsoft Ezinne", "Karen", "Moira", "Microsoft Aria", "Google UK English Female"], rate: 0.95 },
  // Case 001's "Daniel from the Fraud Team" (a scammer).
  case_caller: { gender: "male", age: "adult", prefer: ["Google UK English Male", "Rishi", "Daniel", "Microsoft Guy", "Microsoft Ryan"], rate: 1.04 },
  // The Safe Account
  nadia: { gender: "female", age: "adult", prefer: ["Microsoft Libby", "Karen", "Tessa", "Google UK English Female", "Moira"], rate: 1.0 },
  bankcaller: { gender: "male", age: "adult", prefer: ["Microsoft Guy", "Google UK English Male", "Rishi", "Daniel", "Microsoft Ryan"], pitchShift: -0.03, rate: 1.04 },
  // The Parcel Text
  leo: { gender: "male", age: "adult", prefer: ["Microsoft Ryan", "Google UK English Male", "Daniel", "Rishi"], pitchShift: 0.06, rate: 1.06 },
  zara: { gender: "female", age: "adult", prefer: ["Microsoft Maisie", "Tessa", "Karen", "Google UK English Female", "Microsoft Libby"], pitchShift: 0.04, rate: 1.04 },
  // The Perfect Match
  brenda: { gender: "female", age: "older", prefer: ["Microsoft Sonia", "Moira", "Karen", "Google UK English Female", "Serena"], rate: 0.92 },
  mark: { gender: "male", age: "adult", prefer: ["Microsoft Guy", "Daniel", "Google UK English Male", "Rishi"], pitchShift: -0.06, rate: 0.96 },
  chris: { gender: "male", age: "adult", prefer: ["Microsoft Ryan", "Rishi", "Google UK English Male", "Daniel"], rate: 1.0 },
  // The VIP Group
  kofi: { gender: "male", age: "adult", prefer: ["Microsoft Thomas", "Rishi", "Google UK English Male", "Daniel"], rate: 1.02 },
  ray: { gender: "male", age: "adult", prefer: ["Microsoft Guy", "Google UK English Male", "Daniel", "Rishi"], pitchShift: 0.02, rate: 1.1 },
  ama: { gender: "female", age: "adult", prefer: ["Microsoft Aria", "Tessa", "Karen", "Moira", "Google UK English Female"], rate: 1.0 },
  // Hi Mum, New Number
  sue: { gender: "female", age: "adult", prefer: ["Microsoft Libby", "Karen", "Moira", "Google UK English Female"], pitchShift: -0.03, rate: 0.97 },
  tom: { gender: "male", age: "adult", prefer: ["Microsoft Thomas", "Daniel", "Google UK English Male", "Rishi"], pitchShift: -0.04, rate: 0.97 },
  fakeella: { gender: "female", age: "adult", prefer: ["Microsoft Aria", "Tessa", "Google US English", "Karen"], pitchShift: 0.05, rate: 1.06 },
  ella: { gender: "female", age: "adult", prefer: ["Microsoft Maisie", "Moira", "Google UK English Female", "Karen"], pitchShift: 0.06, rate: 1.04 },
  // The Tax Refund
  raj: { gender: "male", age: "adult", prefer: ["Rishi", "Microsoft Ryan", "Google UK English Male", "Daniel"], rate: 1.0 },
  mina: { gender: "female", age: "adult", prefer: ["Microsoft Neerja", "Veena", "Isha", "Tessa", "Google UK English Female"], pitchShift: 0.08, rate: 1.06 },
  taxcaller: { gender: "male", age: "adult", prefer: ["Microsoft Guy", "Google UK English Male", "Daniel"], pitchShift: -0.05, rate: 1.06 },
  // The Courier
  doreen: { gender: "female", age: "older", prefer: ["Microsoft Sonia", "Moira", "Karen", "Google UK English Female"], rate: 0.88 },
  fakecop: { gender: "male", age: "adult", prefer: ["Microsoft Ryan", "Google UK English Male", "Daniel", "Rishi"], pitchShift: -0.04, rate: 1.02 },
  bello: { gender: "male", age: "adult", prefer: ["Microsoft Thomas", "Rishi", "Google UK English Male", "Daniel"], rate: 0.98 },
};

/** Roles that talk in the same scene, so they shouldn't share a voice if it can be helped. */
const SAME_SCENE: Partial<Record<CharacterRole, CharacterRole[]>> = {
  arthur: ["jamie", "caller", "helen", "grant", "priya", "okafor"],
  caller: ["grant", "jamie"],
  helen: ["jamie"],
  nadia: ["bankcaller", "okafor"],
  leo: ["zara", "bankcaller", "okafor"],
  brenda: ["mark", "chris"],
  kofi: ["ray", "ama"],
  sue: ["fakeella", "ella", "tom"],
  raj: ["taxcaller", "mina"],
  doreen: ["fakecop", "bello"],
};
const together = (a: CharacterRole, b: CharacterRole) => SAME_SCENE[a]?.includes(b) || SAME_SCENE[b]?.includes(a);

// Novelty voices (macOS) that would sound silly or confusing. Never used.
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Hysterical|Deranged|Pipe Organ)\b/i;
// Older or "character" voices that sound robotic or eerie. Only used with "More voice variety" on.
const ROBOTIC = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley|Fred|Ralph|Junior|Kathy|Agnes|Bruce|Vicki|Victoria|Princess|Trinoids)\b/i;
// Modern neural / high-quality voices.
const NATURAL = /(Natural|Neural|Premium|Enhanced|Online|^Google )/i;
// Real children's voices (Microsoft Edge).
const CHILD = /\b(Ana|Maisie)\b|child/i;

const FEMALE_HINT = /(female|woman|samantha|karen|moira|tessa|fiona|victoria|kate|serena|allison|ava|susan|zoe|nicky|veena|isha|kathy|flo|sandy|shelley|grandma|libby|sonia|maisie|aria|jenny|michelle|zira|hazel|neerja|natasha|catherine|emily|amy|stephanie|martha|ana\b|abeo|ezinne)/i;
const MALE_HINT = /(\bmale\b|\bman\b|daniel|alex|fred|oliver|tom|aaron|arthur|gordon|rishi|ralph|evan|nathan|lee|junior|eddy|reed|rocko|grandpa|ryan|thomas|guy|christopher|eric|david|george|mark|william|james|liam|andrew|jamie)/i;

export function guessGender(name: string): Gender | null {
  if (/female/i.test(name)) return "female";
  if (/\bmale\b/i.test(name)) return "male";
  if (FEMALE_HINT.test(name)) return "female";
  if (MALE_HINT.test(name)) return "male";
  return null;
}

export const isRobotic = (name: string) => ROBOTIC.test(name) && !NATURAL.test(name);
export const isNatural = (name: string) => NATURAL.test(name);

/** Natural pitch for a role, given the voice it ended up with. Kept close to 1 so voices don't sound eerie. */
function pitchFor(spec: RoleSpec, voiceName: string | undefined): number {
  const g = voiceName ? guessGender(voiceName) : null;
  const child = voiceName ? CHILD.test(voiceName) : false;
  let p = 1;
  if (spec.age === "child") p = child ? 1.04 : g === "male" ? 1.22 : 1.16; // an adult voice raised a little sounds younger
  else if (spec.age === "older") p = 0.9;
  else if (g && g !== spec.gender) p = spec.gender === "male" ? 0.88 : 1.12; // no voice of the right gender on this device
  p += spec.pitchShift ?? 0;
  return Math.round(Math.min(1.25, Math.max(0.85, p)) * 100) / 100;
}

/** Decide which voice, pitch and speed each role uses on this device. */
export function castVoices(allVoices: VoiceLike[], assistant: Gender, characterVoices = true, variety = false): Record<VoiceRole, Cast> {
  const english = allVoices.filter((v) => v.lang.toLowerCase().startsWith("en") && !NOVELTY.test(v.name));
  // Robotic voices only when asked for variety, or when the device has nothing else.
  const smooth = english.filter((v) => !isRobotic(v.name));
  const pool = variety || !smooth.length ? english : smooth;

  const quality = (v: VoiceLike) => (isNatural(v.name) ? 2 : isRobotic(v.name) ? (variety ? 1 : 0) : 1);
  const preferBonus = (v: VoiceLike, prefer: string[]) => {
    const i = prefer.findIndex((p) => v.name.startsWith(p));
    return i < 0 ? 0 : 12 - Math.min(i, 8);
  };

  // ---- Assistant ----
  const assistantPrefer = assistant === "female" ? FEMALE_ASSISTANT : MALE_ASSISTANT;
  const assistantVoice = [...pool]
    .filter((v) => !CHILD.test(v.name))
    .sort((a, b) => {
      const score = (v: VoiceLike) => (guessGender(v.name) === assistant ? 100 : 0) + quality(v) * 10 + preferBonus(v, assistantPrefer) + (v.lang === "en-GB" ? 2 : 0);
      return score(b) - score(a);
    })[0] ?? pool[0];
  const assistantGenderOk = assistantVoice ? guessGender(assistantVoice.name) === assistant : false;
  const assistantCast: Cast = { voiceName: assistantVoice?.name, pitch: assistantGenderOk ? 1 : assistant === "female" ? 1.12 : 0.88, rate: 1 };
  const result = { assistant: assistantCast, narrator: assistantCast } as Record<VoiceRole, Cast>;

  // ---- Characters ----
  const usedBy = new Map<string, CharacterRole[]>();
  for (const role of Object.keys(SPECS) as CharacterRole[]) {
    const spec = SPECS[role];
    if (!characterVoices) {
      result[role] = assistantCast;
      continue;
    }
    const fits = (v: VoiceLike) => {
      const g = guessGender(v.name);
      if (/^Grand(ma|pa)\b/i.test(v.name) && spec.age !== "older") return -100; // elderly voices only for older characters
      // Children's voices: real child voices, or a female voice raised slightly (sounds more natural than a raised male voice).
      if (spec.age === "child") return CHILD.test(v.name) ? 100 : g === "female" ? 60 : 30;
      if (CHILD.test(v.name)) return -100; // never give an adult a child's voice
      return g === spec.gender ? 100 : 0;
    };
    const score = (v: VoiceLike) => {
      const users = usedBy.get(v.name) ?? [];
      return (
        fits(v) +
        quality(v) * 10 +
        preferBonus(v, spec.prefer) -
        users.length * (variety ? 20 : 6) -
        (users.some((u) => together(u, role)) ? 25 : 0) -
        (v.name === assistantVoice?.name ? 18 : 0) +
        (v.lang === "en-GB" ? 2 : 0)
      );
    };
    const best = [...pool].sort((a, b) => score(b) - score(a))[0];
    if (best) usedBy.set(best.name, [...(usedBy.get(best.name) ?? []), role]);
    const voiceName = best?.name ?? assistantVoice?.name;
    result[role] = { voiceName, pitch: pitchFor(spec, voiceName), rate: spec.rate };
  }
  return result;
}
