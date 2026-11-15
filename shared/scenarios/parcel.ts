// Scenario: "The Parcel Text", a delivery "smishing" scam (a fake text that steals card details).
// Perspectives: Leo (the person targeted) and Zara (his flatmate, who he asks for advice).
// Every name, number, company and web address here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const TEXT = "{courier}: We missed you today. Your parcel is on hold due to an unpaid {fee} delivery fee. Pay within 24 hours or it will be returned: {link}";

const NODES: Record<string, StoryNode> = {
  // ---------------- Leo's perspective ----------------
  pc_start: {
    id: "pc_start",
    art: "parcel_text",
    scene: "Monday, 08:12 · Leo's bedroom",
    lines: [{ speaker: "narrator", text: "Leo is waiting for a new phone case to arrive when a text pops up." }],
    message: { from: "{courier}", text: TEXT },
    clues: [
      { id: "pc-fee", text: "unpaid {fee} delivery fee", tactic: "unusual_payment", explanation: "A tiny fee makes it feel harmless. The real goal is your card details, not the {fee}." },
      { id: "pc-24h", text: "Pay within 24 hours", tactic: "false_urgency", explanation: "A deadline to stop you checking the real tracking first." },
      { id: "pc-link", text: "{link}", tactic: "suspicious_link", explanation: "Look closely: this isn't the courier's real web address. Never pay through a link in a text." },
    ],
    choices: [
      { id: "pc-click", label: "Tap the link. It's only {fee}.", next: "pc_site", safety: "risky", feedback: "Opening the link isn't a disaster on its own, but the page is built to look real and take your details.", saferAlternative: "Check the order in the shop's own app or website instead." },
      { id: "pc-check", label: "Check the order in the shop's own app instead", next: "pc_app", safety: "safe", feedback: "Exactly right. Go to the source you already trust, never the link you were sent." },
    ],
  },
  pc_app: {
    id: "pc_app",
    art: "parcel_text",
    scene: "Monday, 08:15 · Shop app",
    lines: [{ speaker: "narrator", text: "The real tracking says Leo's parcel is arriving tomorrow. No fee." }],
    choices: [
      { id: "pc-report", label: "Forward the text to 7726 (free) to report it, then delete it", next: "pc_reported", safety: "safe", feedback: "Perfect. Reporting it helps phone networks block the number for everyone." },
      { id: "pc-delete", label: "Just delete it", next: "pc_deleted", safety: "safe", feedback: "Safe. Next time, forwarding it to 7726 first helps protect other people too." },
    ],
  },
  pc_site: {
    id: "pc_site",
    art: "fake_website",
    scene: "Monday, 08:14 · A web page",
    lines: [
      { speaker: "narrator", text: "The page looks just like {courier}'s website. It asks for Leo's name, address, date of birth and full card details." },
      { speaker: "zara", text: "Leo, wait. Why does a {fee} fee need your date of birth and the 3 numbers on the back of your card?" },
    ],
    clues: [{ id: "pc-dob", text: "date of birth and the 3 numbers on the back of your card", tactic: "sensitive_info_request", explanation: "A tiny delivery fee never needs this much personal information. It's being collected to steal from you." }],
    choices: [
      { id: "pc-pay", label: "Fill it in and pay. Zara worries too much.", next: "pc_call", safety: "dangerous", feedback: "Those details are now in criminals' hands, and they often come back for more.", saferAlternative: "Close the page and check the real tracking." },
      { id: "pc-close", label: "Close the page without typing anything", next: "pc_closed_node", safety: "safe", feedback: "Good call. You left before giving anything away." },
    ],
  },
  pc_closed_node: {
    id: "pc_closed_node",
    art: "parcel_text",
    scene: "Monday, 08:16 · Shop app",
    lines: [
      { speaker: "narrator", text: "Leo checks the shop's app. His parcel is coming tomorrow, no fee." },
      { speaker: "zara", text: "Forward it to 7726, that reports it for free." },
    ],
    ending: "pc_closed",
  },
  pc_call: {
    id: "pc_call",
    art: "spoofed_call",
    scene: "Wednesday, 18:30 · Leo's flat",
    lines: [
      { speaker: "narrator", text: "Two days later, Leo's phone rings." },
      { speaker: "bankcaller", text: "Hi Leo, this is your bank's fraud team. Someone's trying to use your card. To cancel it, read me the code we've just texted you." },
    ],
    clues: [{ id: "pc-code", text: "read me the code we've just texted you", tactic: "sensitive_info_request", explanation: "A one-time code is like a key. Your real bank will never ask you to read it out." }],
    choices: [
      { id: "pc-readcode", label: "Read out the code", next: "pc_gone", safety: "dangerous", feedback: "That code approved a payment. The caller was the same criminal who took the card details.", saferAlternative: "Hang up and call the number on the back of your card." },
      { id: "pc-bank", label: "Hang up and call the number on the back of the card", next: "pc_saved_node", safety: "safe", feedback: "Great. The real bank can cancel the card safely." },
    ],
  },
  pc_saved_node: {
    id: "pc_saved_node",
    art: "bank_call",
    scene: "Wednesday, 18:35 · Bank (number on the card)",
    lines: [{ speaker: "okafor", text: "We didn't call you, Leo. I've cancelled the card and blocked that payment. A new card is on its way." }],
    ending: "pc_saved",
  },
  pc_gone: {
    id: "pc_gone",
    art: "money_gone",
    scene: "Thursday, 07:50 · Banking app",
    lines: [{ speaker: "narrator", text: "Leo wakes up to see {loss} gone in several payments he didn't make." }],
    ending: "pc_lost",
  },
  pc_reported: { id: "pc_reported", art: "reported", scene: "Monday, 08:17", lines: [{ speaker: "narrator", text: "Leo forwards the text to 7726 and deletes it. His parcel arrives the next day." }], ending: "pc_good" },
  pc_deleted: { id: "pc_deleted", art: "parcel_text", scene: "Monday, 08:17", lines: [{ speaker: "narrator", text: "Leo deletes the text. His parcel arrives the next day." }], ending: "pc_good_quiet" },

  // ---------------- Zara's perspective (the flatmate) ----------------
  zf_start: {
    id: "zf_start",
    art: "parcel_text",
    scene: "Monday, 08:20 · The flat's kitchen",
    lines: [{ speaker: "leo", text: "Zara, look at this. My parcel's stuck. It's only {fee}, I'll just pay it, yeah?" }],
    message: { from: "{courier}", text: TEXT },
    clues: [
      { id: "zf-link", text: "{link}", tactic: "suspicious_link", explanation: "Not the courier's real address. Lookalike links are the heart of this scam." },
      { id: "zf-24h", text: "Pay within 24 hours", tactic: "false_urgency", explanation: "Pressure to act before checking." },
    ],
    choices: [
      { id: "zf-fine", label: "“Yeah, just pay it.”", next: "zf_paid", safety: "dangerous", feedback: "It looked small, but Leo's card details were the real prize.", saferAlternative: "Suggest looking closely at the link first." },
      { id: "zf-look", label: "“Hang on, let's look at that link together first.”", next: "zf_link", safety: "safe", feedback: "Great. Checking together, without judging, is exactly what a good friend does." },
      { id: "zf-mock", label: "“LOL, you'd fall for anything.”", next: "zf_hides", safety: "risky", feedback: "Teasing makes people embarrassed, and embarrassed people stop asking for advice.", saferAlternative: "Offer to check it together." },
    ],
  },
  zf_hides: {
    id: "zf_hides",
    art: "fake_website",
    scene: "Monday, 08:22 · The flat",
    lines: [
      { speaker: "narrator", text: "Leo goes quiet and takes his phone to his room." },
      { speaker: "leo", text: "Whatever. I'll sort it myself." },
    ],
    choices: [
      { id: "zf-sorry", label: "Knock on his door: “Sorry, that was mean. Want to check it together?”", next: "zf_link", safety: "safe", feedback: "Saying sorry quickly keeps the door open. Nice." },
      { id: "zf-leave", label: "Leave him to it", next: "zf_later", safety: "dangerous", feedback: "On his own, Leo filled in the fake form.", saferAlternative: "Apologise and offer to help." },
    ],
  },
  zf_link: {
    id: "zf_link",
    art: "parcel_text",
    scene: "Monday, 08:24 · The flat's kitchen",
    lines: [{ speaker: "leo", text: "Huh. The web address isn't the real {courier} one. And the shop's app says it's arriving tomorrow, no fee." }],
    choices: [
      { id: "zf-report", label: "“Forward it to 7726. It's free and reports it.”", next: "zf_reported", safety: "safe", feedback: "Spot on. Reporting helps networks block the scam for everyone." },
      { id: "zf-group", label: "“Let's warn the flat group chat too.”", next: "zf_warned", safety: "safe", feedback: "Lovely. Sharing what you've learned protects your friends." },
    ],
  },
  zf_later: {
    id: "zf_later",
    art: "spoofed_call",
    scene: "Wednesday, 18:30 · The flat",
    lines: [
      { speaker: "leo", text: "Zara… I paid that fee. Now someone from my bank is on the phone. He wants the code they just texted me, to cancel my card." },
    ],
    clues: [{ id: "zf-code", text: "He wants the code they just texted me", tactic: "sensitive_info_request", explanation: "Real banks never ask for one-time codes. This is the same criminal using the stolen card details." }],
    choices: [
      { id: "zf-hangup", label: "“Hang up! Ring the number on the back of your card.”", next: "zf_saved", safety: "safe", feedback: "Quick thinking. The real bank can cancel the card before any money goes." },
      { id: "zf-shrug", label: "“Do what they say, I guess.”", next: "zf_paid", safety: "dangerous", feedback: "That code approved a payment for the criminals.", saferAlternative: "Tell him to hang up and ring the number on his card." },
    ],
  },
  zf_saved: { id: "zf_saved", art: "bank_call", scene: "Wednesday, 18:35 · Bank (number on the card)", lines: [{ speaker: "okafor", text: "We didn't call you, Leo. I've cancelled the card. Thank your flatmate for that." }], ending: "zf_saved" },
  zf_reported: { id: "zf_reported", art: "reported", scene: "Monday, 08:26", lines: [{ speaker: "narrator", text: "Leo forwards the text to 7726 and deletes it." }], ending: "zf_good" },
  zf_warned: { id: "zf_warned", art: "reported", scene: "Monday, 08:26", lines: [{ speaker: "narrator", text: "Two people in the group chat say they got the same text." }], ending: "zf_good" },
  zf_paid: {
    id: "zf_paid",
    art: "money_gone",
    scene: "Thursday, 07:50 · The flat",
    lines: [{ speaker: "leo", text: "Zara… {loss} has gone from my account. I didn't make these payments." }],
    ending: "zf_lost",
  },
};

