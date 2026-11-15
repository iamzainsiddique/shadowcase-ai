# SHADOWCASE AI: Judge Presentation Pack

> ⚠️ Check against the official **Veritas AI Hackathon Finance track brief** before you submit. The brief was not available while this was built.

> **Demonstration only.** SHADOWCASE AI is an educational prototype, not a tool for real-life situations or a source of financial, legal or security advice. The app shows this notice on every screen and points people to their bank and official services.
>
> **Originality.** All characters, banks, companies, celebrities, numbers and web addresses are invented. Stories, illustrations and code are original; fonts and libraries are open-licensed.

## 1. Project description (concise)
SHADOWCASE AI is an interactive detective game that teaches people, especially older adults and beginners, to recognise financial scams. It has two modes. The **Story Game** lets you live **5 common scams** (fake family emergency, bank "safe account", parcel text, romance, fake investment) through **different people's eyes**: the person targeted, a family member or friend, or a bank adviser. A **"How the trick works"** walkthrough shows each scammer's script with how to beat every step. It needs no AI. **AI Detective** is an AI-assisted investigation with **AI Rewind** and a **Scam Scanner** that explains its evidence in plain English. An interactive tutorial and an Easy Mode make it approachable for people who have never played a game.

## 2. Problem statement
Financial scams increasingly target people through texts, calls and emails that pretend to come from banks, delivery companies or family members. Most protection tools just say "this looks suspicious". They don't build the instinct people need when a scammer is on the phone applying pressure. Warnings are easy to read and easy to forget.

## 3. Innovation
- **Experiential learning, not warnings.** Users investigate, decide, experience possible consequences, and learn.
- **Two ways in.** A game for people who don't want to chat with an AI, and AI tools for people who want deeper analysis.
- **Same scam, different eyes.** Each scam is playable as the person targeted *and* as someone trying to help (family, friend or bank adviser), because scams affect whole families and the people around them need the skills too. You never play as the scammer. The scammer's tactics are shown only in "How the trick works", where every step comes with how to beat it.
- **Never the same twice.** Amounts, companies, places and links change between playthroughs (3 sets of details per scam), and "🎲 Surprise me" picks a different scam each time.
- **Decisions that really branch.** 10 playable stories, 78 scenes, 36 endings and 96 possible paths. Rewind restores the exact moment, including your notebook, so you can compare timelines.
- **Measurable learning.** A 1-minute scam check before and after playing (different messages each time) shows each person their own improvement.
- **Real help built in.** Every ending links to real UK next steps: the number on your card or 159, Report Fraud (0300 123 2040), and 7726 for scam texts.
- **AI Rewind (butterfly effect engine).** After a decision, rewind and choose differently. The AI compares both timelines and explains why one is safer.
- **Evidence-first AI.** The scanner points to the exact words that are suspicious and names the tactic. It doesn't just give a score.
- **Honest by design.** Every AI panel shows whether it is live AI or demo content, outcomes are called *possibilities*, and the score measures learning, not AI confidence.

## 4. Technical architecture
```
Browser (React + TypeScript + Tailwind, Vite)
   │  /api/* (no secrets in the browser)
   ▼
Node.js + Express API ──► Claude (claude-opus-5-5) via official Anthropic SDK
   │                        JSON-schema structured output
   └─ Demo mode: rule-based analyzer + scripted text when no API key is set
Shared TypeScript: case data, types and the branching story engine (runs fully in the browser)
```

## 5. AI functionality
| Feature | What the AI does |
|---|---|
| Scam Scanner / AI partner | Classifies the message (likely scam / suspicious / no signs / unclear), quotes the exact suspicious words, names each tactic, suggests safe verification steps |
| AI Rewind | Compares the original and the rewound decision, describes how each *could* develop, picks the safer one, explains why, gives a key lesson |
| Personalised report | Writes 3–4 lessons based on the player's real choices and the clues they missed |

All AI output uses a strict JSON schema so the UI can render it reliably. System prompts forbid fraud instructions and requests for sensitive data.

## 6. Testing results (real, not invented)
**Automated checks (`npm test`), run 2026-11-16: 52 passed, 0 failed.** They cover:
- **Story structure, for all 10 stories:** no dead ends or loops; every scene and all 36 endings reachable; every story has a good and a bad ending; every clue phrase present in its scene for every set of details; no unfilled details; and a check that you never play as the scammer.
- **The story engine:** choices, clue collection, rewind restoring the notebook, and scoring, including that a flawless run isn't penalised and that rewinding a mistake earns the learning points.
- **Everything else:** voice casting on Mac, Windows, Chrome and Edge voice lists; share links rejecting bad input; the quiz sets; Case 001 data; and the analyzer regression below.

Every story was also played to an ending in the browser (first and last option each time), plus the share links, "How the trick works", the quiz and Easy Mode.

