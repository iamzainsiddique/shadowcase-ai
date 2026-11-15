// Scenario: "The Midnight Call", the grandparent scam (someone pretends to be a grandchild in trouble).
// Perspectives: Arthur (the person targeted) and Helen (his daughter, who gets a worrying call from him).
// Every name, number and organisation here is fictional.
import type { Ending, Scenario, StoryDef, StoryNode } from "../storyTypes";

const ENDINGS: Record<string, Ending> = {
  family_check: {
    id: "family_check",
    title: "The Real Jamie",
    tone: "good",
    summary: "Arthur checked with his family using a number he already knew. Jamie was safe at home the whole time.",
    consequences: ["No money lost.", "Arthur reports the call to the police and his bank so they can warn others."],
    lesson: "When someone says a loved one is in trouble, hang up and call that person, or another relative, on a number you already know.",
  },
  bank: {
    id: "bank",
    title: "The Bank Steps In",
    tone: "good",
    summary: "Arthur called the number on the back of his bank card. The fraud adviser recognised the scam straight away.",
    consequences: ["No money lost.", "The bank adds a protective note to Arthur's account."],
    lesson: "No court, police force or lawyer takes payment in gift cards. Your bank's own number is a safe place to check.",
  },
  neighbour: {
    id: "neighbour",
    title: "A Neighbour's Good Eye",
    tone: "mixed",
    summary: "Arthur nearly paid, but telling Priya the truth broke the scammer's spell before any codes were shared.",
    consequences: ["No money lost, but it was close.", "The unused cards may be refundable at the shop. That's not guaranteed, so ask straight away."],
    lesson: "Secrecy is a red flag. Telling someone you trust is one of the strongest protections there is.",
  },
  last_step: {
    id: "last_step",
    title: "Stopped at the Last Step",
    tone: "mixed",
    summary: "Arthur bought the cards but refused to read out the codes. He called Jamie, who was fine.",
    consequences: ["The codes stayed secret, so the money on the cards wasn't taken.", "Arthur still has {amount} of gift cards. A refund may be possible but isn't guaranteed."],
    lesson: "It's never too late to stop and check, even at the very last step.",
  },
  codes_gone: {
    id: "codes_gone",
    title: "The Codes Are Gone",
    tone: "bad",
    summary: "Arthur read out the gift card codes. In stories like this, the money can be spent within minutes.",
    consequences: [
      "{amount} could be lost. Gift card money is very hard to recover once the codes are shared.",
      "Scammers often call back asking for more, sometimes pretending to be police offering to help.",
      "The right next step: tell the bank, the gift card company and the police straight away.",
    ],
    lesson: "Never read out gift card codes to anyone who contacted you. Anyone asking for payment in gift cards is a scammer.",
  },
};


