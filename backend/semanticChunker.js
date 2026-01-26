export function semanticChunk(text, options = {}) {
  const {
    maxChars = 1200,   // ~300 tokens
    overlap = 200,
    minChars = 300
  } = options;

  const normalized = text
    .replace(/\s+/g, " ")
    .trim();

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).length > maxChars) {
      if (current.length >= minChars) {
        chunks.push(current.trim());
      }

      const tail =
        current.length > overlap
          ? current.slice(-overlap)
          : current;

      current = `${tail} ${sentence}`;
    } else {
      current += ` ${sentence}`;
    }
  }

  if (current.trim().length >= minChars) {
    chunks.push(current.trim());
  }

  return chunks;
}
