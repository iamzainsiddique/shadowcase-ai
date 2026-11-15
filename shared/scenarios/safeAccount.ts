// Scenario: "The Safe Account", a bank impersonation scam (also called "safe account" or APP fraud).
// Perspectives: Nadia (the person targeted) and Ms Okafor (the bank adviser who takes Nadia's call).
// Every name, number and organisation here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  // ---------------- Nadia's perspective ----------------
  sa_start: {
    id: "sa_start",
    art: "spoofed_call",
    scene: "Thursday, 14:05 · Hospital staff room",
    lines: [
      { speaker: "narrator", text: "Nadia is on her break when her mobile rings. The screen says NORTHBRIDGE BANK." },
      { speaker: "bankcaller", text: "Hello, is that Nadia? This is the fraud team at Northbridge Bank. We've stopped a payment of {small} to {shop}. Did you make it?" },
    ],
    clues: [
      { id: "sa-fraudteam", text: "This is the fraud team at Northbridge Bank", tactic: "authority_impersonation", explanation: "Anyone can make a bank's name appear on your phone screen. A name on the screen proves nothing." },
    ],
    choices: [
      { id: "sa-panic", label: "“No, that wasn't me! What do I do?”", next: "sa_hook", safety: "risky", feedback: "A completely normal reaction, but now the caller is steering the conversation.", saferAlternative: "Say you'll call back, hang up, and ring the number on the back of your card." },
      { id: "sa-callback", label: "“I'll hang up and call the number on the back of my card.”", next: "sa_realbank", safety: "safe", feedback: "Spot on. Calling the bank yourself, on a number you trust, beats this scam every time." },
    ],
  },
  sa_hook: {
    id: "sa_hook",
    art: "phone_tension",
    scene: "Thursday, 14:07 · On the phone",
    lines: [
      { speaker: "bankcaller", text: "Don't worry, we can protect you. Your account has been accessed from inside the bank, so we need to move your {savings} savings to a new safe account today." },
      { speaker: "bankcaller", text: "Please don't mention this to staff at your branch. We think one of them may be involved." },
    ],
    clues: [
      { id: "sa-safeaccount", text: "move your {savings} savings to a new safe account", tactic: "unusual_payment", explanation: "Banks never ask you to move money to a 'safe account'. This sentence alone tells you it's a scam." },
      { id: "sa-today", text: "today", tactic: "false_urgency", explanation: "Rushing you so you don't stop to check." },
      { id: "sa-staff", text: "Please don't mention this to staff at your branch", tactic: "emotional_manipulation", explanation: "Cutting you off from the very people who would stop the scam." },
    ],
    choices: [
      { id: "sa-move", label: "“Okay. What are the account details?”", next: "sa_transfer", safety: "dangerous", feedback: "Moving money to a 'safe account' is exactly what the scammer wants. Your bank would never ask this.", saferAlternative: "Hang up and call the number on the back of your card." },
      { id: "sa-check", label: "“Banks never ask that. I'm calling you back on my card's number.”", next: "sa_realbank", safety: "safe", feedback: "Excellent. You spotted the one request a real bank never makes." },
    ],
  },
  sa_transfer: {
    id: "sa_transfer",
    art: "safe_account",
    scene: "Thursday, 14:15 · Banking app",
    lines: [
      { speaker: "bankcaller", text: "I'm texting you the safe account now. When the app asks why you're paying, choose 'Paying family'. Our system blocks anything else." },
      { speaker: "narrator", text: "The banking app shows a warning: 'Could this be a scam? Banks will never ask you to move money to a safe account.'" },
    ],
    message: { from: "Northbridge Bank", text: "Safe account: N. Holdings Ltd, sort code 99-01-02, account 40118822. Ref: SECURE. Do not share this message with anyone." },
    clues: [
      { id: "sa-reason", text: "choose 'Paying family'", tactic: "sensitive_info_request", explanation: "Being told to give your bank a false reason is a huge red flag. It's designed to get past the bank's own checks." },
      { id: "sa-dontshare", text: "Do not share this message with anyone", tactic: "emotional_manipulation", explanation: "Secrecy again. Real banks are happy for you to check with anyone." },
    ],
    choices: [
      { id: "sa-send", label: "Ignore the warning and send the money", next: "sa_gone", safety: "dangerous", feedback: "The app's warning described this exact scam. Money sent this way can be very hard to get back.", saferAlternative: "Stop at the warning and call your bank yourself." },
      { id: "sa-stop", label: "Stop at the warning, hang up and call the bank yourself", next: "sa_close", safety: "safe", feedback: "Brilliant. Even this late, stopping to check protected the money." },
    ],
  },
  sa_realbank: {
    id: "sa_realbank",
    art: "bank_call",
    scene: "Thursday, 14:20 · Northbridge Bank (number on the card)",
    lines: [
      { speaker: "okafor", text: "Nadia, we haven't called you today. Criminals can make any name appear on your phone. You did exactly the right thing." },
      { speaker: "okafor", text: "We will never ask you to move money to a safe account. Your savings are fine." },
    ],
    ending: "sa_safe",
  },
  sa_close: {
    id: "sa_close",
    art: "bank_call",
    scene: "Thursday, 14:25 · Northbridge Bank (number on the card)",
    lines: [
      { speaker: "okafor", text: "You stopped just in time, Nadia. That account belongs to criminals. Let's secure your online banking, as you shared some details with them." },
    ],
    ending: "sa_close",
  },
  sa_gone: {
    id: "sa_gone",
    art: "money_gone",
    scene: "Thursday, 16:00 · Banking app",
    lines: [
      { speaker: "narrator", text: "The 'fraud team' stops answering. Nadia rings the number on her card. The bank never called her." },
    ],
    ending: "sa_lost",
  },

  // ---------------- Ms Okafor's perspective (bank adviser) ----------------
  bk_start: {
    id: "bk_start",
    art: "bank_desk",
    scene: "Thursday, 14:40 · Northbridge Bank phone line",
    lines: [
      { speaker: "narrator", text: "You're Ms Okafor, a bank adviser. A customer, Nadia, rings to send {savings} to a new account she's never paid before." },
      { speaker: "nadia", text: "I need to move my savings now, please. It's urgent. It's for… a family member." },
    ],
    clues: [
      { id: "bk-urgent", text: "It's urgent", tactic: "false_urgency", explanation: "Customers being scammed have usually been told to hurry." },
      { id: "bk-family", text: "It's for… a family member", tactic: "sensitive_info_request", explanation: "Hesitation and a vague reason can mean someone has given her a cover story to repeat." },
    ],
    choices: [
      { id: "bk-process", label: "Process the payment. It's her money and her choice.", next: "bk_lost", safety: "dangerous", feedback: "It is her money, but several warning signs were there. A few kind questions can save someone's savings.", saferAlternative: "Ask gentle, open questions about the payment." },
      { id: "bk-ask", label: "“Has anyone contacted you about this payment or told you what to say?”", next: "bk_opens", safety: "safe", feedback: "Great question. It's open, calm and gives her a chance to tell you what's really happening." },
      { id: "bk-accuse", label: "“This is obviously a scam. How could you fall for it?”", next: "bk_closed", safety: "risky", feedback: "You may be right, but people who feel judged often defend the scammer.", saferAlternative: "Ask calm, open questions instead." },
    ],
  },
  bk_closed: {
    id: "bk_closed",
    art: "bank_desk",
    scene: "Thursday, 14:42 · On the phone",
    lines: [{ speaker: "nadia", text: "How dare you! I'm not stupid. If you won't help, I'll move my money another way." }],
    choices: [
      { id: "bk-sorry", label: "“I'm sorry, that came out wrong. I ask because criminals coach people on what to say. Can I ask you a couple of questions?”", next: "bk_opens", safety: "safe", feedback: "Apologising and explaining why you're asking rebuilds trust. Nicely done." },
      { id: "bk-letgo", label: "Let her end the call", next: "bk_walked", safety: "risky", feedback: "She may try another way to send the money, still believing the scammer.", saferAlternative: "Apologise and explain why you're asking." },
    ],
  },
  bk_opens: {
    id: "bk_opens",
    art: "spoofed_call",
    scene: "Thursday, 14:44 · On the phone",
    lines: [
      { speaker: "nadia", text: "Well… someone from your fraud team called me. He said staff at the bank might be involved, so I shouldn't tell you." },
    ],
    clues: [
      { id: "bk-staff", text: "staff at the bank might be involved", tactic: "emotional_manipulation", explanation: "Scammers warn victims not to trust bank staff, so that staff can't step in." },
    ],
    choices: [
      { id: "bk-explain", label: "“That caller was a criminal. We will never ask you to move money to a safe account. Let's stop this payment together.”", next: "bk_saved", safety: "safe", feedback: "Clear, kind and firm. You stopped the payment and helped her understand why." },
      { id: "bk-send", label: "Make a note and send the payment anyway", next: "bk_lost", safety: "dangerous", feedback: "She has just described a textbook safe-account scam.", saferAlternative: "Explain the scam and hold the payment." },
    ],
  },
  bk_saved: {
    id: "bk_saved",
    art: "reported",
    scene: "Thursday, 14:50 · Northbridge Bank",
    lines: [
      { speaker: "nadia", text: "I can't believe it. He knew my name and my bank. Thank you for asking." },
      { speaker: "narrator", text: "The payment is stopped, Nadia's account is secured, and the scam is reported." },
    ],
    ending: "bk_saved",
  },
  bk_walked: {
    id: "bk_walked",
    art: "bank_desk",
    scene: "Thursday, 15:30 · Northbridge Bank",
    lines: [{ speaker: "narrator", text: "You flag Nadia's account and arrange a call back, but she doesn't answer." }],
    ending: "bk_walked",
  },
  bk_lost: {
    id: "bk_lost",
    art: "money_gone",
    scene: "Friday, 09:00 · Northbridge Bank",
    lines: [{ speaker: "narrator", text: "Nadia rings back in tears. The 'safe account' belonged to criminals, and the money has already been moved on." }],
    ending: "bk_lost",
  },
};

