// Scenario: "Hi Mum", the new-number messaging scam (someone pretends to be your child on a new number).
// Perspectives: Sue (the person targeted) and Tom (her husband). Every name and number here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  nn_start: {
    id: "nn_start",
    art: "phone_message",
    scene: "Wednesday, 19:20 · Sue's sofa",
    lines: [{ speaker: "narrator", text: "Sue, 58, gets a message from a number she doesn't know." }],
    message: { from: "Unknown number", text: "Hi Mum, it's me! I dropped my phone down the loo 🙈 This is my new number, save it x" },
    clues: [{ id: "nn-newnumber", text: "This is my new number", tactic: "family_impersonation", explanation: "A 'new number' from a child who never says their name is the classic opening of this scam." }],
    choices: [
      { id: "nn-who", label: "Reply: “Which one of my children is this?”", next: "nn_dodge", safety: "safe", feedback: "Good. Make them say who they are, and notice if they dodge." },
      { id: "nn-ella", label: "Reply: “Oh no, Ella! Saved x”", next: "nn_ask", safety: "risky", feedback: "You've just told a stranger your daughter's name, which they'll now use.", saferAlternative: "Ask who it is, or ring your children on their old numbers." },
    ],
  },
  nn_dodge: {
    id: "nn_dodge",
    art: "phone_message",
    scene: "Wednesday, 19:22 · Messages",
    lines: [{ speaker: "fakeella", text: "Haha very funny Mum, it's your favourite 😂 Listen, I need a favour, it's a bit urgent." }],
    clues: [{ id: "nn-favourite", text: "it's your favourite", tactic: "family_impersonation", explanation: "Dodging a simple question with a joke. A real child would just say their name." }],
    choices: [
      { id: "nn-call", label: "Ring Ella on her old number", next: "nn_real", safety: "safe", feedback: "The best move of all: check on a number you already know." },
      { id: "nn-favour", label: "“What's the favour, love?”", next: "nn_ask", safety: "risky", feedback: "They still haven't said who they are.", saferAlternative: "Ring your children on their old numbers." },
    ],
  },
  nn_ask: {
    id: "nn_ask",
    art: "phone_message",
    scene: "Wednesday, 19:25 · Messages",
    lines: [{ speaker: "fakeella", text: "I need to pay {bill} today, {amount}, but my banking app won't work on the new phone. Can you pay it to {payee}? I'll pay you back tomorrow x" }],
    clues: [
      { id: "nn-today", text: "I need to pay {bill} today", tactic: "false_urgency", explanation: "A deadline so you pay before you think to check." },
      { id: "nn-payee", text: "pay it to {payee}", tactic: "unusual_payment", explanation: "The money goes to a stranger's account, not your child's." },
    ],
    choices: [
      { id: "nn-pay", label: "Send {amount} to {payee}", next: "nn_more", safety: "dangerous", feedback: "That account belongs to the scammer.", saferAlternative: "Ask for a voice note, or ring her old number." },
      { id: "nn-voice", label: "“Send me a voice note first, love.”", next: "nn_excuse", safety: "safe", feedback: "Clever. A quick voice note is easy for a real child and impossible for a scammer." },
    ],
  },
  nn_excuse: {
    id: "nn_excuse",
    art: "phone_message",
    scene: "Wednesday, 19:27 · Messages",
    lines: [{ speaker: "fakeella", text: "Can't, my mic's broken too 😩 Please Mum, I'm really stressed." }],
    clues: [{ id: "nn-mic", text: "my mic's broken too", tactic: "family_impersonation", explanation: "Always a reason they can't speak to you. That's because they're not who they say." }],
    choices: [
      { id: "nn-call2", label: "Ring Ella on her old number anyway", next: "nn_real", safety: "safe", feedback: "Spot on. Excuses are a reason to check, not to pay." },
      { id: "nn-pay2", label: "Pay it. She sounds stressed.", next: "nn_more", safety: "dangerous", feedback: "The stress is part of the script.", saferAlternative: "Ring her old number." },
    ],
  },
  nn_more: {
    id: "nn_more",
    art: "phone_message",
    scene: "Wednesday, 20:05 · Messages",
    lines: [{ speaker: "fakeella", text: "Thank you!! One more thing, there's a late fee of {late}. Can you cover that too? x" }],
    choices: [
      { id: "nn-stop", label: "Stop, and ring Ella's old number", next: "nn_part", safety: "safe", feedback: "Right call. Stopping now protects the rest." },
      { id: "nn-again", label: "Pay the late fee too", next: "nn_gone", safety: "dangerous", feedback: "There's always one more fee.", saferAlternative: "Stop and ring her old number." },
    ],
  },
  nn_real: { id: "nn_real", art: "family_talk", scene: "Wednesday, 19:30 · On the phone", lines: [{ speaker: "ella", text: "Mum? My phone's fine, I'm at work! I never messaged you." }], ending: "nn_safe" },
  nn_part: { id: "nn_part", art: "bank_call", scene: "Wednesday, 20:10", lines: [{ speaker: "narrator", text: "Ella answers on her old number. She never messaged. Sue rings her bank straight away." }], ending: "nn_partial" },
  nn_gone: { id: "nn_gone", art: "money_gone", scene: "Thursday morning", lines: [{ speaker: "narrator", text: "The new number stops replying. Ella rings for a chat, and Sue realises." }], ending: "nn_lost" },

  // ---------------- Tom's perspective (her husband) ----------------
  tf_start: {
    id: "tf_start",
    art: "phone_message",
    scene: "Wednesday, 19:30 · The living room",
    lines: [
      { speaker: "narrator", text: "Tom notices Sue tapping at her phone, looking worried." },
      { speaker: "sue", text: "Ella's lost her phone. She's on a new number and needs {amount} for {bill} today. I'm just paying it." },
    ],
    clues: [{ id: "tf-newnumber", text: "She's on a new number", tactic: "family_impersonation", explanation: "A child on a 'new number' asking for money is one of the most common scams." }],
    choices: [
      { id: "tf-ok", label: "“Go on then, she's our daughter.”", next: "tf_paid", safety: "dangerous", feedback: "It sounded like Ella, but nobody checked.", saferAlternative: "Suggest ringing her old number first." },
      { id: "tf-check", label: "“Let's ring her old number first, just to be sure.”", next: "tf_ring", safety: "safe", feedback: "Perfect. Calm, practical and kind." },
      { id: "tf-mock", label: "“You'd believe anything!”", next: "tf_upset", safety: "risky", feedback: "Mocking makes people defensive, and less likely to tell you next time.", saferAlternative: "Suggest checking together." },
    ],
  },
  tf_upset: {
    id: "tf_upset",
    art: "family_talk",
    scene: "Wednesday, 19:31",
    lines: [{ speaker: "sue", text: "Don't be horrible, Tom. She needs help." }],
    choices: [
      { id: "tf-sorry", label: "“Sorry. Let's just ring her old number together.”", next: "tf_ring", safety: "safe", feedback: "Saying sorry quickly gets you both back on the same side." },
      { id: "tf-leave", label: "Leave her to it", next: "tf_paid", safety: "dangerous", feedback: "On her own, Sue sends the money.", saferAlternative: "Apologise and check together." },
    ],
  },
  tf_ring: {
    id: "tf_ring",
    art: "family_talk",
    scene: "Wednesday, 19:33 · On speakerphone",
    lines: [{ speaker: "ella", text: "Dad? I haven't lost my phone! Don't send anything!" }],
    choices: [
      { id: "tf-report", label: "Block and report the number, then warn the family group chat", next: "tf_reported", safety: "safe", feedback: "Great. Warning the family protects everyone else they might try." },
      { id: "tf-forget", label: "Laugh it off and forget about it", next: "tf_reported", safety: "safe", feedback: "Safe! Reporting the number as well would help protect others." },
    ],
  },
  tf_paid: {
    id: "tf_paid",
    art: "phone_message",
    scene: "Wednesday, 20:05",
    lines: [{ speaker: "sue", text: "Tom, she's asking for another {late} now, for a late fee…" }],
    choices: [
      { id: "tf-stop", label: "“Hold on. Let's ring her old number right now.”", next: "tf_late", safety: "safe", feedback: "Better late than never. This stops the next payment." },
      { id: "tf-more", label: "“Just send it.”", next: "tf_gone", safety: "dangerous", feedback: "Every 'one more thing' is more money gone.", saferAlternative: "Ring her old number before paying anything else." },
    ],
  },
  tf_reported: { id: "tf_reported", art: "reported", scene: "Wednesday, 19:40", lines: [{ speaker: "narrator", text: "Sue blocks the number. Two cousins in the group chat say they got the same message." }], ending: "tf_good" },
  tf_late: { id: "tf_late", art: "bank_call", scene: "Wednesday, 20:10", lines: [{ speaker: "narrator", text: "The real Ella is fine. Tom and Sue call their bank about the first payment." }], ending: "tf_partial" },
  tf_gone: { id: "tf_gone", art: "money_gone", scene: "Thursday morning", lines: [{ speaker: "narrator", text: "The number stops replying. The real Ella never needed anything." }], ending: "tf_lost" },
};

