import fs from "fs";
import path from "path";
import express from "express";
import OpenAI from "openai";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* 🔐 CORS — THIS IS THE FIX */
app.use(
  cors({
    origin: [
      "https://harmony-aesthetics---wellness-chatbot-ai-1.onrender.com"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

/* OpenAI */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* Load data correctly */
const pagesPath = path.join(__dirname, "data", "pages.json");
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));

const knowledgeBase = pages
  .map(p => `PAGE: ${p.title}\n${p.content}`)
  .join("\n\n----------------\n\n");

/* Health */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* Chat */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message required" });
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
        { role: "user", content: message }
      ]
    });

    res.json({
      answer: completion.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* Start */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
