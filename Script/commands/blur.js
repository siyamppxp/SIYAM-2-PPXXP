// ফাইলের নাম: gapcha.js  (commands ফোল্ডারে রাখো)
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "gapcha",
    version: "1.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "ছবি পুরা ঝাপসা করে দিবে (গ্যাপচা মোড)",
    commandCategory: "fun",
    usages: "কোনো ছবিতে রিপ্লাই দিয়ে .gapcha লিখো",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    // রিপ্লাই চেক
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই করে .gapcha লিখো ভাই!", event.threadID);
    }

    const att = event.messageReply.attachments[0];
    if (att.type !== "photo") return api.sendMessage("❌ শুধু ছবিতেই কাজ করে!", event.threadID);

    const loading = await api.sendMessage("🔥 গ্যাপচা মোড চালু করতেছি... 😂", event.threadID);

    try {
      // ছবি ডাউনলোড
      const { data } = await axios.get(att.url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // আসল ছবি আঁকো
      ctx.drawImage(img, 0, 0);

      // একদম হেভি ব্লার (৬০px + মাল্টিপল লেয়ার)
      ctx.filter = "blur(60px)";
      ctx.drawImage(img, 0, 0);
      ctx.drawImage(img, 0, 0); // আরেকবার → আরো ঝাপসা
      ctx.filter = "blur(40px)";
      ctx.drawImage(img, 0, 0);

      // একটু পিক্সেলেট করে দিলাম যাতে আরো গ্যাপচা লাগে
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, img.width / 10, img.height / 10);
      ctx.drawImage(canvas, 0, 0, img.width, img.height);

      // ফাইল সেভ
      const outPath = path.join(__dirname, "cache", `gapcha_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 80 }));

      api.unsendMessage(loading.messageID);
      api.sendMessage({
        body: "গ্যাপচা সাকসেসফুল! 😂🔥\nএখন কেউ চিনতে পারবে না তোকে!",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(loading.messageID);
      api.sendMessage("❌ কিছু গড়বড় হয়েছে! আবার ট্রাই কর।", event.threadID);
    }
  }
};
