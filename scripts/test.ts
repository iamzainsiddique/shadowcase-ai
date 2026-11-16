// Automated checks. Run with:  npm test
// Covers: story structure, story engine (choices, clues, rewind, scoring), Case 001 data,
// and a regression check that the demo analyzer still classifies the eval set as before.
import assert from "node:assert/strict";
import fs from "node:fs";
import { ALL_STORY_CLUES, CHARACTERS, DUPLICATE_IDS, ENDINGS, NODES, SCENARIOS, SCENE_ART_IDS, START_NODE, STORIES, fill, resolveEnding, resolveNode } from "../shared/story";
import { QUIZ_AFTER, QUIZ_BEFORE } from "../shared/quiz";
import { AUDIENCES } from "../shared/audience";
import { readPlayHash, surprise } from "../src/share";
import { MODEL_CHECKS, scoreMessage } from "../src/ml/scamModel";
import ML_RESULTS from "../ml/results.json";
import { allPaths, choose, collectClue, cluesSeen, currentEnding, getNode, initialState, nextVariant, rewindTo, scoreStory, storyVars } from "../shared/storyEngine";
import { ALL_CLUES, CASE_001, scoreCase } from "../shared/case";
import { TACTICS, TACTIC_LABELS, TACTIC_EXPLAINERS } from "../shared/types";
import { analyzeWithRules } from "../server/rules";
import { castVoices, guessGender, isRobotic, type VoiceRole } from "../src/voices";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}\n      ${(e as Error).message}`);
  }
}

console.log("\nStory structure (all scenarios and perspectives)");
const storyList = Object.values(STORIES);
const reachableFrom = (startId: string) => {
  const seen = new Set<string>([startId]);
  const queue = [startId];
  while (queue.length) for (const c of NODES[queue.shift()!].choices ?? []) if (!seen.has(c.next)) seen.add(c.next), queue.push(c.next);
  return seen;
};
test("5 scenarios, each with at least 2 playable perspectives and a trick breakdown", () => {
  assert.ok(SCENARIOS.length >= 5);
  for (const sc of SCENARIOS) {
    assert.ok(sc.stories.length >= 2, sc.id);
    assert.ok(sc.trick.length >= 4, `${sc.id} trick steps`);
    assert.equal(STORIES[sc.stories[0]].perspective, "victim", `${sc.id}: victim perspective first`);
    for (const id of sc.stories) assert.equal(STORIES[id]?.scenarioId, sc.id, id);
  }
});
test("you never play as the scammer", () => {
  for (const st of storyList) assert.ok(!CHARACTERS[st.you].scammer, `${st.id} plays as ${st.you}`);
});
test("no duplicate scene or ending ids across scenario files", () => assert.deepEqual(DUPLICATE_IDS, []));
test("every story's start scene exists", () => {
  for (const st of storyList) assert.ok(NODES[st.start], st.id);
  assert.ok(NODES[START_NODE]);
});
test("every choice leads to an existing scene", () => {
  for (const n of Object.values(NODES)) for (const c of n.choices ?? []) assert.ok(NODES[c.next], `${n.id} -> ${c.next} missing`);
});
test("every scene has choices or is an ending (never a dead end)", () => {
  for (const n of Object.values(NODES)) assert.ok((n.choices?.length ?? 0) > 0 || n.ending, `${n.id} is a dead end`);
});
test("ending scenes point to a defined ending", () => {
  for (const n of Object.values(NODES)) if (n.ending) assert.ok(ENDINGS[n.ending], `${n.id} has unknown ending`);
});
test("every story: no loops, ≥3 endings, ≥2 decisions on its longest path, at least one good ending", () => {
  for (const st of storyList) {
    const paths = allPaths(st.start);
    const endings = new Set(paths.map((p) => p.ending));
    assert.ok(endings.size >= 3, `${st.id}: ${endings.size} endings`);
    assert.ok(Math.max(...paths.map((p) => p.choices.length)) >= 2, `${st.id}: too short`);
    assert.ok([...endings].some((e) => ENDINGS[e].tone === "good"), `${st.id}: no good ending`);
    assert.ok([...endings].some((e) => ENDINGS[e].tone === "bad"), `${st.id}: no bad ending`);
  }
});
test("The Midnight Call (Arthur) keeps its 5 endings and 3+ decision paths", () => {
  const paths = allPaths();
  assert.equal(new Set(paths.map((p) => p.ending)).size, 5);
  assert.ok(Math.max(...paths.map((p) => p.choices.length)) >= 3);
});
test("every scene and every ending belongs to some story", () => {
  const all = new Set(storyList.flatMap((st) => [...reachableFrom(st.start)]));
  for (const id of Object.keys(NODES)) assert.ok(all.has(id), `${id} unreachable`);
  const endings = new Set([...all].map((id) => NODES[id].ending).filter(Boolean));
  for (const id of Object.keys(ENDINGS)) assert.ok(endings.has(id), `ending ${id} unreachable`);
});
test("every changing detail is filled in, for every variant (no {placeholders} left)", () => {
  for (const st of storyList) {
    const sc = SCENARIOS.find((x) => x.id === st.scenarioId)!;
    assert.ok(sc.variants.length >= 2, `${sc.id} needs 2+ variants`);
    for (const v of sc.variants) {
      for (const id of reachableFrom(st.start)) {
        const n = resolveNode(NODES[id], v);
        assert.ok(!/\{\w+\}/.test(JSON.stringify(n)), `${id} in ${sc.id}: ${JSON.stringify(n).match(/\{\w+\}/)}`);
        if (n.ending) assert.ok(!/\{\w+\}/.test(JSON.stringify(resolveEnding(ENDINGS[n.ending], v))), `ending ${n.ending}`);
      }
      for (const step of sc.trick) assert.ok(!/\{\w+\}/.test(fill(step.line + step.purpose + step.defence, v)), `${sc.id} trick`);
    }
  }
});
test("every clue phrase appears in its scene text for every variant (so it can be tapped)", () => {
  for (const st of storyList) for (const v of SCENARIOS.find((x) => x.id === st.scenarioId)!.variants) for (const id of reachableFrom(st.start)) {
    const n = resolveNode(NODES[id], v);
    const text = n.lines.map((l) => l.text).join(" ") + " " + (n.message?.text ?? "");
    for (const c of n.clues ?? []) assert.ok(text.includes(c.text), `"${c.text}" not found in ${n.id}`);
  }
});
test("clue ids are unique", () => {
  const ids = ALL_STORY_CLUES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});
test("every scene has a valid illustration, and every illustration is used", () => {
  for (const n of Object.values(NODES)) assert.ok((SCENE_ART_IDS as readonly string[]).includes(n.art), `${n.id} has art "${n.art}"`);
  const used = new Set([...Object.values(NODES).map((n) => n.art), ...SCENARIOS.map((s) => s.art)]);
  for (const a of SCENE_ART_IDS) assert.ok(used.has(a), `${a} unused`);
});
test("every unsafe choice offers a safer alternative", () => {
  for (const n of Object.values(NODES)) for (const c of n.choices ?? []) if (c.safety !== "safe") assert.ok(c.saferAlternative, `${c.id} missing saferAlternative`);
});
test("every speaking character exists and has a voice", () => {
  const cast = castVoices([{ name: "Samantha", lang: "en-US" }, { name: "Daniel", lang: "en-GB" }], "female");
  for (const n of Object.values(NODES)) for (const l of n.lines) {
    assert.ok(CHARACTERS[l.speaker], l.speaker);
    assert.ok(cast[l.speaker as VoiceRole], `${l.speaker} has no voice`);
  }
});

console.log("\nReplays, sharing and the scam check");
test("replays pick different details from last time", () => {
  for (const st of storyList) for (let prev = 0; prev < 3; prev++) assert.notEqual(nextVariant(st.id, prev, () => prev / 3 + 0.01), prev);
});
test("initialState starts each story at its own first scene, with its own details", () => {
  const s = initialState("parcel_family", 1);
  assert.equal(s.nodeId, "zf_start");
  assert.equal(storyVars(s).courier, "BoxHopper");
});
test("share links open the right scenario and reject anything else", () => {
  assert.deepEqual(readPlayHash("#play=parcel:parcel_family"), { scenarioId: "parcel", view: "parcel_family" });
  assert.deepEqual(readPlayHash("#play=romance:tricks"), { scenarioId: "romance", view: "tricks" });
  assert.equal(readPlayHash("#play=parcel:romance_victim"), null, "story from another scenario");
  assert.equal(readPlayHash("#play=<script>:x"), null);
  assert.equal(readPlayHash(""), null);
});
test("'Surprise me' always picks a real scenario and view", () => {
  for (let i = 0; i < 20; i++) {
    const r = surprise(() => i / 20);
    assert.ok(readPlayHash(`#play=${r.scenarioId}:${r.view}`), JSON.stringify(r));
  }
});
test("scam check: two different sets of 5, each mixing scams and safe messages", () => {
  for (const set of [QUIZ_BEFORE, QUIZ_AFTER]) {
    assert.equal(set.length, 5);
    assert.ok(set.some((q) => q.isScam) && set.some((q) => !q.isScam));
  }
  const ids = [...QUIZ_BEFORE, ...QUIZ_AFTER].map((q) => q.id);
  assert.equal(new Set(ids).size, 10);
});

