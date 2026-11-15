# SHADOWCASE AI
**Think like a detective. Expose the scam. Change the outcome.**

An interactive financial-scam awareness game for beginners and older adults, with two ways to play:

- **🎭 Story Game:** illustrated, animated stories about **5 common scams**: The Midnight Call (fake family emergency), The Safe Account (bank impersonation), The Parcel Text (fake delivery text), The Perfect Match (romance) and The VIP Group (fake investment).
  - **Different perspectives:** play each scam as the person targeted, or as the family member, friend or bank adviser trying to help. You never play as the scammer.
  - **How the trick works:** a step-by-step look at the scammer's script, with what each line is designed to do and how to beat it.
  - **Never the same twice:** amounts, companies and places change each playthrough, and "🎲 Surprise me" picks a scam for you.
  - You talk to characters, collect clues, make decisions that change the story, and rewind. **No AI or API key needed.**
- **🤖 AI Detective:** an AI-assisted investigation (Case 001, "The Frozen Account") with an AI partner, AI Rewind comparisons, personalised lessons, and a **Scam Scanner** for real messages.

New visitors get a short **interactive tutorial**. An **Easy Mode** gives a simpler, larger, high-contrast interface. A **🧠 1-minute scam check** before and after playing shows how much you've improved, and every ending has a **real help card** with UK next steps.

> ⚠️ **Educational demonstration only.** SHADOWCASE AI is a learning prototype. It is not intended for real-life situations and does not provide financial, legal or security advice. It cannot predict the future, guarantee fraud detection, or prevent every scam. If something is happening to you for real, contact your bank (number on your card) and official services. In the UK: 159, Report Fraud on 0300 123 2040, Police Scotland on 101, or forward scam texts to 7726.
>
> **Originality.** All people, banks, companies, celebrities, phone numbers and web addresses in the stories, cases and quiz are invented; any resemblance to real ones is coincidental. Phone numbers use Ofcom's reserved drama range. Stories, illustrations (inline SVG) and code are original to this project. Fonts are Inter and Space Grotesk (SIL Open Font License); libraries are open source (React, Vite, Tailwind CSS, Express and the Anthropic SDK). The only real organisations named are the help services above, mentioned as factual signposting.

**🌐 Online demo:** https://iamzainsiddique.github.io/shadowcase-ai/ runs in **demo mode** (no live AI, rule-based and clearly labelled), because a public website can't safely hold an API key. The Story Game is complete online. For live AI, run it locally with a key (below).

---

