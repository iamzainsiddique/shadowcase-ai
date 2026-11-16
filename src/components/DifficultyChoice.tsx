// Story Game difficulty: how much help you get while playing.
import { useSettings, type Difficulty } from "../settings";

export const DIFFICULTY: Record<Difficulty, { label: string; icon: string; what: string }> = {
  easy: { label: "Easy", icon: "🟢", what: "Hints tell you how many suspicious phrases each scene has, and Inspector Vale explains every choice." },
  medium: { label: "Medium", icon: "🟡", what: "Inspector Vale explains every choice. No hints about clues." },
  hard: { label: "Hard", icon: "🔴", what: "No hints, answers in a random order, and no feedback until the end, just like real life." },
};

export function DifficultyChoice() {
  const { settings, update } = useSettings();
  const d = settings.difficulty ?? "medium";
  return (
    <div>
      <div role="radiogroup" aria-label="Difficulty" className="flex flex-wrap gap-2">
        {(["easy", "medium", "hard"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={d === k}
            onClick={() => update({ difficulty: k })}
            className={`btn !min-h-[48px] !px-4 !py-2 ${d === k ? "bg-electric-500 text-ink-950" : "border border-ink-600 bg-ink-800"}`}
          >
            {DIFFICULTY[k].icon} {DIFFICULTY[k].label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-300">{DIFFICULTY[d].what}</p>
    </div>
  );
}
