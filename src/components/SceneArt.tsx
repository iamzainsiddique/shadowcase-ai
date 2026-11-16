// Illustrated, gently animated scenes for the Story Game (inline SVG, no image files needed).
// Animations use the .anim-* classes in index.css and switch off with Reduce Motion / Easy View.
import type { SceneArtId } from "../../shared/story";

const W = 800;
const H = 320;

function Frame({ id, label, children, tint = "#2fa8ff" }: { id: string; label: string; children: React.ReactNode; tint?: string }) {
  return (
    <figure className="scene-art overflow-hidden rounded-2xl border border-ink-600 shadow-xl shadow-black/40">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block h-auto w-full">
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1222" />
            <stop offset="1" stopColor="#1a2540" />
          </linearGradient>
          <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={tint} stopOpacity="0.55" />
            <stop offset="1" stopColor={tint} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${id}-bg)`} />
        {children}
        {/* film-grain vignette for a cinematic feel */}
        <rect width={W} height={H} fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="40" />
      </svg>
    </figure>
  );
}

/** Old-style landline phone, ringing when `ringing` is true. */
function Landline({ x, y, ringing = false, color = "#ff7a8a" }: { x: number; y: number; ringing?: boolean; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {ringing && (
        <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round">
          <path className="anim-pulse" d="M-30 -40 q-14 18 0 36" />
          <path className="anim-pulse delay-1" d="M-46 -52 q-22 30 0 60" />
          <path className="anim-pulse" d="M90 -40 q14 18 0 36" />
          <path className="anim-pulse delay-1" d="M106 -52 q22 30 0 60" />
        </g>
      )}
      <g className={ringing ? "anim-ring" : ""}>
        <rect x="-10" y="0" width="80" height="44" rx="12" fill={color} />
        <rect x="-18" y="-18" width="96" height="22" rx="11" fill={color} />
        <circle cx="30" cy="24" r="12" fill="#0b1222" opacity="0.5" />
      </g>
    </g>
  );
}

function Clock({ x, y, r = 34, minute = 47, hour = 9 }: { x: number; y: number; r?: number; minute?: number; hour?: number }) {
  const mAng = (minute / 60) * 360;
  const hAng = ((hour % 12) / 12) * 360 + minute / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#111a2e" stroke="#5cc8ff" strokeWidth="4" />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1="0" y1={-r + 6} x2="0" y2={-r + 12} stroke="#5cc8ff" strokeWidth="3" transform={`rotate(${a})`} />
      ))}
      <line x1="0" y1="0" x2="0" y2={-r * 0.5} stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hAng})`} />
      <g className="anim-tick">
        {/* invisible circle centres the rotation on the clock face */}
        <circle r={r} fill="none" />
        <line x1="0" y1="0" x2="0" y2={-r * 0.8} stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" transform={`rotate(${mAng})`} />
      </g>
      <circle r="4" fill="#ff7a8a" />
    </g>
  );
}

