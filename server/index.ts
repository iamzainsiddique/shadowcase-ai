// SHADOWCASE AI — API server.
// Uses live AI (Claude) when ANTHROPIC_API_KEY is set; otherwise a clearly labeled demo mode.
import "dotenv/config";
import express from "express";
import { analyzeWithAi, hasAiKey, reportWithAi, rewindWithAi } from "./ai";
import { analyzeWithRules } from "./rules";
import { findOption } from "../shared/case";
import { demoReport, demoRewind } from "../shared/demo";
import type { ReportInput } from "../shared/types";

const app = express();
app.use(express.json({ limit: "20kb" }));

const MAX_MESSAGE = 4000;

app.get("/api/status", (_req, res) => {
  res.json({ mode: hasAiKey() ? "live-ai" : "demo" });
});

// 1. Scam message scanner
app.post("/api/scan", async (req, res) => {
  const message = String(req.body?.message ?? "").trim();
  if (!message) return res.status(400).json({ error: "Please paste a message to scan." });
  if (message.length > MAX_MESSAGE) return res.status(400).json({ error: "That message is too long (max 4,000 characters)." });

  if (!hasAiKey()) return res.json(analyzeWithRules(message));
  try {
    res.json(await analyzeWithAi(message));
  } catch (err) {
    console.error("scan failed:", err);
    res.status(502).json({ error: "The AI could not analyse this message right now. Please try again." });
  }
});

// 2. AI Rewind
app.post("/api/rewind", async (req, res) => {
  const { decisionId, originalId, alternativeId } = req.body ?? {};
  const { decision, option: original } = findOption(decisionId, originalId);
  const { option: alternative } = findOption(decisionId, alternativeId);
  if (!decision || !original || !alternative) return res.status(400).json({ error: "Unknown decision." });

  if (!hasAiKey()) return res.json(demoRewind(decisionId, originalId, alternativeId));
  try {
    res.json(await rewindWithAi(decisionId, originalId, alternativeId));
  } catch (err) {
    console.error("rewind failed:", err);
    res.status(502).json({ error: "The AI could not compare these choices right now. Please try again." });
  }
});

// 3. Personalised report lessons
app.post("/api/report", async (req, res) => {
  const input = req.body as ReportInput;
  if (!Array.isArray(input?.choices) || !Array.isArray(input?.cluesFound)) return res.status(400).json({ error: "Invalid report input." });

  if (!hasAiKey()) return res.json(demoReport(input));
  try {
    res.json(await reportWithAi(input));
  } catch (err) {
    console.error("report failed:", err);
    res.status(502).json({ error: "The AI could not write your lessons right now." });
  }
});

const port = Number(process.env.API_PORT ?? 8787);
const server = app.listen(port, () => {
  console.log(`SHADOWCASE API on http://localhost:${port} — mode: ${hasAiKey() ? "LIVE AI (Claude)" : "DEMO (no API key)"}`);
});
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${port} is already in use — SHADOWCASE is probably already running in another terminal.\nStop that one (Ctrl+C) or set API_PORT=8788 in .env, then run "npm run dev" again.\n`);
    process.exit(1);
  }
  throw err;
});