const ENDINGS: Record<string, Ending> = {
  nn_safe: { id: "nn_safe", title: "Old Number, Real Answer", tone: "good", summary: "Sue rang her daughter's old number and found out the truth.", consequences: ["No money lost."], lesson: "If a child messages from a 'new number' asking for money, ring their old number, or ask for a voice note, before doing anything." },
  nn_partial: { id: "nn_partial", title: "Stopped the Second Payment", tone: "mixed", summary: "Sue sent one payment, then stopped and checked.", consequences: ["{amount} could be lost. Calling the bank quickly gives the best chance of getting some back.", "No further money lost."], lesson: "It's never too late to stop. A request for 'one more' payment is a sign to check." },
  nn_lost: { id: "nn_lost", title: "It Wasn't Ella", tone: "bad", summary: "Sue paid twice to a stranger pretending to be her daughter.", consequences: ["{amount} plus {late} could be lost.", "Report it to the bank straight away, and report the number."], lesson: "Never pay a 'new number' without speaking to your child first." },
  tf_good: { id: "tf_good", title: "Check Together", tone: "good", summary: "You helped Sue check with the real Ella before any money moved.", consequences: ["No money lost.", "The family knows about the scam now."], lesson: "When someone you love is about to pay in a hurry, suggest a quick check together, kindly." },
  tf_partial: { id: "tf_partial", title: "Caught It Halfway", tone: "mixed", summary: "One payment went, but you stopped the second.", consequences: ["{amount} could be lost.", "Ring the bank immediately; sometimes payments can be stopped or recovered."], lesson: "The second request is a great moment to step in. Scams usually ask for more." },
  tf_lost: { id: "tf_lost", title: "Nobody Checked", tone: "bad", summary: "The money went to a stranger, twice.", consequences: ["{amount} plus {late} could be lost."], lesson: "A two-minute phone call to the real person would have stopped it." },
};