function NightWindow({ x, y, w = 200, h = 150, rain = false }: { x: number; y: number; w?: number; h?: number; rain?: boolean }) {
  const clipId = `win-${x}-${y}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={clipId}>
        <rect width={w} height={h} rx="8" />
      </clipPath>
      <rect width={w} height={h} rx="8" fill="#070b16" stroke="#26324f" strokeWidth="8" />
      <circle cx={w * 0.72} cy={h * 0.3} r="18" fill="#e2e8f0" opacity="0.9" />
      {[[0.2, 0.25], [0.4, 0.15], [0.3, 0.55], [0.85, 0.7], [0.55, 0.4]].map(([a, b], i) => (
        <circle key={i} className="anim-twinkle" style={{ animationDelay: `${i * 0.6}s` }} cx={w * a} cy={h * b} r="2.5" fill="#fff" />
      ))}
      {rain && (
        <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} className="anim-rain" style={{ animationDelay: `${(i % 7) * 0.18}s` }} x1={10 + i * 13} y1="-10" x2={4 + i * 13} y2="12" stroke="#5cc8ff" strokeOpacity="0.6" strokeWidth="2" />
        ))}
        </g>
      )}
      <line x1={w / 2} y1="0" x2={w / 2} y2={h} stroke="#26324f" strokeWidth="6" />
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#26324f" strokeWidth="6" />
    </g>
  );
}

/** Simple silhouette of Arthur (grey hair, glasses, blue cardigan). */
function ArthurFigure({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-55 120 q0 -70 55 -70 q55 0 55 70 z" fill="#1b86e0" />
      <path d="M-12 52 l12 26 l12 -26" fill="#e2e8f0" />
      <circle cx="0" cy="18" r="34" fill="#f1c9a5" />
      <path d="M-34 14 q2 -30 34 -32 q32 2 34 32 q-6 -14 -14 -16 q-20 8 -40 0 q-8 2 -14 16z" fill="#cbd5e1" />
      <g fill="none" stroke="#0b1222" strokeWidth="3">
        <circle cx="-12" cy="20" r="8" />
        <circle cx="12" cy="20" r="8" />
        <line x1="-4" y1="20" x2="4" y2="20" />
      </g>
      <path d="M-8 38 q8 5 16 0" stroke="#0b1222" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function ShadowCaller({ x, y, label = "?" }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="anim-float">
      <circle r="78" fill="#ff7a8a" opacity="0.12" />
      <path d="M-48 70 q0 -52 48 -52 q48 0 48 52 z" fill="#2a1420" />
      <circle cx="0" cy="-12" r="30" fill="#2a1420" />
      <text x="0" y="0" textAnchor="middle" fontSize="38" fontWeight="700" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">
        {label}
      </text>
      </g>
    </g>
  );
}

function SoundBars({ x, y, color = "#ff7a8a" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={color}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} className="anim-bar" style={{ animationDelay: `${i * 0.12}s` }} x={i * 18} y="-30" width="10" height="60" rx="5" />
      ))}
    </g>
  );
}

function GiftCard({ x, y, r = 0, color = "#9a7bff" }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-50" y="-32" width="100" height="64" rx="8" fill={color} />
      <rect x="-50" y="-14" width="100" height="10" fill="#0b1222" opacity="0.35" />
      <text x="0" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0b1222" fontFamily="Inter, sans-serif">£500</text>
    </g>
  );
}

function Phone({ x, y, scale = 1, children }: { x: number; y: number; scale?: number; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-80" y="-140" width="160" height="290" rx="24" fill="#0b1222" stroke="#5cc8ff" strokeWidth="5" />
      <rect x="-30" y="-130" width="60" height="8" rx="4" fill="#26324f" />
      {children}
    </g>
  );
}

/** A generic person, used in scenes shared by several stories. */
function Person({ x, y, s = 1, skin = "#e8b48f", hair = "#3b2a20", top = "#2fa86f", long = false }: { x: number; y: number; s?: number; skin?: string; hair?: string; top?: string; long?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {long && <path d="M-36 10 q-6 60 10 80 h52 q16 -20 10 -80 z" fill={hair} />}
      <path d="M-55 120 q0 -70 55 -70 q55 0 55 70 z" fill={top} />
      <circle cx="0" cy="18" r="34" fill={skin} />
      <path d="M-34 16 q-2 -36 34 -36 q36 0 34 36 q-8 -20 -34 -22 q-26 2 -34 22z" fill={hair} />
      <circle cx="-11" cy="20" r="3.5" fill="#0b1222" />
      <circle cx="11" cy="20" r="3.5" fill="#0b1222" />
      <path d="M-8 36 q8 5 16 0" stroke="#0b1222" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Laptop({ x, y, children }: { x: number; y: number; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-150" y="-110" width="300" height="190" rx="12" fill="#0b1222" stroke="#5cc8ff" strokeWidth="5" />
      <path d="M-185 80 h370 l-20 22 h-330 z" fill="#26324f" />
      {children}
    </g>
  );
}

function Heart({ x, y, s = 1, color = "#ff7a8a" }: { x: number; y: number; s?: number; color?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 18 C-30 -6 -18 -30 0 -14 C18 -30 30 -6 0 18 Z" fill={color} />;
}

type Vars = Record<string, string>;

const scenes: Record<SceneArtId, (v: Vars) => JSX.Element> = {
  living_room: () => (
    <Frame id="lr" label="A living room at night. The landline on the side table is ringing.">
      <NightWindow x={500} y={26} w={220} h={130} />
      {/* TV with flickering glow */}
      <rect x="70" y="90" width="190" height="120" rx="10" fill="#111a2e" stroke="#26324f" strokeWidth="6" />
      <rect className="anim-flicker" x="80" y="100" width="170" height="100" rx="4" fill="#2fa8ff" opacity="0.35" />
      <rect x="150" y="210" width="30" height="30" fill="#26324f" />
      {/* armchair + Arthur */}
      <rect x="290" y="210" width="190" height="90" rx="26" fill="#7c5cf0" opacity="0.55" />
      <ArthurFigure x={385} y={150} s={0.95} />
      {/* side table + ringing phone */}
      <rect x="560" y="250" width="150" height="14" rx="6" fill="#26324f" />
      <rect x="625" y="264" width="20" height="40" fill="#26324f" />
      <Landline x={600} y={212} ringing />
      <text x="40" y="300" fontSize="20" fill="#5cc8ff" fontFamily="Space Grotesk, sans-serif">21:47</text>
    </Frame>
  ),
  phone_call: () => (
    <Frame id="pc" label="An unknown voice on the phone. The caller is a dark silhouette with a question mark." tint="#ff7a8a">
      <circle cx="200" cy="170" r="140" fill="url(#pc-glow)" />
      <ArthurFigure x={190} y={140} s={1.05} />
      <SoundBars x={330} y={165} />
      <ShadowCaller x={590} y={150} />
      <text x="590" y="290" textAnchor="middle" fontSize="20" fill="#ff7a8a" fontFamily="Inter, sans-serif">“It's me…”</text>
    </Frame>
  ),
  phone_tension: (v) => (
    <Frame id="pt" label="Pressure builds: a ticking clock and a demand for money." tint="#ffd166">
      <circle cx="400" cy="160" r="160" fill="url(#pt-glow)" />
      <ArthurFigure x={170} y={140} s={1} />
      <Clock x={400} y={150} r={70} hour={9} minute={50} />
      <g className="anim-float">
        <text x="620" y="150" textAnchor="middle" fontSize="56" fontWeight="700" fill="#ffd166" fontFamily="Space Grotesk, sans-serif">{v.amount ?? v.savings ?? "£1,500"}</text>
        <text x="620" y="190" textAnchor="middle" fontSize="20" fill="#ffd166" fontFamily="Inter, sans-serif">“tonight!”</text>
      </g>
      <text x="400" y="270" textAnchor="middle" fontSize="18" fill="#cbd5e1" fontFamily="Inter, sans-serif">Tick… tock…</text>
    </Frame>
  ),
  text_message: () => (
    <Frame id="tm" label="A text message from 'Mr Grant' asking for gift cards, with three £500 gift cards fanned out." tint="#9a7bff">
      <circle cx="400" cy="160" r="170" fill="url(#tm-glow)" />
      <Phone x={300} y={160} scale={0.92}>
        <g className="anim-pop">
          <rect x="-66" y="-90" width="132" height="86" rx="14" fill="#26324f" />
          <rect x="-54" y="-74" width="100" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-58" width="84" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-42" width="94" height="8" rx="4" fill="#ff7a8a" />
          <rect x="-54" y="-26" width="60" height="8" rx="4" fill="#cbd5e1" />
        </g>
        <circle className="anim-pulse" cx="62" cy="-118" r="12" fill="#ff7a8a" />
      </Phone>
      <GiftCard x={540} y={140} r={-14} color="#2fa8ff" />
      <GiftCard x={580} y={160} r={0} color="#9a7bff" />
      <GiftCard x={620} y={180} r={14} color="#5fe3a1" />
      <text x="580" y="270" textAnchor="middle" fontSize="20" fill="#ff7a8a" fontFamily="Inter, sans-serif">“Text ALL codes”</text>
    </Frame>
  ),
  supermarket: () => (
    <Frame id="sm" label="A late-night supermarket checkout with three gift cards on the counter. Priya, the neighbour, spots Arthur.">
      {[60, 220, 380].map((x) => (
        <g key={x}>
          <rect x={x} y="40" width="140" height="150" fill="#111a2e" stroke="#26324f" strokeWidth="4" />
          {[70, 110, 150].map((y) => (
            <g key={y}>
              <line x1={x} y1={y} x2={x + 140} y2={y} stroke="#26324f" strokeWidth="4" />
              {[12, 44, 76, 108].map((dx, i) => (
                <rect key={dx} x={x + dx} y={y - 24} width="22" height="22" rx="3" fill={["#2fa8ff", "#9a7bff", "#5fe3a1", "#ffd166"][(i + y) % 4]} opacity="0.6" />
              ))}
            </g>
          ))}
        </g>
      ))}
      {[120, 330, 540, 700].map((x, i) => (
        <rect key={x} className="anim-flicker" style={{ animationDelay: `${i * 0.7}s` }} x={x} y="14" width="70" height="8" rx="4" fill="#e2e8f0" opacity="0.7" />
      ))}
      <rect x="60" y="230" width="460" height="60" rx="8" fill="#26324f" />
      <GiftCard x={200} y={232} r={-6} />
      <GiftCard x={300} y={232} r={4} color="#2fa8ff" />
      <GiftCard x={400} y={232} r={-2} color="#5fe3a1" />
      {/* Priya waving */}
      <g transform="translate(650 150)">
        <path d="M-50 140 q0 -70 50 -70 q50 0 50 70 z" fill="#7c5cf0" />
        <circle cx="0" cy="30" r="32" fill="#c68b62" />
        <path d="M-34 34 q-4 -44 34 -44 q38 0 34 44 q-6 -26 -34 -28 q-28 2 -34 28z" fill="#1f1530" />
        <path d="M-34 34 q-10 60 4 90 M34 34 q10 60 -4 90" stroke="#1f1530" strokeWidth="10" fill="none" />
        <g className="anim-wave">
          <path d="M46 90 l26 -50" stroke="#c68b62" strokeWidth="14" strokeLinecap="round" />
        </g>
        <text x="0" y="-26" textAnchor="middle" fontSize="22" fill="#5fe3a1" fontFamily="Inter, sans-serif" className="anim-pop">“Arthur?”</text>
      </g>
      <text x="40" y="30" fontSize="18" fill="#5cc8ff" fontFamily="Space Grotesk, sans-serif">22:20</text>
    </Frame>
  ),
  bank_call: () => (
    <Frame id="bk" label="The bank's fraud team, shown as a bank building with a glowing shield and a tick." tint="#9a7bff">
      <circle cx="400" cy="150" r="170" fill="url(#bk-glow)" />
      <path d="M260 110 L400 50 L540 110 Z" fill="#9a7bff" />
      <rect x="270" y="110" width="260" height="14" fill="#7c5cf0" />
      {[290, 345, 400, 455, 510].map((x) => (
        <rect key={x} x={x - 12} y="124" width="24" height="120" fill="#b69bff" />
      ))}
      <rect x="250" y="244" width="300" height="22" rx="4" fill="#7c5cf0" />
      <g className="anim-glow" transform="translate(640 150)">
        <path d="M0 -70 L60 -46 V6 Q60 54 0 76 Q-60 54 -60 6 V-46 Z" fill="#5fe3a1" opacity="0.9" />
        <path d="M-26 4 l18 20 l36 -42" stroke="#0b1222" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(140 160) rotate(-8)">
        <rect x="-70" y="-44" width="140" height="88" rx="10" fill="#2fa8ff" />
        <rect x="-70" y="-24" width="140" height="16" fill="#0b1222" opacity="0.5" />
        <text x="0" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1222" fontFamily="Inter, sans-serif">Call the number</text>
        <text x="0" y="38" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b1222" fontFamily="Inter, sans-serif">on the back</text>
      </g>
    </Frame>
  ),
  family_call: () => (
    <Frame id="fc" label="A warm, safe moment: two phones connected by a heart, and a house with lit windows." tint="#5fe3a1">
      <circle cx="400" cy="160" r="170" fill="url(#fc-glow)" />
      <g transform="translate(400 210)">
        <path d="M-120 0 L0 -100 L120 0 Z" fill="#5fe3a1" opacity="0.85" />
        <rect x="-100" y="0" width="200" height="100" fill="#1a2540" stroke="#5fe3a1" strokeWidth="4" />
        <rect className="anim-glow" x="-74" y="20" width="44" height="36" fill="#ffd166" />
        <rect className="anim-glow delay-1" x="30" y="20" width="44" height="36" fill="#ffd166" />
        <rect x="-16" y="50" width="32" height="50" fill="#5fe3a1" />
      </g>
      <Phone x={130} y={165} scale={0.78} />
      <Phone x={670} y={165} scale={0.78} />
      <path d="M210 100 Q400 -20 590 100" stroke="#5fe3a1" strokeWidth="4" strokeDasharray="10 10" fill="none" className="anim-dash" />
      <g transform="translate(400 60)">
        <g className="anim-beat">
          <path d="M0 18 C-30 -6 -18 -30 0 -14 C18 -30 30 -6 0 18 Z" fill="#ff7a8a" />
        </g>
      </g>
      <text x="130" y="178" textAnchor="middle" fontSize="44">👴</text>
      <text x="670" y="178" textAnchor="middle" fontSize="44">🧑</text>
      <text x="130" y="240" textAnchor="middle" fontSize="16" fill="#5fe3a1" fontFamily="Inter, sans-serif">Calling…</text>
      <text x="670" y="240" textAnchor="middle" fontSize="16" fill="#5fe3a1" fontFamily="Inter, sans-serif">“I'm fine!”</text>
    </Frame>
  ),
  kitchen_night: () => (
    <Frame id="kn" label="Arthur's kitchen late at night. Rain on the window, the phone and three gift cards on the table." tint="#ff7a8a">
      <NightWindow x={480} y={30} w={240} h={150} rain />
      <rect x="40" y="40" width="160" height="90" fill="#111a2e" stroke="#26324f" strokeWidth="4" />
      <rect x="40" y="140" width="160" height="10" fill="#26324f" />
      {/* hanging lamp */}
      <line x1="340" y1="0" x2="340" y2="60" stroke="#26324f" strokeWidth="4" />
      <path d="M300 60 h80 l-14 30 h-52z" fill="#ffd166" />
      <ellipse className="anim-flicker" cx="340" cy="210" rx="220" ry="60" fill="#ffd166" opacity="0.08" />
      <rect x="120" y="230" width="460" height="18" rx="6" fill="#5c3d2e" />
      <rect x="150" y="248" width="16" height="70" fill="#5c3d2e" />
      <rect x="536" y="248" width="16" height="70" fill="#5c3d2e" />
      <GiftCard x={330} y={204} r={-10} />
      <GiftCard x={420} y={206} r={6} color="#2fa8ff" />
      <GiftCard x={510} y={204} r={-4} color="#5fe3a1" />
      <Landline x={160} y={186} ringing />
      <Clock x={640} y={250} r={36} hour={10} minute={45} />
    </Frame>
  ),
  kitchen_loss: () => (
    <Frame id="kl" label="The codes are gone: gift cards drift away into the dark and an empty wallet lies open." tint="#ff7a8a">
      <circle cx="400" cy="170" r="160" fill="url(#kl-glow)" />
      <g className="anim-drift">
        <GiftCard x={300} y={200} r={-20} />
      </g>
      <g className="anim-drift delay-1">
        <GiftCard x={420} y={180} r={12} color="#2fa8ff" />
      </g>
      <g className="anim-drift delay-2">
        <GiftCard x={540} y={210} r={-6} color="#5fe3a1" />
      </g>
      {/* open, empty wallet */}
      <g transform="translate(400 262)">
        <rect x="-100" y="-30" width="200" height="66" rx="12" fill="#5c3d2e" />
        <rect x="-86" y="-18" width="172" height="40" rx="6" fill="#2a1a12" />
        <rect x="60" y="-6" width="40" height="18" rx="9" fill="#7a5340" />
        <text x="-10" y="10" textAnchor="middle" fontSize="20" fontWeight="700" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">£0</text>
      </g>
      <text x="400" y="60" textAnchor="middle" fontSize="26" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">Codes shared…</text>
    </Frame>
  ),

  spoofed_call: (v) => (
    <Frame id="sp" label={`A phone shows a call from ${v.callerId ?? "the bank"}, but behind it a shadowy figure holds up a mask.`} tint="#ff7a8a">
      <circle cx="330" cy="160" r="160" fill="url(#sp-glow)" />
      <Phone x={300} y={165} scale={0.9}>
        <text x="0" y="-70" textAnchor="middle" fontSize="15" fill="#94a3b8" fontFamily="Inter, sans-serif">Incoming call</text>
        {(v.callerId ?? "NORTHBRIDGE BANK").split(" ").slice(0, 2).map((w, i, all) => (
          <text key={w} x="0" y={all.length === 1 ? -28 : -40 + i * 24} textAnchor="middle" fontSize="19" fontWeight="700" fill="#e2e8f0" fontFamily="Space Grotesk, sans-serif">{w}</text>
        ))}
        <circle className="anim-pulse" cx="-40" cy="90" r="22" fill="#5fe3a1" />
        <circle cx="40" cy="90" r="22" fill="#ff7a8a" />
      </Phone>
      <ShadowCaller x={590} y={140} />
      <g className="anim-float" transform="translate(520 210) rotate(-10)">
        <rect x="-56" y="-28" width="112" height="56" rx="12" fill="#9a7bff" />
        <text x="0" y="8" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0b1222" fontFamily="Space Grotesk, sans-serif">"{(v.callerId ?? "BANK").split(" ").pop()}"</text>
      </g>
      <text x="590" y="295" textAnchor="middle" fontSize="18" fill="#ff7a8a" fontFamily="Inter, sans-serif">Any name can appear on your screen</text>
    </Frame>
  ),
  safe_account: (v) => (
    <Frame id="sa" label="Money flows from your savings into a dark 'safe account' run by criminals." tint="#ff7a8a">
      <circle cx="560" cy="160" r="150" fill="url(#sa-glow)" />
      <g transform="translate(170 160)">
        <path d="M-90 -40 L0 -90 L90 -40 Z" fill="#9a7bff" />
        <rect x="-80" y="-40" width="160" height="110" fill="#1a2540" stroke="#9a7bff" strokeWidth="4" />
        <text x="0" y="10" textAnchor="middle" fontSize="18" fill="#e2e8f0" fontFamily="Inter, sans-serif">Your savings</text>
        <text x="0" y="40" textAnchor="middle" fontSize="22" fontWeight="700" fill="#5fe3a1" fontFamily="Space Grotesk, sans-serif">{v.savings ?? "£"}</text>
      </g>
      <path d="M270 160 C 360 100, 440 220, 500 160" stroke="#ff7a8a" strokeWidth="5" strokeDasharray="12 10" fill="none" className="anim-dash" />
      {[0, 1, 2].map((i) => (
        <g key={i} className="anim-drift" style={{ animationDelay: `${i * 0.8}s` }}>
          <circle cx={330 + i * 50} cy={150} r="14" fill="#ffd166" />
          <text x={330 + i * 50} y={156} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0b1222">£</text>
        </g>
      ))}
      <g transform="translate(600 160)">
        <rect x="-90" y="-70" width="180" height="140" rx="14" fill="#2a1420" stroke="#ff7a8a" strokeWidth="4" strokeDasharray="8 6" />
        <text x="0" y="-20" textAnchor="middle" fontSize="40" fontWeight="700" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">?</text>
        <text x="0" y="20" textAnchor="middle" fontSize="18" fill="#ff7a8a" fontFamily="Inter, sans-serif">“Safe account”</text>
        <text x="0" y="46" textAnchor="middle" fontSize="14" fill="#fda4af" fontFamily="Inter, sans-serif">run by criminals</text>
      </g>
    </Frame>
  ),
  bank_desk: () => (
    <Frame id="bd" label="A bank adviser with a headset looks at a screen showing a warning about an unusual payment." tint="#9a7bff">
      <circle cx="260" cy="170" r="150" fill="url(#bd-glow)" />
      <Person x={230} y={130} skin="#8a5a3c" hair="#1a1a1a" top="#9a7bff" />
      <g fill="none" stroke="#e2e8f0" strokeWidth="5">
        <path d="M196 150 q0 -60 34 -60 q34 0 34 60" />
        <path d="M200 160 q8 26 30 24" />
      </g>
      <rect x="120" y="250" width="580" height="16" rx="6" fill="#26324f" />
      <g transform="translate(540 150)">
        <rect x="-140" y="-100" width="280" height="180" rx="12" fill="#0b1222" stroke="#5cc8ff" strokeWidth="5" />
        <text x="-120" y="-64" fontSize="16" fill="#94a3b8" fontFamily="Inter, sans-serif">New payee · first payment</text>
        <rect x="-120" y="-46" width="200" height="10" rx="5" fill="#26324f" />
        <rect x="-120" y="-26" width="150" height="10" rx="5" fill="#26324f" />
        <g className="anim-pulse">
          <rect x="-120" y="0" width="240" height="56" rx="10" fill="#ffd166" opacity="0.9" />
          <text x="0" y="35" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0b1222" fontFamily="Space Grotesk, sans-serif">⚠ Ask before sending</text>
        </g>
      </g>
    </Frame>
  ),
  parcel_text: (v) => (
    <Frame id="pt2" label="A text about a parcel fee with a suspicious link, next to a parcel with a small fee tag." tint="#ffd166">
      <circle cx="300" cy="160" r="160" fill="url(#pt2-glow)" />
      <Phone x={300} y={165} scale={0.9}>
        <g className="anim-pop">
          <rect x="-66" y="-96" width="132" height="120" rx="14" fill="#26324f" />
          <text x="-52" y="-70" fontSize="22">📦</text>
          <rect x="-20" y="-82" width="70" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-50" width="100" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-34" width="84" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-10" width="108" height="10" rx="4" fill="#ff7a8a" />
        </g>
        <circle className="anim-pulse" cx="62" cy="-118" r="12" fill="#ff7a8a" />
      </Phone>
      <g className="anim-float" transform="translate(580 170)">
        <rect x="-80" y="-60" width="160" height="120" rx="8" fill="#c9a26b" />
        <rect x="-80" y="-14" width="160" height="16" fill="#a8844f" />
        <rect x="-8" y="-60" width="16" height="120" fill="#a8844f" />
        <g transform="translate(70 -60) rotate(18)">
          <rect x="-40" y="-18" width="80" height="36" rx="8" fill="#ffd166" />
          <text x="0" y="7" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0b1222" fontFamily="Space Grotesk, sans-serif">{v.fee ?? "£1.45"}</text>
        </g>
      </g>
      <text x="580" y="290" textAnchor="middle" fontSize="18" fill="#ffd166" fontFamily="Inter, sans-serif">“Just a small fee…”</text>
    </Frame>
  ),
  fake_website: () => (
    <Frame id="fw" label="A laptop shows a lookalike website asking for card details, with a fishing hook dangling over the form." tint="#ff7a8a">
      <circle cx="400" cy="160" r="170" fill="url(#fw-glow)" />
      <Laptop x={400} y={170}>
        <rect x="-140" y="-100" width="280" height="22" fill="#26324f" />
        <text x="-130" y="-84" fontSize="12" fill="#ff7a8a" fontFamily="Inter, sans-serif">⚠ not the real website</text>
        {["Full name", "Date of birth", "Card number", "3 digits on back"].map((t, i) => (
          <g key={t}>
            <text x="-120" y={-52 + i * 34} fontSize="13" fill="#94a3b8" fontFamily="Inter, sans-serif">{t}</text>
            <rect x="-120" y={-46 + i * 34} width="240" height="16" rx="4" fill="#1a2540" stroke={i > 0 ? "#ff7a8a" : "#26324f"} />
          </g>
        ))}
      </Laptop>
      <g className="anim-float">
        <line x1="560" y1="0" x2="560" y2="120" stroke="#cbd5e1" strokeWidth="3" />
        <path d="M560 120 v26 a16 16 0 0 1 -32 0" stroke="#cbd5e1" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
    </Frame>
  ),
  romance_chat: () => (
    <Frame id="rc" label="A laptop chat full of loving messages and hearts, with a shadowy figure behind the screen." tint="#ff7a8a">
      <circle cx="400" cy="160" r="170" fill="url(#rc-glow)" />
      <ShadowCaller x={640} y={140} />
      <Laptop x={340} y={170}>
        <g className="anim-pop">
          <rect x="-120" y="-90" width="150" height="34" rx="12" fill="#ff7a8a" opacity="0.85" />
          <rect x="-30" y="-46" width="150" height="34" rx="12" fill="#26324f" />
          <rect x="-120" y="-2" width="170" height="34" rx="12" fill="#ff7a8a" opacity="0.85" />
          <text x="-110" y="-68" fontSize="14" fill="#0b1222" fontFamily="Inter, sans-serif">Good morning ❤️</text>
          <text x="-112" y="20" fontSize="14" fill="#0b1222" fontFamily="Inter, sans-serif">I need a small favour…</text>
        </g>
      </Laptop>
      {[0, 1, 2].map((i) => (
        <g key={i} className="anim-float" style={{ animationDelay: `${i * 0.9}s` }}>
          <Heart x={130 + i * 40} y={60 + (i % 2) * 30} s={1 - i * 0.15} />
        </g>
      ))}
    </Frame>
  ),
  investment_ad: (v) => (
    <Frame id="ia" label="A phone advert with a famous face, a chart shooting upwards and a 'VIP' badge." tint="#5fe3a1">
      <circle cx="400" cy="160" r="170" fill="url(#ia-glow)" />
      <Phone x={290} y={165} scale={0.9}>
        <text x="0" y="-92" textAnchor="middle" fontSize="13" fill="#94a3b8" fontFamily="Inter, sans-serif">Sponsored</text>
        <circle cx="0" cy="-50" r="26" fill="#e8b48f" />
        <text x="0" y="-6" textAnchor="middle" fontSize="13" fill="#e2e8f0" fontFamily="Inter, sans-serif">“My secret…”</text>
        <path className="anim-dash" d="M-60 90 L-30 60 L0 70 L30 20 L60 -10" stroke="#5fe3a1" strokeWidth="5" fill="none" strokeDasharray="10 6" />
      </Phone>
      <g className="anim-float" transform="translate(560 120)">
        <rect x="-70" y="-30" width="140" height="60" rx="30" fill="#ffd166" />
        <text x="0" y="10" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0b1222" fontFamily="Space Grotesk, sans-serif">VIP 🚀</text>
      </g>
      <text x="560" y="210" textAnchor="middle" fontSize="40" fontWeight="700" fill="#5fe3a1" fontFamily="Space Grotesk, sans-serif">{v.gains ?? "+40%"}</text>
      <text x="560" y="250" textAnchor="middle" fontSize="18" fill="#cbd5e1" fontFamily="Inter, sans-serif">“Only 50 places left!”</text>
    </Frame>
  ),
  investment_crash: (v) => (
    <Frame id="ic" label="A profit chart crashes down, and the withdraw button is locked behind a fee." tint="#ff7a8a">
      <circle cx="400" cy="160" r="170" fill="url(#ic-glow)" />
      <g transform="translate(120 60)">
        <line x1="0" y1="200" x2="360" y2="200" stroke="#26324f" strokeWidth="4" />
        <line x1="0" y1="0" x2="0" y2="200" stroke="#26324f" strokeWidth="4" />
        <path d="M0 170 L80 130 L160 90 L240 30 L270 40" stroke="#5fe3a1" strokeWidth="6" fill="none" />
        <path className="anim-dash" d="M270 40 L300 120 L330 190 L360 200" stroke="#ff7a8a" strokeWidth="6" fill="none" strokeDasharray="10 8" />
      </g>
      <g transform="translate(610 150)">
        <rect x="-110" y="-40" width="220" height="80" rx="16" fill="#26324f" />
        <text x="0" y="-6" textAnchor="middle" fontSize="20" fontWeight="700" fill="#94a3b8" fontFamily="Space Grotesk, sans-serif">Withdraw</text>
        <text x="0" y="22" textAnchor="middle" fontSize="15" fill="#ff7a8a" fontFamily="Inter, sans-serif">Fee required: {v.fee ?? "£"}</text>
        <g className="anim-beat" transform="translate(96 -40)">
          <rect x="-16" y="-6" width="32" height="26" rx="5" fill="#ff7a8a" />
          <path d="M-9 -6 v-8 a9 9 0 0 1 18 0 v8" stroke="#ff7a8a" strokeWidth="5" fill="none" />
        </g>
      </g>
    </Frame>
  ),
  money_gone: () => (
    <Frame id="mg" label="An empty wallet and a cracked bank card, with pound signs drifting away into the dark." tint="#ff7a8a">
      <circle cx="400" cy="170" r="160" fill="url(#mg-glow)" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} className="anim-drift" style={{ animationDelay: `${i * 0.6}s` }}>
          <text x={260 + i * 90} y={120 + (i % 2) * 40} fontSize="40" fontWeight="700" fill="#ffd166" opacity="0.8" fontFamily="Space Grotesk, sans-serif">£</text>
        </g>
      ))}
      <g transform="translate(300 250) rotate(-8)">
        <rect x="-80" y="-48" width="160" height="96" rx="10" fill="#2fa8ff" />
        <rect x="-80" y="-26" width="160" height="16" fill="#0b1222" opacity="0.5" />
        <path d="M-20 -48 L0 -10 L-14 10 L10 48" stroke="#0b1222" strokeWidth="4" fill="none" />
      </g>
      <g transform="translate(520 262)">
        <rect x="-100" y="-30" width="200" height="66" rx="12" fill="#5c3d2e" />
        <rect x="-86" y="-18" width="172" height="40" rx="6" fill="#2a1a12" />
        <text x="-10" y="10" textAnchor="middle" fontSize="20" fontWeight="700" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">£0</text>
      </g>
    </Frame>
  ),
  family_talk: () => (
    <Frame id="ft" label="Two people talking kindly at a kitchen table, with a heart between them." tint="#5fe3a1">
      <circle cx="400" cy="160" r="170" fill="url(#ft-glow)" />
      <Person x={240} y={120} skin="#e8b48f" hair="#7a4a2a" top="#2fa86f" />
      <Person x={560} y={120} skin="#c68b62" hair="#cbd5e1" top="#7c5cf0" long />
      <rect x="140" y="250" width="520" height="18" rx="6" fill="#5c3d2e" />
      <g className="anim-pop">
        <rect x="290" y="50" width="90" height="40" rx="14" fill="#26324f" />
        <text x="335" y="76" textAnchor="middle" fontSize="18" fill="#e2e8f0">💬</text>
        <rect x="420" y="40" width="90" height="40" rx="14" fill="#26324f" />
        <text x="465" y="66" textAnchor="middle" fontSize="18" fill="#e2e8f0">💬</text>
      </g>
      <g transform="translate(400 170)">
        <g className="anim-beat">
          <Heart x={0} y={0} s={1.4} color="#5fe3a1" />
        </g>
      </g>
    </Frame>
  ),
  reported: () => (
    <Frame id="rp" label="A green shield with a tick: the scam has been stopped and reported." tint="#5fe3a1">
      <circle cx="400" cy="160" r="170" fill="url(#rp-glow)" />
      <g className="anim-glow" transform="translate(400 150)">
        <path d="M0 -100 L86 -66 V8 Q86 78 0 108 Q-86 78 -86 8 V-66 Z" fill="#5fe3a1" opacity="0.9" />
        <path d="M-38 6 l26 28 l52 -60" stroke="#0b1222" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform="translate(160 160)">
        <rect x="-60" y="-40" width="120" height="80" rx="14" fill="#26324f" />
        <text x="0" y="-6" textAnchor="middle" fontSize="16" fill="#94a3b8" fontFamily="Inter, sans-serif">Forward to</text>
        <text x="0" y="22" textAnchor="middle" fontSize="26" fontWeight="700" fill="#5fe3a1" fontFamily="Space Grotesk, sans-serif">7726</text>
      </g>
      <g transform="translate(640 160)">
        <rect x="-70" y="-40" width="140" height="80" rx="14" fill="#26324f" />
        <text x="0" y="-6" textAnchor="middle" fontSize="16" fill="#94a3b8" fontFamily="Inter, sans-serif">Call your bank</text>
        <text x="0" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill="#5fe3a1" fontFamily="Inter, sans-serif">number on card</text>
      </g>
      <text x="400" y="300" textAnchor="middle" fontSize="20" fill="#5fe3a1" fontFamily="Space Grotesk, sans-serif">Stopped and reported</text>
    </Frame>
  ),
  phone_message: () => (
    <Frame id="pm" label="A phone with chat messages from an unknown number, and a shadowy figure typing behind it." tint="#5fe3a1">
      <circle cx="320" cy="160" r="160" fill="url(#pm-glow)" />
      <Phone x={300} y={165} scale={0.9}>
        <text x="0" y="-100" textAnchor="middle" fontSize="13" fill="#94a3b8" fontFamily="Inter, sans-serif">Unknown number</text>
        <g className="anim-pop">
          <rect x="-66" y="-84" width="120" height="40" rx="12" fill="#26324f" />
          <rect x="-54" y="-70" width="90" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-54" y="-56" width="60" height="8" rx="4" fill="#cbd5e1" />
          <rect x="-50" y="-30" width="116" height="40" rx="12" fill="#2fa86f" />
          <rect x="-38" y="-16" width="86" height="8" rx="4" fill="#0b1222" opacity="0.6" />
          <rect x="-66" y="24" width="124" height="40" rx="12" fill="#26324f" />
          <rect x="-54" y="38" width="96" height="8" rx="4" fill="#ff7a8a" />
        </g>
        <g className="anim-pulse">
          <circle cx="-30" cy="96" r="5" fill="#94a3b8" />
          <circle cx="-14" cy="96" r="5" fill="#94a3b8" />
          <circle cx="2" cy="96" r="5" fill="#94a3b8" />
        </g>
      </Phone>
      <ShadowCaller x={590} y={150} />
      <text x="590" y="290" textAnchor="middle" fontSize="18" fill="#ff7a8a" fontFamily="Inter, sans-serif">Who's really typing?</text>
    </Frame>
  ),
  cash_handover: (v) => (
    <Frame id="ch" label="A front door with an envelope of cash, and a shadowy 'courier' waiting outside." tint="#ff7a8a">
      <circle cx="560" cy="160" r="150" fill="url(#ch-glow)" />
      <g transform="translate(220 40)">
        <rect x="0" y="0" width="150" height="260" rx="6" fill="#5c3d2e" stroke="#26324f" strokeWidth="6" />
        <rect x="18" y="20" width="114" height="90" rx="4" fill="#7a5340" />
        <rect x="18" y="130" width="114" height="110" rx="4" fill="#7a5340" />
        <circle cx="125" cy="140" r="7" fill="#ffd166" />
      </g>
      <g className="anim-float" transform="translate(440 190)">
        <rect x="-60" y="-36" width="120" height="72" rx="6" fill="#e2e8f0" />
        <path d="M-60 -36 L0 6 L60 -36" stroke="#94a3b8" strokeWidth="4" fill="none" />
        <text x="0" y="28" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0b1222" fontFamily="Space Grotesk, sans-serif">{v.cash ?? "£££"}</text>
      </g>
      <ShadowCaller x={640} y={150} />
      <text x="640" y="290" textAnchor="middle" fontSize="18" fill="#ff7a8a" fontFamily="Inter, sans-serif">Police never collect cash</text>
    </Frame>
  ),
};

export function SceneArt({ art, vars = {} }: { art: SceneArtId; vars?: Vars }) {
  const Scene = scenes[art];
  return Scene(vars);
}