const VICTIM_NODES: Record<string, StoryNode> = {
  start: {
    id: "start",
    art: "living_room",
    scene: "Tuesday, 21:47 · Arthur's living room",
    lines: [
      { speaker: "narrator", text: "Arthur is watching the evening news when the landline rings." },
      { speaker: "caller", text: "Grandad? It's me… I'm in a lot of trouble." },
    ],
    clues: [{ id: "s-vague", text: "Grandad? It's me", tactic: "family_impersonation", explanation: "The caller never says a name. They wait for you to fill it in." }],
    choices: [
      { id: "start-name", label: "“Jamie? Is that you? What's happened?”", next: "trouble", safety: "risky", feedback: "Saying a name gives the caller the identity they need. Scammers often start vague and let you fill in the gap.", saferAlternative: "Ask “Who is this, please?” and let them say their own name." },
      { id: "start-who", label: "“Who is this, please?”", next: "dodge", safety: "safe", feedback: "Good instinct. Making the caller identify themselves is a simple, strong check." },
    ],
  },
  dodge: {
    id: "dodge",
    art: "phone_call",
    scene: "Tuesday, 21:48 · On the phone",
    lines: [
      { speaker: "caller", text: "It's me, your favourite grandson! Don't you recognise my voice? I've got a terrible cold." },
      { speaker: "narrator", text: "The voice is muffled. It could be Jamie… or it could be anyone." },
    ],
    clues: [{ id: "s-cold", text: "I've got a terrible cold", tactic: "family_impersonation", explanation: "An excuse for why the voice sounds wrong. It's a very common line in these scams." }],
    choices: [
      { id: "dodge-jamie", label: "“Jamie? Oh dear, what's wrong?”", next: "trouble", safety: "risky", feedback: "The caller still hasn't said a name. You've just handed them one.", saferAlternative: "Keep asking: “Which grandson? Tell me your name.”" },
      { id: "dodge-press", label: "“Which grandson? Tell me your name.”", next: "trouble", safety: "safe", feedback: "Well done. Notice how hard the caller works to avoid giving a simple answer." },
    ],
  },
  trouble: {
    id: "trouble",
    art: "phone_tension",
    scene: "Tuesday, 21:50 · On the phone",
    lines: [
      { speaker: "caller", text: "I was in a car accident on holiday in {country}. The police are holding me. I need {amount} for bail tonight or I'll be kept in a cell." },
      { speaker: "caller", text: "Please don't tell Mum. She'll be so angry with me." },
    ],
    clues: [
      { id: "s-tonight", text: "I need {amount} for bail tonight", tactic: "false_urgency", explanation: "A deadline tonight leaves no time to check the story." },
      { id: "s-cell", text: "I'll be kept in a cell", tactic: "fear_pressure", explanation: "Picturing a loved one in danger makes it hard to think calmly." },
      { id: "s-secret", text: "Please don't tell Mum", tactic: "emotional_manipulation", explanation: "Secrecy stops you from checking with the people who would spot the scam." },
    ],
    choices: [
      { id: "trouble-pay", label: "“Of course, love. Tell me how to send the money.”", next: "lawyer", safety: "dangerous", feedback: "Wanting to help family is natural, and scammers rely on it. Agreeing before checking hands them control.", saferAlternative: "Pause and check the story with another family member first." },
      { id: "trouble-mum", label: "“I'm going to ring your mum first.”", next: "pressure", safety: "safe", feedback: "Checking with someone else is one of the most powerful defences against this scam." },
      { id: "trouble-test", label: "“Before anything else, what was our old dog called?”", next: "test", safety: "safe", feedback: "Smart. A personal question that only the real person would know is a quick, strong test." },
    ],
  },
  test: {
    id: "test",
    art: "phone_tension",
    scene: "Tuesday, 21:51 · On the phone",
    lines: [
      { speaker: "caller", text: "Grandad, I can't think straight right now! Please, there's no time for games." },
      { speaker: "narrator", text: "He didn't answer the question." },
    ],
    clues: [{ id: "s-games", text: "there's no time for games", tactic: "false_urgency", explanation: "Dodging a simple question and adding pressure is a big warning sign." }],
    choices: [
      { id: "test-hangup", label: "Hang up and call Jamie on his usual mobile number", next: "real_jamie", safety: "safe", feedback: "This is the best move: hang up and call a number you already know. A real grandchild will always understand." },
      { id: "test-guilt", label: "“Sorry, love. I'll help you.”", next: "lawyer", safety: "dangerous", feedback: "The guilt you feel is exactly what the scammer is using. Failing a simple question is a reason to stop, not to help.", saferAlternative: "Hang up and call Jamie on his usual number." },
    ],
  },
  pressure: {
    id: "pressure",
    art: "phone_tension",
    scene: "Tuesday, 21:51 · On the phone",
    lines: [
      { speaker: "caller", text: "NO! Please, Grandad, don't! My lawyer is right here, he can explain everything." },
    ],
    clues: [{ id: "s-lawyer", text: "My lawyer is right here", tactic: "authority_impersonation", explanation: "Bringing in an 'official' makes the story feel real. That's why scammers add a second voice." }],
    choices: [
      { id: "pressure-helen", label: "Hang up and phone your daughter Helen", next: "helen", safety: "safe", feedback: "Excellent. You kept your plan even under pressure. That's the habit that beats this scam." },
      { id: "pressure-lawyer", label: "“Alright… put the lawyer on.”", next: "lawyer", safety: "risky", feedback: "A second voice can sound convincing, but it's part of the same script.", saferAlternative: "Stick to your plan and call Helen." },
    ],
  },
  helen: {
    id: "helen",
    art: "family_call",
    scene: "Tuesday, 21:55 · Phone call to Helen",
    lines: [
      { speaker: "helen", text: "Dad? Jamie's right here with me. He's upstairs doing his homework! He hasn't been to {country}." },
      { speaker: "helen", text: "That was a scam. I'm so glad you called me." },
    ],
    ending: "family_check",
  },
  real_jamie: {
    id: "real_jamie",
    art: "family_call",
    scene: "Tuesday, 21:53 · Calling Jamie's mobile",
    lines: [
      { speaker: "jamie", text: "Grandad? I'm at home, I'm fine! What's going on?" },
      { speaker: "narrator", text: "Arthur's heart slows down. The 'grandson' on the phone was a stranger." },
    ],
    ending: "family_check",
  },
  lawyer: {
    id: "lawyer",
    art: "text_message",
    scene: "Tuesday, 21:58 · On the phone",
    lines: [
      { speaker: "grant", text: "Good evening, Mr Bell. I'm Mr Grant, Jamie's solicitor. I'm texting you the court's instructions now." },
      { speaker: "narrator", text: "Arthur's phone buzzes with a text message. Tap anything suspicious in it." },
    ],
    message: {
      from: "Mr Grant, Solicitor",
      text: "Buy {cards} GiftZing cards TODAY. Scratch the back and text ALL codes to this number. Court closes at 11pm. Tell no one, reporting restrictions apply.",
    },
    clues: [
      { id: "s-giftcards", text: "Buy {cards} GiftZing cards", tactic: "unusual_payment", explanation: "No court, police force or solicitor takes gift cards. This detail alone proves it's a scam." },
      { id: "s-codes", text: "text ALL codes to this number", tactic: "sensitive_info_request", explanation: "Gift card codes are the same as cash. Whoever has them can spend the money." },
      { id: "s-11pm", text: "Court closes at 11pm", tactic: "false_urgency", explanation: "Another deadline to rush you." },
      { id: "s-tellnoone", text: "Tell no one, reporting restrictions apply", tactic: "authority_impersonation", explanation: "Official-sounding words used to keep you isolated." },
    ],
    choices: [
      { id: "lawyer-shop", label: "Put on your coat and go to the supermarket", next: "shop", safety: "dangerous", feedback: "No court or police force accepts gift cards. That one detail shows it's a scam.", saferAlternative: "Call your bank on the number on your card and ask." },
      { id: "lawyer-bank", label: "“Gift cards for bail? I'm calling my bank first.”", next: "bank", safety: "safe", feedback: "Spot on. Gift cards for bail makes no sense, and your bank's number is a safe place to check." },
    ],
  },
  bank: {
    id: "bank",
    art: "bank_call",
    scene: "Tuesday, 22:05 · Bank's 24-hour line (number on the card)",
    lines: [
      { speaker: "okafor", text: "Mr Bell, this is a well-known scam. We call it the 'grandparent scam'. Courts never take gift cards." },
      { speaker: "okafor", text: "Please don't buy anything. Let's make sure Jamie is safe, and I'll note this on your account." },
    ],
    ending: "bank",
  },
  shop: {
    id: "shop",
    art: "supermarket",
    scene: "Tuesday, 22:20 · Supermarket checkout",
    lines: [
      { speaker: "narrator", text: "Arthur puts {cardsSpoken} on the counter. His hands are shaking." },
      { speaker: "priya", text: "Arthur? It's Priya from next door! Why are you buying {amount} of gift cards at this time of night?" },
    ],
    choices: [
      { id: "shop-tell", label: "Tell Priya the whole story", next: "priya_help", safety: "safe", feedback: "Telling someone breaks the secrecy the scammer worked so hard to build." },
      { id: "shop-lie", label: "“They're birthday presents.” Pay and go home.", next: "codes", safety: "dangerous", feedback: "The scammer told you to keep it secret precisely so that no one could stop you.", saferAlternative: "Tell Priya what's happening." },
    ],
  },
  priya_help: {
    id: "priya_help",
    art: "family_call",
    scene: "Tuesday, 22:25 · Supermarket",
    lines: [
      { speaker: "priya", text: "That's exactly what happened to my aunt last year! Let's ring Jamie together, right now." },
      { speaker: "jamie", text: "Grandad? I'm at home! I'm fine, honestly." },
    ],
    ending: "neighbour",
  },
  codes: {
    id: "codes",
    art: "kitchen_night",
    scene: "Tuesday, 22:45 · Arthur's kitchen",
    lines: [
      { speaker: "grant", text: "Mr Bell, read me the codes now. Quickly, the court is closing and Jamie is very upset." },
    ],
    clues: [{ id: "s-quickly", text: "read me the codes now", tactic: "sensitive_info_request", explanation: "This is the moment the money would actually leave. Saying no here still protects you." }],
    choices: [
      { id: "codes-read", label: "Read out the codes", next: "gone", safety: "dangerous", feedback: "Once codes are shared, the money can be spent within minutes.", saferAlternative: "Refuse, hang up and call Jamie yourself." },
      { id: "codes-stop", label: "“No. I want to speak to Jamie myself.” Hang up and call him.", next: "late_jamie", safety: "safe", feedback: "Brilliant. Even at the last step, stopping to check protected the money." },
    ],
  },
  late_jamie: {
    id: "late_jamie",
    art: "family_call",
    scene: "Tuesday, 22:48 · Calling Jamie's mobile",
    lines: [{ speaker: "jamie", text: "Grandad? I'm fine, I'm at home! Don't give anyone anything!" }],
    ending: "last_step",
  },
  gone: {
    id: "gone",
    art: "kitchen_loss",
    scene: "Tuesday, 22:50 · Arthur's kitchen",
    lines: [
      { speaker: "narrator", text: "Arthur reads out all the codes. The line goes quiet, then the call ends." },
      { speaker: "narrator", text: "The next morning, Helen calls. Jamie was at home all night." },
    ],
    ending: "codes_gone",
  },
};


