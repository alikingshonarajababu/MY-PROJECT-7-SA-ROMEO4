const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "2.0.0",
  hasPermission: 0,
  credits: "Shaan Khan", 
  description: "Dynamic Multi-Script AI - Native Language Support",
  commandCategory: "AI",
  usePrefix: false,
  usages: "[Reply to bot and give language instructions]",
  cooldowns: 5,
};

let userMemory = {};
let isActive = true;

module.exports.handleEvent = async function ({ api, event }) {
  // Credits Lock System
  if (global.client.commands.get("hercai").config.credits !== "Shaan Khan") {
    return api.sendMessage("⚠️ Error: Developer name changed. Access denied. Original: Shaan Khan", event.threadID, event.messageID);
  }

  const { threadID, messageID, senderID, body, messageReply } = event;
  if (!isActive || !body) return;

  if (!messageReply || messageReply.senderID !== api.getCurrentUserID()) return;

  api.setMessageReaction("⌛", messageID, (err) => {}, true);
  api.sendTypingIndicator(threadID);

  const userQuery = body.trim();
  if (!userMemory[senderID]) userMemory[senderID] = [];

  const conversationHistory = userMemory[senderID].join("\n");
  
  // **Enhanced System Prompt for Script Switching**
  const systemPrompt = `You are a highly intelligent AI created by Shaan Khan. 
  1. Default: Talk in Roman Urdu/Hindi.
  2. Native Script Rule: If the user asks (in any language) to speak in Pashto, Urdu, Hindi, Arabic, etc., you must stop using Roman letters and use the ORIGINAL script of that language (e.g., پښتو for Pashto, اردو for Urdu, हिन्दी for Hindi).
  3. Context Awareness: Remember previous instructions about language.
  4. Identity: Your owner is Shaan Khan.
  Current Context: ${conversationHistory}`;

  // Pollinations AI Call
  const apiURL = `https://text.pollinations.ai/${encodeURIComponent(systemPrompt + "\nUser: " + userQuery)}?model=openai&seed=${Math.floor(Math.random() * 9999)}`;

  try {
    const response = await axios.get(apiURL, { timeout: 35000 });
    let botReply = response.data || "Maaf kijiyega, reply generate nahi ho saka.";

    // Memory Management (8 messages for balance between speed and context)
    userMemory[senderID].push(`User: ${userQuery}`);
    userMemory[senderID].push(`Bot: ${botReply}`);
    if (userMemory[senderID].length > 8) userMemory[senderID].splice(0, 2);

    api.setMessageReaction("✅", messageID, (err) => {}, true);
    return api.sendMessage(botReply, threadID, messageID);

  } catch (error) {
    api.setMessageReaction("❌", messageID, (err) => {}, true);
    return api.sendMessage("❌ Connection slow hai. Shaan Khan ke server se contact nahi ho pa raha.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  if (global.client.commands.get("hercai").config.credits !== "Shaan Khan") return;
  const { threadID, messageID } = event;
  const command = args[0]?.toLowerCase();

  if (command === "on") {
    isActive = true;
    return api.sendMessage("✅ Hercai AI (Multi-Script) is now ON. Owner: Shaan Khan", threadID, messageID);
  } else if (command === "off") {
    isActive = false;
    return api.sendMessage("⚠️ Hercai AI is now OFF.", threadID, messageID);
  } else if (command === "clear") {
    userMemory = {};
    return api.sendMessage("🧹 Conversation history cleared!", threadID, messageID);
  }
};
