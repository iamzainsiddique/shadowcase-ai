// DEMO MODE analyzer: simple keyword rules, used ONLY when no AI key is configured.
// The UI labels every result from here as "Demo mode — rule-based, not live AI".
import type { ScanIndicator, ScanResult, Tactic, Verdict } from "../shared/types";

interface Rule {
  tactic: Tactic;
  pattern: RegExp;
  explanation: string;
}

const RULES: Rule[] = [
  { tactic: "false_urgency", pattern: /\b(within \d+ (minutes?|hours?)|immediately|right now|urgent(ly)?|act now|today only|last chance|expires? (today|tonight|soon)|final (notice|warning))\b/i, explanation: "Creates a deadline so you act before checking." },
  { tactic: "fear_pressure", pattern: /\b(frozen|suspended|locked|blocked|arrest(ed)?|warrant|legal action|penalt(y|ies)|closed permanently|will be (closed|terminated|cancelled))\b/i, explanation: "Uses a threat to make you panic." },
  { tactic: "authority_impersonation", pattern: /\b(fraud (team|department)|security (team|department)|(hmrc|irs|tax office|police|government|customs)|dear (valued )?customer|account (team|services))\b/i, explanation: "Claims to be an authority; you can't confirm who is really writing." },
  { tactic: "sensitive_info_request", pattern: /\b((reply|respond|text|send|provide|confirm|share|read|tell)( us| me)?( with)?( your| the)? ((one[- ]time |verification |security |6[- ]digit )?(code|pin|password|passcode)|card (number|details)|cvv|login details|bank details|national insurance|social security))\b/i, explanation: "Asks for private details that a real organisation would never request this way." },
  { tactic: "suspicious_link", pattern: /\b((https?:\/\/)?[a-z0-9-]+-(secure|verify|login|update|support|refund|claim)[a-z0-9-]*\.[a-z.]{2,}(\/\S*)?|bit\.ly\/\S+|tinyurl\.com\/\S+|click (here|the link|below))/i, explanation: "Link or instruction that may lead to a look-alike site." },
  { tactic: "unusual_payment", pattern: /\b(gift cards?|itunes|steam cards?|bitcoin|crypto(currency)?|wire transfer|safe account|western union|moneygram|processing fee|release fee|pay (a|the) (small )?fee)\b/i, explanation: "Asks for a payment method that is hard to reverse." },
  { tactic: "too_good_to_be_true", pattern: /\b(you('ve| have)? won|winner|prize|claim your|free (iphone|gift|money)|guaranteed (returns?|profit)|double your|risk[- ]free|lottery|inheritance)\b/i, explanation: "Offers something unexpected and generous to lure you in." },
  { tactic: "emotional_manipulation", pattern: /\b(don'?t tell (anyone|your family)|keep this (secret|between us)|(mum|mom|dad|grandma|grandpa)[, ]+(it'?s me|i lost my phone|new number)|i'?m in trouble|please help me|my darling|i love you)\b/i, explanation: "Plays on emotions or asks for secrecy." },
];

export function analyzeWithRules(message: string): ScanResult {
  const indicators: ScanIndicator[] = [];
  for (const rule of RULES) {
    const m = message.match(rule.pattern);
    if (m) indicators.push({ tactic: rule.tactic, quote: m[0], explanation: rule.explanation });
  }

  const n = indicators.length;
  let verdict: Verdict;
  if (n >= 2) verdict = "likely_scam";
  else if (n === 1) verdict = "suspicious";
  else verdict = message.trim().length < 20 ? "unclear" : "likely_legitimate";

  const summary =
    n === 0
      ? "The demo rules found none of the common warning signs. That does not prove the message is safe."
      : `The demo rules found ${n} common warning sign${n > 1 ? "s" : ""}.`;

  return {
    verdict,
    summary,
    indicators,
    verificationSteps: [
      "Don't use any link, phone number or email address from the message.",
      "Contact the organisation yourself using the number on your card, statement, or official app.",
      "Never share passwords, PINs, or one-time codes with anyone.",
      "If you're unsure, pause and talk to someone you trust before doing anything.",
    ],
    mode: "demo",
  };
}
