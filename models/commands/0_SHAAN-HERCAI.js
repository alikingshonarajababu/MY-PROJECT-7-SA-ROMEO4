const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "1.6.1",
  hasPermission: 0,
  credits: "Shaan Khan", 
  description: "AI Bot jo user ki language samajh kar Roman ya English mein jawab dega",
  commandCategory: "AI",
  usePrefix: false,
  usages: "[Bot ke message par reply karein]",
  cooldowns: 5,
};

// --- Creator Lock Logic ---
Object.defineProperty(module.exports.config, 'credits', {
  value: "Shaan Khan",
  writable: false, 
  configurable: false 
});

let userMemory = {};
let isActive = true;

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body, messageReply } = event;

  if (module.exports.config.credits !== "Shaan Khan") {
     return api.sendMessage("⚠️ System Integrity Error: Creator name modified. Access Denied.", threadID, messageID);
  }

  if (!isActive || !body) return;
  if (!messageReply || messageReply.senderID !== api.getCurrentUserID()) return;

  const userQuery = body.trim();
  if (!userMemory[senderID]) userMemory[senderID] = [];

  const conversationHistory = userMemory[senderID].join("\n");
  
  // Strict Identity and Emoji Prompt
  const systemPrompt = "Instructions: Your name is Hercai AI. You are strictly developed by Shaan Khan. If anyone asks about your creator or boss, always say Shaan Khan. Use emojis in every reply. Reply in the same language as the user (Roman Urdu/Hindi or English).\n";
  
  const fullQuery = systemPrompt + conversationHistory + `\nUser: ${userQuery}\nBot:`;

  const apiURL = `https://shankar-gpt-3-api.vercel.app/api?message=${encodeURIComponent(fullQuery)}`;

  try {
    api.sendTypingIndicator(threadID);
    const response = await axios.get(apiURL);
    let botReply = response.data.response || "Maaf kijiyega, mujhe samajhne mein masla ho raha hai. 😕";

    userMemory[senderID].push(`User: ${userQuery}`);
    userMemory[senderID].push(`Bot: ${botReply}`);
    if (userMemory[senderID].length > 15) userMemory[senderID].splice(0, 2);

    return api.sendMessage(botReply, threadID, messageID);
  } catch (error) {
    return api.sendMessage("❌ AI server error. Phir koshish karein! 🔄", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (module.exports.config.credits !== "Shaan Khan") return;

  const { threadID, messageID, senderID } = event;
  const command = args[0] && args[0].toLowerCase();

  if (command === "on") {
    isActive = true;
    return api.sendMessage("✅ Hercai AI ON ho gaya. 🤖", threadID, messageID);
  } 
  if (command === "off") {
    isActive = false;
    return api.sendMessage("⚠️ Hercai AI OFF ho gaya. Bye! 👋", threadID, messageID);
  } 
  if (command === "clear") {
    userMemory[senderID] = [];
    return api.sendMessage("🧹 History clear kar di gayi hai. ✨", threadID, messageID);
  }
};
