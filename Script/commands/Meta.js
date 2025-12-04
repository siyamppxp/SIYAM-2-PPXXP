const axios = require("axios");
const fs = require("fs");
const path = require("path");

const cache = new Map();

module.exports = {
  config: {
    name: "meta",
    version: "2.0",
    hasPermssion: 0,
    credits: "SIYAM CHAT BOT",
    description: "AI Image generator with reply select system",
    cooldowns: 8,
    commandCategory: "AI Image",
    usages: ".meta a prompt"
  },

  run: async ({ api, event, args }) => {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage("❌ Example:\n.meta a cyberpunk boy", event.threadID, event.messageID);

    await generate(api, event, prompt);
  },

  handleEvent: async ({ api, event }) => {
    const { body, threadID, senderID } = event;

    if (!cache.has(senderID)) return;
    if (!["1","2","3","4"].includes(body?.trim())) return;

    const data = cache.get(senderID);
    const index = parseInt(body.trim()) - 1;
    const url = data[index];

    if (!url) return api.sendMessage("❌ Invalid option", threadID);

    const file = path.join(__dirname, "cache", `meta_${senderID}.jpg`);
    try {
      const imgBuffer = (await axios.get(url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(file, Buffer.from(imgBuffer));

      api.sendMessage(
        {
          body: "✅ Selected Image:",
          attachment: fs.createReadStream(file)
        },
        threadID,
        () => fs.unlinkSync(file)
      );

      cache.delete(senderID);
    } catch (e) {
      api.sendMessage("❌ Failed to send image", threadID);
    }
  }
};

async function generate(api, event, prompt) {
  let wait;
  try {
    wait = await api.sendMessage("⏳ AI Image তৈরি হচ্ছে...", event.threadID);

    const res = await axios.post(
      "https://metakexbyneokex.fly.dev/images/generate",
      { prompt },
      { timeout: 120000 }
    );

    const images = res.data?.images?.map(i => i.url);
    if (!images || images.length === 0) throw new Error("No image");

    let msg = "🖼 Select one image (reply 1-4)\n\n";
    images.slice(0, 4).forEach((u, i) => msg += `${i + 1}. ${u}\n`);

    api.sendMessage(msg, event.threadID, event.messageID);

    cache.set(event.senderID, images.slice(0,4));

    api.unsendMessage(wait.messageID);
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ API Error / Image Fail", event.threadID);
  }
}
