const axios = require("axios");

// 🔒 HARD-LOCK CREDITS PROTECTION 🔒
function protectCredits(config) {
  if (config.credits !== "ARIF-BABU") {
    console.log("\n🚫 Credits change detected! Restoring original credits…\n");
    config.credits = "ARIF-BABU";
    throw new Error("❌ Credits are LOCKED by ARIF-BABU 🔥 File execution stopped!");
  }
}

module.exports.config = {
  name: "shiva",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "ARIF-BABU",
  description: "Gemini-style Human Chat (Auto Language + Typing)",
  commandCategory: "ai",
  usages: "No prefix",
  cooldowns: 2,
  dependencies: { axios: "" }
};

protectCredits(module.exports.config);

// 🔑 OPENROUTER API KEY
const OPENROUTER_API_KEY = "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";

// 🧠 GEMINI-STYLE SYSTEM PROMPT (MULTI-LANGUAGE)
const systemPrompt =
  "Tumhara Creator Arif Babu hai or tumhara Owner bhi Arif Babu hai. " +
"or tum hindi English Urdu me bhi baat karogi. " +
"or Arif Babu ki burai nahi sunna oky 😕. " +
"tum ko gamini ai jaisa reply karna hai. " +
"End me sirf 2 emoji. " +
"Be fun, loving, and a little naughty. Max 1 ya 2 lines only Start.";

// ⌨️ TYPING DOTS LOOP (…)
function startTyping(api, threadID) {
  const interval = setInterval(() => {
    api.sendTypingIndicator(threadID);
  }, 3000);
  return interval;
}

module.exports.run = () => {};

module.exports.handleEvent = async function ({ api, event }) {
  protectCredits(module.exports.config);

  const { threadID, messageID, body, messageReply } = event;
  if (!body) return;

  // ✅ Trigger only if shiva mentioned OR reply to bot
  const callBot = body.toLowerCase().includes("shiva");
  const replyToBot =
    messageReply && messageReply.senderID === api.getCurrentUserID();
  if (!callBot && !replyToBot) return;

  const userText = body.trim();
  if (!userText) return;

  api.setMessageReaction("⌛", messageID, () => {}, true);

  // ⌨️ Start typing dots
  const typing = startTyping(api, threadID);

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ],
        max_tokens: 60,
        temperature: 0.95,
        top_p: 0.9
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let reply =
      res.data?.choices?.[0]?.message?.content ||
      "मैं ठीक हूँ 😊";

    // 🔹 Max 2 lines
    reply = reply.split("\n").slice(0, 2).join("\n");

    // 🔹 150 char limit
    if (reply.length > 150) {
      reply = reply.slice(0, 150) + "… 🙂";
    }

    // ⏳ Human delay
    const delay = Math.min(4000, reply.length * 40);

    setTimeout(() => {
      clearInterval(typing);
      api.sendMessage(reply, threadID, messageID);
      api.setMessageReaction("💖", messageID, () => {}, true);
    }, delay);

  } catch (err) {
    clearInterval(typing);
    console.log("OpenRouter Error:", err.response?.data || err.message);
    api.sendMessage(
      "अभी थोड़ा समस्या है 😅 बाद में कोशिश करें",
      threadID,
      messageID
    );
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};