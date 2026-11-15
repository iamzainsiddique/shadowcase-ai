# Scam text filter: results

> This project is a prototype and is not financial advice.

Data: SMS Spam Collection (5574 messages, 747 spam). Stratified 80/20 split, seed 42 (4459 train / 1115 test). The dataset has no dates, so a time-based split wasn't possible. Modern UK test: 24 messages we wrote (12 scam, 12 genuine), never used for training. Modern UK training examples: 40 different messages.

Spam is rare, so we report **precision** (of the messages flagged, how many were really spam) and **recall** (of the real spam, how much was caught), not just accuracy.

**Caution:** the keyword rules were written while we were looking at the 24 modern UK test messages, so their modern-test score (and the combined score) is optimistic. The trained models never saw those 24 messages.

| Method | SMS test precision | SMS test recall | SMS test accuracy | Modern UK precision | Modern UK recall |
|---|---|---|---|---|---|
| Baseline: everything 'not spam' | 0.0% | 0.0% | 86.6% | 0.0% | 0.0% |
| Baseline: SHADOWCASE keyword rules | 75.0% | 22.1% | 88.6% | 92.3% | 100.0% |
| TF-IDF + naive Bayes | 100.0% | 81.9% | 97.6% | 100.0% | 16.7% |
| TF-IDF + logistic regression | 97.2% | 93.3% | 98.7% | 80.0% | 33.3% |
| TF-IDF + logistic regression + 40 modern UK examples (used in the app) | 95.2% | 93.3% | 98.5% | 80.0% | 66.7% |
| Model + keyword rules together (the app's scanner) | 88.5% | 93.3% | 97.5% | 85.7% | 100.0% |

## Five messages the final model gets wrong (SMS test set)

- True: **not spam**, predicted: **spam** (p = 0.527): “Hi kindly give us back our documents which we submitted for loan from STAPATI”
- True: **spam**, predicted: **not spam** (p = 0.045): “Hi ya babe x u 4goten bout me?' scammers getting smart..Though this is a regular vodafone no, if you respond you get further prem rate msg/subscription. Other nos used also. Beware!”
- True: **not spam**, predicted: **spam** (p = 0.673): “Ok... Ur typical reply...”
- True: **spam**, predicted: **not spam** (p = 0.396): “Bought one ringtone and now getting texts costing 3 pound offering more tones etc”
- True: **spam**, predicted: **not spam** (p = 0.107): “ROMCAPspam Everyone around should be responding well to your presence since you are so warm and outgoing. You are bringing in a real breath of sunshine.”

## Modern UK test messages the final model gets wrong

- True: **spam**, predicted: **not spam** (p = 0.181): “Mum it's me, I dropped my phone in the sink, this is my new number. Can you help me pay a bill urgently? Don't tell dad, I'll explain later x”
- True: **spam**, predicted: **not spam** (p = 0.188): “Hi, I'm an investment manager. My clients double their savings in 3 months with our crypto platform. Guaranteed returns, risk-free. Shall I set you up?”
- True: **spam**, predicted: **not spam** (p = 0.046): “I know we only met online a few weeks ago but I feel so close to you. I'm stuck abroad and need £900 for my flight home. Please keep this between us.”
- True: **spam**, predicted: **not spam** (p = 0.082): “Hey, it's Sam from the church group. Could you do me a favour and pick up four £100 Steam cards for my niece's birthday? I'll pay you back Sunday.”
- True: **not spam**, predicted: **spam** (p = 0.606): “Thanks for your order! Your new kettle will arrive between Tuesday and Thursday. Track it any time in your account on our website.”
- True: **not spam**, predicted: **spam** (p = 0.54): “Northbridge Bank: Urgent security reminder — we will never ask you to move money to a safe account. If anyone does, hang up and call us on the number on your card.”
