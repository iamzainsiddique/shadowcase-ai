// "Display" panel: Easy Mode, text size, contrast, motion, and Replay Tutorial.
import { useEffect, useRef } from "react";
import { useSettings, type TextSize } from "../settings";
import { setVoicePrefs, speak, speechAvailable } from "../speech";
import { VoiceChoice } from "./VoiceChoice";

function Toggle({ label, description, checked, onChange, disabled }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex min-h-[56px] cursor-pointer items-start justify-between gap-4 rounded-xl border border-ink-600 bg-ink-900 p-4 ${disabled ? "opacity-60" : ""}`}>
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-slate-300">{description}</span>
      </span>
      <input type="checkbox" role="switch" className="mt-1 h-6 w-6 shrink-0 accent-electric-500" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function SettingsPanel({ onClose, onTutorial }: { onClose: () => void; onTutorial: () => void }) {
  const { settings, update, effective } = useSettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4" onClick={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="settings-title" className="my-auto card w-full max-w-lg space-y-4 p-6 focus:outline-none" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 id="settings-title" className="h2">Display & comfort</h2>
          <button className="btn-ghost !min-h-[44px] !px-3" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <Toggle
          label="⭐ Easy Mode"
          description="Biggest text and buttons, strong colours, no animations, and extra step-by-step tips. Recommended if you're new to games or computers."
          checked={settings.easyMode}
          onChange={(v) => update({ easyMode: v })}
        />

        <fieldset className="rounded-xl border border-ink-600 bg-ink-900 p-4" disabled={settings.easyMode}>
          <legend className="px-1 font-semibold">Text size</legend>
          <div className="mt-2 flex gap-2">
            {(["normal", "large", "xl"] as TextSize[]).map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => update({ textSize: s })}
                aria-pressed={effective.textSize === s}
                className={`btn flex-1 ${effective.textSize === s ? "bg-electric-500 text-ink-950" : "border border-ink-600 bg-ink-800"}`}
                style={{ fontSize: `${0.9 + i * 0.2}rem` }}
              >
                {["Normal", "Large", "Largest"][i]}
              </button>
            ))}
          </div>
          {settings.easyMode && <p className="mt-2 text-sm text-slate-300">Easy Mode uses the largest text.</p>}
        </fieldset>

        <Toggle
          label="🔊 Read aloud automatically"
          description="New messages and story lines are read out as soon as they appear. When this is off, press the 🔊 button on any message to hear it."
          checked={settings.autoRead}
          onChange={(v) => update({ autoRead: v })}
        />

        {speechAvailable() && (
          <fieldset className="space-y-3 rounded-xl border border-ink-600 bg-ink-900 p-4">
            <legend className="px-1 font-semibold">Voices</legend>
            <VoiceChoice />
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block font-semibold">🎭 Character voices in the Story Game</span>
                <span className="block text-sm text-slate-300">Each character gets a voice to suit their age: Arthur sounds older and slower, Jamie (the grandson) sounds like a child, the scammers sound different again.</span>
              </span>
              <input type="checkbox" role="switch" aria-label="Character voices in the Story Game" className="mt-1 h-6 w-6 shrink-0 accent-electric-500" checked={settings.characterVoices} onChange={(e) => update({ characterVoices: e.target.checked })} />
            </label>
            {settings.characterVoices && (
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block font-semibold">🎚️ More voice variety</span>
                  <span className="block text-sm text-slate-300">Off (recommended): only smooth, natural-sounding voices. On: also uses older computer voices so more characters sound different, but some sound robotic.</span>
                </span>
                <input type="checkbox" role="switch" aria-label="More voice variety" className="mt-1 h-6 w-6 shrink-0 accent-electric-500" checked={settings.voiceVariety} onChange={(e) => { update({ voiceVariety: e.target.checked }); setVoicePrefs({ assistant: settings.assistantVoice, characterVoices: true, variety: e.target.checked }); }} />
              </label>
            )}
            {settings.characterVoices && (
              <button
                type="button"
                className="btn-ghost !min-h-[44px] !py-2 text-sm"
                onClick={() =>
                  speak([
                    { text: "Grandad? It's me. I'm in a lot of trouble.", role: "caller" },
                    { text: "Who is this, please?", role: "arthur" },
                    { text: "Dad? Jamie's right here with me.", role: "helen" },
                    { text: "Grandad, I'm at home. I'm fine!", role: "jamie" },
                    { text: "Good instinct. Hang up and call a number you already know.", role: "vale" },
                  ])
                }
              >
                ▶ Hear the story voices
              </button>
            )}
            <details className="text-sm text-slate-300">
              <summary className="cursor-pointer font-semibold">Want smoother, more natural voices?</summary>
              <p className="mt-2">The app can only use voices installed on your device. Better ones are free to add:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li><strong>Mac:</strong> System Settings → Accessibility → Spoken Content → System voice → Manage Voices. Add “Enhanced” or “Premium” English voices (for example Serena, Daniel, Jamie, Kate), then reload this page.</li>
                <li><strong>Windows:</strong> the Microsoft Edge browser includes natural voices, including children's voices.</li>
                <li><strong>Chrome:</strong> includes “Google UK English” voices.</li>
              </ul>
            </details>
          </fieldset>
        )}

        <Toggle label="High contrast" description="Brighter text and stronger outlines." checked={effective.highContrast} disabled={settings.easyMode} onChange={(v) => update({ highContrast: v })} />
        <Toggle label="Reduce motion" description="Turns off animations and sliding effects." checked={effective.reduceMotion} disabled={settings.easyMode} onChange={(v) => update({ reduceMotion: v })} />

        <div className="flex flex-wrap gap-3 pt-2">
          <button className="btn-ghost" onClick={onTutorial}>❓ Replay the tutorial</button>
          <button className="btn-primary ml-auto" onClick={onClose}>Done</button>
        </div>
        <p className="text-sm text-slate-400">Settings are saved on this device only.</p>
      </div>
    </div>
  );
}
