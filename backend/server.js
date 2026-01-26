import fs from "fs";
import path from "path";
import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- FRONTEND PATH (THIS IS THE FIX) ----------
const __dirname = new URL(".", import.meta.url).pathname;
const frontendPath = path.resolve(__dirname, "../frontend");

// Serve frontend files
app.use(express.static(frontendPath));

// ---------- OPENAI ----------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------- LOAD DATA ----------
const pagesPath = path.resolve(__dirname, "../data/pages.json");
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));

if (!Array.isArray(pages) || pages.length === 0) {
  throw new Error("pages.json is empty or invalid");
}

const knowledgeBase = pages
  .map(page => `PAGE: ${page.title}\n${page.content}`)
  .join("\n\n----------------\n\n");

// ---------- API ----------
app.post("/api/chat", async (req, res) => {
  try {
    const userQuestion = req.body.message;
    if (!userQuestion) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are the official assistant for Harmony Aesthetics & Wellness.

Answer ONLY using the information below.
If the answer is not explicitly stated, say:
"I don’t have that information."

${knowledgeBase}
          `
        },
        { role: "user", content: userQuestion }
      ]
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- HEALTH CHECK ----------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------- FRONTEND FALLBACK ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
