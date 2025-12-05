const axios = require("axios");

module.exports = {
  config: {
    name: "numlookup",
    version: "2.1",
    author: "SiAM",
    countDown: 10,
    role: 0,
    category: "utility",
    shortDescription: {
      en: "Search phone number info + FB profile"
    },
    longDescription: {
      en: "Get name, carrier, location & Facebook profile picture from phone number"
    },
    guide: {
      en: "{pn} <number> — Example: {pn}numlookup 8801838456789"
    }
  },

  onStart: async function ({ message, args, event }) {
    console.log("Numlookup command triggered! Args:", args); // ডিবাগ লগ

    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);

    if (args.length === 0) {
      console.log("No args provided");
      return message.reply(
        `Please provide a phone number with country code!\n\nExample:\n${p}numlookup 8801838456789`
      );
    }

    let phone = args.join("").trim();
    if (phone.startsWith("+")) phone = phone.slice(1);
    phone = phone.replace(/\D/g, "");

    if (!/^\d+$/.test(phone) || phone.length < 10) {
      console.log("Invalid number");
      return message.reply("Invalid number! Use country code without + sign.\nExample: 8801838456789");
    }

    console.log("API calling with phone:", phone);
    message.reaction("🔍", event.messageID);

    try {
      const res = await axios.get(
        `https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=${phone}`,
        { timeout: 10000 } // 10s timeout
      );

      console.log("API Response:", res.data); // ডিবাগ লগ

      const data = res.data;

      if (!data || res.status !== 200) {
        return message.reply("No information found for this number!");
      }

      let msg = "Number Lookup Result 📱\n\n";
      msg += `Number: +${phone}\n`;
      msg += `Name: ${data.name || "Not found"}\n`;
      msg += `Facebook ID: ${data.fb_id ? `https://facebook.com/${data.fb_id}` : "Not found"}\n`;

      const attachment = data.img ? await global.utils.getStreamFromURL(data.img) : null;

      await message.reply({
        body: msg,
        attachment
      });

      message.reaction("✅", event.messageID);

    } catch (error) {
      console.error("Numlookup Error:", error.message);
      message.reaction("❌", event.messageID);
      message.reply(
        `API Error! Try again later or check number.\nExample: ${p}numlookup 8801838456789`
      );
    }
  }
};
