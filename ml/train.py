"""SHADOWCASE AI: scam text filter (Veritas AI Hackathon, track 4.2.1).

Trains a TF-IDF + logistic regression filter on the SMS Spam Collection and compares it fairly with
simple baselines, reporting precision and recall for spam (not just accuracy, because spam is rare).

Run:  ml/.venv/bin/python ml/train.py        (or open ml/scam_filter.ipynb in Google Colab)

What it does
1. Loads the SMS Spam Collection (5,574 messages, ~13% spam) and makes a stratified 80/20 split.
   The dataset has no dates, so a time-based split isn't possible; a fixed random seed keeps it repeatable.
2. Baselines: (a) label everything "not spam"; (b) the app's own keyword rules (read from server/rules.ts).
3. Models: TF-IDF + multinomial naive Bayes, and TF-IDF + logistic regression.
4. Our own addition ("make it your own"): the dataset is over 10 years old, so we test every method on
   24 modern UK scam and genuine messages we wrote (data/eval-messages.json), and train an extra model that
   also learns from 40 *different* modern examples (data/modern-train-messages.json). The 24 test messages
   are never used for training.
5. Shows five messages the model gets wrong, and exports the final model to JSON so the app can run it
   in the browser and explain which words made it suspicious.

This project is a prototype and is not financial advice.
"""
from __future__ import annotations

import io
import json
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB

ROOT = Path(__file__).resolve().parent.parent
SEED = 42
DATA_URL = "https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip"


def load_sms() -> tuple[list[str], np.ndarray]:
    local = ROOT / "ml" / "data" / "download" / "SMSSpamCollection"
    if local.exists():
        raw = local.read_text(encoding="utf-8", errors="replace")
    else:  # e.g. in Google Colab
        with urllib.request.urlopen(DATA_URL) as r:
            raw = zipfile.ZipFile(io.BytesIO(r.read())).read("SMSSpamCollection").decode("utf-8", errors="replace")
    texts, labels = [], []
    for line in raw.splitlines():
        if "\t" not in line:
            continue
        label, text = line.split("\t", 1)
        texts.append(text)
        labels.append(1 if label == "spam" else 0)
    return texts, np.array(labels)


def load_json(path: Path, spam_labels=("spam", "suspicious")) -> tuple[list[str], np.ndarray]:
    items = json.loads(path.read_text(encoding="utf-8"))
    return [i["text"] for i in items], np.array([1 if i["label"] in spam_labels else 0 for i in items])


# ---- Baseline (b): the app's own keyword rules, read from server/rules.ts so there is one source of truth.
def load_rules() -> list[re.Pattern]:
    src = (ROOT / "server" / "rules.ts").read_text(encoding="utf-8")
    patterns = re.findall(r"pattern: /(.+?)/i,\s*explanation", src)
    return [re.compile(p, re.IGNORECASE) for p in patterns]


def rules_predict(texts: list[str], rules: list[re.Pattern]) -> np.ndarray:
    # The app calls a message "suspicious" or "likely scam" if any rule matches.
    return np.array([1 if any(r.search(t) for r in rules) else 0 for t in texts])


def metrics(y_true, y_pred) -> dict:
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    return {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn),
    }


def make_vectorizer() -> TfidfVectorizer:
    # Settings mirrored exactly by the app's in-browser version (src/ml/scamModel.ts).
    return TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=2, max_features=6000, sublinear_tf=True)