## Run it (beginner steps)

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd ~/Desktop/shadowcase-ai
npm install
npm run dev
```

Open the address it prints (usually **http://localhost:5173**).

### Turning on live AI
Without a key, AI Detective runs in **Demo mode**, and a yellow badge says so. The Story Game doesn't need a key at all. To use live AI:

1. Copy `.env.example` to `.env`
2. Put your Anthropic API key after `ANTHROPIC_API_KEY=`
3. Restart `npm run dev`. The badge turns green: **● Live AI**.

The key stays on the server and is never sent to the browser.

### Commands
| Command | What it does |
|---|---|
| `npm run dev` | Starts the website (port 5173) and the API server (port 8787) together |
| `npm test` | Runs the automated checks (all stories' structure, story engine and scoring, share links, quiz, voice casting, analyzer regression) |
| `npm run eval` | Runs the 24-message test set and writes `eval/results-<mode>.md` |
| `npm run eval -- --rules` | Same, but forces the demo rule-based analyzer |
| `npm run build` | Type-checks and builds the production site |

---

## How the code is organised

```
shadowcase-ai/
├── shared/                 Code used by BOTH the website and the server
│   ├── types.ts            Data shapes + the 9 scam tactics with plain-English explanations
│   ├── case.ts             Case 001 "The Frozen Account" (AI Detective)
│   ├── story.ts            Story Game registry: characters, scenarios, stories, filling in {details}
│   ├── storyTypes.ts       Types for scenarios, perspectives, scenes and "How the trick works"
│   ├── scenarios/          One file per scam: midnight, safeAccount, parcel, romance, investment
│   ├── quiz.ts             The 1-minute scam check (two sets of 5 messages)
│   └── storyEngine.ts      Branching-story engine: choose, collect clues, rewind, score (pure functions)
├── server/                 Node + Express API (the only place the AI key is used)
│   ├── index.ts            Routes: /api/status, /api/scan, /api/rewind, /api/report
│   ├── ai.ts               Live AI calls to Claude (claude-opus-5-5) with JSON-schema output
│   └── rules.ts            Demo-mode keyword analyzer (used only when no key is set)
├── src/
│   ├── App.tsx             Header (Home, mode switch, Display, Help), keeps both modes' progress
│   ├── settings.tsx        Text size, Easy Mode, high contrast, reduce motion, auto read-aloud (saved on this device)
│   ├── speech.ts           Read-aloud helpers: speak (per-character voices), stop, auto-read hook
│   ├── voices.ts           Voice casting: picks an age/gender-appropriate voice for each character
│   ├── components/
│   │   ├── Tutorial.tsx        6-step interactive onboarding (Next / Back / Skip / Replay)
│   │   ├── SettingsPanel.tsx   "Display & comfort" dialog
│   │   ├── ClickableText.tsx   "Tap the suspicious words" mechanic (used by both modes)
│   │   ├── SceneArt.tsx        20 illustrated, animated story scenes (inline SVG, no image files)
│   │   ├── Quiz.tsx            1-minute scam check, before and after
│   │   ├── HelpCard.tsx        Real UK help: bank / 159, Report Fraud, 7726
│   │   ├── ShareButton.tsx     Copy a link to a scenario
│   │   ├── Avatar.tsx          Illustrated character portraits + Inspector Vale
│   │   ├── ui.tsx              Tooltip, Easy Mode hints, loading, error, progress bar
│   │   └── ModeBadge, SpeakButton, Highlight
│   └── views/
│       ├── Home.tsx            Mode selection screen
│       ├── ScenarioPicker.tsx  Choose a scam and a perspective, or "Surprise me"
│       ├── StoryGame.tsx       Story Game: dialogue, notebook, feedback, rewind, endings, report
│       ├── TrickBreakdown.tsx  "How the trick works" walkthrough
│       ├── AiDetective.tsx     AI Detective hub (tabs: Case 001 and Scam Scanner)
│       ├── Investigation.tsx   Case 001: briefing → evidence → playbook → decisions + AI Rewind
│       ├── Report.tsx          Case 001 report + AI-written lessons
│       └── Scanner.tsx         AI Scam Scanner + practice mode
├── data/eval-messages.json  24 fictional labelled messages (12 scam, 12 legitimate)
├── scripts/test.ts          Automated checks (npm test)
├── scripts/eval.ts          Evaluation script (npm run eval)
└── docs/                    Judge presentation pack (PRESENTATION.md)
```

### Main components explained
- **Tutorial.** Opens automatically on the first visit. Six steps: what the app does, tapping a clue in a sample message, a practice decision, rewinding it to compare, the two modes, and Easy Mode. Completion is saved in the browser. The **❓ Help** button (or Display → Replay) shows it again.
- **Story engine (`shared/storyEngine.ts`).** Each story is plain data: scenes with dialogue, clue phrases, and choices that point to the next scene. Text can contain `{details}` (amounts, company names, links) that are filled in from one of three sets per scam, so replays differ. The engine records your history and a snapshot of your notebook before each decision; that snapshot is what makes **Rewind** exact. In total there are 5 scams, 10 playable stories, 78 scenes, 36 endings and 96 possible paths.
- **Perspectives.** Each scam has a victim story plus a family, friend or bank story. The helper stories teach the other half of scam protection: how to help someone without shaming them. Tests check that no story lets you play as the scammer.
- **How the trick works.** For each scam, 5–6 steps of the scammer's script, grouped into stages (hook, build trust, create panic, cut you off, take the money). Each step says what the line is designed to do and how to beat it. It's there to help people recognise the pattern, never to teach it.
- **Share links.** `#play=parcel:parcel_family` opens a scenario directly. The link contains only the scenario name, nothing personal.
- **1-minute scam check.** 5 "scam or safe?" messages before playing and 5 different ones after, with your before → after score. It's saved only in the browser, and the app labels it a self-check, not a scientific test.
- **Real help card.** Real UK services, checked November 2026: your bank on the number on your card, or 159; Report Fraud (formerly Action Fraud) on 0300 123 2040 / reportfraud.police.uk; Police Scotland 101; and 7726 for scam texts. Everything inside the stories is fictional.
- **Illustrations & animation.** Every story scene has its own drawn, gently animated illustration: a ringing phone, a ticking clock, rain on the window, gift cards drifting away. Scenes fade in, dialogue appears line by line, and characters' mouths move when they speak. Scammers are drawn as shadowy "?" silhouettes because you never really know who's calling. All animation switches off with Reduce Motion or Easy Mode.
- **Read aloud automatically.** This is offered in the tutorial and in "Aa Display". When it's on, every new tutorial step, story scene (including the answer options), Inspector Vale explanation, Case 001 decision and scan result is read out as soon as it appears. When it's off, people press the 🔊 button on any message. Hidden screens never read.
- **Follow along while it reads.** Whatever is being read right now is highlighted with a glowing outline and a "🔊 Reading now" tag, and scrolled into view. Each story scene has its own controls: **▶ Read this scene aloud**, **⏸ Pause / ▶ Resume**, **⏹ Stop**, **⏮ Start again**, plus "Now reading: Arthur" so you know who is speaking. Floating Pause and Stop buttons appear anywhere in the app while something is being read.
- **Voices.** In the Story Game each character has a voice that fits their age and gender. Arthur, 78, sounds older and speaks more slowly. Jamie, the grandson, has a child's voice. The caller pretending to be him sounds young too, but different and hurried. Inspector Vale is calm. Everything else (tutorial, AI Detective, scan results, reports, story narration) uses the **assistant voice**, which can be **female or male** (chosen in the tutorial or under "Aa Display", with a preview). The browser can only use voices installed on the device. By default `src/voices.ts` uses only **natural-sounding voices**, skipping the robotic or eerie ones some computers include, and keeps pitch changes small, because big changes sound creepy. It also avoids giving two people in the same scene the same voice. A child's voice is a real child voice where the browser has one (for example Microsoft Edge); otherwise it's a slightly raised voice. **More voice variety** (in Display) adds older computer voices so more characters sound different. Display also explains how to install better free voices. Character voices can be switched off.
- **Inspector Vale.** After every Story Game decision, a guide character explains in plain language whether it was safe, risky or dangerous, and what the safer option would have been.
- **Timeline comparison.** If you rewind and reach a different ending, the ending screen shows both timelines side by side.
- **Scores.** Both modes score **learning goals**, never AI confidence. Every part of the score shows how it was worked out.
  - *Story Game:* clues 30 (the share of clues on *your path* that you tapped), decisions 40 (the average over your final path: safe = full, risky = half, dangerous = none), outcome 20 (good 20 / mixed 10 / bad 0), learning from mistakes 10.
  - *Case 001:* clues 40, verdict 15, decisions 30 (10/5/0 each), learning from mistakes 15.
  - "Learning from mistakes" is the share of your risky or dangerous choices that you went back and rewound. If you made none, you get full marks, so a perfect run is never penalised for not rewinding (earlier versions did this). Rewinding a safe choice doesn't count.
- **AI Detective.** Unchanged features: evidence board with "Ask the AI partner", Playbook, decisions with **AI Rewind** (the server asks Claude to compare both choices), an AI-written report, and the Scam Scanner. Every AI panel says whether it is live AI or demo mode.

### Accessibility
- **Easy Mode** (one switch): largest text, 60px buttons, high contrast, no animations, hides decorative effects, and adds 👉 plain-language hints on every screen.
- Separate options for text size, high contrast and reduce motion.
- Read-aloud buttons (browser speech; nothing leaves the device), keyboard focus rings, a skip link, `aria-live` announcements, tooltips that work on tap, hover and keyboard, a prominent 🏠 Home button, and layouts that work on phone and desktop.

### Safety design
- The API key is read from server environment variables only.
- AI prompts forbid fraud instructions and requests for passwords, PINs or codes, and require outcomes to be described as possibilities.
- Pasted messages are treated as data, not instructions, and capped at 4,000 characters.
- The Scammer's Playbook and Story Game explain tactics only so people can recognise and resist them.
