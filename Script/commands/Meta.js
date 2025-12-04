const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const API = "https://metakexbyneokex.fly.dev/images/generate";
const cache = new Map();

module.exports = {
  config: {
    name: "meta",
    version: "3.0",
    hasPermssion: 0,
    credits: "SIYAM CHAT BOT",
    description: "Meta AI Image (grid + reply select)",
    usages: ".meta a dog",
    commandCategory: "AI IMAGE",
    cooldowns: 5
  },

  run: async ({ api, event, args }) => {
    const prompt = args.join(" ");
    if (!prompt)
      return api.sendMessage("❌ Example: .meta a dog", event.threadID, event.messageID);

    generate(api, event, prompt);
  },

  handleEvent: async ({ api, event }) => {
    const pick = event.body?.trim();
    if (!["1","2","3","4"].includes(pick)) return;

    if (!cache.has(event.senderID)) return;

    const data = cache.get(event.senderID);
    const imgURL = data.urls[pick - 1];

    if (!imgURL) return api.sendMessage("❌ Image not found", event.threadID);

    const file = path.join(__dirname, "cache", `meta_pick_${event.senderID}.jpg`);

    try {
      const buffer = (await axios.get(imgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(file, buffer);

      api.sendMessage(
        {
          body: "✅ Selected Image:",
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file)
      );

      cache.delete(event.senderID);
    } catch (e) {
      api.sendMessage("❌ Failed to send image", event.threadID);
    }
  }
};

// ===== IMAGE GEN + GRID =====
async function generate(api, event, prompt) {
  let wait;
  const dir = path.join(__dirname, "cache");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  try {
    wait = await api.sendMessage("⏳ Generating images...", event.threadID);

    const res = await axios.post(API, { prompt }, { timeout: 150000 });
    const urls = res.data.images.map(i => i.url).slice(0,4);

    if (urls.length < 4) throw new Error("Not enough images");

    const files = [];
    for (let i = 0; i < 4; i++) {
      const file = path.join(dir, `meta_${Date.now()}_${i}.jpg`);
      const buf = (await axios.get(urls[i], { responseType: "arraybuffer" })).data;
      fs.writeFileSync(file, buf);
      files.push(file);
    }

    const gridPath = path.join(dir, `grid_${Date.now()}.png`);
    await makeGrid(files, gridPath);

    api.sendMessage(
      {
        body: "🖼 Reply with 1 - 4 to get full image",
        attachment: fs.createReadStream(gridPath)
      },
      event.threadID,
      () => {
        files.forEach(f => fs.unlinkSync(f));
        fs.unlinkSync(gridPath);
      }
    );

    cache.set(event.senderID, { urls });

    api.unsendMessage(wait.messageID);

  } catch (e) {
    console.error(e);
    api.sendMessage("❌ Meta AI Failed", event.threadID);
  }
}

// ===== GRID MAKER =====
async function makeGrid(images, output) {
  const imgs = await Promise.all(images.map(loadImage));

  const w = imgs[0].width;
  const h = imgs[0].height;
  const pad = 10;

  const canvas = createCanvas(w*2 + pad*3, h*2 + pad*3);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const pos = [
    [pad, pad],
    [pad*2 + w, pad],
    [pad, pad*2 + h],
    [pad*2 + w, pad*2 + h]
  ];

  imgs.forEach((img,i)=>{
    ctx.drawImage(img, pos[i][0], pos[i][1], w, h);

    ctx.fillStyle="rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.arc(pos[i][0]+35, pos[i][1]+35, 25, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#fff";
    ctx.font="bold 26px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(i+1, pos[i][0]+35, pos[i][1]+35);
  });

  fs.writeFileSync(output, canvas.toBuffer());
}