Dataset: 24 fictional, hand-labelled messages (12 scam, 12 legitimate) in `data/eval-messages.json`. Run with `npm run eval`.

**Demo rule-based analyzer, measured 2026-11-15:**

| Metric | Result |
|---|---|
| Correct | 23 |
| Incorrect | 1 |
| Accuracy | 95.8% |
| Scams caught | 12/12 |
| Legitimate messages wrongly flagged | 1/12 |

**Live AI (Claude): not measured yet.** No API key was available during the build. Add a key, run `npm run eval`, and paste the numbers from `eval/results-live-ai.md` here. Don't quote a live-AI accuracy until you have run it.

### Limitations and failure cases
1. **False positive on a real safety message (#24).** A genuine bank reminder saying "we will never ask you to move money to a safe account" was flagged as a likely scam. The keyword rules saw "urgent" and "safe account" but can't understand negation.
2. **Keyword rules miss subtle scams.** A message with no trigger words (for example a slow-building romance or investment scam) would score "no warning signs". The UI warns that no warning signs doesn't mean safe.
3. **Small, self-written test set.** The same team wrote the rules and the 24 messages, so 95.8% is likely optimistic. Real-world accuracy would be lower. A larger, independently written dataset is needed.
4. **Five scams, written by us.** The Story Game covers 5 common UK scam types. Others (impersonating the tax office or police, ticket and rental scams, crypto "recovery" scams) aren't full stories yet, and the stories haven't been reviewed by a fraud expert.
5. **Live AI can be wrong too.** It can't verify senders, links or phone numbers. It only reads the text.
6. **Story Game consequences are hand-written.** They are plausible simulations written for this project, not predictions or real case data. They haven't been checked by a fraud expert yet.
7. **The before/after scam check is a self-check.** It uses 5 different messages each time, so a change in score isn't a controlled measurement. It's useful for motivation, not as evidence that the app works. A proper study would be needed for that.

## 7. Real-world impact
- Builds the "stop, hang up, call the number on your card" reflex through practice instead of reading.
- Teaches families and friends how to help without shaming, which is the moment many real scams are stopped or missed.
- Designed for people who are most targeted and least served by tech-heavy tools: large text, read-aloud, plain language.
- The Scanner gives an explained second opinion at the moment someone receives a suspicious message.

## 8. Two-minute demo script
| Time | Say / do |
|---|---|
| 0:00–0:15 | "Scam warnings are easy to ignore. SHADOWCASE AI turns scam awareness into a detective game." Show the **tutorial** for a few seconds (tap the "You've won £500" clue), then press **Skip**. Point to the two modes on the Home screen. |
| 0:15–0:45 | **Story Game.** Show the **5 scams** and the perspective buttons. Start "The Midnight Call" as Arthur. Tap "Grandad? It's me" (it goes into the notebook), choose "Jamie? Is that you?" and show **Inspector Vale's** explanation. Make a bad choice or two, then **⏪ Rewind** and show the **timeline comparison**. |
| 0:45–1:05 | On the ending, press **👪 Play as Helen**: the same scam from the daughter's side. One choice ("How could you fall for this?") shows why shaming makes it worse. Point out the **real help card** (159, 0300 123 2040, 7726). |
| 1:05–1:20 | Open **🔍 How the trick works** for The Safe Account: the scammer's script, each line's purpose, and how to beat it. Mention that details change every playthrough and "🎲 Surprise me". |
| 1:20–1:45 | Switch to **🤖 AI Detective** (point to the honest Live AI / Demo badge). Open the **Scam Scanner** with Example 2 ("Mum it's me…") to show highlighted evidence. |
| 1:45–2:00 | Show the **🧠 1-minute scam check** result screen (before → after), then **Easy Mode** and read-aloud with highlighting. Close with "Think like a detective. Expose the scam. Change the outcome." |

**Backup plan:** the Story Game needs no internet or API. If the API fails, remove the key and restart: AI Detective then runs in clearly labelled demo mode.

## 9. AI tools, models and datasets used
- **Claude Opus 5.5** (`claude-opus-5-5`) via the official Anthropic TypeScript SDK: scanner, rewind comparison, report lessons
- **Claude Code**: used to help build the app
- **Browser Web Speech API**: read-aloud (on-device)
- **Dataset**: 24 synthetic, fictional messages written for this project (`data/eval-messages.json`). No real personal data.
- Libraries: React, Vite, TypeScript, Tailwind CSS, Express

## 10. Business potential (hypotheses, not proven revenue)
SHADOWCASE AI could become a financial safety education platform for schools, community organisations, banks and senior learning programmes. Possible revenue models include institutional subscriptions, licensed training modules, and customised educational programmes. None of these have been validated yet.
