import fs from "fs";
import path from "path";
import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
const __dirname = path.resolve();

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- serve frontend ---------- */
app.use(
  express.static(path.join(__dirname, "frontend"))
);

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "frontend", "index.html")
  );
});

/* ---------- OpenAI ---------- */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ---------- load knowledge ---------- */
const pagesPath = path.join(
  __dirname,
  "backend",
  "data",
  "pages.json"
);

const pages = JSON.parse(
  fs.readFileSync(pagesPath, "utf8")
);

const knowledgeBase = pages
  .map(p => `PAGE: ${p.title}\n${p.content}`)
  .join("\n\n----------------\n\n");

/* ---------- chat endpoint ---------- */
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are the assistant for Harmony Aesthetics & Wellness.
Answer ONLY from the content below.
If missing, say: "I don’t have that information."

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

/* ---------- health ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- start ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
