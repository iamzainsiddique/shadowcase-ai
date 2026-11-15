// Home = mode selection. Two clear choices: Story Game (no AI) or AI Detective.
import { EasyHint } from "../components/ui";
import { HelpCard } from "../components/HelpCard";
import { SCENARIOS } from "../../shared/story";

interface Props {
  onStory: () => void;
  onSurprise: () => void;
  onQuiz: () => void;
  onDetective: (tab: "case" | "scanner") => void;
  onTutorial: () => void;
}

export function Home({ onStory, onSurprise, onQuiz, onDetective, onTutorial }: Props) {
  return (
    <div className="space-y-12 animate-rise">
      <section className="space-y-5 text-center">
        <p className="eyebrow">Financial scam awareness</p>
        <h1 className="h1 mx-auto max-w-3xl">
          Think like a detective.{" "}
          <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">Expose the scam. Change the outcome.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-300">
          Practise spotting scams in a safe, made-up world. Make choices, see what <em>could</em> happen, and rewind to learn the safer path before it happens in real life.
        </p>
        <EasyHint>Pick one of the two big boxes below to begin. If you're not sure, choose the Story Game.</EasyHint>
      </section>

      <section aria-labelledby="choose" className="space-y-4">
        <h2 id="choose" className="sr-only">Choose how to play</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <ModeCard
            icon="🎭"
            badge="No AI needed · Best for first-timers"
            title="Story Game"
            subtitle="Live the scam from different sides"
            points={[`${SCENARIOS.length} scams: ${SCENARIOS.map((s) => s.icon).join(" ")} phone, bank, parcel text, romance, investment`, "Play as the person targeted, their family or the bank", "Different details every time, rewind any choice"]}
            cta="Play the Story Game"
            onClick={onStory}
            accent="from-electric-500 to-electric-400"
          />
          <ModeCard
            icon="🤖"
            badge="Uses AI · For deeper analysis"
            title="AI Detective"
            subtitle="Investigate with AI"
            points={["AI-assisted case investigation", "Practise with the message scanner (demo)", "AI compares your rewound decisions"]}
            cta="Open AI Detective"
            onClick={() => onDetective("case")}
            accent="from-violet-500 to-violet-400"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn-ghost" onClick={onSurprise}>🎲 Surprise me with a scam</button>
          <button className="btn-ghost" onClick={onQuiz}>🧠 1-minute scam check</button>
          <button className="btn-ghost" onClick={() => onDetective("scanner")}>🔎 Try the message scanner (demo)</button>
          <button className="btn-ghost" onClick={onTutorial}>❓ Show me how it works</button>
        </div>
      </section>

      <HelpCard />

      <section className="card grid gap-4 p-6 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">Built for everyone</p>
          <p className="text-slate-300">Turn on <strong>Easy Mode</strong> in “Display” at the top for bigger text and buttons, stronger colours and no animations.</p>
        </div>
        <div>
          <p className="font-display text-lg font-bold">Honest about AI</p>
          <p className="text-slate-300">In AI Detective, a badge always shows whether you're seeing live AI or demo content. Outcomes are possibilities, not predictions.</p>
        </div>
        <div>
          <p className="font-display text-lg font-bold">Never asks for secrets</p>
          <p className="text-slate-300">We never ask for passwords, PINs or codes. Remove personal details before scanning a message.</p>
        </div>
      </section>
    </div>
  );
}

function ModeCard(p: { icon: string; badge: string; title: string; subtitle: string; points: string[]; cta: string; onClick: () => void; accent: string }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden p-6 transition hover:border-electric-400">
      <div className={`decorative absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${p.accent} opacity-20 blur-3xl`} />
      <div className="text-5xl" aria-hidden>{p.icon}</div>
      <p className="mt-3 text-sm font-semibold text-electric-400">{p.badge}</p>
      <h3 className="font-display text-3xl font-bold">{p.title}</h3>
      <p className="text-lg text-slate-300">{p.subtitle}</p>
      <ul className="mt-4 flex-1 space-y-2 text-lg">
        {p.points.map((pt) => (
          <li key={pt}>✓ {pt}</li>
        ))}
      </ul>
      <button className="btn-primary mt-6 w-full text-lg" onClick={p.onClick}>{p.cta} →</button>
    </article>
  );
}
