// Choose a scam scenario and whose eyes to see it through, or let "Surprise me" pick.
import { SCENARIOS, STORIES, type PerspectiveKind } from "../../shared/story";
import { SceneArt } from "../components/SceneArt";
import { EasyHint } from "../components/ui";
import { getPlayed, surprise, type PlayRequest } from "../share";

export const PERSPECTIVE_ICON: Record<PerspectiveKind | "tricks", string> = { victim: "👤", family: "👪", bank: "🏦", tricks: "🔍" };
export const PERSPECTIVE_NAME: Record<PerspectiveKind | "tricks", string> = {
  victim: "The person targeted",
  family: "Family or friend",
  bank: "Bank adviser",
  tricks: "How the trick works",
};

export function ScenarioPicker({ onPick }: { onPick: (r: PlayRequest) => void }) {
  const played = getPlayed();
  return (
    <section className="space-y-6 animate-rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Story Game · {SCENARIOS.length} scams, many viewpoints</p>
          <h1 className="h1">Choose a scam to investigate</h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-300">
            Live each scam as the person targeted, or as the family member, friend or bank adviser trying to help. Details like amounts and names change every time you play.
          </p>
        </div>
        <button className="btn-primary text-lg" onClick={() => onPick(surprise())}>🎲 Surprise me</button>
      </div>
      <EasyHint>Not sure? Press “Surprise me”, or start with The Midnight Call as the person targeted.</EasyHint>

      <div className="grid gap-5 md:grid-cols-2">
        {SCENARIOS.map((sc) => (
          <article key={sc.id} className="card flex flex-col overflow-hidden">
            <div className="pointer-events-none">
              <SceneArt art={sc.art} vars={sc.variants[0]} />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div>
                <p className="text-sm font-semibold text-electric-400">{sc.icon} {sc.scamType}</p>
                <h2 className="font-display text-2xl font-bold">{sc.title}</h2>
                <p className="text-slate-300">{sc.tagline}</p>
              </div>
              <div className="mt-auto grid gap-2" role="group" aria-label={`Ways to play ${sc.title}`}>
                {sc.stories.map((id) => {
                  const st = STORIES[id];
                  return (
                    <button key={id} className="btn-ghost w-full !justify-start text-left" onClick={() => onPick({ scenarioId: sc.id, view: id })}>
                      <span aria-hidden>{PERSPECTIVE_ICON[st.perspective]}</span>
                      <span className="flex-1">
                        <span className="block font-semibold">Play as {st.label.split(",")[0]}</span>
                        <span className="block text-sm text-slate-400">{PERSPECTIVE_NAME[st.perspective]}</span>
                      </span>
                      {played.includes(id) && <span className="chip border border-safe/40 text-safe">✓ Played</span>}
                    </button>
                  );
                })}
                <button className="btn-ghost w-full !justify-start text-left" onClick={() => onPick({ scenarioId: sc.id, view: "tricks" })}>
                  <span aria-hidden>🔍</span>
                  <span className="flex-1">
                    <span className="block font-semibold">How the trick works</span>
                    <span className="block text-sm text-slate-400">See the scammer's script, and how to beat each step</span>
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
