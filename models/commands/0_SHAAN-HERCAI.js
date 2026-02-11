const axios = require("axios");

module.exports.config = {
  name: "hercai",
  version: "1.6.1",
  hasPermission: 0,
  credits: "SHAAN", 
  description: "AI Bot jo user ki language samajh kar Roman ya English mein jawab dega",
  commandCategory: "AI",
  usePrefix: false,
  usages: "[Bot ke message par reply karein]",
  cooldowns: 5,
};

let userMemory = {};
let isActive = true; // Default state

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID, body, messageReply } = event;

  // Check agar bot active hai aur message maujood hai
  if (!isActive || !body) return;

  // Sirf bot ke message par reply karne se AI trigger hoga
  if (!messageReply || messageReply.senderID !== api.getCurrentUserID()) return;

  const userQuery = body.trim();

  // User ki memory initialize karein
  if (!userMemory[senderID]) userMemory[senderID] = [];

  // Pichli baaton ka record (History)
  const conversationHistory = userMemory[senderID].join("\n");
  
  // Prompt instruction: User ki language mein jawab do
  const systemPrompt = "Instructions: Reply in the same language as the user. If they use Roman Urdu/Hindi, reply in Roman. If English, reply in English.\n";
  const fullQuery = systemPrompt + conversationHistory + `\nUser: ${userQuery}\nBot:`;

  const apiURL = `https://shankar-gpt-3-api.vercel.app/api?message=${encodeURIComponent(fullQuery)}`;

  try {
    // Typing indicator on
    api.sendTypingIndicator(threadID);

    const response = await axios.get(apiURL);
    let botReply = response.data.response || "Maaf kijiyega, mujhe samajhne mein masla ho raha hai.";

    // Memory update (Limit 15 messages)
    userMemory[senderID].push(`User: ${userQuery}`);
    userMemory[senderID].push(`Bot: ${botReply}`);
    if (userMemory[senderID].length > 15) userMemory[senderID].splice(0, 2);

    return api.sendMessage(botReply, threadID, messageID);

  } catch (error) {
    console.error("API Error:", error.message);
    return api.sendMessage("❌ AI server se connect nahi ho pa raha. Kripya baad mein check karein.", threadID, messageID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const command = args[0] && args[0].toLowerCase();

  if (command === "on") {
    isActive = true;
    return api.sendMessage("✅ Hercai AI ab ON ho gaya hai. Ab aap reply karke baat kar sakte hain.", threadID, messageID);
  } 
  
  if (command === "off") {
    isActive = false;
    return api.sendMessage("⚠️ Hercai AI ko OFF kar diya gaya hai.", threadID, messageID);
  } 
  
  if (command === "clear") {
    if (args[1] && args[1].toLowerCase() === "all") {
      userMemory = {};
      return api.sendMessage("🧹 Sabhi users ka data clear kar diya gaya hai.", threadID, messageID);
    }
    if (userMemory[senderID]) {
      delete userMemory[senderID];
      return api.sendMessage("🧹 Aapki chat history delete ho chuki hai.", threadID, messageID);
    } else {
      return api.sendMessage("⚠️ Aapki koi history maujood nahi hai.", threadID, messageID);
    }
  }
};
