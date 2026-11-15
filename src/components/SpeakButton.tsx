// Read-aloud controls. Always available, whether or not "Read aloud automatically" is on.
import { useEffect, useId, useRef, type ReactNode } from "react";
import { pauseSpeaking, resumeSpeaking, speak, speechAvailable, stopSpeaking, useSpeech, type SpeechItem, type VoiceRole } from "../speech";
import { CHARACTERS } from "../../shared/story";

/**
 * Reads one piece of text. `role` picks the voice (a story character, or the assistant by default).
 * Pass the same `id` as the <Readable> showing the text so it lights up while being read.
 * While its text is playing, the button turns into "Stop".
 */
export function SpeakButton({ text, label = "Read aloud", role = "assistant", id }: { text: string; label?: string; role?: VoiceRole; id?: string }) {
  const autoId = useId();
  const itemId = id ?? `say-${autoId}`;
  const { currentId } = useSpeech();
  if (!speechAvailable()) return null;
  const playing = currentId === itemId;
  return (
    <button
      type="button"
      onClick={() => (playing ? stopSpeaking() : speak([{ text, role, id: itemId }]))}
      className={`btn-ghost !min-h-[40px] !px-3 !py-1.5 text-sm ${playing ? "!border-electric-400 !text-electric-400" : ""}`}
      aria-label={playing ? "Stop reading" : `${label}: ${text.slice(0, 60)}`}
    >
      {playing ? "⏹ Stop" : `🔊 ${label}`}
    </button>
  );
}

/**
 * Wraps text that can be read aloud. While the item with this id is being read, it is highlighted
 * (glowing outline + "Reading now" tag) and scrolled into view, so people can follow along.
 */
export function Readable({ id, children, className = "", as: Tag = "div" }: { id: string; children: ReactNode; className?: string; as?: "div" | "li" | "section" }) {
  const { currentId } = useSpeech();
  const active = currentId === id;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 20) {
      const reduce = document.documentElement.dataset.motion === "reduce";
      ref.current.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    }
  }, [active]);
  return (
    <Tag ref={ref as never} className={`reading-target relative ${active ? "is-reading" : ""} ${className}`} aria-current={active ? "true" : undefined}>
      {active && (
        <span className="reading-tag" aria-hidden="true">
          🔊 Reading now
        </span>
      )}
      {children}
    </Tag>
  );
}

/** Who is speaking an item, for the "Now reading" label. */
function speakerName(items: SpeechItem[], id: string | null) {
  const item = items.find((i) => typeof i !== "string" && i.id === id);
  const role = item && typeof item !== "string" ? item.role : undefined;
  if (!role || role === "assistant" || role === "narrator") return "Narrator";
  const c = (CHARACTERS as Record<string, { name: string }>)[role];
  return c ? c.name.replace(/[“”]/g, "").replace(" (you)", "") : "Narrator";
}

/**
 * Play / pause / stop / start-again controls for a whole group of items (e.g. one story scene).
 * Works whether auto-read is on (it's already playing) or off (press ▶ to start).
 */
export function ReadingBar({ items, queueId, label = "this scene" }: { items: SpeechItem[]; queueId: string; label?: string }) {
  const { status, queueId: playingQueue, currentId } = useSpeech();
  if (!speechAvailable()) return null;
  const mine = playingQueue === queueId && status !== "idle";
  const start = () => speak(items, { queueId });
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-600 bg-ink-900/80 p-2" role="group" aria-label={`Read ${label} aloud`}>
      {!mine && (
        <button type="button" className="btn-primary !min-h-[44px] !py-2" onClick={start}>
          ▶ Read {label} aloud
        </button>
      )}
      {mine && status === "speaking" && (
        <button type="button" className="btn-ghost !min-h-[44px] !py-2" onClick={pauseSpeaking}>
          ⏸ Pause
        </button>
      )}
      {mine && status === "paused" && (
        <button type="button" className="btn-primary !min-h-[44px] !py-2" onClick={resumeSpeaking}>
          ▶ Resume
        </button>
      )}
      {mine && (
        <>
          <button type="button" className="btn-ghost !min-h-[44px] !py-2" onClick={stopSpeaking}>
            ⏹ Stop
          </button>
          <button type="button" className="btn-ghost !min-h-[44px] !py-2" onClick={start}>
            ⏮ Start again
          </button>
          <span className="px-2 text-sm text-electric-400" aria-live="polite">
            {status === "paused" ? "Paused" : `Now reading: ${speakerName(items, currentId)}`}
          </span>
        </>
      )}
    </div>
  );
}

/** Floating controls shown while anything is being read aloud. */
export function StopReadingButton() {
  const { status } = useSpeech();
  if (status === "idle") return null;
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex gap-2">
      {status === "speaking" ? (
        <button type="button" onClick={pauseSpeaking} className="btn-ghost bg-ink-900 shadow-2xl" aria-label="Pause reading aloud">
          ⏸ Pause
        </button>
      ) : (
        <button type="button" onClick={resumeSpeaking} className="btn-ghost bg-ink-900 shadow-2xl" aria-label="Resume reading aloud">
          ▶ Resume
        </button>
      )}
      <button type="button" onClick={stopSpeaking} className="btn-primary shadow-2xl" aria-label="Stop reading aloud">
        ⏹ Stop reading
      </button>
    </div>
  );
}
