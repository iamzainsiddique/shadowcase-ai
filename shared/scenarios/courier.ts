// Scenario: "The Courier", a fake police "courier fraud" (fake officers ask you to hand over cash as 'evidence').
// Perspectives: Doreen (the person targeted) and Mr Bello (the bank cashier who serves her). All fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  cp_start: {
    id: "cp_start",
    art: "spoofed_call",
    scene: "Friday, 10:15 · Doreen's hallway",
    lines: [
      { speaker: "narrator", text: "Doreen, 81, answers her landline." },
      { speaker: "fakecop", text: "Mrs Doreen? This is Detective Constable Harris from {station} Police. We've arrested a man using your bank card, and we believe someone at your bank is involved." },
    ],
    clues: [
      { id: "cp-dc", text: "This is Detective Constable Harris", tactic: "authority_impersonation", explanation: "Anyone can say they're the police. A title on the phone proves nothing." },
      { id: "cp-bank", text: "someone at your bank is involved", tactic: "emotional_manipulation", explanation: "Turning you against your bank stops the bank staff from warning you." },
    ],
    choices: [
      { id: "cp-check", label: "“I'll ring 101 to check you're real.”", next: "cp_trick", safety: "safe", feedback: "Excellent instinct. Checking with the police yourself is exactly right." },
      { id: "cp-help", label: "“Oh my goodness. How can I help?”", next: "cp_ask", safety: "risky", feedback: "Wanting to help the police is natural, and that's what this scam uses.", saferAlternative: "Say you'll ring 101 to check, from a different phone." },
    ],
  },
  cp_trick: {
    id: "cp_trick",
    art: "spoofed_call",
    scene: "Friday, 10:17",
    lines: [
      { speaker: "fakecop", text: "Of course, madam, please do. Just dial now, there's no need to hang up your end." },
      { speaker: "narrator", text: "Scammers sometimes keep a landline open, so you're still talking to them when you dial." },
    ],
    clues: [{ id: "cp-hangup", text: "there's no need to hang up your end", tactic: "authority_impersonation", explanation: "If the line stays open, your 'check' goes straight back to the scammer." }],
    choices: [
      { id: "cp-other", label: "Use a different phone, or wait 5 minutes, then ring 101", next: "cp_real", safety: "safe", feedback: "Perfect. A different phone, or a wait, makes sure you reach the real police." },
      { id: "cp-same", label: "Dial 101 straight away on the same line", next: "cp_ask", safety: "risky", feedback: "The line was still open. The 'police officer' who answered was the scammer's partner.", saferAlternative: "Use a different phone, or wait 5 minutes first." },
    ],
  },
  cp_ask: {
    id: "cp_ask",
    art: "cash_handover",
    scene: "Friday, 10:25 · On the phone",
    lines: [{ speaker: "fakecop", text: "We need your help to catch them. Withdraw {cash} in cash from your branch. Don't tell the cashier why, as they may be involved. A courier will collect it as evidence." }],
    clues: [
      { id: "cp-cash", text: "Withdraw {cash} in cash", tactic: "unusual_payment", explanation: "Real police never ask you to withdraw money, ever." },
      { id: "cp-cashier", text: "Don't tell the cashier why", tactic: "emotional_manipulation", explanation: "Keeping the cashier in the dark stops the one person who could protect you." },
      { id: "cp-courier", text: "A courier will collect it", tactic: "authority_impersonation", explanation: "Police never send a courier to collect cash or bank cards." },
    ],
    choices: [
      { id: "cp-withdraw", label: "Go to the bank and withdraw the cash", next: "cp_bank", safety: "dangerous", feedback: "The police would never ask this. The 'courier' works for the scammer.", saferAlternative: "Refuse and hang up. Then call 101 from another phone." },
      { id: "cp-refuse", label: "“The police would never ask that. I'm hanging up.”", next: "cp_real", safety: "safe", feedback: "Absolutely right, and very brave." },
    ],
  },
  cp_bank: {
    id: "cp_bank",
    art: "bank_desk",
    scene: "Friday, 11:30 · Bank branch",
    lines: [{ speaker: "bello", text: "That's a lot of cash, Mrs Doreen. Can I ask what it's for? Has anyone asked you to do this?" }],
    choices: [
      { id: "cp-tell", label: "Tell him about the police call", next: "cp_saved", safety: "safe", feedback: "Telling him broke the spell. Bank staff are on your side." },
      { id: "cp-lie", label: "“It's for a new kitchen.”", next: "cp_gone", safety: "dangerous", feedback: "That's the cover story the scammer wanted you to use.", saferAlternative: "Tell the cashier the truth." },
    ],
  },
  cp_real: { id: "cp_real", art: "reported", scene: "Friday, 10:40", lines: [{ speaker: "narrator", text: "The real police confirm there's no DC Harris. They thank Doreen for reporting it." }], ending: "cp_safe" },
  cp_saved: { id: "cp_saved", art: "reported", scene: "Friday, 11:40", lines: [{ speaker: "bello", text: "Police never collect cash, Mrs Doreen. Let's sit somewhere quiet, and I'll call the real police for you." }], ending: "cp_saved" },
  cp_gone: { id: "cp_gone", art: "cash_handover", scene: "Friday, 15:00 · Doreen's front door", lines: [{ speaker: "narrator", text: "A 'courier' collects the envelope. Nobody from the 'police' ever calls again." }], ending: "cp_lost" },

  // ---------------- Mr Bello's perspective (bank cashier) ----------------
  bc_start: {
    id: "bc_start",
    art: "bank_desk",
    scene: "Friday, 11:30 · Bank branch counter",
    lines: [
      { speaker: "narrator", text: "You're Mr Bello, a cashier at a bank branch. Doreen, a regular customer who usually takes out £50, asks for {cash} in cash." },
      { speaker: "doreen", text: "I'd like {cash} in cash, please. It's… for some building work." },
    ],
    clues: [
      { id: "bc-cash", text: "I'd like {cash} in cash", tactic: "unusual_payment", explanation: "A large, unusual cash withdrawal is a common sign of courier fraud." },
      { id: "bc-building", text: "It's… for some building work", tactic: "emotional_manipulation", explanation: "A hesitant reason can be a cover story she's been told to say." },
    ],
    choices: [
      { id: "bc-hand", label: "Count out the cash. It's her money.", next: "bc_gone", safety: "dangerous", feedback: "It is her money, but the warning signs were there. A kind question costs nothing.", saferAlternative: "Ask gently whether anyone has asked her to take the money out." },
      { id: "bc-ask", label: "“Of course. Has anyone been in touch with you about this money?”", next: "bc_opens", safety: "safe", feedback: "Perfect: friendly, open and non-judgemental." },
      { id: "bc-rude", label: "“I'm not giving you that much cash.”", next: "bc_offended", safety: "risky", feedback: "Refusing without explaining feels like an insult, and pushes her away.", saferAlternative: "Ask kindly what's happening." },
    ],
  },
  bc_offended: {
    id: "bc_offended",
    art: "bank_desk",
    scene: "Friday, 11:32",
    lines: [{ speaker: "doreen", text: "I beg your pardon! I'm perfectly capable of managing my own money." }],
    choices: [
      { id: "bc-sorry", label: "Apologise, and ask kindly whether anyone has asked her to take money out", next: "bc_opens", safety: "safe", feedback: "A sincere apology and a gentle question get things back on track." },
      { id: "bc-callafter", label: "Let her leave, then call the police with your concerns", next: "bc_late", safety: "risky", feedback: "Calling the police helps, but she may get the cash elsewhere first.", saferAlternative: "Apologise and keep the conversation going." },
      { id: "bc-give", label: "Hand over the cash to avoid a scene", next: "bc_gone", safety: "dangerous", feedback: "Avoiding an awkward moment left her alone with the scammer.", saferAlternative: "Apologise and ask kindly." },
    ],
  },
  bc_opens: {
    id: "bc_opens",
    art: "cash_handover",
    scene: "Friday, 11:35",
    lines: [{ speaker: "doreen", text: "Well… a detective rang. He said someone at the bank is involved, and a courier will collect the cash as evidence." }],
    clues: [{ id: "bc-courier", text: "a courier will collect the cash", tactic: "authority_impersonation", explanation: "Police never collect cash. This is courier fraud." }],
    choices: [
      { id: "bc-protect", label: "Explain police never collect cash, take her somewhere quiet, and call the police for her", next: "bc_saved", safety: "safe", feedback: "Textbook. In the UK, branches can call the police straight away in situations like this." },
      { id: "bc-note", label: "Make a note, but hand over the cash", next: "bc_gone", safety: "dangerous", feedback: "She's just described courier fraud.", saferAlternative: "Stop the withdrawal and call the police for her." },
    ],
  },
  bc_saved: { id: "bc_saved", art: "reported", scene: "Friday, 12:00", lines: [{ speaker: "doreen", text: "I'd never have guessed. Thank you for asking, young man." }], ending: "bc_saved" },
  bc_late: { id: "bc_late", art: "spoofed_call", scene: "Friday, 15:00", lines: [{ speaker: "narrator", text: "The police visit Doreen that afternoon. She had already withdrawn some cash at another branch, but hadn't handed it over yet." }], ending: "bc_late" },
  bc_gone: { id: "bc_gone", art: "cash_handover", scene: "Friday, 15:00", lines: [{ speaker: "narrator", text: "That afternoon, a 'courier' collects Doreen's envelope." }], ending: "bc_lost" },
};