def main() -> None:
    texts, y = load_sms()
    print(f"SMS Spam Collection: {len(texts)} messages, {y.sum()} spam ({y.mean():.1%})")
    X_tr, X_te, y_tr, y_te = train_test_split(texts, y, test_size=0.2, stratify=y, random_state=SEED)
    print(f"Train {len(X_tr)} ({np.mean(y_tr):.1%} spam) · Test {len(X_te)} ({np.mean(y_te):.1%} spam)")

    modern_te, y_modern_te = load_json(ROOT / "data" / "eval-messages.json")
    modern_tr, y_modern_tr = load_json(ROOT / "data" / "modern-train-messages.json")
    assert not set(modern_te) & set(modern_tr), "modern test and training messages must not overlap"

    rules = load_rules()
    results: dict[str, dict] = {}

    def evaluate(name, predict):
        results[name] = {"sms_test": metrics(y_te, predict(X_te)), "modern_uk_test": metrics(y_modern_te, predict(modern_te))}

    # Baselines
    evaluate("Baseline: everything 'not spam'", lambda t: np.zeros(len(t), dtype=int))
    evaluate("Baseline: SHADOWCASE keyword rules", lambda t: rules_predict(t, rules))

    # Models trained on the SMS Spam Collection only
    vec = make_vectorizer().fit(X_tr)
    nb = MultinomialNB().fit(vec.transform(X_tr), y_tr)
    evaluate("TF-IDF + naive Bayes", lambda t: nb.predict(vec.transform(t)))
    lr = LogisticRegression(C=10, class_weight="balanced", max_iter=2000, random_state=SEED).fit(vec.transform(X_tr), y_tr)
    evaluate("TF-IDF + logistic regression", lambda t: lr.predict(vec.transform(t)))

    # Our addition: also learn from 40 modern UK examples (the 24 modern test messages stay unseen)
    X_aug, y_aug = list(X_tr) + modern_tr, np.concatenate([y_tr, y_modern_tr])
    vec_aug = make_vectorizer().fit(X_aug)
    lr_aug = LogisticRegression(C=10, class_weight="balanced", max_iter=2000, random_state=SEED).fit(vec_aug.transform(X_aug), y_aug)
    evaluate("TF-IDF + logistic regression + 40 modern UK examples (used in the app)", lambda t: lr_aug.predict(vec_aug.transform(t)))

    # What the app's scanner actually does: flag if the model OR the keyword rules flag it.
    evaluate("Model + keyword rules together (the app's scanner)", lambda t: np.maximum(lr_aug.predict(vec_aug.transform(t)), rules_predict(t, rules)))

    # Five messages the final model gets wrong on the SMS test set (and any it misses on the modern set)
    def wrong(texts_, y_true, k):
        pred = lr_aug.predict(vec_aug.transform(texts_))
        prob = lr_aug.predict_proba(vec_aug.transform(texts_))[:, 1]
        out = []
        for t, yt, yp, p in zip(texts_, y_true, pred, prob):
            if yt != yp:
                out.append({"text": t, "true": "spam" if yt else "not spam", "predicted": "spam" if yp else "not spam", "p_spam": round(float(p), 3)})
        return out[:k]

    errors_sms = wrong(X_te, y_te, 5)
    errors_modern = wrong(modern_te, y_modern_te, 10)

    # ---- Export the final model for the app (runs in the browser, explains its decision) ----
    vocab = vec_aug.vocabulary_
    terms = sorted(vocab, key=vocab.get)
    model = {
        "about": "TF-IDF (1-2 word n-grams, sublinear tf, l2) + logistic regression trained on the SMS Spam Collection "
                 "(UCI, Almeida & Hidalgo, CC BY 4.0) plus 40 modern UK examples written for SHADOWCASE AI. Prototype, not financial advice.",
        "terms": terms,
        "idf": [round(float(v), 5) for v in vec_aug.idf_],
        "coef": [round(float(v), 5) for v in lr_aug.coef_[0]],
        "intercept": round(float(lr_aug.intercept_[0]), 5),
        "threshold": 0.5,
        # Expected probabilities, so the app's tests can check the browser version matches Python.
        "checks": [
            {"text": t, "p_spam": round(float(lr_aug.predict_proba(vec_aug.transform([t]))[0, 1]), 4)}
            for t in [X_te[0], X_te[1], modern_te[0], modern_te[-1], "Hi Mum, this is my new number, can you pay a bill for me today?"]
        ],
    }
    out_model = ROOT / "src" / "ml" / "scam-model.json"
    out_model.parent.mkdir(parents=True, exist_ok=True)
    out_model.write_text(json.dumps(model, separators=(",", ":")), encoding="utf-8")

    summary = {
        "dataset": {"messages": len(texts), "spam": int(y.sum()), "train": len(X_tr), "test": len(X_te), "seed": SEED,
                    "modern_uk_test": len(modern_te), "modern_uk_train": len(modern_tr)},
        "results": results,
        "errors_sms_test": errors_sms,
        "errors_modern_uk_test": errors_modern,
    }
    (ROOT / "ml" / "results.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    write_markdown(summary)

    for name, r in results.items():
        s, m = r["sms_test"], r["modern_uk_test"]
        print(f"{name:75s} SMS P={s['precision']:.3f} R={s['recall']:.3f} | modern P={m['precision']:.3f} R={m['recall']:.3f}")
    print(f"Model exported: {out_model.relative_to(ROOT)} ({out_model.stat().st_size // 1024} KB, {len(terms)} features)")


def write_markdown(s: dict) -> None:
    pct = lambda v: f"{v:.1%}"
    lines = [
        "# Scam text filter: results",
        "",
        "> This project is a prototype and is not financial advice.",
        "",
        f"Data: SMS Spam Collection ({s['dataset']['messages']} messages, {s['dataset']['spam']} spam). Stratified 80/20 split, seed {s['dataset']['seed']} "
        f"({s['dataset']['train']} train / {s['dataset']['test']} test). The dataset has no dates, so a time-based split wasn't possible. "
        f"Modern UK test: {s['dataset']['modern_uk_test']} messages we wrote (12 scam, 12 genuine), never used for training. "
        f"Modern UK training examples: {s['dataset']['modern_uk_train']} different messages.",
        "",
        "Spam is rare, so we report **precision** (of the messages flagged, how many were really spam) and **recall** "
        "(of the real spam, how much was caught), not just accuracy.",
        "",
        "**Caution:** the keyword rules were written while we were looking at the 24 modern UK test messages, so their "
        "modern-test score (and the combined score) is optimistic. The trained models never saw those 24 messages.",
        "",
        "| Method | SMS test precision | SMS test recall | SMS test accuracy | Modern UK precision | Modern UK recall |",
        "|---|---|---|---|---|---|",
    ]
    for name, r in s["results"].items():
        a, m = r["sms_test"], r["modern_uk_test"]
        lines.append(f"| {name} | {pct(a['precision'])} | {pct(a['recall'])} | {pct(a['accuracy'])} | {pct(m['precision'])} | {pct(m['recall'])} |")
    lines += ["", "## Five messages the final model gets wrong (SMS test set)", ""]
    for e in s["errors_sms_test"]:
        lines.append(f"- True: **{e['true']}**, predicted: **{e['predicted']}** (p = {e['p_spam']}): “{e['text']}”")
    lines += ["", "## Modern UK test messages the final model gets wrong", ""]
    lines += [f"- True: **{e['true']}**, predicted: **{e['predicted']}** (p = {e['p_spam']}): “{e['text']}”" for e in s["errors_modern_uk_test"]] or ["- None."]
    (ROOT / "ml" / "results.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main())
