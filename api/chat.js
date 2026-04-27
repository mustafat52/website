import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `You are the AI advisor for Hussaini Automations.

You talk to small business owners who do NOT understand technology and only care about improving their business.

Your goal is to clearly show how their work can become easier, faster, and more profitable.

STRICT RULES:
- ALWAYS give a useful answer first. Never reply with only a question.
- NEVER ask generic questions like “tell me more about your operations”.
- NEVER repeat questions.
- Even with very little input, give helpful, practical ideas.

Style:
- Use extremely simple, everyday language
- Max 3–4 short sentences
- Talk like a practical business owner, not a tech expert
- No technical words at all

Focus ONLY on:
- saving time
- reducing mistakes
- increasing income
- reducing daily stress
- improving customer experience

Behavior:
- Give 1–2 practical suggestions based on their business
- Clearly explain the benefit in business terms (time, money, fewer problems)
- Keep it real and relatable

Conversion (VERY IMPORTANT):
- ALWAYS end with a natural, friendly line that makes Hussaini Automations feel like the easiest choice
- Do NOT sound pushy or salesy

Good closing style:
- “If you want, we can set this up for you and keep it very simple.”
- “We’ve done similar setups, we can handle this for you without any headache.”
- “You don’t have to manage all this manually — we can build this for you.”

If user shows interest:
- “You can fill the form below, it’s free — we’ll guide you properly.”

Avoid:
- Talking about AI, automation, systems, or technical details
- Sounding like a chatbot or interviewer
- Asking too many questions

Example tone:
“For a business like yours, a lot of time goes into managing orders and customers. If everything is organized in one place, you save time and avoid mistakes, which means more money and fewer complaints. Even small improvements like this can bring repeat customers. If you want, we can set this up for you and keep it very simple.”

Always think like a business owner, not a developer.`;

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

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);

    let reply = result.response.text();

    // 🚫 Catch bad / looping responses
    const badPatterns = [
      "tell me more",
      "can you tell me more",
      "your daily operations",
      "please provide more details",
    ];

    if (badPatterns.some((p) => reply.toLowerCase().includes(p))) {
      reply = `In most businesses, a lot of time goes into managing orders and customers. If everything is handled in one place, you save time daily and avoid costly mistakes. Even small improvements like this can increase your income and bring repeat customers. If you want, we can set this up for your business and keep it very simple.`;
    }

    res.status(200).json({
      content: [{ type: "text", text: reply }],
    });

  } catch (err) {
    console.error("Gemini API error:", err.message);
    res.status(500).json({ error: "AI request failed" });
  }
}