const ENDINGS: Record<string, Ending> = {
  cp_safe: { id: "cp_safe", title: "The Real Police", tone: "good", summary: "Doreen checked with the real police, using a safe line.", consequences: ["No money lost.", "Her report helps police warn others."], lesson: "Police will never ask you to withdraw money or hand anything to a courier. To check, call 101 from a different phone, or wait 5 minutes." },
  cp_saved: { id: "cp_saved", title: "The Cashier Who Asked", tone: "mixed", summary: "Doreen went to the bank, but telling the cashier the truth stopped the scam.", consequences: ["No money lost.", "It was close. Bank staff stepped in."], lesson: "If anyone tells you not to tell the bank why you need money, tell the bank exactly that." },
  cp_lost: { id: "cp_lost", title: "Handed to a Stranger", tone: "bad", summary: "Doreen gave {cash} to a 'courier' working for the scammers.", consequences: ["{cash} could be lost. Cash is very hard to recover.", "Report it to the police immediately."], lesson: "Real police never collect cash, cards or valuables from your home." },
  bc_saved: { id: "bc_saved", title: "A Kind Question", tone: "good", summary: "Your gentle question uncovered the scam, and you got Doreen real help.", consequences: ["No money lost.", "The police are investigating the 'detective'."], lesson: "Kind, open questions help people who've been told to keep secrets. Bank staff can be the last line of defence." },
  bc_late: { id: "bc_late", title: "Help Came Later", tone: "mixed", summary: "Doreen left upset, but your call to the police reached her in time.", consequences: ["No money handed over, but she withdrew cash elsewhere first."], lesson: "Even if a conversation goes wrong, raising the alarm still helps." },
  bc_lost: { id: "bc_lost", title: "The Envelope", tone: "bad", summary: "The cash went to a criminal's courier.", consequences: ["{cash} could be lost."], lesson: "An unusual cash withdrawal plus a vague reason is worth a kind question." },
};

