import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
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

    // 1️⃣ Retrieve relevant knowledge
    const retrievedContext = await semanticSearch(userMessage);

    // 2️⃣ Strict system prompt
    const systemPrompt = `
You are an AI assistant for Harmony Aesthetics & Wellness.

RULES:
- Answer ONLY using the CONTEXT below.
- If the answer is not found, say:
  "I don’t have that information."

CONTEXT:
${retrievedContext || "No relevant information found."}
`;

    // 3️⃣ OpenAI Responses API call (CORRECT FORMAT)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    // 4️⃣ Correct extraction for Responses API
    const answer =
      data?.output_text ||
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
  console.log(`Server running on port ${PORT}`);
});
