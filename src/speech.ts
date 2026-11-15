// Read-aloud helpers using the browser's built-in voices (nothing leaves the device).
//
// speak() reads a list of items one after another. Each item can carry an `id`; while that item is
// being read, components showing it can highlight themselves (see <Readable> and useSpeech()).
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { useSettings } from "./settings";
import { castVoices, type Cast, type Gender, type VoiceRole } from "./voices";

export type { VoiceRole } from "./voices";

export const speechAvailable = () => typeof window !== "undefined" && "speechSynthesis" in window;

/** Something to read: plain text (assistant voice) or text with a character voice and/or an id to highlight. */
export type SpeechItem = string | { text: string; role?: VoiceRole; id?: string };

// ---- Voice preferences (kept in sync with Settings by SettingsProvider) ----
export interface VoicePrefs {
  assistant: Gender;
  characterVoices: boolean;
  /** Also use robotic-sounding voices so more characters sound different. */
  variety: boolean;
}
let prefs: VoicePrefs = { assistant: "female", characterVoices: true, variety: false };
let cast: Record<VoiceRole, Cast> | null = null;

export function setVoicePrefs(next: VoicePrefs) {
  prefs = next;
  cast = null; // recast with the new preferences
}

function getCast() {
  if (!cast && speechAvailable()) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) cast = castVoices(voices, prefs.assistant, prefs.characterVoices, prefs.variety);
  }
  return cast;
}

// Browsers load voices asynchronously; recast once they arrive.
if (speechAvailable()) {
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    cast = null;
  });
}

/** Which voice each role is using right now (for the settings screen and tests). */
export function describeCast(): Partial<Record<VoiceRole, Cast>> {
  return getCast() ?? {};
}

// ---- Playback state (a tiny store so React components can follow along) ----
export interface SpeechState {
  status: "idle" | "speaking" | "paused";
  /** id of the item being read right now (if it has one). */
  currentId: string | null;
  /** Which group of items is playing, e.g. one story scene. */
  queueId: string | null;
}
let state: SpeechState = { status: "idle", currentId: null, queueId: null };
const listeners = new Set<() => void>();
function setState(next: Partial<SpeechState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Follow what is being read: status, current item id and queue id. */
export function useSpeech(): SpeechState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Bumped by every speak()/stop so events from cancelled utterances are ignored. */
let generation = 0;
let watchdog: number | undefined;

/** Stop anything being read, then read these items one after another, each in its own voice. */
export function speak(items: SpeechItem[], opts: { queueId?: string } = {}) {
  if (!speechAvailable()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const gen = ++generation;
  const c = getCast();
  const voices = synth.getVoices();
  const list = items
    .map((item) => (typeof item === "string" ? { text: item, role: "assistant" as VoiceRole, id: undefined } : { role: "assistant" as VoiceRole, ...item }))
    .filter((i) => i.text.trim());
  if (!list.length) return setState({ status: "idle", currentId: null, queueId: null });

  setState({ status: "speaking", currentId: list[0].id ?? null, queueId: opts.queueId ?? null });
  list.forEach((item, index) => {
    const u = new SpeechSynthesisUtterance(item.text.trim());
    const castForRole = c?.[item.role];
    if (castForRole) {
      const voice = voices.find((v) => v.name === castForRole.voiceName);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      }
      u.pitch = castForRole.pitch;
      u.rate = castForRole.rate;
    }
    u.onstart = () => {
      if (gen === generation) setState({ currentId: item.id ?? null, status: synth.paused ? "paused" : "speaking" });
    };
    const finished = () => {
      if (gen === generation && index === list.length - 1) setState({ status: "idle", currentId: null, queueId: null });
    };
    u.onend = finished;
    u.onerror = finished;
    synth.speak(u);
  });

  // Safety net: some browsers don't always fire onend (e.g. after cancel/pause quirks).
  window.clearInterval(watchdog);
  watchdog = window.setInterval(() => {
    if (gen !== generation) return window.clearInterval(watchdog);
    if (state.status === "speaking" && !synth.speaking && !synth.pending) {
      window.clearInterval(watchdog);
      setState({ status: "idle", currentId: null, queueId: null });
    }
  }, 1000);
}

export function pauseSpeaking() {
  if (!speechAvailable() || state.status !== "speaking") return;
  window.speechSynthesis.pause();
  setState({ status: "paused" });
}

export function resumeSpeaking() {
  if (!speechAvailable() || state.status !== "paused") return;
  window.speechSynthesis.resume();
  setState({ status: "speaking" });
}

export function stopSpeaking() {
  if (!speechAvailable()) return;
  generation++;
  window.speechSynthesis.cancel();
  // Some browsers stay "paused" after cancel; resume clears that so the next speak() works.
  window.speechSynthesis.resume();
  setState({ status: "idle", currentId: null, queueId: null });
}

/** False for screens that are mounted but hidden (e.g. the mode you're not using), so they never talk. */
export const VisibleContext = createContext(true);

/**
 * Runs whenever new content appears (the `key` changes, or the screen becomes visible):
 * - "Read aloud automatically" on: reads `items` (which also cuts off whatever was being read before);
 * - off: stops anything still being read from the previous screen, so it never carries on after
 *   the player presses Continue or picks an option. People then use the 🔊 / ▶ buttons.
 */
export function useAutoRead(items: SpeechItem[], key: string, active = true, queueId?: string) {
  const { settings } = useSettings();
  const visible = useContext(VisibleContext);
  const on = active && visible;
  const prev = useRef<{ key: string; on: boolean; auto: boolean } | null>(null);
  useEffect(() => {
    const p = prev.current;
    prev.current = { key, on, auto: settings.autoRead };
    if (!on) return;
    const newContent = !p || !p.on || p.key !== key;
    const autoJustTurnedOn = !!p && !p.auto && settings.autoRead;
    if (settings.autoRead && (newContent || autoJustTurnedOn)) speak(items, { queueId: queueId ?? key });
    else if (newContent) stopSpeaking();
    // Only re-run when the content key changes (or the screen becomes visible), not on every render.
  }, [key, settings.autoRead, on]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** True while the browser is reading (or has paused) something. */
export function useIsSpeaking() {
  return useSpeech().status !== "idle";
}
