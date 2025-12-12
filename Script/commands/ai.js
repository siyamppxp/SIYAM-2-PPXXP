const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "ai",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "SHAHADAT SAHU",
    description: "AI Chat Bot - Reply with any message",
    commandCategory: "AI Tools",
    usages: "Reply to any message or type /ai your message",
    cooldowns: 3
  },

  handleEvent: async ({ api, event }) => {
    const { body, messageReply, threadID, messageID } = event;
    
    // Jodi user /ai na bole reply kore
    if (!body) return;
    
    const msgText = body || (messageReply && messageReply.body);
    if (!msgText) return;

    await processAI(api, threadID, messageID, msgText);
  },

  run: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const msgText = args.join(" ");
    if (!msgText) return api.sendMessage("💬 Type a message to ask AI!", threadID, messageID);

    await processAI(api, threadID, messageID, msgText);
  }
};

async function processAI(api, threadID, messageID, msgText) {
  try {
    // Wait message
    const wait = await api.sendMessage("🤖 Thinking...", threadID);

    // API call
    const res = await axios.post("https://metakexbyneokex.fly.dev/chat", {
      message: msgText
    });

    const reply = res.data?.response || "❌ AI did not return anything!";

    // Send reply
    await api.sendMessage(reply, threadID, messageID);

    // Remove wait message
    api.unsendMessage(wait.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ API Error! Try again later.", threadID, messageID);
  }
}
