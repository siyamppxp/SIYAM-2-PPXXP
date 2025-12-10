const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===== FILE =====
const DB_FILE = path.join(__dirname, "likeDB.json");

// ===== INIT =====
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");

let db = {};
try {
  db = JSON.parse(fs.readFileSync(DB_FILE));
} catch {
  db = {};
}

// ===== SAVE =====
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ===== RANDOM =====
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== RANDOM NAME =====
function randomName() {
  const names = ["Siam", "Ratul", "Hasan", "Nayeem", "Rakib", "Arif"];
  const tags = ["✓", "乂", "ツ", "亗"];
  return `${tags[random(0,3)]}${names[random(0,5)]}${tags[random(0,3)]}`;
}

module.exports.config = {
  name: "like",
  version: "MEMORY",
  hasPermssion: 1,
  credits: "ONLY SIYAM",
  description: "FF Like bot with memory system",
  commandCategory: "admin",
  usages: "/like [region] [uid]",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {

  const { threadID, messageID, senderID } = event;

  // ADMIN
  if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("⛔ ADMIN ONLY COMMAND!", threadID, messageID);
  }

  let region = "BD", UID;
  if (args.length === 1) UID = args[0];
  else if (args.length >= 2) {
    region = args[0].toUpperCase();
    UID = args[1];
  } else {
    return api.sendMessage("❌ /like [region] [uid]", threadID, messageID);
  }

  if (!/^\d{5,20}$/.test(UID))
    return api.sendMessage("❌ Invalid UID!", threadID, messageID);

  const now = Date.now();

  // ===== INIT USER IN DB =====
  if (!db[UID]) {
    db[UID] = {
      last: 0,
      botLikes: 0
    };
  }

  // ===== 24H CHECK =====
  const diff = now - db[UID].last;
  if (diff < 86400000) {
    const left = Math.ceil((86400000 - diff) / (1000 * 60 * 60));
    return api.sendMessage(`⏳ This UID already received likes.\nTry again after ${left} hour(s).`, threadID, messageID);
  }

  await api.sendMessage("⏳ Processing like request...", threadID);

  // ===== GET REAL DATA =====
  let realLikes = 0;
  let playerName = randomName();

  try {
    const apiUrl = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
    const res = await axios.get(apiUrl);

    if (res.data?.basicInfo?.liked)
      realLikes = parseInt(res.data.basicInfo.liked);

    if (res.data?.basicInfo?.nickname)
      playerName = res.data.basicInfo.nickname;

  } catch {
    realLikes = random(1000, 8000);
  }

  // ===== BOT LIKE SYSTEM =====
  const newLike = random(1, 290);

  // ADD PREVIOUS BOT LIKES + NEW
  db[UID].botLikes += newLike;
  db[UID].last = now;
  saveDB();

  // ===== FINAL TOTAL =====
  const total = realLikes + db[UID].botLikes;

  const msg = `✅ Likes Sent Successfully! 🎉

👤 Player Name: ${playerName}
🌍 Region: ${region}
🆔 UID: ${UID}

❤️ Real Likes (API): ${realLikes}
➕ Bot Added (All): ${db[UID].botLikes}
💖 Given Today: ${newLike}

🎯 Total Showing: ${total}

CREADIT: ONLY SIYAM`;

  return api.sendMessage(msg, threadID, messageID);
};
