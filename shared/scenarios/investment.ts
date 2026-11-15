// Scenario: "The VIP Group", an investment scam (a fake celebrity advert leads to a fake trading platform).
// Perspectives: Kofi (the person targeted) and Ama (his sister, who he tries to recruit).
// Every name, celebrity, company and platform here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  // ---------------- Kofi's perspective ----------------
  iv_start: {
    id: "iv_start",
    art: "investment_ad",
    scene: "Saturday, 23:10 · Kofi's sofa",
    lines: [{ speaker: "narrator", text: "Kofi, 29, is scrolling social media after a long week of deliveries when an advert catches his eye." }],
    message: { from: "Sponsored post", text: "TV star {celebrity} reveals her secret: '{promise}' Join Coach Ray's FREE VIP trading group now. Only 50 places left!" },
    clues: [
      { id: "iv-celeb", text: "TV star {celebrity} reveals her secret", tactic: "authority_impersonation", explanation: "Scam adverts use famous faces without permission. A celebrity in an ad proves nothing." },
      { id: "iv-promise", text: "{promise}", tactic: "too_good_to_be_true", explanation: "Real investments never promise easy, fast profits." },
      { id: "iv-places", text: "Only 50 places left", tactic: "false_urgency", explanation: "Fake scarcity, to make you join before you think." },
    ],
    choices: [
      { id: "iv-join", label: "Join the VIP group", next: "iv_group", safety: "risky", feedback: "Joining isn't a loss yet, but these groups are designed to build hype and trust.", saferAlternative: "Search the celebrity's name plus “scam” first." },
      { id: "iv-search", label: "Search the celebrity's name plus “scam” first", next: "iv_found", safety: "safe", feedback: "Great habit. Fake celebrity adverts are often reported online within days." },
    ],
  },
  iv_group: {
    id: "iv_group",
    art: "romance_chat",
    scene: "Sunday · VIP group chat",
    lines: [
      { speaker: "ray", text: "Welcome Kofi! 🚀 Start small: deposit {deposit} on our platform. Our members are making 40% a week, guaranteed." },
      { speaker: "narrator", text: "The chat is full of screenshots of huge profits and people saying thank you to Ray." },
    ],
    clues: [
      { id: "iv-guaranteed", text: "40% a week, guaranteed", tactic: "too_good_to_be_true", explanation: "No real investment can guarantee returns, let alone 40% a week." },
    ],
    choices: [
      { id: "iv-deposit", label: "Deposit {deposit} to try it", next: "iv_profit", safety: "risky", feedback: "It's a small start, but the platform is fake, and small wins are used to draw you in.", saferAlternative: "Check the firm on the official FCA register first." },
      { id: "iv-fca", label: "Check the firm on the official FCA register first", next: "iv_checked", safety: "safe", feedback: "Exactly right. Real UK investment firms are listed on the Financial Conduct Authority's register." },
    ],
  },
  iv_profit: {
    id: "iv_profit",
    art: "investment_ad",
    scene: "One week later · The platform",
    lines: [
      { speaker: "narrator", text: "The dashboard shows Kofi's {deposit} has grown to {gains}. It looks amazing." },
      { speaker: "ray", text: "Congrats bro! To withdraw you just need to pay a {fee} release fee first. Or invest more to unlock VIP rates!" },
    ],
    clues: [{ id: "iv-fee", text: "pay a {fee} release fee", tactic: "unusual_payment", explanation: "Paying to get your own money back is a sure sign of a fake platform. The 'profits' are just numbers on a screen." }],
    choices: [
      { id: "iv-pay", label: "Pay the release fee", next: "iv_gone", safety: "dangerous", feedback: "The 'profit' was never real. Fees just lead to more fees.", saferAlternative: "Stop, tell someone, and call your bank." },
      { id: "iv-ama", label: "Tell his sister Ama and ask what she thinks", next: "iv_out", safety: "safe", feedback: "Talking to someone outside the group breaks the spell. Well done." },
    ],
  },
  iv_found: { id: "iv_found", art: "reported", scene: "Saturday, 23:15", lines: [{ speaker: "narrator", text: "The first results: news stories warning that {celebrity} never made that advert. Kofi reports the ad." }], ending: "iv_spotted" },
  iv_checked: { id: "iv_checked", art: "reported", scene: "Sunday", lines: [{ speaker: "narrator", text: "Coach Ray's 'platform' isn't on the register. Kofi leaves the group and reports it." }], ending: "iv_checked" },
  iv_out: { id: "iv_out", art: "family_talk", scene: "Monday", lines: [{ speaker: "ama", text: "Kof, nobody legit charges you to take out your own money. Let's call your bank and report it." }], ending: "iv_out" },
  iv_gone: { id: "iv_gone", art: "investment_crash", scene: "Two weeks later", lines: [{ speaker: "narrator", text: "The website stops loading. The group chat has been deleted. Ray has blocked Kofi." }], ending: "iv_lost" },

  // ---------------- Ama's perspective (his sister) ----------------
  af_start: {
    id: "af_start",
    art: "investment_ad",
    scene: "Monday evening · Ama's flat",
    lines: [{ speaker: "kofi", text: "Ama, look at this! I put in {deposit} and it's already {gains}. You should join too, before the places go!" }],
    clues: [{ id: "af-gains", text: "it's already {gains}", tactic: "too_good_to_be_true", explanation: "Huge gains in a week are a hallmark of fake platforms. The numbers on screen are made up." }],
    choices: [
      { id: "af-join", label: "“Wow, sign me up!”", next: "af_lost", safety: "dangerous", feedback: "Scams spread through friends and family exactly like this.", saferAlternative: "Ask if he can actually withdraw his money." },
      { id: "af-ask", label: "“Nice! Have you tried taking a small amount out?”", next: "af_withdraw", safety: "safe", feedback: "Perfect question. Trying a withdrawal is where fake platforms fall apart." },
      { id: "af-mock", label: "“You idiot, that's obviously a scam.”", next: "af_defend", safety: "risky", feedback: "Calling him an idiot makes him defend the scam instead of questioning it.", saferAlternative: "Ask a curious question instead." },
    ],
  },
  af_defend: {
    id: "af_defend",
    art: "family_talk",
    scene: "Monday evening",
    lines: [{ speaker: "kofi", text: "You're just jealous. Coach Ray said people would say that." }],
    clues: [{ id: "af-ray", text: "Coach Ray said people would say that", tactic: "emotional_manipulation", explanation: "Scammers warn victims in advance that family will doubt them, so doubts feel like proof." }],
    choices: [
      { id: "af-calm", label: "“Fair enough. Let's just test a small withdrawal together.”", next: "af_withdraw", safety: "safe", feedback: "Calm and practical. Testing it gets the truth without an argument." },
      { id: "af-drop", label: "Drop it", next: "af_later", safety: "dangerous", feedback: "Kofi keeps investing, and the losses grow.", saferAlternative: "Suggest testing a small withdrawal." },
    ],
  },
  af_withdraw: {
    id: "af_withdraw",
    art: "investment_crash",
    scene: "Monday evening",
    lines: [{ speaker: "kofi", text: "It says I need to pay a {fee} release fee first… that's normal, right?" }],
    clues: [{ id: "af-fee", text: "pay a {fee} release fee", tactic: "unusual_payment", explanation: "Real platforms don't make you pay to withdraw your own money." }],
    choices: [
      { id: "af-report", label: "“No real platform does that. Let's call your bank and report it together.”", next: "af_reported", safety: "safe", feedback: "Spot on, and doing it together makes it easier for him." },
      { id: "af-pay", label: "“Maybe just pay it to get the money out.”", next: "af_lost", safety: "dangerous", feedback: "The fee is just the next step of the scam. There's nothing to get out.", saferAlternative: "Explain that release fees are a scam sign, and report it." },
    ],
  },
  af_later: {
    id: "af_later",
    art: "investment_crash",
    scene: "Two weeks later · Ama's phone",
    lines: [{ speaker: "kofi", text: "Ama… I paid a {fee} fee to withdraw, and now they want another one. They say it's tax. I'm a bit stuck." }],
    clues: [{ id: "af-another", text: "now they want another one", tactic: "unusual_payment", explanation: "Fee after fee is how these platforms drain people. The money was never going to come out." }],
    choices: [
      { id: "af-stop", label: "“Don't pay another penny. Let's call your bank and report it together.”", next: "af_partial", safety: "safe", feedback: "Right call. Stopping now protects whatever he has left." },
      { id: "af-again", label: "“Maybe pay one more and it'll come through.”", next: "af_lost", safety: "dangerous", feedback: "There will always be one more fee.", saferAlternative: "Tell him to stop paying and call his bank." },
    ],
  },
  af_partial: { id: "af_partial", art: "reported", scene: "Two weeks later", lines: [{ speaker: "narrator", text: "Ama sits with Kofi while he calls his bank and reports the platform." }], ending: "af_partial" },
  af_reported: { id: "af_reported", art: "reported", scene: "Monday evening", lines: [{ speaker: "kofi", text: "I've lost {deposit}… but I'm glad I didn't pay more. Thanks, sis." }], ending: "af_good" },
  af_lost: { id: "af_lost", art: "investment_crash", scene: "A month later", lines: [{ speaker: "narrator", text: "The platform disappears. Between them, Kofi and his friends have lost {total}." }], ending: "af_lost" },
};

