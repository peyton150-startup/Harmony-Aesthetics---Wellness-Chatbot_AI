import fs from "fs";
import path from "path";
import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load pages.json ONCE at startup
const pagesPath = path.join(process.cwd(), "data/pages.json");

// pages.json is an ARRAY
const pages = JSON.parse(fs.readFileSync(pagesPath, "utf8"));

if (!Array.isArray(pages) || pages.length === 0) {
  throw new Error("pages.json is empty or not an array");
}

// Build knowledge base (verbatim)
const knowledgeBase = pages
  .map(page => `PAGE: ${page.title}\n${page.content}`)
  .join("\n\n----------------\n\n");

// Chat endpoint
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
        {
          role: "user",
          content: userQuestion
        }
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
