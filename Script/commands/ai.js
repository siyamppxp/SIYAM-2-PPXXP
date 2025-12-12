const axios = require("axios");
const API_ENDPOINT = "https://metakexbyneokex.fly.dev/chat";

module.exports.config = {
    name: "ai",
    version: "2.1",
    hasPermssion: 0,
    credits: "ONLY SIYAM BOT TEAM ☢️",
    description: "Chat with Meta AI in structured format",
    commandCategory: "AI",
    usages: "[your question]",
    cooldowns: 3
};

// Escape markdown to avoid formatting issues
function escape_md(text) {
    if (!text) return "None";
    return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

module.exports.run = async ({ api, event, args }) => {
    const userMsg = args.join(" ").trim();
    const { threadID, messageID, senderID } = event;

    if (!userMsg)
        return api.sendMessage(
            "❌ Please type a message.\nExample: /ai Who are you?",
            threadID,
            messageID
        );

    // Inform user that AI is thinking
    api.sendMessage(`🤖 AI Thinking...\n\n💬 Question: ${escape_md(userMsg)}`, threadID, messageID);

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: userMsg, new_conversation: true, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const aiReply = res.data.message || "AI replied empty message.";

        // Send AI reply and store messageID for ongoing session
        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    author: senderID,
                    session: true
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

// Handle replies to AI messages
module.exports.onReply = async ({ api, event, Reply }) => {
    const { senderID, threadID, messageID, body } = event;

    // Only continue conversation if sender is the original user
    if (!Reply || senderID !== Reply.author) return;

    const userMsg = body.trim();
    if (!userMsg) return;

    try {
        const res = await axios.post(
            API_ENDPOINT,
            { message: userMsg, new_conversation: false, cookies: {} },
            { headers: { "Content-Type": "application/json" }, timeout: 20000 }
        );

        const aiReply = res.data.message || "AI replied empty message.";

        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
                // Keep session alive for multi-turn replies
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "ai",
                    author: senderID,
                    session: true
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
