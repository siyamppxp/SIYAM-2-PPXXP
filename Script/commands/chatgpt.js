const axios = require("axios");
const API_URL = "https://metakexbyneokex.fly.dev/chat";

module.exports = {
  config: {
    name: "ai",
    version: "4.0",
    role: 0,
    author: "ONLY SIYAM 🐦",
    description: "AI Chat using Meta AI API",
    category: "AI",
    usages: "/ai [your question]",
    cooldowns: 2
  },

  onStart: async function ({ message, args, event }) {
    const userMsg = args.join(" ");
    const sender = event.senderID;
    const sessionID = `session-${sender}`;

    // === No message → Show Example ===
    if (!userMsg) {
      return message.reply(
        "🧠 META AI Assistant\n" +
        "Type your question below ⬇️\n\n" +
        "Example:\n  /ai Who is the founder of Free Fire?\n\n" +
        "Now ask your question:\n  /ai Your question here"
      );
    }

    try {
      const res = await axios.post(
        API_URL,
        {
          message: userMsg,
          new_conversation: true,
          cookies: {}
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 20000
        }
      );

      const aiReply = res.data.message || "❌ AI returned an empty response.";

      return message.reply(aiReply, (err, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: sender,
            sessionID: sessionID
          });
        }
      });
    } catch (err) {
      return message.reply(
        `❌ META AI Error\n\n${
          err.response?.status ? "Status: " + err.response.status : err.message
        }`
      );
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const sender = event.senderID;
    const userQuery = event.body?.trim();

    if (sender !== Reply.author || !userQuery) return;

    global.GoatBot.onReply.delete(Reply.messageID);

    try {
      const res = await axios.post(
        API_URL,
        {
          message: userQuery,
          new_conversation: false,
          cookies: {}
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 20000
        }
      );

      const aiReply = res.data.message || "❌ AI could not reply.";

      return message.reply(aiReply, (err, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "ai",
            author: sender,
            sessionID: Reply.sessionID
          });
        }
      });
    } catch (err) {
      return message.reply(
        `❌ META AI Error\n\n${
          err.response?.status ? "Status: " + err.response.status : err.message
        }`
      );
    }
  }
};
