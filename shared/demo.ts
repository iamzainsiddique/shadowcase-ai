// DEMO MODE fallbacks (no AI): used by the server when no API key is set, and by the browser in the
// public static demo, which has no server. Every result is labelled mode: "demo" in the UI.
import { ALL_CLUES, findOption } from "./case";
import { TACTIC_EXPLAINERS, type ReportInput, type ReportResult, type RewindResult } from "./types";

const safetyRank = { safe: 0, risky: 1, dangerous: 2 } as const;

export function demoRewind(decisionId: string, originalId: string, alternativeId: string): RewindResult | null {
  const { decision, option: original } = findOption(decisionId, originalId);
  const { option: alternative } = findOption(decisionId, alternativeId);
  if (!decision || !original || !alternative) return null;
  const safer = safetyRank[original.safety] <= safetyRank[alternative.safety] ? original : alternative;
  return {
    saferOptionId: safer.id,
    comparison: `You compared "${original.label}" with "${alternative.label}".`,
    originalPath: original.outcome,
    alternativePath: alternative.outcome,
    whySafer:
      safer.safety === "safe"
        ? "This choice puts Margaret back in control: she contacts the real organisation herself, using details she already trusts."
        : "Neither choice is fully safe, but this one gives the scammer less to work with.",
    keyLesson: "Stop, hang up, and contact your bank yourself using a number you already trust.",
    mode: "demo",
  };
}

export function demoReport(input: ReportInput): ReportResult {
  const missedTactics = [...new Set(ALL_CLUES.filter((c) => !input.cluesFound.includes(c.id)).map((c) => c.tactic))];
  const riskyChoices = input.choices.map((c) => findOption(c.decisionId, c.optionId).option).filter((o) => o && o.safety !== "safe");
  const lessons = [
    ...missedTactics.slice(0, 2).map((t) => `Watch for this next time: ${TACTIC_EXPLAINERS[t]}`),
    ...(riskyChoices.length
      ? ["When a message or caller pressures you, the safest move is to stop and contact the organisation yourself."]
      : ["You chose the safe path every time. Keep using the 'stop and check' habit in real life."]),
    "Talking to someone you trust before moving money is one of the strongest protections there is.",
  ];
  return { lessons, closing: "Every scam you can recognise is one you can stop.", mode: "demo" };
}