// ---------------- Helen's perspective ----------------
const FAMILY_NODES: Record<string, StoryNode> = {
  hf_start: {
    id: "hf_start",
    art: "family_call",
    scene: "Tuesday, 22:10 · Helen's kitchen",
    lines: [
      { speaker: "narrator", text: "Helen is loading the dishwasher when her phone rings. It's her dad, Arthur. He sounds out of breath." },
      { speaker: "arthur", text: "Helen, I can't talk long. I need to buy some gift cards tonight. It's for something important. I've been told not to say what." },
    ],
    clues: [
      { id: "hf-giftcards", text: "I need to buy some gift cards tonight", tactic: "unusual_payment", explanation: "Gift cards bought in a hurry, late at night, are one of the clearest signs someone is being scammed." },
      { id: "hf-secret", text: "I've been told not to say what", tactic: "emotional_manipulation", explanation: "Someone has told Arthur to keep it secret. That's how scammers stop family from stepping in." },
    ],
    choices: [
      { id: "hf-scold", label: "“Dad, that sounds ridiculous. How could you fall for this?”", next: "hf_defensive", safety: "risky", feedback: "It's natural to be alarmed, but people who feel embarrassed often stop talking, and that helps the scammer.", saferAlternative: "Stay calm and kind: “I'm not cross. Who told you not to say?”" },
      { id: "hf-calm", label: "“Okay, Dad, I'm not cross. Who told you not to say?”", next: "hf_story", safety: "safe", feedback: "Perfect. A calm, kind question keeps him talking, and talking is what breaks the scam." },
      { id: "hf-busy", label: "“I'm busy, Dad. Do whatever you think is best.”", next: "hf_lost", safety: "dangerous", feedback: "Arthur reached out, which was his best defence. Brushing him off left him alone with the scammer.", saferAlternative: "Stop what you're doing and ask what's going on." },
    ],
  },
  hf_defensive: {
    id: "hf_defensive",
    art: "phone_tension",
    scene: "Tuesday, 22:11 · On the phone",
    lines: [{ speaker: "arthur", text: "I'm not a fool, Helen. Someone in the family needs me, and I'm going to help." }],
    choices: [
      { id: "hf-sorry", label: "“Sorry, Dad. I'm on your side. Can we check it together?”", next: "hf_story", safety: "safe", feedback: "Saying sorry and offering to help together turns the conversation back round. Well done." },
      { id: "hf-letgo", label: "“Fine. It's your money.”", next: "hf_lost", safety: "dangerous", feedback: "Walking away is exactly what the scammer hoped for.", saferAlternative: "Apologise and offer to check it together." },
    ],
  },
  hf_story: {
    id: "hf_story",
    art: "phone_tension",
    scene: "Tuesday, 22:13 · On the phone",
    lines: [
      { speaker: "arthur", text: "It's Jamie. He's been arrested on holiday in {country}. His solicitor, a Mr Grant, says I must buy {amount} in gift cards or he stays in a cell tonight." },
      { speaker: "narrator", text: "Helen looks across the room. Jamie is sitting right there on the sofa, playing a game on his phone." },
    ],
    clues: [
      { id: "hf-cell", text: "or he stays in a cell tonight", tactic: "fear_pressure", explanation: "A frightening picture plus a deadline: the classic recipe for panic." },
      { id: "hf-solicitor", text: "His solicitor, a Mr Grant", tactic: "authority_impersonation", explanation: "A second, official-sounding person makes the story feel real." },
    ],
    choices: [
      { id: "hf-jamie", label: "“Dad, Jamie's here with me. I'm putting him on now.”", next: "hf_check", safety: "safe", feedback: "The fastest proof of all: let Arthur hear the real Jamie." },
      { id: "hf-safe", label: "“Better safe than sorry. Buy the cards, Dad.”", next: "hf_lost", safety: "dangerous", feedback: "The real Jamie is in the room. Courts never take gift cards.", saferAlternative: "Put Jamie on the phone so Dad can hear he's safe." },
    ],
  },
  hf_check: {
    id: "hf_check",
    art: "family_call",
    scene: "Tuesday, 22:14 · On the phone",
    lines: [
      { speaker: "jamie", text: "Grandad? It's me, I'm right here at Mum's! I haven't been anywhere!" },
      { speaker: "arthur", text: "Oh, thank goodness. But he sounded so real… I feel such a fool." },
    ],
    choices: [
      { id: "hf-report", label: "“You're not a fool, Dad. These people are professionals. Let's report it and ring your bank together.”", next: "hf_report", safety: "safe", feedback: "Reassuring him and reporting it means it's less likely to happen again, to him or anyone else." },
      { id: "hf-forget", label: "“Let's just forget it happened.”", next: "hf_quiet_end", safety: "risky", feedback: "No money was lost, but scammers often call back the same person. Reporting helps protect him.", saferAlternative: "Reassure him and report it together." },
    ],
  },
  hf_report: {
    id: "hf_report",
    art: "reported",
    scene: "Wednesday, 09:00 · Arthur's kitchen",
    lines: [
      { speaker: "narrator", text: "Helen and Arthur report the call together and ring his bank on the number on his card. The bank adds a note to his account." },
      { speaker: "arthur", text: "Next time anyone rings like that, I'll hang up and call you first." },
    ],
    ending: "hf_safe",
  },
  hf_quiet_end: {
    id: "hf_quiet_end",
    art: "phone_call",
    scene: "Two weeks later · Arthur's living room",
    lines: [{ speaker: "narrator", text: "The phone rings again. A new voice says he's from the police and is investigating 'the gift card gang'. He needs Arthur's bank details." }],
    ending: "hf_quiet",
  },
  hf_lost: {
    id: "hf_lost",
    art: "kitchen_loss",
    scene: "Wednesday, 08:30 · Helen's kitchen",
    lines: [{ speaker: "narrator", text: "The next morning Arthur calls back, upset. He bought {amount} of gift cards and read out the codes. Jamie was with Helen all along." }],
    ending: "hf_lost",
  },
};

