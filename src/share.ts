// Share links and simple progress, stored only in this browser. A share link contains only the
// scenario and perspective (e.g. #play=parcel:parcel_family), never any personal data or answers.
import { SCENARIOS, STORIES } from "../shared/story";

/** "tricks" = the "How the trick works" walkthrough; otherwise a story id. */
export interface PlayRequest {
  scenarioId: string;
  view: string;
}

export function shareUrl(r: PlayRequest) {
  return `${location.origin}${location.pathname}#play=${r.scenarioId}:${r.view}`;
}

export function readPlayHash(hash = typeof location !== "undefined" ? location.hash : ""): PlayRequest | null {
  const m = /^#play=([\w-]+):([\w-]+)$/.exec(hash);
  if (!m) return null;
  const [, scenarioId, view] = m;
  if (!SCENARIOS.some((s) => s.id === scenarioId)) return null;
  if (view !== "tricks" && STORIES[view]?.scenarioId !== scenarioId) return null;
  return { scenarioId, view };
}

const PLAYED = "shadowcase.played";
const LAST = "shadowcase.lastScenario";

export function getPlayed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PLAYED) ?? "[]");
  } catch {
    return [];
  }
}
export function markPlayed(id: string) {
  try {
    const p = getPlayed();
    if (!p.includes(id)) localStorage.setItem(PLAYED, JSON.stringify([...p, id]));
  } catch {}
}
export function getLastScenario(): string | null {
  try {
    return localStorage.getItem(LAST);
  } catch {
    return null;
  }
}
export function setLastScenario(id: string) {
  try {
    localStorage.setItem(LAST, id);
  } catch {}
}

/** "Surprise me": a random scenario (not the one played last) and a random perspective in it. */
export function surprise(random = Math.random): PlayRequest {
  const last = getLastScenario();
  const pool = SCENARIOS.filter((s) => s.id !== last);
  const scenario = pool[Math.floor(random() * pool.length)] ?? SCENARIOS[0];
  const views = [...scenario.stories, "tricks"];
  return { scenarioId: scenario.id, view: views[Math.floor(random() * views.length)] };
}
