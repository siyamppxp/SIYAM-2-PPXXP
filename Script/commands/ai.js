const axios = require('axios');
const API_ENDPOINT = 'https://metakexbyneokex.fly.dev/chat';

module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    hasPermssion: 0,
    credits: "SIYAM BOT TEAM ☢️",
    description: "Chat with Meta AI",
    commandCategory: "AI",
    usages: "[message] or reply to the bot's message",
    cooldowns: 5
  },

  onStart: async function({ api, event, args, getText }) {
    const { threadID, messageID, senderID } = event;
    const userMessage = args.join(" ");

    if (!userMessage)
      return api.sendMessage("❌ Please provide a message to start chatting with the AI.", threadID, messageID);

    const sessionID = `chat-${senderID}`;

    try {
      const res = await axios.post(API_ENDPOINT, {
        message: userMessage,
        new_conversation: true,
        cookies: {}
      }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

      const aiMessage = res.data.message || "AI responded, but the message was empty.";

      api.sendMessage(aiMessage, threadID, (err, info) => {
        if (info) {
          // Save reply info for continuation
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            messageID: info.messageID,
            sessionID: sessionID
          });
        }
      });

    } catch (err) {
      let errorMsg = "Unknown error while contacting AI.";
      if (err.response) errorMsg = `API Error: Status ${err.response.status}`;
      else if (err.code === 'ECONNABORTED') errorMsg = "Request timed out.";

      api.sendMessage(`❌ AI Command Failed\n\nError: ${errorMsg}`, threadID, messageID);
    }
  },

  onReply: async function({ api, event, Reply }) {
    const { threadID, senderID } = event;
    const query = event.body?.trim();

    if (!query || senderID !== Reply.author) return;

    global.GoatBot.onReply.delete(Reply.messageID);
    const sessionID = Reply.sessionID || `chat-${senderID}`;

    try {
      const res = await axios.post(API_ENDPOINT, {
        message: query,
        new_conversation: false,
        cookies: {}
      }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

      const aiMessage = res.data.message || "AI responded, but the message was empty.";

      api.sendMessage(aiMessage, threadID, (err, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            messageID: info.messageID,
            sessionID: sessionID
          });
        }
      });

    } catch (err) {
      let errorMsg = "Unknown error while contacting AI.";
      if (err.response) errorMsg = `API Error: Status ${err.response.status}`;
      else if (err.code === 'ECONNABORTED') errorMsg = "Request timed out.";

      api.sendMessage(`❌ AI Command Failed\n\nError: ${errorMsg}`, threadID);
    }
  }
};
