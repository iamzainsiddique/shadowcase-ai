// Scenario: "The Tax Refund", a fake tax office text and call (refund bait, then threats).
// Perspectives: Raj (the person targeted) and Mina (his daughter). Everything here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  tx_start: {
    id: "tx_start",
    art: "phone_message",
    scene: "Monday, 12:40 · Raj's van, lunch break",
    lines: [{ speaker: "narrator", text: "Raj, 45, a self-employed plumber, gets a text." }],
    message: { from: "TAX OFFICE", text: "You are due a tax refund of {refund}. To claim, verify your details within 24 hours: {link}" },
    clues: [
      { id: "tx-refund", text: "You are due a tax refund", tactic: "too_good_to_be_true", explanation: "Unexpected money is bait. Tax offices don't text refund links." },
      { id: "tx-24h", text: "within 24 hours", tactic: "false_urgency", explanation: "A deadline so you click without checking." },
      { id: "tx-link", text: "{link}", tactic: "suspicious_link", explanation: "Not an official government address. Always go to the official website yourself." },
    ],
    choices: [
      { id: "tx-click", label: "Tap the link to claim it", next: "tx_site", safety: "risky", feedback: "The link leads to a copycat site built to collect your details.", saferAlternative: "Go to the official government website yourself and log in there." },
      { id: "tx-official", label: "Ignore the link and log in on the official government website yourself", next: "tx_none", safety: "safe", feedback: "Exactly right. Go to the source, never the link." },
    ],
  },
  tx_site: {
    id: "tx_site",
    art: "fake_website",
    scene: "Monday, 12:42 · A web page",
    lines: [{ speaker: "narrator", text: "The page asks for Raj's name, date of birth, bank card number and the 3 digits on the back." }],
    clues: [{ id: "tx-cvv", text: "the 3 digits on the back", tactic: "sensitive_info_request", explanation: "A refund is paid into your account. It never needs your card's security code." }],
    choices: [
      { id: "tx-fill", label: "Fill it in to get the refund", next: "tx_call", safety: "dangerous", feedback: "Those details are now with criminals, and they'll use them to sound convincing later.", saferAlternative: "Close the page and check on the official site." },
      { id: "tx-close", label: "Close it. Why would a refund need my card's security code?", next: "tx_closed", safety: "safe", feedback: "Great question to ask yourself. You left before giving anything away." },
    ],
  },
  tx_call: {
    id: "tx_call",
    art: "spoofed_call",
    scene: "Tuesday, 09:10 · Raj's mobile",
    lines: [{ speaker: "taxcaller", text: "This is the Tax Office enforcement team. Your refund claim flagged unpaid tax of {fine}. Pay today by bank transfer, or a warrant will be issued for your arrest." }],
    clues: [
      { id: "tx-arrest", text: "a warrant will be issued for your arrest", tactic: "fear_pressure", explanation: "Threats of arrest over the phone are designed to make you panic. Real tax offices don't do this." },
      { id: "tx-transfer", text: "Pay today by bank transfer", tactic: "unusual_payment", explanation: "Paying 'today' to an account they give you is a sure sign of a scam." },
    ],
    choices: [
      { id: "tx-pay", label: "Pay it to avoid arrest", next: "tx_gone", safety: "dangerous", feedback: "Fear did the work. The account belongs to the scammer.", saferAlternative: "Hang up and check your tax account on the official website." },
      { id: "tx-hang", label: "Hang up and check your tax account on the official website", next: "tx_card", safety: "safe", feedback: "Well done. Nothing is owed, and now you know." },
    ],
  },
  tx_none: { id: "tx_none", art: "reported", scene: "Monday, 12:50", lines: [{ speaker: "narrator", text: "Raj's real tax account shows no refund at all. He forwards the text to 7726." }], ending: "tx_safe" },
  tx_closed: { id: "tx_closed", art: "reported", scene: "Monday, 12:45", lines: [{ speaker: "narrator", text: "Raj closes the page and reports the text by forwarding it to 7726." }], ending: "tx_closed" },
  tx_card: { id: "tx_card", art: "bank_call", scene: "Tuesday, 09:30 · Bank (number on the card)", lines: [{ speaker: "okafor", text: "Your card details were stolen through that fake website. I've cancelled the card. No payments have gone through." }], ending: "tx_card" },
  tx_gone: { id: "tx_gone", art: "money_gone", scene: "Tuesday, 11:00", lines: [{ speaker: "narrator", text: "Raj checks his real tax account. He never owed anything." }], ending: "tx_lost" },

  // ---------------- Mina's perspective (his daughter) ----------------
  mf_start: {
    id: "mf_start",
    art: "phone_message",
    scene: "Monday, 18:00 · The kitchen",
    lines: [{ speaker: "raj", text: "Mina, look! The tax office owes me {refund}! I just need to put my card details in. Can you help me with this website?" }],
    clues: [{ id: "mf-owes", text: "The tax office owes me {refund}", tactic: "too_good_to_be_true", explanation: "An unexpected refund by text is one of the most common scams." }],
    choices: [
      { id: "mf-help", label: "Help him fill it in", next: "mf_call", safety: "dangerous", feedback: "The site was fake, and now the criminals have his card details.", saferAlternative: "Show him how to check on the official site." },
      { id: "mf-check", label: "“Dad, tax offices don't text links. Let's check your account on the official site.”", next: "mf_good", safety: "safe", feedback: "Spot on, and helpful rather than bossy." },
      { id: "mf-eye", label: "Roll your eyes: “Dad, that's so obviously fake.”", next: "mf_hurt", safety: "risky", feedback: "True, but it makes him feel silly, so he may do it alone.", saferAlternative: "Show him how to check it properly." },
    ],
  },
  mf_hurt: {
    id: "mf_hurt",
    art: "family_talk",
    scene: "Monday, 18:01",
    lines: [{ speaker: "raj", text: "Alright, clever clogs. I'll do it myself, then." }],
    choices: [
      { id: "mf-sorry", label: "“Sorry, Dad. Let me show you how to check it properly.”", next: "mf_good", safety: "safe", feedback: "Nice save. Showing beats telling." },
      { id: "mf-shrug", label: "Shrug and go back to your phone", next: "mf_call", safety: "dangerous", feedback: "On his own, he filled in the fake form.", saferAlternative: "Apologise and help him check." },
    ],
  },
  mf_call: {
    id: "mf_call",
    art: "spoofed_call",
    scene: "Tuesday, 09:15 · Raj rings Mina",
    lines: [{ speaker: "raj", text: "Mina! The tax office is on the phone saying I'll be arrested unless I pay {fine} today!" }],
    clues: [{ id: "mf-arrest", text: "I'll be arrested unless I pay", tactic: "fear_pressure", explanation: "Threats of arrest over the phone are a scam tactic, not how tax offices work." }],
    choices: [
      { id: "mf-hang", label: "“Hang up, Dad! The real tax office doesn't threaten arrest on the phone. Call the bank.”", next: "mf_partial", safety: "safe", feedback: "Quick and clear. That stopped the payment." },
      { id: "mf-pay", label: "“Just pay it so they go away.”", next: "mf_lost", safety: "dangerous", feedback: "Paying doesn't make scammers go away. It shows them you'll pay.", saferAlternative: "Tell him to hang up and call the bank." },
    ],
  },
  mf_good: { id: "mf_good", art: "reported", scene: "Monday, 18:10", lines: [{ speaker: "raj", text: "No refund on the real site… Thanks, love. I nearly put my card in." }], ending: "mf_good" },
  mf_partial: { id: "mf_partial", art: "bank_call", scene: "Tuesday, 09:30", lines: [{ speaker: "narrator", text: "Raj hangs up and calls his bank. They cancel his card before anything is taken." }], ending: "mf_partial" },
  mf_lost: { id: "mf_lost", art: "money_gone", scene: "Tuesday, 11:00", lines: [{ speaker: "narrator", text: "Raj pays. The 'tax office' calls again the next week, asking for more." }], ending: "mf_lost" },
};

