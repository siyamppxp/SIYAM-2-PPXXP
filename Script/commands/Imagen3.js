const axios = require('axios');
const fs = require('fs-extra'); 
const path = require('path');

const API_ENDPOINT = "https://dev.oculux.xyz/api/imagen3";

module.exports = {
  config: {
    name: "imagen3",
    aliases: ["img3", "generate3"],
    version: "1.0",
    author: "SIYAM CHAT BOT",
    hasPermission: 0,
    commandCategory: "ai-image",
    cooldowns: 10,
    description: "Generate an image using the Imagen3 model",
    usage: "[prompt]",
    dependencies: {
      "axios": "",
      "fs-extra": ""
    }
  },

  run: async function({ api, event, args }) {
    const message = {
      reply: (content) => api.sendMessage(content, event.threadID)
    };

    if (!args[0] || !/^[\x00-\x7F]*$/.test(args.join(" "))) {
      return message.reply("❌ Please provide a valid English prompt to generate an image.\nExample: !imagen3 sunset over mountains");
    }

    const prompt = args.join(" ");
    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const tempFilePath = path.join(cacheDir, `imagen3_${Date.now()}.png`);

    try {
      message.reply("⏳ Generating your image, please wait...");

      // API request
      const response = await axios.get(API_ENDPOINT, {
        params: { p: prompt },
        responseType: 'arraybuffer',
        timeout: 45000
      });

      // Save image locally
      fs.writeFileSync(tempFilePath, Buffer.from(response.data, 'binary'));

      // Send image
      await api.sendMessage({
        body: `🎨 Imagen3 image generated for: "${prompt}"`,
        attachment: fs.createReadStream(tempFilePath)
      }, event.threadID);

    } catch (error) {
      console.error("Imagen3 Command Error:", error);
      let errorMessage = "❌ An error occurred while generating the image.";
      if (error.code === 'ETIMEDOUT') errorMessage = "❌ Generation timed out. Try a simpler prompt or check API.";
      if (error.response) errorMessage = `❌ HTTP Error: ${error.response.status}`;
      message.reply(errorMessage);

    } finally {
      // Delete temp file
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  }
};