const ENDINGS: Record<string, Ending> = {
  pc_good: { id: "pc_good", title: "Checked and Reported", tone: "good", summary: "Leo checked the real tracking and reported the fake text to 7726.", consequences: ["No money or details lost.", "His report helps block the scam for others."], lesson: "Never pay through a link in a text. Check the order in the shop's own app, then forward the scam text to 7726." },
  pc_good_quiet: { id: "pc_good_quiet", title: "Safe, Quietly", tone: "good", summary: "Leo ignored the link and checked the real tracking.", consequences: ["No money or details lost."], lesson: "You stayed safe. Forwarding scam texts to 7726 (free) also helps protect other people." },
  pc_closed: { id: "pc_closed", title: "Closed in Time", tone: "good", summary: "Leo opened the fake page but closed it before typing anything.", consequences: ["No money or details lost."], lesson: "If a page asks for far more than the task needs, close it and go to the real website yourself." },
  pc_saved: { id: "pc_saved", title: "Card Cancelled", tone: "mixed", summary: "Leo's card details were stolen, but he called his real bank before any money went.", consequences: ["No money lost, but his card had to be cancelled.", "Criminals now have some of his personal details, so he should watch out for more scam calls."], lesson: "Your bank will never ask you to read out a one-time code. Hang up and call the number on your card." },
  pc_lost: { id: "pc_lost", title: "Small Fee, Big Loss", tone: "bad", summary: "The {fee} 'fee' gave criminals Leo's card details, and the code he read out let them spend.", consequences: ["{loss} could be lost. Call the bank right away; card payments can sometimes be disputed.", "Report it so the pattern can be tracked."], lesson: "A tiny fee is bait. The real target is your card details and your one-time codes." },
  zf_good: { id: "zf_good", title: "A Friend Who Checks", tone: "good", summary: "You helped Leo spot the fake link without making him feel silly.", consequences: ["No money or details lost.", "The text was reported, helping others."], lesson: "When a friend asks “Is this real?”, check it together kindly. Teasing makes people hide things next time." },
  zf_saved: { id: "zf_saved", title: "Saved on the Second Try", tone: "mixed", summary: "Leo's card details were stolen, but your advice stopped the follow-up call from taking money.", consequences: ["No money lost, but the card had to be cancelled.", "Next time, checking the text together at the start would avoid all of this."], lesson: "Even when a friend has made a mistake, it's not too late. Help them stop the next step." },
  zf_lost: { id: "zf_lost", title: "He Paid on His Own", tone: "bad", summary: "Without help, Leo entered his card details on the fake page.", consequences: ["{loss} could be lost.", "Leo should call his bank on the number on his card straight away."], lesson: "People ask friends because they're unsure. Taking that question seriously can save their money." },
};

