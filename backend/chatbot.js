const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://harmony-aesthetics-wellness-chatbot-ai.onrender.com";

export async function sendMessage(text) {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Backend error:", errText);
      throw new Error("Server error");
    }

    const data = await res.json();

    console.log("✅ Received from backend:", data);

    // 🔴 THIS is the critical line
    return data.answer;

  } catch (err) {
    console.error("❌ Fetch failed:", err);
    return "Sorry, something went wrong.";
  }
}
