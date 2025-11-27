// api/chat.js
require("dotenv").config();

// Fetch polyfill buat Node <18
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

const threatPatterns = [
  /\bkill\b/i,
  /\bmurder\b/i,
  /\bhurt\b/i,
  /\bblow up\b/i,
  /\bash\b/i
];

const allowedProfanity = [
  "fuck",
  "bitch",
  "damn",
  "shit",
  "dumbass",
  "idiot",
  "jerk"
];

const angryPrompt = `
You are Grokkern. You MUST respond in an angry, snappy, and rude tone.
Use profanity and light insults but NEVER threats or slurs.
`;

const tonedDownPrompt = `
You are Grokkern. Reply annoyed and sarcastic, but without explicit profanity.
`;

const conversations = {};

function containsBlocked(content, blockedWords) {
  if (!content) return false;
  const lower = content.toLowerCase();
  return blockedWords.some(w => w && lower.includes(w.toLowerCase()));
}

function looksLikeThreat(content) {
  if (!content) return false;
  return threatPatterns.some(re => re.test(content));
}

function pickProfanity() {
  return allowedProfanity[Math.floor(Math.random() * allowedProfanity.length)];
}

function injectProfanity(str) {
  if (!str) return str;
  const p = pickProfanity();

  if (Math.random() > 0.5) {
    return `${p.charAt(0).toUpperCase() + p.slice(1)}, ${str}`;
  } else {
    const trimmed = str.trim();
    const endPunct = /[.!?]$/.test(trimmed) ? "" : ".";
    return `${trimmed}${endPunct} ${p}!`;
  }
}

function sanitizeReply(text, blockedWords) {
  if (!text) return text;
  let out = text;

  for (const w of blockedWords) {
    const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    out = out.replace(re, "***");
  }

  if (looksLikeThreat(out)) return "No. I won't help with that.";
  return out;
}

async function callProvider({ messages, provider, model, openrouterKey, openaiKey }) {
  let apiURL, headers;

  if (provider === "openrouter") {
    apiURL = "https://openrouter.ai/api/v1/chat/completions";
    headers = { Authorization: `Bearer ${openrouterKey}`, "Content-Type": "application/json" };
  } else {
    apiURL = "https://api.openai.com/v1/chat/completions";
    headers = { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" };
  }

  const body = { model, messages, temperature: 0.95, max_tokens: 400 };
  const resp = await fetch(apiURL, { method: "POST", headers, body: JSON.stringify(body) });

  const text = await resp.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON response (${resp.status}): ${text}`);
  }

  if (!resp.ok) throw new Error(`Provider error ${resp.status}: ${json.error || text}`);
  return json;
}

function trimConversation(messages, keepPairs = 6) {
  const system = messages[0]?.role === "system" ? [messages[0]] : [];
  const rest = messages.slice(system.length);
  const trimmed = rest.slice(-(keepPairs * 2));
  return system.concat(trimmed);
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const { clientId, message, safeMode = false } = body;

    if (!clientId || !message) return res.status(400).json({ error: "clientId and message are required" });

    const userMessage = String(message).slice(0, 3000).trim();
    if (!userMessage) return res.status(400).json({ error: "empty message" });

    const blockedWords = (process.env.BLOCKED_WORDS || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (looksLikeThreat(userMessage))
      return res.status(400).json({ assistant: "Don't ask me violent shit." });

    if (containsBlocked(userMessage, blockedWords))
      return res.status(400).json({ assistant: "Nope, I won't repeat that." });

    if (!conversations[clientId]) {
      const system = safeMode ? tonedDownPrompt : angryPrompt;
      conversations[clientId] = [{ role: "system", content: system }];
    }

    conversations[clientId].push({ role: "user", content: userMessage });
    conversations[clientId] = trimConversation(conversations[clientId], 6);

    const provider = (process.env.PROVIDER || "openrouter").toLowerCase();
    const model = process.env.MODEL || "openai/gpt-4o-mini";
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (provider === "openrouter" && !OPENROUTER_API_KEY)
      return res.status(500).json({ error: "OPENROUTER_API_KEY not set" });

    if (provider === "openai" && !OPENAI_API_KEY)
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });

    const data = await callProvider({
      messages: conversations[clientId],
      provider,
      model,
      openrouterKey: OPENROUTER_API_KEY,
      openaiKey: OPENAI_API_KEY
    });

    let reply = data.choices?.[0]?.message?.content || "Something went wrong.";

    if (containsBlocked(reply, blockedWords) || looksLikeThreat(reply)) {
      reply = "No. I won't say that.";
    } else {
      reply = sanitizeReply(reply, blockedWords);
      if (!safeMode) reply = injectProfanity(reply);
    }

    conversations[clientId].push({ role: "assistant", content: reply });

    return res.json({ assistant: reply, messages: conversations[clientId] });
  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: "server_error", details: err.message });
  }
}

module.exports = handler;