export const COURIER_NODES = NODES;
export const COURIER_ENDINGS = ENDINGS;

export const COURIER_STORIES: StoryDef[] = [
  { id: "courier_victim", scenarioId: "courier", perspective: "victim", you: "doreen", label: "Doreen, 81, the person being targeted", intro: "Doreen answers a call from a 'detective' who says her bank is involved in a crime. You play as Doreen. Tap anything suspicious, and decide what she does.", start: "cp_start", question: "What should Doreen do?", cast: ["doreen", "fakecop", "bello"] },
  { id: "courier_bank", scenarioId: "courier", perspective: "bank", you: "bello", label: "Mr Bello, the bank cashier", intro: "Now see it from the bank counter. You play as Mr Bello. A regular customer wants an unusually large amount of cash. How do you help without upsetting her?", start: "bc_start", question: "What should Mr Bello do?", cast: ["bello", "doreen"] },
];

export const COURIER: Scenario = {
  id: "courier",
  title: "The Courier",
  icon: "🚔",
  scamType: "Fake police 'courier fraud'",
  tagline: "The police need your help. Or do they?",
  art: "cash_handover",
  stories: ["courier_victim", "courier_bank"],
  variants: [
    { cash: "£4,000", station: "Westmere", callerId: "POLICE" },
    { cash: "£6,500", station: "Kingsholt", callerId: "POLICE" },
    { cash: "£3,200", station: "Ferncombe", callerId: "POLICE" },
  ],
  trick: [
    { stage: "Hook", speaker: "fakecop", line: "This is Detective Constable Harris from {station} Police.", tactic: "authority_impersonation", purpose: "People trust and want to help the police.", defence: "Hang up and call 101 from a different phone to check." },
    { stage: "Cut you off", speaker: "fakecop", line: "Someone at your bank is involved.", tactic: "emotional_manipulation", purpose: "Stops you trusting the bank staff who would spot it.", defence: "Your bank is on your side. Tell them everything." },
    { stage: "Build trust", speaker: "fakecop", line: "Just dial now, there's no need to hang up your end.", tactic: "authority_impersonation", purpose: "Keeps the line open so your 'check' reaches the scammers.", defence: "Use another phone, or wait 5 minutes before calling." },
    { stage: "Take the money", speaker: "fakecop", line: "Withdraw {cash} in cash. Don't tell the cashier why.", tactic: "unusual_payment", purpose: "Gets cash, which is almost impossible to trace.", defence: "Police never ask you to withdraw money." },
    { stage: "Take the money", speaker: "fakecop", line: "A courier will collect it as evidence.", tactic: "authority_impersonation", purpose: "Sends someone to your door to take the money.", defence: "Never hand cash or cards to a courier. Call 999 if someone is on their way." },
  ],
};
