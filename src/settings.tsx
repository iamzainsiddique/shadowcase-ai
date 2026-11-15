// Display & accessibility settings, shared through React context and remembered in this browser.
// Easy Mode is a one-tap bundle: biggest text, high contrast, no animation, extra plain-language hints.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setVoicePrefs } from "./speech";

export type TextSize = "normal" | "large" | "xl";

export interface Settings {
  textSize: TextSize;
  easyMode: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  /** Read new messages aloud automatically when they appear. */
  autoRead: boolean;
  /** Voice for the assistant: tutorial, AI Detective, scanner, reports and story narration. */
  assistantVoice: "female" | "male";
  /** Give each story character their own voice (age and gender appropriate). */
  characterVoices: boolean;
  /** Also use older, robotic-sounding voices so more characters sound different. Off = natural voices only. */
  voiceVariety: boolean;
}

const DEFAULTS: Settings = { textSize: "normal", easyMode: false, highContrast: false, reduceMotion: false, autoRead: false, assistantVoice: "female", characterVoices: true, voiceVariety: false };
const KEY = "shadowcase.settings";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  /** What is actually applied (Easy Mode switches the other options on). */
  effective: Settings;
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  const effective: Settings = settings.easyMode
    ? { ...settings, textSize: "xl", highContrast: true, reduceMotion: true }
    : settings;

  useEffect(() => {
    setVoicePrefs({ assistant: settings.assistantVoice, characterVoices: settings.characterVoices, variety: settings.voiceVariety });
  }, [settings.assistantVoice, settings.characterVoices, settings.voiceVariety]);

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.size = effective.textSize;
    html.dataset.easy = String(effective.easyMode);
    html.dataset.contrast = effective.highContrast ? "high" : "normal";
    html.dataset.motion = effective.reduceMotion ? "reduce" : "normal";
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {}
  }, [settings, effective.textSize, effective.easyMode, effective.highContrast, effective.reduceMotion]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  return <SettingsContext.Provider value={{ settings, update, effective }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
