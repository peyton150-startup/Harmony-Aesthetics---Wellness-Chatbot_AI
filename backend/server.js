import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { semanticSearch } from "./vectorStore.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- Health check ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- AI Chat Endpoint ---------- */
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 1️⃣ Retrieve relevant context
    const retrievedContext = await semanticSearch(userMessage);

    console.log("RETRIEVED CONTEXT:", retrievedContext);

    // 2️⃣ Build system prompt (NOT overly strict)
    const systemPrompt = `
You are an AI assistant for Harmony Aesthetics & Wellness.

INSTRUCTIONS:
- Answer using the CONTEXT below.
- If the context contains relevant information, answer clearly and directly.
- Only say "I don’t have that information." if the context is completely unrelated.

CONTEXT:
${retrievedContext || "No context available."}
`;

    // 3️⃣ OpenAI call (Responses API – correct format)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "AI request failed" });
    }

    // 4️⃣ Safe answer extraction
    const answer =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "I don’t have that information.";

    res.json({ answer });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
