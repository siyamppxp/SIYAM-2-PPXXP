const axios = require("axios");

module.exports = {
  config: {
    name: "numlookup",
    version: "1.1",
    author: "SiAM",
    countDown: 10,
    role: 0,
    category: "Utility",
    ShortDescription: "Looks up phone number information.",
    LongDescription: "Provides carrier and potential Facebook ID information for a given phone number.",
    guide: {
      en: "{pn} <phone_number_with_country_code>"
    }
  },

  onStart: async function ({ api, args, event, message }) {
    try {
      // helper functions from global.utils (if available)
      const { getPrefix, getStreamFromURL } = global.utils || {};

      const prefix = typeof getPrefix === "function" ? getPrefix(event.threadID) : "!";

      // 1) Validate args
      if (!args || args.length === 0) {
        return message.reply(
          `❌ Number টা দাও (country code সহ)।\n\nExample:\n${prefix}numlookup 8801838XXXXXX`
        );
      }

      // join all parts and strip non-digits
      const raw = args.join("").trim();
      const cleaned = raw.replace(/\D/g, "");

      if (!cleaned || cleaned.length < 6) {
        return message.reply(
          `❌ Invalid number. নম্বরটি ঠিক করে দাও (country code সহ)।\n\nExample:\n${prefix}numlookup 8801838XXXXXX`
        );
      }

      // 2) Prepare API key (use env var if set)
      const DEFAULT_API_KEY = "gaysex";
      const apiKey = process.env.NUMLOOKUP_KEY || DEFAULT_API_KEY;

      // 3) Build API URL (with small timeout)
      const apiURL = `https://connect-foxapi.onrender.com/tools/numlookup?apikey=${encodeURIComponent(apiKey)}&number=${encodeURIComponent(cleaned)}`;

      // 4) show reaction / busy status if available
      try { message.reaction && message.reaction("⏳", event.messageID); } catch (e) {}

      // 5) Call API (with timeout)
      const res = await axios.get(apiURL, { timeout: 10000 });

      if (!res || !res.data) {
        try { message.reaction && message.reaction("❓", event.messageID); } catch (e) {}
        return message.reply("❌ API থেকে সঠিক response পেলাম না। পরে আবার চেষ্টা করো।");
      }

      // 6) Parse response (flexible)
      const data = res.data;
      // expected fields: name, img, fb_id, carrier, country (some apis may include)
      const name = data.name || data.fullname || data.displayName || null;
      const fbId = data.fb_id || data.facebook_id || data.facebook || null;
      const img = data.img || data.image || data.avatar || null;
      const carrier = data.carrier || data.operator || data.network || null;
      const country = data.country || data.country_name || null;
      const extra = data; // keep for debugging if needed

      // 7) Build reply text
      let body = `Number Lookup Results 📱\n\n`;
      body += `❏ Number: ${cleaned}\n`;
      if (name) body += `❏ Name: ${name}\n`;
      if (fbId) body += `❏ Facebook ID: ${fbId}\n`;
      if (carrier) body += `❏ Carrier: ${carrier}\n`;
      if (country) body += `❏ Country: ${country}\n`;

      // If nothing useful found, say so
      if (!name && !fbId && !carrier && !country) {
        body += `\n⚠️ কোনো তথ্য পাওয়া যায়নি অথবা API তে নেই।`;
      }

      // 8) Attach image if available
      let attachment = null;
      if (img && typeof getStreamFromURL === "function") {
        try {
          attachment = await getStreamFromURL(img);
        } catch (err) {
          // ignore image error
          console.warn("Numlookup: couldn't fetch image:", err.message || err);
        }
      }

      // 9) Send reply
      await message.reply({
        body,
        ...(attachment && { attachment })
      });

      try { message.reaction && message.reaction("✅", event.messageID); } catch (e) {}

    } catch (err) {
      console.error("Numlookup Error:", err);

      try { message.reaction && message.reaction("❌", event.messageID); } catch (e) {}

      // If it's an axios error with response
      if (err.response && err.response.data) {
        // try to surface useful message
        const code = err.response.status;
        const data = err.response.data;
        const msg = data.message || data.error || JSON.stringify(data).slice(0,200);
        return message.reply(`❌ API Error (${code}): ${msg}`);
      }

      // timeout
      if (err.code === "ECONNABORTED") {
        return message.reply("❌ API request timeout. আবার চেষ্টা করো।");
      }

      // generic
      return message.reply("❌ কিছু ভুল হয়েছে। পরে আবার চেষ্টা করো।");
    }
  }
};
