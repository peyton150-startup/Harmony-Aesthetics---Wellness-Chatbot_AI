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
  return dot / (magA * magB);
}

/* ---------- ingest ---------- */
export async function buildVectors(chunks) {
  const vectors = [];

  for (const chunk of chunks) {
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.text
    });

    vectors.push({
      id: chunk.id,
      text: chunk.text,
      embedding: emb.data[0].embedding
    });
  }

  fs.writeFileSync(VECTOR_FILE, JSON.stringify(vectors, null, 2));
}

/* ---------- search ---------- */
export async function semanticSearch(query, topK = 3) {
  if (!fs.existsSync(VECTOR_FILE)) return "";

  const vectors = JSON.parse(fs.readFileSync(VECTOR_FILE, "utf8"));

  const queryEmb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });

  const scored = vectors.map(v => ({
    text: v.text,
    score: cosineSimilarity(queryEmb.data[0].embedding, v.embedding)
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(r => r.text)
    .join("\n");
}