const ENDINGS: Record<string, Ending> = {
  iv_spotted: { id: "iv_spotted", title: "Not Really Her", tone: "good", summary: "A quick search showed the celebrity advert was fake.", consequences: ["No money lost.", "Reporting the ad helps get it taken down."], lesson: "Celebrities in adverts prove nothing. Search the name plus “scam” before you click." },
  iv_checked: { id: "iv_checked", title: "Checked the Register", tone: "good", summary: "Kofi checked the official register before investing, and the firm wasn't on it.", consequences: ["No money lost."], lesson: "Check any investment firm on the FCA register (or your country's regulator) before you pay." },
  iv_out: { id: "iv_out", title: "Got Out Early", tone: "mixed", summary: "Kofi lost his first deposit, but stopped before paying the 'release fee'.", consequences: ["{deposit} could be lost, but no more.", "Calling the bank and reporting it quickly gives the best chance of help."], lesson: "If you have to pay to withdraw your own money, it's a scam. Stop and tell someone." },
  iv_lost: { id: "iv_lost", title: "The Profits Were Never Real", tone: "bad", summary: "Kofi paid the fee, then more. The platform vanished.", consequences: ["{deposit} plus every 'fee' could be lost.", "Scammers sometimes come back pretending to be 'recovery experts' who can get the money back for a fee. That's another scam."], lesson: "Guaranteed high returns don't exist. Numbers on a scammer's website are not money." },
  af_good: { id: "af_good", title: "The Withdrawal Test", tone: "good", summary: "Your practical question exposed the fake platform before Kofi lost more.", consequences: ["Kofi lost his first deposit but nothing more.", "You didn't join, and you didn't fall out."], lesson: "Curious questions (“Can you take money out?”) work better than arguments." },
  af_partial: { id: "af_partial", title: "Stopped the Fees", tone: "mixed", summary: "Kofi lost his deposit and one fee, but you helped him stop before the next.", consequences: ["{deposit} plus a {fee} fee could be lost.", "Beware of 'recovery experts' who promise to get it back for a fee. That's another scam."], lesson: "It's never too late to help someone stop. Ask the practical question: “Can you actually take your money out?”" },
  af_lost: { id: "af_lost", title: "It Spread", tone: "bad", summary: "The scam spread through the family and friends, as these schemes are designed to.", consequences: ["{total} could be lost between them.", "Report it and contact the banks straight away."], lesson: "When someone you love is excited about easy money, slow things down with questions, not insults." },
};

