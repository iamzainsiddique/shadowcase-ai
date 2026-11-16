# SHADOWCASE AI: a scam text filter that explains itself, inside a scam-awareness game
**Track 4.2 AI + Finance · Project 4.2.1 Scam text filter** · **Demo:** https://iamzainsiddique.github.io/shadowcase-ai/ · **Code and Colab notebook:** https://github.com/iamzainsiddique/shadowcase-ai (`ml/scam_filter.ipynb`)

**This project is a prototype and is not financial advice.**

## Problem
Scam texts trick people into clicking links, paying fake fees or moving money, and older adults are hit hardest. A filter that just says "spam" doesn't teach anyone. Our user is an **elderly relative**, who needs a clear flag, the reason for it, and practice at spotting scams themselves.

## Approach
1. **Filter (scikit-learn):** we used the SMS Spam Collection (5,574 texts, 13.4% spam) with a **stratified** 80/20 split (seed 42; the data has no dates). We tried TF-IDF (1–2 word n-grams) with **naive Bayes** and **logistic regression**, and compared them with two **baselines**: "everything is not spam", and our own keyword rules.
2. **Make it our own:** (a) **Modern UK scams.** The dataset is over 10 years old, so we wrote 24 modern UK test messages (12 scam, 12 genuine), such as "Hi Mum" new-number texts, fake parcel fees, fake tax refunds and "safe account" scams, and never trained on them. We trained a second model with 40 *different* modern examples added. (b) **It explains itself.** The app runs the model in the browser and shows the words that pushed it towards "scam", plus named tactics such as false urgency. (c) **Designed for an elderly user**, inside a game: 8 scam stories playable as the person targeted or as family or bank staff, Easy View, read-aloud, and a real-help card. An optional Claude Opus 5.5 mode gives deeper explanations.

## Results: precision and recall for spam (held-out data)
| Method | SMS test precision | SMS test recall | Modern UK precision | Modern UK recall |
|---|---|---|---|---|
| Baseline: everything "not spam" (86.6% accuracy) | 0% | **0%** | 0% | 0% |
| Baseline: our keyword rules | 75.0% | 22.1% | 92.3%* | 100%* |
| TF-IDF + naive Bayes | 100% | 81.9% | 100% | 16.7% |
| TF-IDF + logistic regression | 97.2% | 93.3% | 80.0% | 33.3% |
| **+ 40 modern UK examples (used in the app)** | **95.2%** | **93.3%** | 80.0% | **66.7%** |
| Model + keyword rules together (the app's scanner) | 88.5% | 93.3% | 85.7% | 100%* |

**What we learned.** The baseline looks 87% accurate but catches nothing. Logistic regression catches 93% of spam with 95% precision, far better than either baseline. **On modern UK scams, the old dataset struggles:** it caught only 33% until we added modern examples (67%). Messages with no "spammy" words still slip through, such as "Mum, new number", romance and "Steam cards for my niece". *The keyword rules were written while looking at the modern test set, so their scores (and the combined scores) are optimistic.

**Five messages the model gets wrong (SMS test):** "Ok... Ur typical reply..." (flagged, but genuine) · "Hi kindly give us back our documents which we submitted for loan…" (flagged, but genuine) · "Hi ya babe x u 4goten bout me?'… prem rate msg/subscription…" (missed scam) · "Bought one ringtone and now getting texts costing 3 pound…" (missed) · "ROMCAPspam Everyone around should be responding well to your presence…" (missed). The full list, including the modern misses, is in `ml/results.md`.

**Limitations:** the modern test set is small (24) and written by us. We didn't test with a real elderly user, and the stories weren't reviewed by a fraud expert. Claude's accuracy wasn't measured on this set.

## Credits
SMS Spam Collection (UCI; Almeida & Hidalgo; CC BY 4.0). scikit-learn, pandas, Google Colab. Claude Opus 5.5 (Anthropic API) for the optional AI explanations. Built with help from Claude Code. React, Vite, TypeScript, Tailwind CSS and Express. All characters, banks and modern messages are fictional.