const ENDINGS: Record<string, Ending> = {
  tx_safe: { id: "tx_safe", title: "Straight to the Source", tone: "good", summary: "Raj checked his real tax account instead of clicking the link.", consequences: ["No money or details lost."], lesson: "For anything about tax or benefits, go to the official website yourself. Never use a link in a text." },
  tx_closed: { id: "tx_closed", title: "Closed in Time", tone: "good", summary: "Raj noticed the page wanted far too much and closed it.", consequences: ["No money or details lost."], lesson: "A refund never needs your card's security code." },
  tx_card: { id: "tx_card", title: "Card Cancelled", tone: "mixed", summary: "Raj's card details were stolen, but he didn't fall for the threatening call.", consequences: ["No money lost, but his card had to be cancelled."], lesson: "Threats of arrest over the phone are always a scam. Hang up and check yourself." },
  tx_lost: { id: "tx_lost", title: "Paid Out of Fear", tone: "bad", summary: "Raj paid {fine} to avoid an 'arrest' that was never real.", consequences: ["{fine} could be lost.", "Scammers often call back for more. Report it and tell the bank now."], lesson: "Real tax offices don't threaten arrest on the phone or demand payment today." },
  mf_good: { id: "mf_good", title: "Show, Don't Tell", tone: "good", summary: "You showed your dad how to check the real way.", consequences: ["No money or details lost.", "He knows how to check next time."], lesson: "Helping someone check for themselves builds a habit that lasts." },
  mf_partial: { id: "mf_partial", title: "Hang Up!", tone: "mixed", summary: "His card details were stolen, but your advice stopped the 'tax' payment.", consequences: ["No money lost, but the card was cancelled."], lesson: "When someone's in a panic, a short, calm instruction (“Hang up and call the bank”) is the most helpful thing." },
  mf_lost: { id: "mf_lost", title: "They Didn't Go Away", tone: "bad", summary: "Raj paid, and the scammers came back for more.", consequences: ["{fine} could be lost."], lesson: "Paying a scammer never ends it. Hang up, check officially, and report." },
};

