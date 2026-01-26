import express from "express";
import fetch from "node-fetch";

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "No message provided" });
    }

    // ---- Harmony Aesthetics & Wellness Grounding Context ----
    const harmonyContext = `
You are an assistant for Harmony Aesthetics & Wellness.
Answer ONLY using the information below.
If the answer is not found here, say you do not have that information.

Harmony Aesthetics & Wellness is a medical spa with locations in Kensington, Maryland
and Falls Church, Virginia. The clinic focuses on personalized care, natural results,
and a welcoming environment.

SERVICES OFFERED:
Harmony Aesthetics & Wellness provides aesthetic and wellness services including:
- Facials and customized skincare treatments
- RF microneedling
- IPL therapy for pigmentation and sun damage
- Chemical peels
- PRX Collagen Stimulator
- Neurotoxins (such as Botox-style injectables)
- Dermal fillers
- DeRive Hair Restoration
- Laser hair removal
- Ketamine therapy
- Vitamin IV therapy

CONSULTATIONS:
Complimentary consultations are offered to discuss goals and recommend treatments.

PHILOSOPHY:
Treatments are customized based on individual skin type and wellness needs.
The clinic emphasizes comfort, safety, and natural-looking results.

CONTACT & LOCATIONS:
Kensington, MD:
10901 Connecticut Ave #201, Kensington, MD 20895

Falls Church, VA:
124 E Broad St Suite A, Falls Church, VA 22046

Appointments can be scheduled online, by phone, or in person.
`;

    // ---- OpenAI API Call ----
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: harmonyContext
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      reply: data.output_text || "I'm not sure about that."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