console.log("\nStory engine");
test("choosing moves to the next scene and records history", () => {
  const s = choose(initialState(), "start-who");
  assert.equal(s.nodeId, "dodge");
  assert.equal(s.history.length, 1);
});
test("clues can only be collected in the current scene, once", () => {
  let s = collectClue(initialState(), "s-vague");
  s = collectClue(s, "s-vague");
  s = collectClue(s, "s-giftcards"); // belongs to a later scene
  assert.deepEqual(s.clues, ["s-vague"]);
});
test("different choices reach different endings", () => {
  const safe = ["start-who", "dodge-press", "trouble-mum", "pressure-helen"].reduce(choose, initialState());
  const unsafe = ["start-name", "trouble-pay", "lawyer-shop", "shop-lie", "codes-read"].reduce(choose, initialState());
  assert.equal(currentEnding(safe)!.id, "family_check");
  assert.equal(currentEnding(unsafe)!.id, "codes_gone");
});
test("rewind returns to the decision, restores the notebook and remembers the old ending", () => {
  let s = initialState();
  s = collectClue(s, "s-vague");
  s = choose(s, "start-name"); // -> trouble
  s = collectClue(s, "s-secret");
  s = ["trouble-pay", "lawyer-shop", "shop-lie", "codes-read"].reduce(choose, s);
  assert.equal(currentEnding(s)!.id, "codes_gone");
  const r = rewindTo(s, 1); // back to the "trouble" decision
  assert.equal(r.nodeId, "trouble");
  assert.deepEqual(r.clues, ["s-vague", "s-secret"]);
  assert.equal(r.rewinds, 1);
  assert.equal(r.previousEnding, "codes_gone");
  assert.ok(r.endingsFound.includes("codes_gone"));
  const after = choose(r, "trouble-test");
  assert.equal(after.nodeId, "test");
});
test("score parts add up and stay within 0-100", () => {
  for (const p of allPaths()) {
    const s = p.choices.reduce(choose, initialState());
    const sc = scoreStory(s);
    assert.equal(sc.total, sc.clues.points + sc.decisions.points + sc.outcome.points + sc.reflection.points);
    assert.ok(sc.total >= 0 && sc.total <= 100);
    for (const part of [sc.clues, sc.decisions, sc.outcome, sc.reflection]) assert.ok(part.points >= 0 && part.points <= part.max && part.why.length > 0);
  }
});
test("a flawless run isn't penalised for not rewinding", () => {
  const best = ["start-who", "dodge-press", "trouble-test", "test-hangup"].reduce(choose, initialState());
  const sc = scoreStory(best);
  assert.equal(sc.reflection.points, 10);
  assert.equal(sc.decisions.points, 40);
  assert.equal(sc.outcome.points, 20);
  assert.equal(sc.total, 70, "70 with no clues tapped (clues are the other 30)");
});
test("tapping every clue on the path + safe play = 100", () => {
  let s = initialState();
  for (const id of ["start-who", "dodge-press", "trouble-test", "test-hangup"]) {
    for (const c of getNode(s.nodeId).clues ?? []) s = collectClue(s, c.id);
    s = choose(s, id);
  }
  for (const c of getNode(s.nodeId).clues ?? []) s = collectClue(s, c.id);
  assert.equal(scoreStory(s).total, 100);
});
test("learning from mistakes: rewinding a risky choice earns the reflection points", () => {
  const s = choose(initialState(), "start-name"); // risky
  assert.equal(scoreStory(s).reflection.points, 0);
  const fixed = choose(rewindTo(s, 0), "start-who");
  assert.equal(fixed.mistakes, 1);
  assert.equal(fixed.mistakesUndone, 1);
  assert.equal(scoreStory(fixed).reflection.points, 10);
});
test("rewinding a safe choice doesn't count as fixing a mistake", () => {
  const s = rewindTo(choose(initialState(), "start-who"), 0);
  assert.equal(s.mistakesUndone, 0);
});
test("best path scores higher than worst path", () => {
  const best = ["start-who", "dodge-press", "trouble-test", "test-hangup"].reduce(choose, initialState());
  const worst = ["start-name", "trouble-pay", "lawyer-shop", "shop-lie", "codes-read"].reduce(choose, initialState());
  assert.ok(scoreStory(best).total > scoreStory(worst).total);
});
test("cluesSeen only counts scenes on the path taken", () => {
  const s = choose(initialState(), "start-name");
  assert.deepEqual(cluesSeen(s).sort(), ["s-cell", "s-secret", "s-tonight", "s-vague"].sort());
});

