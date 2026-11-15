# SHADOWCASE AI: Think like a detective. Expose the scam. Change the outcome.

**Live demo:** https://iamzainsiddique.github.io/shadowcase-ai/ · **Code:** https://github.com/iamzainsiddique/shadowcase-ai
*Educational demonstration only: not for real-life situations, and not financial, legal or security advice.*

## The problem
Financial scams by phone, text and online chat cost people their savings, and they hit older adults and people new to technology hardest. Most protection is a warning ("this looks suspicious") or a leaflet. Neither builds the instinct you need when a convincing voice is pressuring you *right now*. Scams also involve more than one person: family, friends and bank staff are often the ones who could stop it, but they don't know how to help without causing shame.

## Our approach
An interactive detective game with two modes:

- **🎭 Story Game (no AI needed):** 8 common UK scams, such as the fake grandson, bank "safe account", parcel text, romance, fake investment, "Hi Mum" new number, fake tax refund and fake police courier. **Each scam can be played from different perspectives:** the person targeted, *and* a family member, friend or bank worker trying to help. You never play the scammer. Instead, **"How the trick works"** walks through each scammer line, what it's designed to do, and how to beat it. Players tap suspicious words to collect clues, make choices that branch the story, and **rewind** any decision to compare timelines. Amounts, names and places change every playthrough.
- **🤖 AI Detective (Claude Opus 5.5):** an AI **Scam Scanner** that quotes the exact suspicious words, names the tactic and suggests safe checks. It also offers an AI-assisted case with **AI Rewind**, where the AI compares two decisions and explains which is safer, plus AI-written personalised lessons. The AI uses strict JSON-schema output. The API key stays on the server. Without a key, a clearly labelled demo mode runs instead.
- **Built for older users:** an interactive tutorial, an **Easy Mode** (large text, high contrast, no animation), read-aloud with a voice for each character and highlighting of the line being read, and a **real UK help card** on every ending (bank or 159, Report Fraud 0300 123 2040, 7726).

## How well it worked (real results)
- **Automated tests: 52/52 pass.** All 16 stories have no dead ends, reachable endings, and both safe and unsafe outcomes. A test also confirms you never play as the scammer. The tests cover scoring, voice casting, share links and the quiz.
- **Scam detection, demo rule-based analyzer:** 23/24 correct (95.8%) on 24 fictional, hand-labelled messages. It caught all 12 scams and wrongly flagged 1 of 12 genuine messages.
- **Live AI accuracy: not yet measured** on the same set. *(If you run `npm run eval` with a key before submitting, put the number here.)*
- **Every story played to an ending** in the browser, along with the public site, Easy Mode and read-aloud.
- **Limitations:** the test set is small and written by us, so the real-world score would be lower. Keyword rules miss subtle scams and negation. The stories haven't been reviewed by a fraud expert. The before/after "scam check" is a self-check, not a study.

## Credits
AI used inside the app: **Claude Opus 5.5** (Anthropic API) for the scanner, AI Rewind and lessons. Built with help from **Claude Code**. Browser Web Speech API for read-aloud. Libraries: React, Vite, TypeScript, Tailwind CSS, Express. Fonts: Inter and Space Grotesk (open licence). All data is synthetic: the characters, banks and messages are invented.
