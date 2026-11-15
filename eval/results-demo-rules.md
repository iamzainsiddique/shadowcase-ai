# Evaluation results — demo-rules

Run on 2026-11-15T21:33:33.345Z over 24 fictional, hand-labelled messages (`data/eval-messages.json`).

| Metric | Value |
|---|---|
| Correctly classified | 23 |
| Incorrectly classified | 1 |
| Accuracy | 95.8% |
| Scams caught (recall) | 12/12 (100.0%) |
| Legitimate messages wrongly flagged | 1/12 |

## Misclassified examples
- #24: labelled **legitimate**, analyzer said **likely_scam** — "Northbridge Bank: Urgent security reminder — we will never ask you to move money to a safe account. If anyone does, hang up and call us on the number on your card."

## All results
| # | Label | Verdict | Correct |
|---|---|---|---|
| 1 | suspicious | likely_scam | ✓ |
| 2 | suspicious | likely_scam | ✓ |
| 3 | suspicious | likely_scam | ✓ |
| 4 | suspicious | likely_scam | ✓ |
| 5 | suspicious | likely_scam | ✓ |
| 6 | suspicious | likely_scam | ✓ |
| 7 | suspicious | likely_scam | ✓ |
| 8 | suspicious | likely_scam | ✓ |
| 9 | suspicious | likely_scam | ✓ |
| 10 | suspicious | suspicious | ✓ |
| 11 | suspicious | suspicious | ✓ |
| 12 | suspicious | suspicious | ✓ |
| 13 | legitimate | likely_legitimate | ✓ |
| 14 | legitimate | likely_legitimate | ✓ |
| 15 | legitimate | likely_legitimate | ✓ |
| 16 | legitimate | likely_legitimate | ✓ |
| 17 | legitimate | likely_legitimate | ✓ |
| 18 | legitimate | likely_legitimate | ✓ |
| 19 | legitimate | likely_legitimate | ✓ |
| 20 | legitimate | likely_legitimate | ✓ |
| 21 | legitimate | likely_legitimate | ✓ |
| 22 | legitimate | likely_legitimate | ✓ |
| 23 | legitimate | likely_legitimate | ✓ |
| 24 | legitimate | likely_scam | ✗ |