export const TAX_NODES = NODES;
export const TAX_ENDINGS = ENDINGS;

export const TAX_STORIES: StoryDef[] = [
  { id: "tax_victim", scenarioId: "tax", perspective: "victim", you: "raj", label: "Raj, 45, the person being targeted", intro: "Raj is a busy plumber. A text says the tax office owes him money. You play as Raj. Tap anything suspicious and decide what he does.", start: "tx_start", question: "What should Raj do?", cast: ["raj", "taxcaller", "okafor"] },
  { id: "tax_family", scenarioId: "tax", perspective: "family", you: "mina", label: "Mina, Raj's daughter", intro: "Now see it from the family's side. You play as Mina, 17. Your dad is excited about a tax refund and wants your help with a website.", start: "mf_start", question: "What should Mina say?", cast: ["mina", "raj"] },
];

export const TAX: Scenario = {
  id: "tax",
  title: "The Tax Refund",
  icon: "🧾",
  scamType: "Fake tax refund and tax-threat scam",
  tagline: "First they offer money. Then they threaten you.",
  art: "spoofed_call",
  stories: ["tax_victim", "tax_family"],
  variants: [
    { refund: "£326.40", fine: "£1,850", link: "tax-refund-claim.info/verify", callerId: "TAX OFFICE" },
    { refund: "£487.12", fine: "£2,400", link: "taxoffice-refunds.net/claim", callerId: "TAX OFFICE" },
    { refund: "£212.75", fine: "£1,200", link: "secure-tax-rebate.org/form", callerId: "TAX OFFICE" },
  ],
  trick: [
    { stage: "Hook", speaker: "narrator", line: "You are due a tax refund of {refund}.", tactic: "too_good_to_be_true", purpose: "Free money gets people to click without thinking.", defence: "Tax offices don't text refund links. Check on the official website yourself." },
    { stage: "Create panic", speaker: "narrator", line: "Verify your details within 24 hours.", tactic: "false_urgency", purpose: "A deadline stops you from checking.", defence: "Real refunds don't vanish in 24 hours." },
    { stage: "Take the money", speaker: "narrator", line: "Card number and the 3 digits on the back.", tactic: "sensitive_info_request", purpose: "Steals card details, and gives the scammer information to sound real later.", defence: "A refund never needs your card's security code." },
    { stage: "Create panic", speaker: "taxcaller", line: "A warrant will be issued for your arrest.", tactic: "fear_pressure", purpose: "Fear makes people pay without thinking.", defence: "Real tax offices don't threaten arrest on the phone. Hang up." },
    { stage: "Take the money", speaker: "taxcaller", line: "Pay {fine} today by bank transfer.", tactic: "unusual_payment", purpose: "Money sent this way goes straight to the criminals.", defence: "Check what you owe on the official website, and never pay a caller." },
  ],
};
