const axios = require("axios");
const API_ENDPOINT = "https://metakexbyneokex.fly.dev/chat";

module.exports.config = {
    name: "ai",
    version: "2.0",
    hasPermssion: 0,
    credits: "ONLY SIYAM BOT TEAM ☢️",
    description: "Chat with Meta AI in structured format",
    commandCategory: "AI",
    usages: "[your question]",
    cooldowns: 3
};

// Markdown escape
function escape_md(text) {
    if (!text) return "None";
    return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

module.exports.run = async ({ api, event, args }) => {
    const userMsg = args.join(" ").trim();
    const { threadID, messageID, senderID } = event;

    if (!userMsg)
        return api.sendMessage("❌ Please type a message.\nExample: ai Who are you?", threadID, messageID);

    // Initial AI thinking message
    const sentMsg = await api.sendMessage(`🤖 AI Thinking...\n\n💬 Question: ${escape_md(userMsg)}`, threadID, messageID);

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: userMsg, new_conversation: true, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const aiReply = res.data.message || "AI replied empty message.";

        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                // Track reply so conversation continues
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    author: senderID,
                    conversationID: info.messageID // track this conversation
                });
            }
        });

    } catch (e) {
        api.sendMessage(
            `❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`,
            threadID,
            messageID
        );
    }
};

module.exports.onReply = async ({ api, event, Reply }) => {
    const { senderID, threadID, messageID, body } = event;

    if (!Reply || senderID !== Reply.author) return;

    const ask = body.trim();

    // Delete old tracking to prevent duplicates
    global.GoatBot.onReply.delete(messageID);

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: ask, new_conversation: false, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const answer = res.data.message || "AI replied empty message.";

        api.sendMessage(answer, threadID, (err, info) => {
            if (!err) {
                // Track reply again for next message
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "ai",
                    author: senderID,
                    conversationID: Reply.conversationID || messageID
                });
            }
        });

    } catch (e) {
        api.sendMessage(
            `❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`,
            threadID,
            messageID
        );
    }
};
