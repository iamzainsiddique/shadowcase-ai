// Scenario: "The Perfect Match", a romance scam (a fake online partner who builds trust, then asks for money).
// Perspectives: Brenda (the person targeted) and Chris (her son, who notices something is wrong).
// Every name and profile here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const NODES: Record<string, StoryNode> = {
  // ---------------- Brenda's perspective ----------------
  rm_start: {
    id: "rm_start",
    art: "romance_chat",
    scene: "Week 6 · Brenda's living room, 07:30",
    lines: [{ speaker: "narrator", text: "Brenda, 62, has been chatting with Mark for six weeks. He says he's an army doctor working overseas. Every morning there's a sweet message waiting." }],
    message: { from: "Mark ❤️", text: "Good morning my beautiful Brenda. I've never felt like this about anyone. Let's move our chats off this dating site to WhatsApp, it's more private 😊" },
    clues: [
      { id: "rm-never", text: "I've never felt like this about anyone", tactic: "emotional_manipulation", explanation: "Very strong feelings, very fast, from someone you've never met. Scammers call it 'love bombing'." },
      { id: "rm-move", text: "move our chats off this dating site", tactic: "suspicious_link", explanation: "Dating sites can spot and ban scammers. Moving you to a private app takes away that protection." },
    ],
    choices: [
      { id: "rm-whatsapp", label: "Move to WhatsApp. It is more private.", next: "rm_ask", safety: "risky", feedback: "Moving off the dating site removes its safety checks, which is why scammers push for it.", saferAlternative: "Stay on the site and ask for a video call first." },
      { id: "rm-video", label: "“I'd love to. Let's have a video call first.”", next: "rm_excuse", safety: "safe", feedback: "Smart. A quick video call is one of the simplest ways to check someone is real." },
    ],
  },
  rm_excuse: {
    id: "rm_excuse",
    art: "romance_chat",
    scene: "Week 6 · Later that day",
    lines: [{ speaker: "mark", text: "My camera is broken here on the base, darling, and the signal is terrible. Soon, I promise." }],
    clues: [{ id: "rm-camera", text: "My camera is broken", tactic: "family_impersonation", explanation: "There's always a reason they can't video call. That's because the photos aren't really them." }],
    choices: [
      { id: "rm-search", label: "Do a reverse image search on his photos", next: "rm_found", safety: "safe", feedback: "Brilliant. Reverse image search often reveals stolen photos in seconds." },
      { id: "rm-trust", label: "Accept it. He's busy saving lives.", next: "rm_ask", safety: "risky", feedback: "Understandable, but excuses for never being seen are a key warning sign.", saferAlternative: "Check his photos with a reverse image search." },
    ],
  },
  rm_ask: {
    id: "rm_ask",
    art: "romance_chat",
    scene: "Week 8 · A message late at night",
    lines: [
      { speaker: "mark", text: "Brenda, I'm in trouble. My bank account is frozen out here and I need {amount} for {reason}. I'll pay you back the moment I land." },
      { speaker: "mark", text: "Please don't tell your son. He wouldn't understand what we have." },
    ],
    clues: [
      { id: "rm-amount", text: "I need {amount} for {reason}", tactic: "unusual_payment", explanation: "Someone you've never met in person asking for money is the classic sign of a romance scam." },
      { id: "rm-son", text: "Please don't tell your son", tactic: "emotional_manipulation", explanation: "Keeping family out is how scammers keep you from being protected." },
    ],
    choices: [
      { id: "rm-send", label: "Send the money. He'll pay it back.", next: "rm_more", safety: "dangerous", feedback: "Once the first payment works, the requests usually grow.", saferAlternative: "Talk to Chris before sending anything." },
      { id: "rm-chris", label: "Tell Chris about it", next: "rm_chris", safety: "safe", feedback: "Very brave. Telling someone breaks the secrecy the scam depends on." },
    ],
  },
  rm_more: {
    id: "rm_more",
    art: "romance_chat",
    scene: "Week 9 · A message",
    lines: [{ speaker: "mark", text: "Darling, thank you! Just one more problem: customs want another {amount2} before they'll release my things. Then I can finally come home to you." }],
    clues: [{ id: "rm-more", text: "customs want another {amount2}", tactic: "false_urgency", explanation: "There's always 'one more' fee. It never ends until you stop paying." }],
    choices: [
      { id: "rm-again", label: "Send it. We're so close.", next: "rm_gone", safety: "dangerous", feedback: "The 'one more fee' pattern keeps going until the money runs out.", saferAlternative: "Stop and tell Chris." },
      { id: "rm-stop", label: "Stop and tell Chris everything", next: "rm_stopped", safety: "safe", feedback: "It takes courage to stop. You protected the rest of your savings." },
    ],
  },
  rm_found: { id: "rm_found", art: "reported", scene: "Week 6 · Brenda's laptop", lines: [{ speaker: "narrator", text: "The photos belong to a real officer in another country, with a different name. Brenda reports the profile to the dating site." }], ending: "rm_spotted" },
  rm_chris: {
    id: "rm_chris",
    art: "family_talk",
    scene: "Week 8 · Sunday lunch",
    lines: [{ speaker: "chris", text: "Mum, I'm not cross. But someone you've never seen asking for money is exactly how these scams work. Let's look into him together." }],
    ending: "rm_family",
  },
  rm_stopped: { id: "rm_stopped", art: "family_talk", scene: "Week 9 · Sunday lunch", lines: [{ speaker: "chris", text: "Thank you for telling me, Mum. We'll call your bank and report the profile together." }], ending: "rm_stopped" },
  rm_gone: { id: "rm_gone", art: "money_gone", scene: "Month 4", lines: [{ speaker: "narrator", text: "Mark's messages stop. His profile disappears. Brenda has sent {total}." }], ending: "rm_lost" },

  // ---------------- Chris's perspective (her son) ----------------
  cf_start: {
    id: "cf_start",
    art: "family_talk",
    scene: "Sunday lunch · Brenda's house",
    lines: [
      { speaker: "narrator", text: "Chris notices his mum keeps checking her phone and smiling." },
      { speaker: "brenda", text: "I've met someone, Chris. Mark. He's a doctor overseas. He just needs a little help with money until he gets home." },
    ],
    clues: [{ id: "cf-money", text: "He just needs a little help with money", tactic: "unusual_payment", explanation: "An online partner who needs money before you've ever met is the biggest warning sign." }],
    choices: [
      { id: "cf-laugh", label: "“Mum, he's obviously fake. How could you be so naive?”", next: "cf_defend", safety: "risky", feedback: "You might be right, but feeling foolish makes people defend the scammer and stop talking to you.", saferAlternative: "Show interest and ask gentle questions." },
      { id: "cf-listen", label: "“Tell me about him. Have you two ever video-called?”", next: "cf_talk", safety: "safe", feedback: "Lovely. Interest and gentle questions help her look at it clearly herself." },
      { id: "cf-ignore", label: "Change the subject", next: "cf_lost", safety: "dangerous", feedback: "She raised it with you, which was a chance to help. Without it, the scam carries on in secret.", saferAlternative: "Ask about him kindly." },
    ],
  },
  cf_defend: {
    id: "cf_defend",
    art: "family_talk",
    scene: "Sunday lunch",
    lines: [{ speaker: "brenda", text: "You don't know him. You never want me to be happy." }],
    choices: [
      { id: "cf-sorry", label: "“I'm sorry. I do want you to be happy. Can we look at his messages together?”", next: "cf_talk", safety: "safe", feedback: "Saying sorry and showing you care brings her back into the conversation." },
      { id: "cf-fine", label: "“Fine. It's your money.”", next: "cf_lost", safety: "dangerous", feedback: "Walking away leaves her alone with someone who's working hard to isolate her.", saferAlternative: "Apologise and offer to look together." },
    ],
  },
  cf_talk: {
    id: "cf_talk",
    art: "romance_chat",
    scene: "Sunday afternoon",
    lines: [{ speaker: "brenda", text: "No, we've never video-called. His camera's broken. And… he said not to tell you." }],
    clues: [
      { id: "cf-camera", text: "His camera's broken", tactic: "family_impersonation", explanation: "Never being seen on camera often means the photos belong to someone else." },
      { id: "cf-secret", text: "he said not to tell you", tactic: "emotional_manipulation", explanation: "Asking her to keep secrets from family is a big red flag." },
    ],
    choices: [
      { id: "cf-search", label: "“Shall we do a reverse image search on his photos together?”", next: "cf_found", safety: "safe", feedback: "Perfect. Letting her see the evidence herself is far stronger than telling her." },
      { id: "cf-grab", label: "Take her phone and block him yourself", next: "cf_blocked", safety: "risky", feedback: "It stops this one, but she may feel humiliated and hide the next one from you.", saferAlternative: "Check his photos together so she sees it herself." },
    ],
  },
  cf_found: { id: "cf_found", art: "reported", scene: "Sunday afternoon", lines: [{ speaker: "brenda", text: "That's… a different man's name. Oh, Chris. Thank you for not laughing at me." }], ending: "cf_good" },
  cf_blocked: { id: "cf_blocked", art: "family_talk", scene: "Sunday afternoon", lines: [{ speaker: "brenda", text: "I'm a grown woman, Chris. You had no right." }], ending: "cf_mixed" },
  cf_lost: { id: "cf_lost", art: "money_gone", scene: "Three months later", lines: [{ speaker: "narrator", text: "Brenda finally tells Chris the truth. She has sent Mark {total}, and he has vanished." }], ending: "cf_lost" },
};

