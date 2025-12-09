/**
 * like.js
 * FAKE FREE FIRE LIKE BOT (ADMIN ONLY)
 * CREATOR: ONLY SIYAM
 */

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ===== FILE PATH =====
const COOLDOWN_FILE = path.join(__dirname, "likeCooldown.json");

// ===== LOAD DATABASE =====
let cooldownData = {};
if (fs.existsSync(COOLDOWN_FILE)) {
  try {
    cooldownData = JSON.parse(fs.readFileSync(COOLDOWN_FILE));
  } catch {
    cooldownData = {};
  }
}

// ===== SAVE DATABASE =====
function saveDB() {
  fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(cooldownData, null, 2));
}

// ===== RANDOM FUNCTIONS =====
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===== RANDOM NAME FALLBACK =====
function randomName() {
  const names = ["Hossain", "Siam", "Ratul", "Arif", "Sakib", "Nayeem", "Hasib", "Rakib"];
  const signs = ["✓", "亗", "ツ", "×", "么", "乂", "卍"];
  return `${signs[random(0, signs.length-1)]}${names[random(0, names.length-1)]}${signs[random(0, signs.length-1)]}`;
}

module.exports.config = {
  name: "like",
  version: "FINAL",
  hasPermssion: 1, // ✅ ADMIN ONLY
  credits: "ONLY SIYAM",
  description: "Fake Free Fire Like System",
  commandCategory: "admin",
  usages: "/like [region] [uid]",
  cooldowns: 2
};

module.exports.run = async function({ api, event, args }) {

  const { threadID, messageID, senderID } = event;

  // ===== ADMIN CHECK =====
  if (!global.config.ADMINBOT || !global.config.ADMINBOT.includes(senderID)) {
    return api.sendMessage("⛔ ADMIN ONLY COMMAND!", threadID, messageID);
  }

  // ===== ARGUMENT HANDLING =====
  let region = "BD";
  let UID;

  if (args.length === 1) {
    UID = args[0];
  } else if (args.length >= 2) {
    region = args[0].toUpperCase();
    UID = args[1];
  } else {
    return api.sendMessage("❌ Usage: /like [region] [uid]\nExample: /like bd 903437692", threadID, messageID);
  }

  // ===== VALIDATE UID =====
  if (!/^\d{5,20}$/.test(UID)) {
    return api.sendMessage("❌ Invalid UID!", threadID, messageID);
  }

  // ===== 24 HOURS SYSTEM =====
  const now = Date.now();

  if (cooldownData[UID]) {
    const diff = now - cooldownData[UID];
    const hoursLeft = 24 - Math.floor(diff / (1000 * 60 * 60));

    if (diff < 86400000) {
      return api.sendMessage(`⏳ This UID already received likes.\nTry again after ${hoursLeft} hour(s).`, threadID, messageID);
    }
  }

  // ===== ANIMATION =====
  await api.sendMessage("🚀 Sending likes...\nProgress: 0%", threadID);
  await delay(800);
  await api.sendMessage("⚡ Progress: 25%", threadID);
  await delay(800);
  await api.sendMessage("⚡ Progress: 50%", threadID);
  await delay(800);
  await api.sendMessage("⚡ Progress: 75%", threadID);
  await delay(800);
  await api.sendMessage("✅ Progress: 100%", threadID);

  // ===== RANDOM LIKE CALC =====
  const likesGiven = random(1, 290);
  const likesBefore = random(500, 9000);
  const totalLikes = likesBefore + likesGiven;

  let playerName = randomName();

  // ===== FETCH FROM API =====
  try {
    const apiUrl = `https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`;
    const res = await axios.get(apiUrl);

    if (res.data && res.data.basicInfo && res.data.basicInfo.nickname) {
      playerName = res.data.basicInfo.nickname;
    }
  } catch {
    // fallback: random name used
  }

  // ===== SAVE 24H TIMER =====
  cooldownData[UID] = now;
  saveDB();

  // ===== FINAL MESSAGE =====
  const result = `✅ Likes Sent Successfully! 🎉

👤 Player Name: ${playerName}
🌍 Region: ${region}
🆔 UID: ${UID}

❤️ Likes Before: ${likesBefore}
💖 Likes Given: ${likesGiven}
🎯 Total Likes Now: ${totalLikes}

CREADIT: ONLY SIYAM`;

  return api.sendMessage(result, threadID, messageID);
};

// ===== DELAY =====
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
      }
