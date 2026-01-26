import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const VECTOR_FILE = "./data/vectors.json";

/* ---------- math helpers ---------- */
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  if (!magA || !magB) return 0;
  return dot / (magA * magB);
}

/* ---------- semantic search (USED AT RUNTIME) ---------- */
export async function semanticSearch(query, topK = 3) {
  if (!fs.existsSync(VECTOR_FILE)) {
    console.error("❌ vectors.json not found");
    return "";
  }

  const vectors = JSON.parse(fs.readFileSync(VECTOR_FILE, "utf8"));

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;

  const scored = vectors.map(v => ({
    text: v.text,
    score: cosineSimilarity(queryEmbedding, v.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, topK);

  console.log(
    "🔍 Top similarity scores:",
    topMatches.map(r => r.score.toFixed(3))
  );

  // 🔑 IMPORTANT FIX:
  // If similarity is weak, still return best matches
  const context = topMatches
    .map(r => r.text)
    .join("\n\n");

  return context || "";
}