const ENDINGS: Record<string, Ending> = {
  sa_safe: {
    id: "sa_safe",
    title: "Call Back, Stay Safe",
    tone: "good",
    summary: "Nadia hung up and called her bank on a number she trusted. The 'fraud team' was fake.",
    consequences: ["No money lost.", "Nadia knows a name on her screen proves nothing."],
    lesson: "If your 'bank' calls, hang up and call the number on the back of your card, ideally from a different phone.",
  },
  sa_close: {
    id: "sa_close",
    title: "Stopped at the Warning",
    tone: "mixed",
    summary: "Nadia got very close, but stopped at the app's warning. Her money is safe, but she shared some details.",
    consequences: ["No money lost.", "She needs to change her online banking details and watch for follow-up calls."],
    lesson: "Read payment warnings carefully. If someone told you what to tick or say, it's a scam.",
  },
  sa_lost: {
    id: "sa_lost",
    title: "The 'Safe' Account Wasn't",
    tone: "bad",
    summary: "Nadia moved her {savings} to an account run by criminals.",
    consequences: ["{savings} could be lost. Banks may refund some victims, but it's not guaranteed and can take time.", "The right next step: call the bank straight away and report it."],
    lesson: "There is no such thing as a 'safe account'. Any caller asking you to move money is a scammer.",
  },
  bk_saved: {
    id: "bk_saved",
    title: "The Right Questions",
    tone: "good",
    summary: "Your calm questions helped Nadia tell you about the 'fraud team' call. The payment was stopped.",
    consequences: ["No money lost.", "Nadia's account is secured and the scam is reported."],
    lesson: "Gentle, open questions (“Has anyone told you what to say?”) help people who've been coached by scammers.",
  },
  bk_walked: {
    id: "bk_walked",
    title: "The Call Ended",
    tone: "mixed",
    summary: "Nadia felt judged and hung up. Her money hasn't moved yet, but she may try another way.",
    consequences: ["No money lost so far.", "She still believes the scammer, so the risk is still there."],
    lesson: "People being scammed often defend the scammer. Kindness keeps them talking long enough to see the truth.",
  },
  bk_lost: {
    id: "bk_lost",
    title: "Too Late",
    tone: "bad",
    summary: "The payment went through to a criminal's account.",
    consequences: ["{savings} could be lost, and money sent this way can be hard to recover.", "Nadia may feel let down by the bank as well as by the scammer."],
    lesson: "Urgency, a new payee and a vague reason together are warning signs. It's okay to pause a payment and ask.",
  },
};

