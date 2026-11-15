// Case 001 — entirely fictional people, bank, numbers and links.
import type { Tactic } from "./types";

export interface Clue {
  id: string;
  /** Exact text inside the evidence body that the player can click. */
  text: string;
  tactic: Tactic;
  explanation: string;
}

export interface Evidence {
  id: string;
  kind: "sms" | "call" | "email" | "alert";
  title: string;
  from: string;
  time: string;
  body: string;
  clues: Clue[];
}

export type Safety = "safe" | "risky" | "dangerous";

export interface DecisionOption {
  id: string;
  label: string;
  safety: Safety;
  /** Scripted, illustrative outcome. Shown as a possibility, never a prediction. */
  outcome: string;
}

export interface Decision {
  id: string;
  title: string;
  scene: string;
  speaker?: string;
  line?: string;
  options: DecisionOption[];
}

export interface CaseFile {
  id: string;
  title: string;
  tagline: string;
  victim: string;
  briefing: string;
  evidence: Evidence[];
  isScam: boolean;
  decisions: Decision[];
}

export const CASE_001: CaseFile = {
  id: "case-001",
  title: "The Frozen Account",
  tagline: "A text, a phone call, and a 'safe account'.",
  victim: "Margaret Ellis, 71, retired school librarian",
  briefing:
    "Margaret banks with (fictional) Northbridge Bank. On Tuesday morning her phone lit up with a warning. By lunchtime she had nearly moved her savings. Examine the evidence, mark every red flag you can find, then decide: is this a scam?",
  isScam: true,
  evidence: [
    {
      id: "ev-sms",
      kind: "sms",
      title: "Text message",
      from: "+44 7700 900123",
      time: "Tue 09:12",
      body:
        "NORTHBRIDGE ALERT: Unusual sign-in detected. Your account has been FROZEN. Verify within 30 minutes or your funds will be permanently locked: northbridge-secure-verify.co/login",
      clues: [
        { id: "c-sender", text: "+44 7700 900123", tactic: "authority_impersonation", explanation: "A personal mobile number, not your bank's registered short code or name." },
        { id: "c-frozen", text: "Your account has been FROZEN", tactic: "fear_pressure", explanation: "Shouting about a frozen account is designed to trigger panic." },
        { id: "c-30min", text: "Verify within 30 minutes", tactic: "false_urgency", explanation: "A tight deadline stops you from checking with the bank or family." },
        { id: "c-link", text: "northbridge-secure-verify.co/login", tactic: "suspicious_link", explanation: "Look-alike web address. A real bank uses its own domain and tells you to use the app." },
      ],
    },
    {
      id: "ev-call",
      kind: "call",
      title: "Phone call transcript",
      from: "'Daniel from Northbridge Fraud Team'",
      time: "Tue 09:20",
      body:
        "\"Hello Mrs Ellis, I'm Daniel from the Northbridge Fraud Team. We've stopped a payment of £2,400. To cancel it I need you to read me the 6-digit code we just texted you. Please don't hang up, and don't tell anyone in the branch — we think a staff member is involved.\"",
      clues: [
        { id: "c-fraudteam", text: "I'm Daniel from the Northbridge Fraud Team", tactic: "authority_impersonation", explanation: "Anyone can claim a title. The call came to you; you didn't call them." },
        { id: "c-code", text: "read me the 6-digit code", tactic: "sensitive_info_request", explanation: "One-time codes are for you only. Banks never ask you to read them out." },
        { id: "c-secret", text: "don't tell anyone in the branch", tactic: "emotional_manipulation", explanation: "Isolating you from people who could help is a classic control tactic." },
        { id: "c-hangup", text: "Please don't hang up", tactic: "fear_pressure", explanation: "Keeping you on the line prevents you from calling the real bank." },
      ],
    },
    {
      id: "ev-email",
      kind: "email",
      title: "Email",
      from: "security@northbridge-support-team.com",
      time: "Tue 09:41",
      body:
        "Dear Valued Customer, as discussed, move your savings to the protected Safe Account below today. Sort code 99-00-00, account 00012345. This account is in your name and fully guaranteed.",
      clues: [
        { id: "c-dear", text: "Dear Valued Customer", tactic: "authority_impersonation", explanation: "Generic greeting. Your bank knows your name." },
        { id: "c-safe", text: "move your savings to the protected Safe Account", tactic: "unusual_payment", explanation: "There is no such thing as a bank 'safe account'. Real banks never ask you to move money to protect it." },
        { id: "c-guaranteed", text: "fully guaranteed", tactic: "too_good_to_be_true", explanation: "Promises of guarantees are used to calm your doubts." },
      ],
    },
    {
      id: "ev-alert",
      kind: "alert",
      title: "Northbridge app notification",
      from: "Northbridge Bank app",
      time: "Tue 09:05",
      body:
        "New sign-in to your account on a Windows PC in Leeds. Wasn't you? Open the app and tap 'Secure my account', or call the number on the back of your card.",
      clues: [],
    },
  ],
  decisions: [
    {
      id: "d1",
      title: "Decision 1 — The text",
      scene: "09:12. Margaret's phone buzzes. The text says her account is FROZEN and she has 30 minutes. Her heart is racing.",
      options: [
        { id: "d1-link", label: "Tap the link and log in to fix it quickly", safety: "dangerous", outcome: "The page looks just like Northbridge. Margaret types her username and password. The scammers may now be able to see her account." },
        { id: "d1-reply", label: "Call the number in the text to ask what's happening", safety: "risky", outcome: "A friendly 'agent' answers immediately. The scammer now has her on the phone and knows she believes them." },
        { id: "d1-card", label: "Ignore the text and call the number on the back of her bank card", safety: "safe", outcome: "The real Northbridge confirms her account is not frozen. They mark the text as a known scam." },
      ],
    },
    {
      id: "d2",
      title: "Decision 2 — The caller",
      scene: "09:20. A man calling himself Daniel from the Fraud Team says a £2,400 payment is pending.",
      speaker: "Daniel",
      line: "To cancel it I need the 6-digit code we just texted you. Please don't hang up.",
      options: [
        { id: "d2-code", label: "Read out the code so he can cancel the payment", safety: "dangerous", outcome: "That code actually approved a new device. The caller could now be able to make payments from her account." },
        { id: "d2-questions", label: "Ask him to prove who he is first", safety: "risky", outcome: "Daniel reads out her date of birth and address (stolen in a data breach). He sounds convincing, and the pressure continues." },
        { id: "d2-hangup", label: "Hang up, wait 5 minutes, and call the bank from a different phone", safety: "safe", outcome: "The real bank has no record of Daniel. They block any new devices and reset her security." },
      ],
    },
    {
      id: "d3",
      title: "Decision 3 — The 'Safe Account'",
      scene: "09:41. An email arrives asking Margaret to move her savings into a 'protected Safe Account' today.",
      options: [
        { id: "d3-transfer", label: "Transfer her savings to the Safe Account", safety: "dangerous", outcome: "The money lands in an account the scammers control. Transfers like this can be very hard to recover." },
        { id: "d3-wait", label: "Wait until tomorrow and decide then", safety: "risky", outcome: "Waiting helps, but the scammers call again tonight with new threats. She is still alone with the decision." },
        { id: "d3-family", label: "Call her daughter, then visit her branch in person", safety: "safe", outcome: "Her daughter recognises the pattern immediately. The branch confirms there is no 'safe account' and helps her report it." },
      ],
    },
  ],
};

