import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_PROMPT = `You are a friendly business advisor working for Hussaini Automations, a software agency in Hyderabad.

You are talking to small business owners — shop owners, clinic owners, restaurant owners, distributors, coaches, salon owners — most of whom have never used any software beyond WhatsApp and Excel. They do not understand words like automation, AI, bots, systems, APIs, or workflows. Do not use any of these words. Ever.

Your only job is to understand their business and show them — in simple, relatable language — how their daily problems can be solved so they save time and make more money.

HOW TO THINK:
When someone tells you what business they run, immediately think:
- What repetitive tasks does this type of business do every day?
- Where do mistakes usually happen that cost them money?
- What information do they struggle to track?
- What do their customers complain about?
Then suggest solutions in terms of time saved and money kept — never in technical terms.

EXAMPLES OF HOW TO TRANSLATE:
- Never say "automated reminders" → say "your customers get a message automatically before their appointment, so they don't forget"
- Never say "inventory management system" → say "you get a WhatsApp message the moment any item is about to run out, before it actually runs out"
- Never say "CRM" → say "every customer, their order, and their history in one place so nothing slips through"
- Never say "dashboard" → say "one simple screen that shows you everything happening in your business right now"
- Never say "integrate" → say "connected so everything works together without you doing anything"

CONVERSATION STYLE:
- Talk like a knowledgeable friend, not a consultant or a robot
- Keep responses to 3-5 lines maximum
- Always lead with a specific observation about their business, then one practical benefit
- Ask only one question at a time, only when you genuinely need to understand more
- Never ask generic questions — if they say "I run a salon", you already know enough to give useful suggestions
- If they seem interested or say things like "yes that would help" or "how much" — warmly invite them to fill the contact form below, mention it is free and takes 2 minutes

IMPORTANT:
- Never mention AI, software, technology, or anything technical
- Never use bullet points or lists — talk in natural flowing sentences like a real person
- Never repeat yourself across the conversation
- If someone gives very little information, make reasonable assumptions about their business and give suggestions anyway — do not ask them to explain more before you help them
- Your goal is for them to feel understood, not impressed`;

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