const axios = require("axios");
const API_ENDPOINT = "https://metakexbyneokex.fly.dev/chat";

module.exports.config = {
    name: "ai",
    version: "3.0",
    hasPermssion: 0,
    credits: "ONLY SIYAM BOT TEAM ☢️",
    description: "Chat with Meta AI in Messenger-style session",
    commandCategory: "AI",
    usages: "[your question]",
    cooldowns: 3
};

// Markdown escape
function escape_md(text) {
    if (!text) return "None";
    return text.toString().replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
}

// Main command
module.exports.run = async ({ api, event, args }) => {
    const userMsg = args.join(" ").trim();
    const { threadID, messageID, senderID } = event;

    if (!userMsg)
        return api.sendMessage("❌ Please type a message.\nExample: /ai hi", threadID, messageID);

    // Send "thinking" message first
    api.sendMessage(`🤖 AI Thinking...\n💬 Question: ${escape_md(userMsg)}`, threadID, messageID, async (err, info) => {
        if (err) return;

        try {
            const res = await axios.post(API_ENDPOINT, { message: userMsg, new_conversation: true, cookies: {} }, { headers: { "Content-Type": "application/json" }, timeout: 20000 });
            const aiReply = res.data.message || "AI replied empty message.";

            api.sendMessage(aiReply, threadID, (err2, info2) => {
                if (!err2) {
                    // Save reply session
                    if (!global.GoatBot) global.GoatBot = {};
                    if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();

                    global.GoatBot.onReply.set(info2.messageID, {
                        commandName: "ai",
                        author: senderID,
                        sessionID: `chat-${senderID}`
                    });
                }
            });

        } catch (e) {
            api.sendMessage(`❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`, threadID, messageID);
        }
    });
};

// Reply handler
module.exports.onReply = async ({ api, event, Reply }) => {
    const { senderID, threadID, messageID, body } = event;

    // Only handle replies from the original author
    if (senderID !== Reply.author) return;

    const userMsg = body.trim();
    if (!userMsg) return;

    // Delete previous session from map
    if (global.GoatBot?.onReply) global.GoatBot.onReply.delete(messageID);

    try {
        const res = await axios.post(API_ENDPOINT, { message: userMsg, new_conversation: false, cookies: {} }, { headers: { "Content-Type": "application/json" }, timeout: 20000 });
        const aiReply = res.data.message || "AI replied empty message.";

        api.sendMessage(aiReply, threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: "ai",
                    author: senderID,
                    sessionID: Reply.sessionID || `chat-${senderID}`
                });
            }
        });

    } catch (e) {
        api.sendMessage(`❌ AI ERROR\n➤ ${e?.response?.status ? "Server Error " + e.response.status : e.message}`, threadID, messageID);
    }
};