const FAMILY_ENDINGS: Record<string, Ending> = {
  hf_safe: {
    id: "hf_safe",
    title: "Stronger Together",
    tone: "good",
    summary: "Helen stayed calm, proved Jamie was safe, and reported the scam with her dad.",
    consequences: ["No money lost.", "Arthur now has a simple plan: hang up and call family first.", "The report helps police and banks warn others."],
    lesson: "When someone you love sounds caught up in something, stay calm and kind. Shame makes people hide things; kindness keeps them talking.",
  },
  hf_quiet: {
    id: "hf_quiet",
    title: "They Called Back",
    tone: "mixed",
    summary: "No money was lost, but nothing was reported, and the scammers tried again with a new story.",
    consequences: ["No money lost yet.", "Scammers often target the same person again, sometimes pretending to be police 'helping' with the first scam."],
    lesson: "Report scams even when nothing was lost. And remember: real police never ask for your bank details or money over the phone.",
  },
  hf_lost: {
    id: "hf_lost",
    title: "Alone With the Scammer",
    tone: "bad",
    summary: "Arthur reached out, but without support he followed the scammer's instructions.",
    consequences: ["{amount} could be lost, and gift card money is very hard to recover.", "Arthur may feel too embarrassed to tell anyone next time."],
    lesson: "When someone tells you they're being asked for gift cards or secrecy, stop everything and help them check.",
  },
};

