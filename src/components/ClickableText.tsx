// "Tap the suspicious words" mechanic, shared by Case 001 (AI Detective) and the Story Game.

interface ClueLike {
  id: string;
  text: string;
}

/** Splits text into clickable pieces: real clues plus ordinary phrases ("decoys"),
 *  so clicking ordinary text feels the same and players can't guess by hovering. */
export function splitEvidence<C extends ClueLike>(body: string, clues: C[]) {
  const pieces: { text: string; clue?: C }[] = [];
  let rest = body;
  while (rest.length) {
    let next: { idx: number; clue: C } | null = null;
    for (const clue of clues) {
      const idx = rest.indexOf(clue.text);
      if (idx >= 0 && (!next || idx < next.idx)) next = { idx, clue };
    }
    const plain = next ? rest.slice(0, next.idx) : rest;
    plain.split(/(?<=[.,:;!?])\s+/).filter(Boolean).forEach((t) => pieces.push({ text: t }));
    if (!next) break;
    pieces.push({ text: next.clue.text, clue: next.clue });
    rest = rest.slice(next.idx + next.clue.text.length);
  }
  return pieces;
}

export function ClickableText<C extends ClueLike>({ text, clues, found, onFind, onMiss }: { text: string; clues: C[]; found: string[]; onFind: (c: C) => void; onMiss: () => void }) {
  return (
    <>
      {splitEvidence(text, clues).map((p, i) => {
        const isFound = p.clue && found.includes(p.clue.id);
        return (
          <span key={i}>
            <button
              type="button"
              onClick={() => (p.clue ? onFind(p.clue) : onMiss())}
              className={`rounded px-0.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 ${isFound ? "bg-danger/25 ring-1 ring-danger/60" : "hover:bg-electric-500/15"}`}
            >
              {p.text}
            </button>{" "}
          </span>
        );
      })}
    </>
  );
}