const ENDINGS: Record<string, Ending> = {
  rm_spotted: { id: "rm_spotted", title: "The Photos Told the Truth", tone: "good", summary: "A reverse image search showed 'Mark' was using a stranger's photos.", consequences: ["No money lost.", "Reporting the profile helps the site protect others."], lesson: "If you can't video call someone, you don't know who they are. A reverse image search can show stolen photos." },
  rm_family: { id: "rm_family", title: "Brave Enough to Ask", tone: "good", summary: "Brenda told her son before sending anything. Together they saw it for what it was.", consequences: ["No money lost.", "Brenda knows she can talk to Chris without being judged."], lesson: "Anyone asking you to keep a relationship secret from family is protecting themselves, not you." },
  rm_stopped: { id: "rm_stopped", title: "Stopped the Spiral", tone: "mixed", summary: "Brenda sent the first payment but stopped before the next one.", consequences: ["{amount} could be lost.", "Telling Chris and the bank quickly gives the best chance of help."], lesson: "It's never too late to stop. Scammers always have 'one more fee'." },
  rm_lost: { id: "rm_lost", title: "Heartbreak Twice Over", tone: "bad", summary: "Brenda lost her savings and the relationship she believed in.", consequences: ["{total} could be lost.", "Romance scam victims often feel ashamed, but it's a crime, and it's not their fault."], lesson: "Never send money to someone you've only met online, however real it feels." },
  cf_good: { id: "cf_good", title: "Seeing It for Herself", tone: "good", summary: "You helped your mum find the truth herself, kindly.", consequences: ["No more money lost.", "Brenda trusts you enough to come to you next time."], lesson: "Help people see the evidence for themselves. It's kinder and much more convincing than telling them they're wrong." },
  cf_mixed: { id: "cf_mixed", title: "Blocked, But Hurt", tone: "mixed", summary: "Mark is blocked, but Brenda feels embarrassed and angry.", consequences: ["No more money lost for now.", "She may hide the next approach from you."], lesson: "Protecting someone works best with them, not over their head." },
  cf_lost: { id: "cf_lost", title: "Lost in Secret", tone: "bad", summary: "Brenda kept sending money for months without telling anyone.", consequences: ["{total} could be lost.", "Contacting the bank and reporting it now is still worth doing."], lesson: "When someone you love mentions an online partner who needs money, stay curious and kind, and keep talking." },
};

