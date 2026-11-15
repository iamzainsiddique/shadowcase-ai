// "Female / Male assistant voice" picker, used in the tutorial and the Display panel.
import { useSettings } from "../settings";
import { setVoicePrefs, speak } from "../speech";

export function VoiceChoice() {
  const { settings, update } = useSettings();
  const choose = (v: "female" | "male") => {
    update({ assistantVoice: v });
    // Apply immediately so the preview uses the new voice.
    setVoicePrefs({ assistant: v, characterVoices: settings.characterVoices, variety: settings.voiceVariety });
    speak([`Hello, I'm your ${v} assistant voice. I'll read the tutorial, the AI Detective and your reports.`]);
  };
  return (
    <div role="radiogroup" aria-label="Assistant voice">
      <p className="mb-2 font-semibold">🗣️ Assistant voice</p>
      <p className="mb-2 text-sm text-slate-300">Reads the tutorial, AI Detective, scan results, reports and story narration. Tap one to hear it.</p>
      <div className="flex gap-2">
        {(["female", "male"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={settings.assistantVoice === v}
            onClick={() => choose(v)}
            className={`btn flex-1 ${settings.assistantVoice === v ? "bg-electric-500 text-ink-950" : "border border-ink-600 bg-ink-800"}`}
          >
            {v === "female" ? "👩 Female" : "👨 Male"}
          </button>
        ))}
      </div>
    </div>
  );
}