export function findOption(decisionId: string, optionId: string) {
  const decision = CASE_001.decisions.find((d) => d.id === decisionId);
  const option = decision?.options.find((o) => o.id === optionId);
  return { decision, option };
}

export const ALL_CLUES = CASE_001.evidence.flatMap((e) => e.clues);

export interface CaseScorePart {
  points: number;
  max: number;
  /** Plain-English explanation of how these points were worked out. */
  why: string;
}

const CASE_POINTS = { safe: 10, risky: 5, dangerous: 0 } as const;

/**
 * Learning-based score for Case 001 (not an AI confidence score).
 * - Clues (40): share of the case's clues you tapped.
 * - Verdict (15): whether you correctly called it a scam.
 * - Decisions (30): 10 per decision for a safe choice, 5 for risky, 0 for dangerous.
 * - Learning from mistakes (15): share of your risky/dangerous decisions you compared with AI Rewind.
 *   If every decision was safe, there was nothing to fix, so you get the full 15.
 */
export function scoreCase(choices: { decisionId: string; optionId: string }[], found: string[], verdictCorrect: boolean, rewoundDecisions: string[]) {
  const spotted = found.filter((id) => ALL_CLUES.some((c) => c.id === id)).length;
  const clues: CaseScorePart = { max: 40, points: Math.round((spotted / ALL_CLUES.length) * 40), why: `You tapped ${spotted} of the ${ALL_CLUES.length} clues in the evidence.` };
  const verdict: CaseScorePart = { max: 15, points: verdictCorrect ? 15 : 0, why: verdictCorrect ? "You correctly decided this was a scam." : "Your verdict didn't match: this case was a scam." };
  const safeties = choices.map((c) => findOption(c.decisionId, c.optionId).option?.safety ?? "dangerous");
  const n = (s: string) => safeties.filter((x) => x === s).length;
  const decisions: CaseScorePart = {
    max: 30,
    points: safeties.reduce((sum, s) => sum + CASE_POINTS[s], 0),
    why: `${n("safe")} safe, ${n("risky")} risky and ${n("dangerous")} dangerous (10 points for safe, 5 for risky, 0 for dangerous).`,
  };
  const unsafe = choices.filter((c, i) => safeties[i] !== "safe");
  const reviewed = unsafe.filter((c) => rewoundDecisions.includes(c.decisionId)).length;
  const reflection: CaseScorePart = unsafe.length
    ? { max: 15, points: Math.round((reviewed / unsafe.length) * 15), why: `You used AI Rewind on ${reviewed} of your ${unsafe.length} risky or dangerous decision${unsafe.length === 1 ? "" : "s"}.` }
    : { max: 15, points: 15, why: "Every decision was safe, so there was nothing to fix." };
  return { clues, verdict, decisions, reflection, total: clues.points + verdict.points + decisions.points + reflection.points };
}