export const INVESTMENT_NODES = NODES;
export const INVESTMENT_ENDINGS = ENDINGS;

export const INVESTMENT_STORIES: StoryDef[] = [
  { id: "invest_victim", scenarioId: "investment", perspective: "victim", you: "kofi", label: "Kofi, 29, the person being targeted", intro: "Kofi works long hours and wants to get ahead. An advert with a famous face promises a way. You play as Kofi. Tap anything that sounds too good to be true and decide what he does.", start: "iv_start", question: "What should Kofi do?", cast: ["kofi", "ray", "ama"] },
  { id: "invest_family", scenarioId: "investment", perspective: "family", you: "ama", label: "Ama, Kofi's sister", intro: "Now see it from the family's side. You play as Ama. Your brother is excited about an investment that's 'already making money', and he wants you in.", start: "af_start", question: "What should Ama say?", cast: ["ama", "kofi"] },
];

export const INVESTMENT: Scenario = {
  id: "investment",
  title: "The VIP Group",
  icon: "📈",
  scamType: "Fake investment / crypto scam",
  tagline: "A famous face. Guaranteed profits. Only 50 places left.",
  art: "investment_ad",
  stories: ["invest_victim", "invest_family"],
  variants: [
    { celebrity: "Gemma Larkfield", promise: "I turned £250 into £10,000 in a month!", deposit: "£250", gains: "£1,900", fee: "£600", total: "£9,400" },
    { celebrity: "Holly Brightwater", promise: "This trick made me £8,000 a week!", deposit: "£300", gains: "£2,350", fee: "£750", total: "£11,200" },
    { celebrity: "Tasha Quillon", promise: "Banks hate this simple money trick!", deposit: "£200", gains: "£1,600", fee: "£500", total: "£7,800" },
  ],
  trick: [
    { stage: "Hook", speaker: "narrator", line: "TV star {celebrity} reveals her secret.", tactic: "authority_impersonation", purpose: "A famous face borrows trust the scammer hasn't earned.", defence: "Celebrities don't sell investments in adverts. Search the name plus “scam”." },
    { stage: "Create panic", speaker: "narrator", line: "Only 50 places left!", tactic: "false_urgency", purpose: "Fear of missing out stops careful thinking.", defence: "Real opportunities don't vanish overnight. Take your time." },
    { stage: "Build trust", speaker: "ray", line: "Our members are making 40% a week, guaranteed.", tactic: "too_good_to_be_true", purpose: "Group chats full of fake success stories make it feel normal.", defence: "No real investment is guaranteed. Check the firm on the FCA register." },
    { stage: "Build trust", speaker: "narrator", line: "Your {deposit} has grown to {gains}.", tactic: "too_good_to_be_true", purpose: "Fake profits on screen make you trust the platform and invest more.", defence: "Try withdrawing a small amount early. Fake platforms always find a reason you can't." },
    { stage: "Take the money", speaker: "ray", line: "To withdraw you just need to pay a {fee} release fee.", tactic: "unusual_payment", purpose: "Squeezes out more money before the platform disappears.", defence: "Never pay to get your own money back. Stop, report it, and call your bank." },
  ],
};
