module.exports = async function handler(req, res) {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const keyPreview = hasKey ? process.env.GEMINI_API_KEY.slice(0, 8) + "..." : "NOT SET";

  // Try actually calling Gemini
  let geminiStatus = "not tested";
  let geminiError = null;

  if (hasKey) {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent("Say hi in one word.");
      const text = result.response.text();
      geminiStatus = "SUCCESS: " + text;
    } catch (err) {
      geminiStatus = "FAILED";
      geminiError = err.message;
    }
  }

  res.status(200).json({
    env: {
      GEMINI_API_KEY: keyPreview,
      EMAIL_USER: process.env.EMAIL_USER || "NOT SET",
    },
    gemini: {
      status: geminiStatus,
      error: geminiError,
    },
    node: process.version,
    timestamp: new Date().toISOString(),
  });
};