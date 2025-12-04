// ফাইল নাম: omg.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "omg",
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam + Oculux",
    description: "Instant OMG level AI image (1 click = 1 image)",
    usages: ".omg a dragon flying in space",
    commandCategory: "AI IMAGE",
    cooldowns: 8
  },

  run: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ লিখো কী চাও!\nExample: .omg a cute girl with blue hair", event.threadID);

    let msg = await api.sendMessage("🌀 Generating OMG image...", event.threadID);

    try {
      const response = await axios.get(`https://dev.oculux.xyz/api/artv1?p=${encodeURIComponent(prompt)}`, {
        timeout: 60000
      });

      const imgUrl = response.data.image_url || response.data.url || response.data.images?.[0]?.url;
      if (!imgUrl) throw new Error("Image URL not found");

      const img = await axios.get(imgUrl, { responseType: "stream" });

      api.unsendMessage(msg.messageID);
      api.sendMessage({
        body: "✨ OMG Done! 🔥",
        attachment: img.data
      }, event.threadID);

    } catch (e) {
      api.unsendMessage(msg.messageID);
      api.sendMessage("❌ OMG failed bro! Try again or change prompt.", event.threadID);
      console.log(e);
    }
  }
};
