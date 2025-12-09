/**
 * diamond.js
 * FUN / DEMO ONLY — NOT REAL TOPUP
 */

module.exports.config = {
  name: "diamond",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Free Fire Diamond ",
  commandCategory: "utility",
  usages: "/diamond",
  cooldowns: 3
};

const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const axios = require("axios");

module.exports.run = async function({ api, event }) {
  const { threadID, messageID, senderID } = event;

  const intro =
`💎 FREE FIRE DIAMOND

👉 Send Free Fire UID
or type "cancel" to stop`;

  return api.sendMessage(intro, threadID, (err, info) => {
    global.client.handleReply.push({
      type: "DIAMOND_GET_UID",
      name: this.config.name,
      author: senderID,
      messageID: info.messageID
    });
  }, messageID);
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const text = (body || "").trim();

  // Cancel
  if (text.toLowerCase() === "cancel") {
    return api.sendMessage("✅ Cancelled.", threadID, messageID);
  }

  // ===== STEP 1: GET UID =====
  if (handleReply.type === "DIAMOND_GET_UID") {
    const uid = text;

    if (!/^\d{5,20}$/.test(uid)) {
      return api.sendMessage("❌ Invalid UID. Please send correct UID or 'cancel'.", threadID, messageID);
    }

    // ✅ FINDING PLAYER ANIMATION
    const loading = await api.sendMessage("🔍 Finding player.", threadID);

    const animate = ["📡 Connecting to server...", "✅ Player data found!"];
    for (let i = 0; i < animate.length; i++) {
      await delay(700);
      await api.editMessage(animate[i], loading.messageID);
    }

    // Fetch player name from API
    let playerName = "Unknown";
    try {
      const res = await axios.get(`https://danger-info-alpha.vercel.app/accinfo?uid=${uid}&key=DANGERxINFO`);
      const data = res.data;
      if (data && data.basicInfo && data.basicInfo.nickname) {
        playerName = data.basicInfo.nickname;
      }
    } catch (e) {
      console.log("API error:", e.message);
    }

    const askAmount =
`🎮 PLAYER FOUND

👤 Name: ${playerName}
🆔 UID: ${uid}

💎 Enter diamond amount (e.g. 100, 1000)
or type "cancel"`;

    return api.sendMessage(askAmount, threadID, (err, info) => {
      global.client.handleReply.push({
        type: "DIAMOND_GET_AMOUNT",
        name: this.config.name,
        author: senderID,
        uid,
        playerName,
        messageID: info.messageID
      });
    }, messageID);
  }

  // ===== STEP 2: GET AMOUNT =====
  if (handleReply.type === "DIAMOND_GET_AMOUNT") {
    const amount = parseInt(text.replace(/\D/g, ""), 10);
    const uid = handleReply.uid;
    const playerName = handleReply.playerName || "Unknown";

    if (!amount || amount <= 0) {
      return api.sendMessage("❌ Invalid amount. Send a number or 'cancel'.", threadID, messageID);
    }

    // Fake process
    await api.sendMessage("⏳ Connecting to garena top up server...", threadID);
    await delay(800);
    await api.sendMessage("🔁 Processing...", threadID);
    await delay(800);
    await api.sendMessage("✅ Completed", threadID);

    const now = moment().tz("Asia/Dhaka").format("YYYY-MM-DD HH:mm:ss");

    // ✅ Garena-style Transaction ID
    const trxId =
      "GRN" +
      Math.random().toString(36).substr(2, 4).toUpperCase() +
      "-" +
      Math.random().toString(36).substr(2, 4).toUpperCase() +
      "-" +
      Date.now().toString().slice(-4);

    const receipt =
`🎫 DIAMOND RECEIPT

👤 Player : ${playerName}
🆔 UID     : ${uid}
💎 Amount  : ${amount}
🕒 Time    : ${now}
🧾 Trx ID  : ${trxId}
✅ Status  : SUCCESS

CREADIT: ONLY SIYAM.`;

    // Save log
    try {
      const cacheDir = path.resolve(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const logFile = path.join(cacheDir, "diamond_sim_log.json");

      let logs = [];
      if (await fs.pathExists(logFile)) {
        logs = await fs.readJson(logFile).catch(() => []);
      }
      logs.push({ uid, playerName, amount, time: now, trxId, simulated: true });
      await fs.writeJson(logFile, logs, { spaces: 2 });
    } catch (e) {
      console.log("Log error:", e.message);
    }

    return api.sendMessage(receipt, threadID, messageID);
  }
};

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
