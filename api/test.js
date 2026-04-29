module.exports = async function handler(req, res) {
  // Step 1 - is the route even reachable?
  // Step 2 - is the key present?
  // Step 3 - can we load the package?
  // Step 4 - can we call Gemini?

  const results = {};

  // Step 1
  results.route = "REACHABLE";

  // Step 2
  results.key_present = !!process.env.GEMINI_API_KEY;
  results.key_preview = process.env.GEMINI_API_KEY 
    ? process.env.GEMINI_API_KEY.slice(0,8) + "..." 
    : "MISSING";

  // Step 3
  try {
    const pkg = require("@google/generative-ai");
    results.package_loaded = true;
    results.package_keys = Object.keys(pkg);
  } catch(e) {
    results.package_loaded = false;
    results.package_error = e.message;
  }

  // Step 4 - only if steps 2+3 passed
  if (results.key_present && results.package_loaded) {
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Say OK");
      results.gemini_call = "SUCCESS: " + result.response.text();
    } catch(e) {
      results.gemini_call = "FAILED";
      results.gemini_error = e.message;
    }
  }

  results.node_version = process.version;
  results.timestamp = new Date().toISOString();

  return res.status(200).json(results);
};