export const ROMANCE_NODES = NODES;
export const ROMANCE_ENDINGS = ENDINGS;

export const ROMANCE_STORIES: StoryDef[] = [
  { id: "romance_victim", scenarioId: "romance", perspective: "victim", you: "brenda", label: "Brenda, 62, the person being targeted", intro: "Brenda was widowed two years ago. Recently she met Mark on a dating site, and he seems wonderful. You play as Brenda. Read his messages, tap anything that doesn't feel right, and decide what she does.", start: "rm_start", question: "What should Brenda do?", cast: ["brenda", "mark", "chris"] },
  { id: "romance_family", scenarioId: "romance", perspective: "family", you: "chris", label: "Chris, Brenda's son", intro: "Now see it from the family's side. You play as Chris. Your mum seems happier than she's been in years, but something about her new partner worries you.", start: "cf_start", question: "What should Chris say?", cast: ["chris", "brenda"] },
];

export const ROMANCE: Scenario = {
  id: "romance",
  title: "The Perfect Match",
  icon: "💌",
  scamType: "Romance scam",
  tagline: "He's kind, he's caring, and he needs a favour.",
  art: "romance_chat",
  stories: ["romance_victim", "romance_family"],
  variants: [
    { amount: "£3,000", amount2: "£2,500", reason: "a flight home", total: "£18,500" },
    { amount: "£4,500", amount2: "£3,200", reason: "a medical bill", total: "£24,000" },
    { amount: "£2,200", amount2: "£1,800", reason: "a visa fee", total: "£12,900" },
  ],
  trick: [
    { stage: "Hook", speaker: "mark", line: "I've never felt like this about anyone.", tactic: "emotional_manipulation", purpose: "Intense affection, very fast, builds an emotional bond before any request.", defence: "Real relationships grow slowly. Be wary of strong feelings from someone you've never met." },
    { stage: "Cut you off", speaker: "mark", line: "Let's move our chats off this dating site.", tactic: "suspicious_link", purpose: "Gets you away from the site's safety checks and reporting tools.", defence: "Stay on the platform until you've met safely in person." },
    { stage: "Build trust", speaker: "mark", line: "My camera is broken here on the base.", tactic: "family_impersonation", purpose: "Hides the fact the photos are stolen from someone else.", defence: "No video call? Do a reverse image search on their photos." },
    { stage: "Take the money", speaker: "mark", line: "I need {amount} for {reason}. I'll pay you back.", tactic: "unusual_payment", purpose: "The request comes only once you care, so saying no feels like betrayal.", defence: "Never send money to someone you've only met online." },
    { stage: "Cut you off", speaker: "mark", line: "Please don't tell your son.", tactic: "emotional_manipulation", purpose: "Family would spot it, so the scammer works to keep them out.", defence: "Secrecy is the signal to tell someone you trust." },
  ],
};
