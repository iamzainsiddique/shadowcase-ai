// Evaluation: runs every labelled message through the analyzer and records the REAL results.
// Usage:  npm run eval            -> uses live AI if ANTHROPIC_API_KEY is set, otherwise demo rules
//         npm run eval -- --rules -> forces the demo rule-based analyzer
// A verdict of "likely_scam" or "suspicious" counts as predicting "suspicious".
import "dotenv/config";
import fs from "node:fs";
import { analyzeWithAi, hasAiKey } from "../server/ai";
import { analyzeWithRules } from "../server/rules";

interface Item {
  id: number;
  label: "suspicious" | "legitimate";
  text: string;
}

const items: Item[] = JSON.parse(fs.readFileSync("data/eval-messages.json", "utf8"));
const useAi = hasAiKey() && !process.argv.includes("--rules");
const modeName = useAi ? "live-ai" : "demo-rules";

const rows: { id: number; label: string; predicted: string; verdict: string; correct: boolean }[] = [];
for (const item of items) {
  const r = useAi ? await analyzeWithAi(item.text) : analyzeWithRules(item.text);
  const predicted = r.verdict === "likely_scam" || r.verdict === "suspicious" ? "suspicious" : "legitimate";
  rows.push({ id: item.id, label: item.label, predicted, verdict: r.verdict, correct: predicted === item.label });
  process.stdout.write(predicted === item.label ? "." : "x");
}
console.log();

const correct = rows.filter((r) => r.correct).length;
const tp = rows.filter((r) => r.label === "suspicious" && r.predicted === "suspicious").length;
const fp = rows.filter((r) => r.label === "legitimate" && r.predicted === "suspicious").length;
const fn = rows.filter((r) => r.label === "suspicious" && r.predicted === "legitimate").length;
const tn = rows.filter((r) => r.label === "legitimate" && r.predicted === "legitimate").length;
const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(1)}%` : "n/a");

const errors = rows.filter((r) => !r.correct);
const md = `# Evaluation results — ${modeName}

Run on ${new Date().toISOString()} over ${rows.length} fictional, hand-labelled messages (\`data/eval-messages.json\`).

| Metric | Value |
|---|---|
| Correctly classified | ${correct} |
| Incorrectly classified | ${rows.length - correct} |
| Accuracy | ${pct(correct, rows.length)} |
| Scams caught (recall) | ${tp}/${tp + fn} (${pct(tp, tp + fn)}) |
| Legitimate messages wrongly flagged | ${fp}/${fp + tn} |

## Misclassified examples
${errors.length ? errors.map((e) => `- #${e.id}: labelled **${e.label}**, analyzer said **${e.verdict}** — "${items.find((i) => i.id === e.id)!.text}"`).join("\n") : "- None in this run."}

## All results
| # | Label | Verdict | Correct |
|---|---|---|---|
${rows.map((r) => `| ${r.id} | ${r.label} | ${r.verdict} | ${r.correct ? "✓" : "✗"} |`).join("\n")}
`;

fs.mkdirSync("eval", { recursive: true });
const out = `eval/results-${modeName}.md`;
fs.writeFileSync(out, md);
console.log(`Accuracy ${pct(correct, rows.length)} (${correct}/${rows.length}). Written to ${out}`);