console.log("\nShared data (AI Detective)");
test("every tactic has a label and an explanation", () => {
  for (const t of TACTICS) assert.ok(TACTIC_LABELS[t] && TACTIC_EXPLAINERS[t], t);
});
test("Case 001 clue phrases exist in their evidence", () => {
  for (const ev of CASE_001.evidence) for (const c of ev.clues) assert.ok(ev.body.includes(c.text) || ev.from.includes(c.text), c.id);
});
test("Case 001 score: all-safe decisions get full 'learning from mistakes' without rewinding", () => {
  const safe = CASE_001.decisions.map((d) => ({ decisionId: d.id, optionId: d.options.find((o) => o.safety === "safe")!.id }));
  const sc = scoreCase(safe, ALL_CLUES.map((c) => c.id), true, []);
  assert.equal(sc.total, 100);
  const risky = CASE_001.decisions.map((d) => ({ decisionId: d.id, optionId: d.options.find((o) => o.safety !== "safe")!.id }));
  assert.equal(scoreCase(risky, [], true, []).reflection.points, 0);
  assert.equal(scoreCase(risky, [], true, CASE_001.decisions.map((d) => d.id)).reflection.points, 15);
});
test("Case 001 has 3 decisions, each with one safe option", () => {
  assert.equal(CASE_001.decisions.length, 3);
  for (const d of CASE_001.decisions) assert.equal(d.options.filter((o) => o.safety === "safe").length, 1);
});

