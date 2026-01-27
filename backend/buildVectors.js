import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { buildVectors } from "./vectorStore.js";
import { semanticChunk } from "./semanticChunker.js";

dotenv.config();

const PAGES_FILE = "./data/pages.json";

async function run() {
  if (!fs.existsSync(PAGES_FILE)) {
    console.error("❌ pages.json not found");
    process.exit(1);
  }

  const pages = JSON.parse(fs.readFileSync(PAGES_FILE, "utf8"));

  const chunks = [];
  let id = 0;

  for (const page of pages) {
    if (!page.text || page.text.length < 50) continue;

    const parts = semanticChunk(page.text);

    for (const part of parts) {
      chunks.push({
        id: id++,
        source: page.source || "unknown",
        text: part
      });
    }
  }

  console.log(`🧩 Total semantic chunks: ${chunks.length}`);

  await buildVectors(chunks);
}

run().catch(err => {
  console.error("❌ Vector build failed:", err);
});
