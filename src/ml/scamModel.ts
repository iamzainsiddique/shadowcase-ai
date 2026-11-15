// Trained scam text filter, running entirely in the browser (no server, no API key, nothing sent anywhere).
//
// The model is trained in Python by ml/train.py (TF-IDF with 1–2 word n-grams + logistic regression on the
// SMS Spam Collection plus 40 modern UK examples) and exported to scam-model.json. This file repeats the
// exact same maths as scikit-learn so the browser gives the same answer; scripts/test.ts checks that.
// It is a prototype and is not financial advice.
import model from "./scam-model.json";

export interface ModelData {
  terms: string[];
  idf: number[];
  coef: number[];
  intercept: number;
  threshold: number;
  checks: { text: string; p_spam: number }[];
}

const M = model as ModelData;
const INDEX = new Map(M.terms.map((t, i) => [t, i]));

/** Same as scikit-learn's default tokenizer: lowercase, runs of 2+ letters/digits/underscores. */
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [];
}

export interface ModelResult {
  /** Probability (0–1) that the message is spam or a scam. */
  pSpam: number;
  flagged: boolean;
  /** Words or word pairs that pushed the model towards "scam", strongest first. */
  reasons: { term: string; weight: number }[];
}

export function scoreMessage(text: string, data: ModelData = M, index: Map<string, number> = INDEX): ModelResult {
  const words = tokenize(text);
  const grams = [...words, ...words.slice(1).map((w, i) => `${words[i]} ${w}`)];
  const counts = new Map<string, number>();
  for (const g of grams) if (index.has(g)) counts.set(g, (counts.get(g) ?? 0) + 1);

  // TF-IDF with sublinear tf (1 + log count), then L2 normalisation, then the logistic regression.
  const weights = [...counts].map(([g, c]) => [g, (1 + Math.log(c)) * data.idf[index.get(g)!]] as const);
  const norm = Math.sqrt(weights.reduce((s, [, v]) => s + v * v, 0)) || 1;
  const contributions = weights.map(([g, v]) => ({ term: g, weight: (v / norm) * data.coef[index.get(g)!] }));
  const z = contributions.reduce((s, c) => s + c.weight, data.intercept);
  const pSpam = 1 / (1 + Math.exp(-z));

  return {
    pSpam,
    flagged: pSpam >= data.threshold,
    reasons: contributions.filter((c) => c.weight > 0.05).sort((a, b) => b.weight - a.weight).slice(0, 6),
  };
}

export const MODEL_CHECKS = M.checks;