console.log("\nVoice casting");
const MAC = ["Samantha|en-US", "Albert|en-US", "Bad News|en-US", "Bubbles|en-US", "Daniel|en-GB", "Eddy (English (United Kingdom))|en-GB", "Eddy (English (United States))|en-US", "Flo (English (United Kingdom))|en-GB", "Fred|en-US", "Grandma (English (United Kingdom))|en-GB", "Grandpa (English (United Kingdom))|en-GB", "Junior|en-US", "Karen|en-AU", "Kathy|en-US", "Moira|en-IE", "Ralph|en-US", "Reed (English (United Kingdom))|en-GB", "Rishi|en-IN", "Rocko (English (United Kingdom))|en-GB", "Sandy (English (United Kingdom))|en-GB", "Shelley (English (United Kingdom))|en-GB", "Tessa|en-ZA", "Zarvox|en-US", "Thomas|fr-FR"].map((x) => ({ name: x.split("|")[0], lang: x.split("|")[1] }));
const WINDOWS = ["Microsoft David - English (United States)|en-US", "Microsoft Zira - English (United States)|en-US", "Microsoft Mark - English (United States)|en-US", "Microsoft Hazel - English (United Kingdom)|en-GB", "Microsoft George - English (United Kingdom)|en-GB", "Microsoft Susan - English (United Kingdom)|en-GB"].map((x) => ({ name: x.split("|")[0], lang: x.split("|")[1] }));
const CHROME = [...MAC, ...["Google UK English Female|en-GB", "Google UK English Male|en-GB", "Google US English|en-US"].map((x) => ({ name: x.split("|")[0], lang: x.split("|")[1] }))];
const EDGE = ["Sonia|GB", "Ryan|GB", "Libby|GB", "Maisie|GB", "Thomas|GB", "Ana|US", "Guy|US", "Aria|US"].map((x) => ({ name: `Microsoft ${x.split("|")[0]} Online (Natural) - English`, lang: `en-${x.split("|")[1]}` }));
const ADULT_MALE: VoiceRole[] = ["arthur", "grant", "case_caller"];
const ADULT_FEMALE: VoiceRole[] = ["helen", "priya", "okafor", "vale"];
const CHARACTERS_ALL: VoiceRole[] = [...ADULT_MALE, ...ADULT_FEMALE, "jamie", "caller"];
test("by default only natural-sounding voices are used (no robotic or novelty voices)", () => {
  for (const list of [MAC, CHROME, WINDOWS, EDGE]) for (const a of ["female", "male"] as const) {
    const c = castVoices(list, a);
    for (const [role, cast] of Object.entries(c)) assert.ok(!isRobotic(cast.voiceName ?? ""), `${role} -> ${cast.voiceName}`);
  }
});
test("Arthur (78) sounds older: lower pitch and slower", () => {
  const c = castVoices(MAC, "female");
  assert.equal(c.arthur.voiceName, "Daniel");
  assert.ok(c.arthur.pitch < 1 && c.arthur.rate < 0.9);
});
test("the grandson sounds like a child: a real child voice if available, otherwise a raised higher voice", () => {
  assert.ok(castVoices(EDGE, "female").jamie.voiceName!.includes("Maisie"));
  const mac = castVoices(MAC, "female").jamie;
  assert.equal(guessGender(mac.voiceName!), "female", "a female voice raised a little sounds more like a child than a raised male voice");
  assert.ok(mac.pitch > 1.1);
});
test("adults never get a child's voice, and elderly voices go only to Arthur", () => {
  for (const variety of [false, true]) for (const list of [MAC, EDGE]) {
    const c = castVoices(list, "female", true, variety);
    for (const r of [...ADULT_MALE, ...ADULT_FEMALE]) assert.ok(!/Maisie|Ana /.test(c[r].voiceName!), `${r} -> ${c[r].voiceName}`);
    for (const r of CHARACTERS_ALL.filter((x) => x !== "arthur")) assert.ok(!/^Grand/.test(c[r].voiceName!), `${r} -> ${c[r].voiceName}`);
  }
});
test("pitch stays in a natural range (big shifts sound creepy)", () => {
  for (const list of [MAC, CHROME, WINDOWS, EDGE, [{ name: "Google US English", lang: "en-US" }]]) for (const a of ["female", "male"] as const) {
    for (const cast of Object.values(castVoices(list, a))) assert.ok(cast.pitch >= 0.85 && cast.pitch <= 1.25, `${cast.voiceName} ${cast.pitch}`);
  }
});
test("adult characters get a voice of the right gender when one exists", () => {
  for (const list of [MAC, WINDOWS, CHROME, EDGE]) for (const assistant of ["female", "male"] as const) {
    const c = castVoices(list, assistant);
    for (const r of ADULT_MALE) assert.equal(guessGender(c[r].voiceName!), "male", `${r} -> ${c[r].voiceName}`);
    for (const r of ADULT_FEMALE) assert.equal(guessGender(c[r].voiceName!), "female", `${r} -> ${c[r].voiceName}`);
  }
});
test("people in the same scene don't share a voice when the device has enough", () => {
  for (const list of [CHROME, EDGE]) {
    const c = castVoices(list, "female");
    for (const other of ["jamie", "caller", "helen", "grant", "priya", "okafor"] as const) assert.notEqual(c.arthur.voiceName, c[other].voiceName, other);
    assert.notEqual(c.caller.voiceName, c.grant.voiceName);
    assert.notEqual(c.caller.voiceName, c.jamie.voiceName, "the fake grandson must not sound exactly like the real one");
  }
});
test("Edge's natural voices: every character gets their own voice", () => {
  const c = castVoices(EDGE, "female");
  const names = ["arthur", "jamie", "caller", "helen", "grant", "vale"].map((r) => c[r as VoiceRole].voiceName);
  assert.equal(new Set(names).size, names.length, names.join(", "));
});
test("'More voice variety' adds extra (older) voices so fewer characters share", () => {
  const distinct = (variety: boolean) => new Set(CHARACTERS_ALL.map((r) => castVoices(MAC, "female", true, variety)[r].voiceName)).size;
  assert.ok(distinct(true) > distinct(false), `${distinct(true)} vs ${distinct(false)}`);
});
test("assistant voice follows the female/male setting", () => {
  for (const list of [MAC, WINDOWS, CHROME, EDGE]) {
    assert.equal(guessGender(castVoices(list, "female").assistant.voiceName!), "female");
    assert.equal(guessGender(castVoices(list, "male").assistant.voiceName!), "male");
  }
});
test("novelty and non-English voices are never used", () => {
  for (const variety of [false, true]) {
    const c = castVoices(MAC, "male", true, variety);
    for (const cast of Object.values(c)) assert.ok(!["Albert", "Bad News", "Bubbles", "Zarvox", "Thomas"].includes(cast.voiceName!), cast.voiceName);
  }
});
test("turning character voices off makes everyone use the assistant voice", () => {
  const c = castVoices(MAC, "female", false);
  for (const r of CHARACTERS_ALL) assert.equal(c[r].voiceName, c.assistant.voiceName);
});
test("device with a single female voice: male characters fall back to a slightly lower pitch", () => {
  const c = castVoices([{ name: "Google US English", lang: "en-US" }], "female");
  assert.equal(c.arthur.voiceName, "Google US English");
  assert.ok(c.arthur.pitch < 1 && c.grant.pitch < 1);
});
test("device with only robotic voices still reads aloud", () => {
  const c = castVoices([{ name: "Fred", lang: "en-US" }], "female");
  assert.equal(c.assistant.voiceName, "Fred");
});
test("device with no voices doesn't crash", () => {
  const c = castVoices([], "male");
  assert.equal(c.arthur.voiceName, undefined);
});