export const SAFE_ACCOUNT_NODES = NODES;
export const SAFE_ACCOUNT_ENDINGS = ENDINGS;

export const SAFE_ACCOUNT_STORIES: StoryDef[] = [
  {
    id: "safe_victim",
    scenarioId: "safe_account",
    perspective: "victim",
    you: "nadia",
    label: "Nadia, 41, the person being targeted",
    intro: "Nadia is a nurse on a busy shift when her phone shows a call from her bank. You play as Nadia. Listen carefully, tap anything suspicious and decide what she does.",
    start: "sa_start",
    question: "What should Nadia do?",
    cast: ["nadia", "bankcaller", "okafor"],
  },
  {
    id: "safe_bank",
    scenarioId: "safe_account",
    perspective: "bank",
    you: "okafor",
    label: "Ms Okafor, the bank adviser",
    intro: "Now see it from inside the bank. You play as Ms Okafor. A customer wants to send her savings to a new account, fast. Something feels off. How do you help without making her feel foolish?",
    start: "bk_start",
    question: "What should Ms Okafor do?",
    cast: ["okafor", "nadia"],
  },
];

export const SAFE_ACCOUNT: Scenario = {
  id: "safe_account",
  title: "The Safe Account",
  icon: "🏦",
  scamType: "Bank impersonation ('safe account') scam",
  tagline: "Your bank is calling. Or is it?",
  art: "spoofed_call",
  stories: ["safe_victim", "safe_bank"],
  variants: [
    { savings: "£8,400", small: "£749", shop: "an electronics shop in Manchester" },
    { savings: "£12,750", small: "£1,200", shop: "a jewellers in Leeds" },
    { savings: "£5,900", small: "£389", shop: "an online phone shop" },
  ],
  trick: [
    { stage: "Hook", speaker: "bankcaller", line: "This is the fraud team at Northbridge Bank.", tactic: "authority_impersonation", purpose: "Uses a trusted name, often shown on the caller ID, so you lower your guard.", defence: "A name on your screen proves nothing. Hang up and call the number on your card." },
    { stage: "Create panic", speaker: "bankcaller", line: "We've stopped a payment of {small}. Did you make it?", tactic: "fear_pressure", purpose: "A fake 'suspicious payment' makes you worried and grateful for their 'help'.", defence: "Check your account yourself, in your own app, after you hang up." },
    { stage: "Cut you off", speaker: "bankcaller", line: "Don't mention this to staff at your branch.", tactic: "emotional_manipulation", purpose: "Stops you talking to the real bank, who would spot it straight away.", defence: "Anyone telling you not to trust your bank is the one you shouldn't trust." },
    { stage: "Take the money", speaker: "bankcaller", line: "We need to move your savings to a new safe account today.", tactic: "unusual_payment", purpose: "The 'safe account' belongs to the criminals.", defence: "Banks never ask you to move money to keep it safe. Ever." },
    { stage: "Take the money", speaker: "bankcaller", line: "When the app asks why, choose 'Paying family'.", tactic: "sensitive_info_request", purpose: "Coaches you past the bank's own scam warnings.", defence: "If anyone tells you what to say to your bank, stop. It's a scam." },
  ],
};
