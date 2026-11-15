// Types shared by the React frontend and the Node server.

export const TACTICS = [
  "false_urgency",
  "authority_impersonation",
  "family_impersonation",
  "emotional_manipulation",
  "fear_pressure",
  "sensitive_info_request",
  "suspicious_link",
  "unusual_payment",
  "too_good_to_be_true",
] as const;
export type Tactic = (typeof TACTICS)[number];

export const TACTIC_LABELS: Record<Tactic, string> = {
  false_urgency: "False urgency",
  authority_impersonation: "Pretending to be an authority",
  family_impersonation: "Pretending to be family or a friend",
  emotional_manipulation: "Emotional manipulation",
  fear_pressure: "Fear-based pressure",
  sensitive_info_request: "Asking for private information",
  suspicious_link: "Suspicious link or contact",
  unusual_payment: "Unusual payment method",
  too_good_to_be_true: "Too good to be true",
};

export const TACTIC_EXPLAINERS: Record<Tactic, string> = {
  false_urgency: "Scammers set short deadlines so you act before you think or ask someone.",
  authority_impersonation: "They pretend to be your bank, the government, or a company so you trust them.",
  family_impersonation: "They pretend to be a grandchild, relative or friend in trouble, hoping you'll help without checking.",
  emotional_manipulation: "They use love, sympathy, or excitement to cloud your judgement.",
  fear_pressure: "They threaten frozen accounts, arrest, or losses to make you panic.",
  sensitive_info_request: "Real banks never ask you to share passwords, PINs, or one-time codes.",
  suspicious_link: "Links and phone numbers inside a message can lead straight to the scammer.",
  unusual_payment: "Gift cards, crypto, wire transfers, or 'safe accounts' are hard to get back.",
  too_good_to_be_true: "Prizes, refunds, or deals you didn't expect are often bait.",
};

export type Mode = "live-ai" | "demo";

export type Verdict = "likely_scam" | "suspicious" | "likely_legitimate" | "unclear";

export interface ScanIndicator {
  tactic: Tactic;
  /** Exact text copied from the message, used for highlighting. */
  quote: string;
  explanation: string;
}

export interface ScanResult {
  verdict: Verdict;
  summary: string;
  indicators: ScanIndicator[];
  verificationSteps: string[];
  mode: Mode;
}

export interface RewindResult {
  saferOptionId: string;
  comparison: string;
  originalPath: string;
  alternativePath: string;
  whySafer: string;
  keyLesson: string;
  mode: Mode;
}

export interface ReportInput {
  choices: { decisionId: string; optionId: string }[];
  cluesFound: string[];
  verdictCorrect: boolean;
  rewindsUsed: number;
}

export interface ReportResult {
  lessons: string[];
  closing: string;
  mode: Mode;
}