export const MIDNIGHT_NODES = { ...VICTIM_NODES, ...FAMILY_NODES };
export const MIDNIGHT_ENDINGS = { ...ENDINGS, ...FAMILY_ENDINGS };

export const MIDNIGHT_STORIES: StoryDef[] = [
  {
    id: "midnight_victim",
    scenarioId: "midnight",
    perspective: "victim",
    you: "arthur",
    label: "Arthur, 78, the person being targeted",
    intro: "It's late on a Tuesday evening. Arthur Bell, 78, is at home when the phone rings. You play as Arthur. Read what people say, tap anything that sounds suspicious to add it to your notebook, and choose what Arthur says and does. Inspector Vale will explain each decision.",
    start: "start",
    question: "What should Arthur do?",
    cast: ["arthur", "caller", "helen", "priya"],
  },
  {
    id: "midnight_family",
    scenarioId: "midnight",
    perspective: "family",
    you: "helen",
    label: "Helen, Arthur's daughter",
    intro: "Same evening, different view. You play as Helen. Her dad rings her sounding worried and secretive. Can you help him without making him feel foolish?",
    start: "hf_start",
    question: "What should Helen say?",
    cast: ["helen", "arthur", "jamie"],
  },
];

export const MIDNIGHT: Scenario = {
  id: "midnight",
  title: "The Midnight Call",
  icon: "📞",
  scamType: "Grandparent scam (fake family emergency)",
  tagline: "A frightened voice. A secret. A deadline.",
  art: "living_room",
  stories: ["midnight_victim", "midnight_family"],
  variants: [
    { amount: "£1,500", cards: "3 x £500", cardsSpoken: "three £500 gift cards", country: "Spain" },
    { amount: "£2,000", cards: "4 x £500", cardsSpoken: "four £500 gift cards", country: "Portugal" },
    { amount: "£1,000", cards: "2 x £500", cardsSpoken: "two £500 gift cards", country: "Greece" },
  ],
  trick: [
    { stage: "Hook", speaker: "caller", line: "Grandad? It's me… I'm in a lot of trouble.", tactic: "family_impersonation", purpose: "Starts vague on purpose, so the person fills in a grandchild's name themselves.", defence: "Never offer a name. Ask: “Who is this, please?”" },
    { stage: "Build trust", speaker: "caller", line: "I've got a terrible cold.", tactic: "family_impersonation", purpose: "Explains away why the voice doesn't sound right.", defence: "If a voice sounds wrong, trust that feeling. Ask a question only the real person would know." },
    { stage: "Create panic", speaker: "caller", line: "I need {amount} for bail tonight or I'll be kept in a cell.", tactic: "fear_pressure", purpose: "Fear plus a deadline leaves no time to think or check.", defence: "Real emergencies can wait the two minutes it takes to call someone you trust." },
    { stage: "Cut you off", speaker: "caller", line: "Please don't tell Mum.", tactic: "emotional_manipulation", purpose: "Keeps family out, because family would spot the lie.", defence: "Any request for secrecy is your cue to tell someone straight away." },
    { stage: "Build trust", speaker: "grant", line: "I'm Mr Grant, Jamie's solicitor.", tactic: "authority_impersonation", purpose: "A second, official-sounding voice makes the story feel real.", defence: "Hang up and phone the family member yourself, on a number you already have." },
    { stage: "Take the money", speaker: "grant", line: "Buy {cards} GiftZing cards and text ALL codes.", tactic: "unusual_payment", purpose: "Gift card codes are like cash and almost impossible to trace or get back.", defence: "No court, police force or solicitor takes gift cards. Anyone asking is a scammer." },
  ],
};
