// Illustrated character portraits (inline SVG). Scammers appear as shadowy silhouettes on purpose:
// you never actually know who is on the other end of the line.
import type { CharacterId } from "../../shared/story";

interface Look {
  skin: string;
  hair: string;
  hairStyle: "receding" | "bob" | "short" | "long" | "curly" | "none";
  top: string;
  glasses?: boolean;
  headset?: boolean;
  tie?: boolean;
  shadow?: boolean;
}

const LOOKS: Partial<Record<CharacterId, Look>> = {
  arthur: { skin: "#f1c9a5", hair: "#cbd5e1", hairStyle: "receding", top: "#1b86e0", glasses: true },
  caller: { skin: "#2a1420", hair: "#2a1420", hairStyle: "none", top: "#2a1420", shadow: true },
  grant: { skin: "#2a1420", hair: "#2a1420", hairStyle: "none", top: "#2a1420", tie: true, shadow: true },
  helen: { skin: "#e8b48f", hair: "#7a4a2a", hairStyle: "bob", top: "#2fa86f" },
  jamie: { skin: "#d9a07a", hair: "#2b1d14", hairStyle: "short", top: "#5cc8ff" },
  priya: { skin: "#c68b62", hair: "#1f1530", hairStyle: "long", top: "#7c5cf0" },
  okafor: { skin: "#8a5a3c", hair: "#1a1a1a", hairStyle: "curly", top: "#9a7bff", headset: true },
  nadia: { skin: "#d9a07a", hair: "#2b1d14", hairStyle: "long", top: "#5cc8ff" },
  bankcaller: { skin: "#2a1420", hair: "#2a1420", hairStyle: "none", top: "#2a1420", headset: true, shadow: true },
  leo: { skin: "#f1c9a5", hair: "#c27c3a", hairStyle: "short", top: "#ff9f43" },
  zara: { skin: "#6b4430", hair: "#141414", hairStyle: "curly", top: "#5fe3a1" },
  brenda: { skin: "#f1c9a5", hair: "#d6d3d1", hairStyle: "bob", top: "#e879a6", glasses: true },
  mark: { skin: "#2a1420", hair: "#2a1420", hairStyle: "none", top: "#2a1420", shadow: true },
  chris: { skin: "#f1c9a5", hair: "#5a3a22", hairStyle: "short", top: "#2fa86f" },
  kofi: { skin: "#5c3a26", hair: "#141414", hairStyle: "short", top: "#ffd166" },
  ray: { skin: "#2a1420", hair: "#2a1420", hairStyle: "none", top: "#2a1420", tie: true, shadow: true },
  ama: { skin: "#6b4430", hair: "#141414", hairStyle: "long", top: "#9a7bff" },
};

export function Avatar({ id, size = 56, talking = false, talkDelay = 0 }: { id: CharacterId; size?: number; talking?: boolean; talkDelay?: number }) {
  const look = LOOKS[id];
  if (!look) return null;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={`shrink-0 rounded-full ${talking ? "anim-talk" : ""}`} style={{ ["--talk-delay" as string]: `${talkDelay}s` }}>
      <circle cx="50" cy="50" r="50" fill={look.shadow ? "#3a1a26" : "#1a2540"} />
      {look.shadow && <circle cx="50" cy="50" r="46" fill="none" stroke="#ff7a8a" strokeWidth="3" strokeDasharray="6 6" />}
      {/* long hair goes behind the head */}
      {look.hairStyle === "long" && <path d="M24 46 q-4 40 10 50 h32 q14 -10 10 -50 z" fill={look.hair} />}
      {/* shoulders */}
      <path d="M16 100 q0 -28 34 -28 q34 0 34 28 z" fill={look.top} />
      {look.tie && <path d="M46 74 h8 l-2 8 l4 16 h-12 l4 -16 z" fill="#ff7a8a" />}
      {/* head */}
      <circle cx="50" cy="44" r="22" fill={look.skin} />
      {look.hairStyle === "receding" && <path d="M28 42 q0 -22 22 -24 q22 2 22 24 q-4 -10 -9 -11 q-13 5 -26 0 q-5 1 -9 11z" fill={look.hair} />}
      {look.hairStyle === "bob" && <path d="M26 50 q-4 -32 24 -32 q28 0 24 32 q-2 -18 -24 -20 q-22 2 -24 20z" fill={look.hair} />}
      {look.hairStyle === "short" && <path d="M28 40 q2 -20 22 -20 q20 0 22 20 q-10 -8 -22 -8 q-12 0 -22 8z" fill={look.hair} />}
      {look.hairStyle === "long" && <path d="M27 44 q0 -26 23 -26 q23 0 23 26 q-6 -16 -23 -17 q-17 1 -23 17z" fill={look.hair} />}
      {look.hairStyle === "curly" && (
        <g fill={look.hair}>
          {[30, 38, 46, 54, 62, 70].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 24 : 28} r="7" />
          ))}
        </g>
      )}
      {look.shadow ? (
        <text x="50" y="54" textAnchor="middle" fontSize="26" fontWeight="700" fill="#ff7a8a" fontFamily="Space Grotesk, sans-serif">?</text>
      ) : (
        <>
          <circle cx="42" cy="44" r="2.6" fill="#0b1222" />
          <circle cx="58" cy="44" r="2.6" fill="#0b1222" />
          <path className={talking ? "anim-mouth" : ""} d="M44 54 q6 4 12 0" stroke="#0b1222" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {look.glasses && (
        <g fill="none" stroke="#0b1222" strokeWidth="2">
          <circle cx="42" cy="44" r="6" />
          <circle cx="58" cy="44" r="6" />
          <line x1="48" y1="44" x2="52" y2="44" />
        </g>
      )}
      {look.headset && (
        <g fill="none" stroke="#e2e8f0" strokeWidth="3">
          <path d="M28 44 q0 -26 22 -26 q22 0 22 26" />
          <path d="M30 50 q4 10 14 10" />
          <circle cx="28" cy="46" r="3" fill="#e2e8f0" />
        </g>
      )}
    </svg>
  );
}

/** Inspector Vale, the guide who explains each decision. */
export function InspectorVale({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="shrink-0 rounded-full">
      <circle cx="50" cy="50" r="50" fill="#2a2150" />
      <path d="M16 100 q0 -28 34 -28 q34 0 34 28 z" fill="#c9a26b" />
      <path d="M40 72 l10 14 l10 -14" fill="#e2e8f0" />
      <circle cx="50" cy="46" r="21" fill="#e8b48f" />
      <path d="M29 48 q-2 -24 21 -24 q23 0 21 24 q-4 -12 -21 -13 q-17 1 -21 13z" fill="#b5532f" />
      <ellipse cx="50" cy="28" rx="30" ry="6" fill="#4a3a26" />
      <path d="M32 28 q2 -16 18 -16 q16 0 18 16z" fill="#5a4630" />
      <circle cx="43" cy="47" r="2.4" fill="#0b1222" />
      <circle cx="57" cy="47" r="2.4" fill="#0b1222" />
      <path d="M44 56 q6 4 12 0" stroke="#0b1222" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <g transform="translate(70 70) rotate(-30)">
        <circle r="9" fill="none" stroke="#5cc8ff" strokeWidth="3" />
        <line x1="7" y1="7" x2="16" y2="16" stroke="#5cc8ff" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
