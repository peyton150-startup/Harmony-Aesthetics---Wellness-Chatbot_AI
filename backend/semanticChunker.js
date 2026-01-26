export function semanticChunk(text, options = {}) {
  const {
    maxChars = 1200,   // ~300 tokens
    overlap = 200
  } = options;

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChars) {
      chunks.push(current.trim());

      // overlap tail
      current =
        current.slice(-overlap) + " " + sentence;
    } else {
      current += " " + sentence;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}