export const NEW_NUMBER_NODES = NODES;
export const NEW_NUMBER_ENDINGS = ENDINGS;

export const NEW_NUMBER_STORIES: StoryDef[] = [
  { id: "newnum_victim", scenarioId: "new_number", perspective: "victim", you: "sue", label: "Sue, 58, the person being targeted", intro: "Sue is relaxing after work when a message arrives from 'her daughter' on a new number. You play as Sue. Tap anything suspicious, and decide how she replies.", start: "nn_start", question: "What should Sue do?", cast: ["sue", "fakeella", "ella"] },
  { id: "newnum_family", scenarioId: "new_number", perspective: "family", you: "tom", label: "Tom, Sue's husband", intro: "Now see it from the family's side. You play as Tom. Your wife is about to send money to your daughter's 'new number'.", start: "tf_start", question: "What should Tom say?", cast: ["tom", "sue", "ella"] },
];

export const NEW_NUMBER: Scenario = {
  id: "new_number",
  title: "Hi Mum, New Number",
  icon: "💬",
  scamType: "'Hi Mum' new-number message scam",
  tagline: "It sounds just like your child. It isn't.",
  art: "phone_message",
  stories: ["newnum_victim", "newnum_family"],
  variants: [
    { amount: "£1,280", late: "£180", bill: "my rent", payee: "J. Okon Lettings" },
    { amount: "£965", late: "£140", bill: "a phone bill", payee: "M. Reid" },
    { amount: "£1,540", late: "£220", bill: "a car repair", payee: "K. Doyle Motors" },
  ],
  trick: [
    { stage: "Hook", speaker: "fakeella", line: "Hi Mum, it's me! This is my new number.", tactic: "family_impersonation", purpose: "Sent to lots of parents at once. Many have a child who could have lost a phone.", defence: "Ring your child on the number you already have." },
    { stage: "Build trust", speaker: "fakeella", line: "Haha very funny Mum, it's your favourite.", tactic: "family_impersonation", purpose: "Avoids giving a name, so you fill it in yourself.", defence: "If they won't say their name, stop." },
    { stage: "Create panic", speaker: "fakeella", line: "I need to pay {bill} today.", tactic: "false_urgency", purpose: "A deadline so you pay before checking.", defence: "A real child can wait two minutes while you phone them." },
    { stage: "Cut you off", speaker: "fakeella", line: "Can't send a voice note, my mic's broken too.", tactic: "family_impersonation", purpose: "Stops you hearing that it's not really them.", defence: "No voice, no money." },
    { stage: "Take the money", speaker: "fakeella", line: "Can you pay it to {payee}?", tactic: "unusual_payment", purpose: "The money goes straight to the scammer's account.", defence: "Never pay a stranger's account because of a message. Check first." },
  ],
};