test("every age group recommends 3 real scenarios", () => {
  for (const a of Object.values(AUDIENCES)) {
    assert.equal(a.recommended.length, 3);
    for (const id of a.recommended) assert.ok(SCENARIOS.some((s) => s.id === id), id);
  }
});

console.log("\nTrained scam filter (ml/train.py → src/ml/scam-model.json)");
test("the browser version gives the same probabilities as scikit-learn (5 check messages)", () => {
  assert.equal(MODEL_CHECKS.length, 5);
  for (const c of MODEL_CHECKS) assert.ok(Math.abs(scoreMessage(c.text).pSpam - c.p_spam) < 0.001, `${c.text.slice(0, 40)}: ${scoreMessage(c.text).pSpam} vs ${c.p_spam}`);
});
test("results: the model beats both baselines on spam recall, and reports precision and recall", () => {
  const r = ML_RESULTS.results as Record<string, { sms_test: { precision: number; recall: number } }>;
  const model = r["TF-IDF + logistic regression + 40 modern UK examples (used in the app)"].sms_test;
  assert.equal(r["Baseline: everything 'not spam'"].sms_test.recall, 0);
  assert.ok(model.recall > r["Baseline: SHADOWCASE keyword rules"].sms_test.recall);
  assert.ok(model.precision > 0.9 && model.recall > 0.9, JSON.stringify(model));
  assert.equal(ML_RESULTS.errors_sms_test.length, 5, "five wrong examples are reported");
});
test("the filter explains itself: a scam text lists the words that made it suspicious", () => {
  const r = scoreMessage("WINNER! You have won a £1000 prize. Call now to claim, text CLAIM to 80888");
  assert.ok(r.flagged && r.reasons.length > 0, JSON.stringify(r));
  assert.ok(!scoreMessage("Running 10 minutes late, see you at the cafe").flagged);
});

console.log("\nDemo analyzer regression (eval set)");
test("demo analyzer still gets ≥23/24 on data/eval-messages.json (baseline measured 2026-11-15)", () => {
  const items: { label: string; text: string }[] = JSON.parse(fs.readFileSync("data/eval-messages.json", "utf8"));
  const correct = items.filter((i) => {
    const v = analyzeWithRules(i.text).verdict;
    return (v === "likely_scam" || v === "suspicious" ? "suspicious" : "legitimate") === i.label;
  }).length;
  assert.ok(correct >= 23, `got ${correct}/24`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
