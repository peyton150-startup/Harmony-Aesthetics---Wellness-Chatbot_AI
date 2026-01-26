import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Needed for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   CORS CONFIG (CRITICAL)
========================= */
app.use(cors({
  origin: [
    "https://harmony-aesthetics-wellness-chatbot-ai-1.onrender.com"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* =========================
   DATA FILE PATHS
   backend/data/pages.json
========================= */
const DATA_DIR = path.join(__dirname, "data");
const PAGES_PATH = path.join(DATA_DIR, "pages.json");

let pages = [];

try {
  pages = JSON.parse(fs.readFileSync(PAGES_PATH, "utf-8"));
  console.log("pages.json loaded successfully");
} catch (err) {
  console.error("FAILED TO LOAD pages.json:", err.message);
}

/* =========================
   HEALTH CHECK (REQUIRED)
========================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   CHAT ENDPOINT
========================= */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // VERY BASIC RESPONSE (replace with your AI logic)
  const answer = `You asked: "${message}"`;

  res.json({ answer });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
