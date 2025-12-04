// ফাইলের নাম: effects.js  (commands ফোল্ডারে রাখো)
const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "effects",
    aliases: ["blur", "blur2", "blur3", "dream", "ghost"],
    version: "3.0",
    hasPermssion: 0,
    credits: "Siyam Pro",
    description: "ছবিতে বিভিন্ন প্রো ইফেক্ট (blur, dream, ghost)",
    commandCategory: "IMAGE EDIT",
    usages: "কোনো ছবিতে রিপ্লাই দিয়ে লিখো: .blur / .blur2 / .blur3 / .dream / .ghost",
    cooldowns: 4
  },

  run: async function({ api, event, args }) {
    const cmd = event.body.toLowerCase().split(" ")[0].slice(1); // .blur, .dream ইত্যাদি

    if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
      return api.sendMessage("❌ কোনো ছবিতে রিপ্লাই দিয়ে লিখো!", event.threadID);
    }

    const url = event.messageReply.attachments[0].url;
    const wait = await api.sendMessage("🌀 ইফেক্ট লাগাচ্ছি... একটু অপেক্ষা করো!", event.threadID);

    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const img = await loadImage(data);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // বিভিন্ন ইফেক্ট
      switch (cmd) {
        case "blur":
          ctx.filter = "blur(12px)";
          ctx.drawImage(img, 0, 0);
          break;

        case "blur2":
          ctx.filter = "blur(25px)";
          ctx.drawImage(img, 0, 0);
          break;

        case "blur3":
          ctx.filter = "blur(45px)";
          ctx.drawImage(img, 0, 0);
          break;

        case "dream":
          ctx.filter = "blur(15px) brightness(1.2)";
          ctx.drawImage(img, 0, 0);
          ctx.globalAlpha = 0.6;
          ctx.filter = "none";
          ctx.drawImage(img, 0, 0);
          break;

        case "ghost":
          ctx.filter = "blur(20px) contrast(150%) invert(80%)";
          ctx.drawImage(img, 0, 0);
          ctx.globalAlpha = 0.7;
          ctx.filter = "none";
          ctx.drawImage(img, 0, 0);
          break;

        default:
          ctx.filter = "blur(15px)";
          ctx.drawImage(img, 0, 0);
      }

      const outputPath = path.join(__dirname, "cache", `${cmd}_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(outputPath));
      fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg", { quality: 95 }));

      api.unsendMessage(wait.messageID);
      api.sendMessage({
        body: {
          blur: "✨ সুন্দর ব্লার হয়ে গেছে!",
          blur2: "Strong ব্লার 🔥",
          blur3: "পুরা ঝাপসা করে দিলাম!",
          dream: "ড্রিমি লুক! মন ভরে গেলো না?",
          ghost: "ভুত হয়ে গেলি তুই!"
        }[cmd],
        attachment: fs.createReadStream(outputPath)
      }, event.threadID, () => fs.unlinkSync(outputPath));

    } catch (e) {
      console.log(e);
      api.unsendMessage(wait.messageID);
      api.sendMessage("❌ কিছু গড়বড় হয়েছে! আবার ট্রাই করো।", event.threadID);
    }
  }
};
