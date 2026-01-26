const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://harmony-aesthetics-wellness-chatbot-ai.onrender.com";

export async function sendMessage(text) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text })
  });

  if (!res.ok) {
    throw new Error("Server error");
  }

  const data = await res.json();
  return data.answer;
}
