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

/* ---------- build vectors (RUN ONCE AFTER SCRAPING) ---------- */
export async function buildVectors(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No chunks provided to buildVectors()");
  }

  const inputs = chunks.map(c => c.text);

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs
  });

  const vectors = chunks.map((chunk, i) => ({
    id: chunk.id,
    source: chunk.source || "unknown",
    text: chunk.text,
    embedding: embeddingResponse.data[i].embedding
  }));

  fs.mkdirSync("./data", { recursive: true });
  fs.writeFileSync(VECTOR_FILE, JSON.stringify(vectors, null, 2));

  console.log(`✅ ${vectors.length} vectors saved to ${VECTOR_FILE}`);
}

/* ---------- semantic search (USED AT RUNTIME) ---------- */
export async function semanticSearch(query, topK = 3) {
  if (!fs.existsSync(VECTOR_FILE)) return "";

  const vectors = JSON.parse(fs.readFileSync(VECTOR_FILE, "utf8"));

  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });

  const scored = vectors.map(v => ({
    text: v.text,
    score: cosineSimilarity(
      queryEmbedding.data[0].embedding,
      v.embedding
    )
  }));

  return scored
    .filter(r => r.score > 0.75) // similarity threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(r => r.text)
    .join("\n\n");
}
