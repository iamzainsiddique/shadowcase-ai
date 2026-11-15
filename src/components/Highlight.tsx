// Renders text with given phrases wrapped in <mark>. Phrases not found in the text are skipped.
export function Highlight({ text, phrases, className = "bg-danger/25 text-white rounded px-0.5 ring-1 ring-danger/60" }: { text: string; phrases: string[]; className?: string }) {
  const ranges: [number, number][] = [];
  const lower = text.toLowerCase();
  for (const p of phrases) {
    if (!p) continue;
    const i = lower.indexOf(p.toLowerCase());
    if (i >= 0) ranges.push([i, i + p.length]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const parts: JSX.Element[] = [];
  let pos = 0;
  ranges.forEach(([s, e], k) => {
    if (s < pos) return; // skip overlaps
    if (s > pos) parts.push(<span key={`t${k}`}>{text.slice(pos, s)}</span>);
    parts.push(<mark key={`m${k}`} className={className}>{text.slice(s, e)}</mark>);
    pos = e;
  });
  parts.push(<span key="end">{text.slice(pos)}</span>);
  return <>{parts}</>;
}