export const PARCEL_NODES = NODES;
export const PARCEL_ENDINGS = ENDINGS;

export const PARCEL_STORIES: StoryDef[] = [
  { id: "parcel_victim", scenarioId: "parcel", perspective: "victim", you: "leo", label: "Leo, 19, the person being targeted", intro: "Leo, a student, is waiting for a delivery when a text arrives about a small unpaid fee. You play as Leo. Look closely at the text, tap anything suspicious, and decide what he does.", start: "pc_start", question: "What should Leo do?", cast: ["leo", "zara", "bankcaller"] },
  { id: "parcel_family", scenarioId: "parcel", perspective: "family", you: "zara", label: "Zara, Leo's flatmate", intro: "Same text, different view. You play as Zara. Your flatmate Leo asks if he should pay a parcel fee. How do you help without making him feel daft?", start: "zf_start", question: "What should Zara say?", cast: ["zara", "leo"] },
];

export const PARCEL: Scenario = {
  id: "parcel",
  title: "The Parcel Text",
  icon: "📦",
  scamType: "Fake delivery text (smishing)",
  tagline: "Just a small fee. What could go wrong?",
  art: "parcel_text",
  stories: ["parcel_victim", "parcel_family"],
  variants: [
    { courier: "ParcelPigeon", fee: "£1.45", link: "parcelpigeon-redelivery.info/pay", loss: "£640" },
    { courier: "BoxHopper", fee: "£2.99", link: "boxhopper-uk-help.net/fee", loss: "£820" },
    { courier: "CrateRunner", fee: "£1.99", link: "craterunner-redeliver.org/pay", loss: "£475" },
  ],
  trick: [
    { stage: "Hook", speaker: "narrator", line: "We missed you today. Your parcel is on hold.", tactic: "authority_impersonation", purpose: "Sent to thousands of people at once. Lots of them really are waiting for a parcel.", defence: "Check the order in the shop's own app, never through a text." },
    { stage: "Build trust", speaker: "narrator", line: "An unpaid {fee} delivery fee.", tactic: "unusual_payment", purpose: "Tiny amounts feel too small to be a scam, so people don't stop to think.", defence: "The fee isn't the point. Your card details are." },
    { stage: "Create panic", speaker: "narrator", line: "Pay within 24 hours or it will be returned.", tactic: "false_urgency", purpose: "A deadline so you click before checking.", defence: "Couriers don't send you to pay through random links. Slow down." },
    { stage: "Take the money", speaker: "narrator", line: "Name, address, date of birth and full card details.", tactic: "sensitive_info_request", purpose: "Collects everything needed to steal from you, or to fool you later in a fake 'bank' call.", defence: "Close any page asking for more than the task needs." },
    { stage: "Take the money", speaker: "bankcaller", line: "To cancel it, read me the code we've just texted you.", tactic: "sensitive_info_request", purpose: "A second scam: the 'bank' call uses the stolen details to sound real, and the code approves a payment.", defence: "Never read out a one-time code. Hang up and call the number on your card." },
  ],
};
