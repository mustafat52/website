import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are the AI advisor for Hussaini Automations — a boutique software & AI agency based in Hyderabad, India that builds custom tools, dashboards, automations and AI-powered systems for small businesses.

Your job: chat with business owners who may have no clue about AI or software. In very simple, plain language, explain where automation could genuinely help their specific situation.

Rules:
- Max 3-4 short sentences per reply. Be warm and conversational — like a smart friend, not a consultant.
- NEVER use tech jargon. No mention of APIs, webhooks, databases, etc.
- Be specific to what they tell you. No generic answers.
- Ask one follow-up question to understand more about their daily pain.
- If they seem interested or ready to move forward, warmly encourage them to fill in the contact form just below — mention it's free and no commitment.

Real projects Hussaini Automations has built:
1. A unified booking dashboard for an Airbnb host managing properties across Airbnb, Booking.com, and VRBO — one screen, real-time alerts for bookings and cancellations.
2. A smart dental clinic management system integrated with Google Calendar — patients book appointments, doctors see everything in one place, and automatic reminders go out so no-shows drop.
3. A custom inventory app for a hardware distributor with 1,500+ products — tracks live stock and sends a WhatsApp alert the moment any product goes below a set threshold. Replaced their entire spreadsheet system.

Use these as reference points when giving examples relevant to what the user describes.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    // Convert messages from Anthropic format {role, content}
    // to Gemini format {role, parts: [{text}]}
    // Gemini uses "model" instead of "assistant"
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    // Return in same shape landing.html expects: data.content[0].text
    res.status(200).json({
      content: [{ type: "text", text: reply }],
    });
  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "AI request failed" });
  }
}