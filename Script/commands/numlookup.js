// commands/numlookup.js
const axios = require("axios");

module.exports.config = {
  name: "numlookup",
  version: "3.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Phone number lookup with name + profile picture",
  commandCategory: "utility",
  usages: ".numlookup 8801789963078",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const number = args.join("").replace("+", "").trim();

  if (!number) {
    return api.sendMessage("নাম্বার দে ভাই!\nউদাহরণ: .numlookup 8801789963078", event.threadID);
  }

  const cleanNumber = number.replace(/\D/g, "");
  if (cleanNumber.length < 10) {
    return api.sendMessage("ভুল নাম্বার! সঠিক কান্ট্রি কোডসহ দে।", event.threadID);
  }

  api.sendMessage("খুঁজতেছি...", event.threadID);

  try {
    const res = await axios.get(
      `https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=${cleanNumber}`
    );

    const d = res.data;

    // যদি API থেকে কোনো ডাটা না আসে
    if (!d || (!d.name && !d.img && !d.fb_id)) {
      return api.sendMessage("কোনো তথ্য পাওয়া যায়নি এই নাম্বারে।", event.threadID);
    }

    let msg = `Number lookup result for: ${cleanNumber}\n`;
    msg += `────────────────────\n\n`;
    msg += `More info:\n`;
    msg += `  name: ${d.name || "Not found"}\n`;
    msg += `  img: ${d.img ? "[Profile Picture Below]" : "Not found"}\n`;
    msg += `  fb_id: ${d.fb_id || "Not Found"}`;

    // ছবি থাকলে পাঠাবে
    const attachment = d.img ? await global.utils.getStreamFromURL(d.img) : null;

    api.sendMessage({
      body: msg,
      attachment: attachment || []
    }, event.threadID);

  } catch (e) {
    api.sendMessage("API ডাউন বা নাম্বারে কোনো তথ্য নেই। পরে ট্রাই করো।", event.threadID);
  }
};
