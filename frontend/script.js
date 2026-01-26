const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://harmony-aesthetics-wellness-chatbot-ai.onrender.com";

fetch(`${API_BASE}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: userMessage,
    sessionId: "user-123"
  })
});
