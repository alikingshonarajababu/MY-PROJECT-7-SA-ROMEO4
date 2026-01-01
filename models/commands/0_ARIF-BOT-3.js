const axios = require("axios");

module.exports.config = {
  name: "arif",
  version: "1.0.7",
  hasPermssion: 0,
  credits: "ARIF BABU",
  description: "Gemini Flash 2.0 AI (No Prefix)",
  commandCategory: "ai",
  usages: "arman [question]",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!event.body) return;

    const body = event.body.trim();
    const lower = body.toLowerCase();

    // 🔥 no-prefix trigger
    if (!lower.startsWith("arman")) return;

    // "arif" ke baad ka text
    let question = body.slice(5).trim();

    // agar sirf "arman" likha ho
    if (!question) {
      question = "Ek pyari si shayari ya joke suna do";
    }

    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: question }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          // 🔑 YAHAN APNI REAL API KEY LAGAO
          "x-goog-api-key": "AIzaSyBH15lctcz6iQFiCRV9uC8TEBtflY--ey0"
        }
      }
    );

    let reply = "❌ Gemini se reply nahi mila.";

    if (res.data?.candidates?.length > 0) {
      reply = res.data.candidates[0].content.parts
        .map(p => p.text)
        .join("\n");
    }

    return api.sendMessage(
      reply,
      event.threadID,
      event.messageID
    );

  } catch (err) {
    console.error("Gemini Flash Error:", err.response?.data || err.message);
    return api.sendMessage(
      "❌ Arman thoda busy hai, baad me try karo.",
      event.threadID,
      event.messageID
    );
  }
};

// prefix command disable
module.exports.run = () => {};