const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const dataPath = path.join(__dirname, "themeDB.json");

const THEMES = [
  { id: "196241301102133", name: "Ocean Blue" },
  { id: "206470323178566", name: "Sunset Pink" },
  { id: "174636906462322", name: "Fire Red" },
  { id: "234473941", name: "Messenger Dark" },
  { id: "182550717762552", name: "Neon Purple" }
];

// Auto add 1000 dummy ids
for (let i = 1; i <= 1000; i++) {
  THEMES.push({
    id: `${900000000 + i}`,
    name: `Custom Theme #${i}`,
    image: `https://picsum.photos/seed/theme${i}/400/300`
  });
}

// Create DB
if (!fs.existsSync(dataPath)) {
  fs.writeJsonSync(dataPath, {
    auto: {},
    history: {},
    votes: {},
    packs: []
  }, { spaces: 2 });
}

function getDB() {
  return fs.readJsonSync(dataPath);
}

function saveDB(data) {
  fs.writeJsonSync(dataPath, data, { spaces: 2 });
}

// AUTO ENGINE
function startAuto(api) {
  setInterval(async () => {
    let db = getDB();
    for (let tid in db.auto) {
      let t = THEMES[Math.floor(Math.random() * THEMES.length)];
      try {
        await api.changeThreadColor(t.id, tid);
        db.history[tid] = db.history[tid] || [];
        db.history[tid].push({ name: t.name, time: Date.now() });
        saveDB(db);
      } catch (e) {
        console.log("Theme Error:", e.message);
      }
    }
  }, 60 * 60 * 1000); // hourly
}

module.exports = {
  config: {
    name: "changetheme",
    aliases: ["theme", "aitheme"],
    version: "ULTIMATE",
    author: "SIYAM",
    role: 0,
    shortDescription: "Advanced theme system with AI, auto, vote, history",
    guide: `
.changetheme
.changetheme set <number>
.changetheme auto on/off
.changetheme history
.changetheme vote <number>
.changetheme votes
.changetheme pack add <id> <name>
`
  },

  onLoad() {
    console.log("✅ SIYAM ULTIMATE CHANGETHEME LOADED");
  },

  onStart: async function ({ api, event, args, message }) {

    if (!global.__themeAuto) {
      global.__themeAuto = true;
      startAuto(api);
    }

    let db = getDB();
    let tid = event.threadID;
    let cmd = args[0];

    // LIST
    if (!cmd) {
      let list = "🎨 THEME LIST\n\n";
      THEMES.slice(0, 20).forEach((t, i) => list += `${i + 1}. ${t.name}\n`);
      return message.reply(list + "\nUse: .changetheme set <no>");
    }

    // SET
    if (cmd === "set") {
      let n = parseInt(args[1]);
      if (!n || !THEMES[n - 1]) return message.reply("❌ Invalid number!");
      let t = THEMES[n - 1];
      await api.changeThreadColor(t.id, tid);

      db.history[tid] = db.history[tid] || [];
      db.history[tid].push({ name: t.name, time: Date.now() });

      saveDB(db);
      return message.reply(`✅ Theme applied: ${t.name}`);
    }

    // AUTO
    if (cmd === "auto") {
      if (args[1] === "on") {
        db.auto[tid] = true;
        saveDB(db);
        return message.reply("✅ Auto rotation ON!");
      }
      if (args[1] === "off") {
        delete db.auto[tid];
        saveDB(db);
        return message.reply("❌ Auto rotation OFF!");
      }
    }

    // HISTORY
    if (cmd === "history") {
      let h = db.history[tid] || [];
      if (!h.length) return message.reply("No history yet.");

      let text = "🕘 THEME HISTORY\n";
      h.slice(-10).reverse().forEach((x, i) => {
        text += `${i + 1}. ${x.name} - ${new Date(x.time).toLocaleString()}\n`;
      });
      return message.reply(text);
    }

    // VOTE
    if (cmd === "vote") {
      let n = args[1];
      if (!THEMES[n - 1]) return message.reply("Invalid theme.");
      db.votes[n] = (db.votes[n] || 0) + 1;
      saveDB(db);
      return message.reply(`✅ Voted for ${THEMES[n - 1].name}`);
    }

    // SHOW VOTES
    if (cmd === "votes") {
      let text = "🗳️ THEME VOTES\n";
      Object.keys(db.votes).forEach(k => {
        if (THEMES[k - 1])
          text += `${THEMES[k - 1].name}: ${db.votes[k]} votes\n`;
      });
      return message.reply(text || "No votes.");
    }

    // THEME PACK ADD
    if (cmd === "pack" && args[1] === "add") {
      let id = args[2];
      let name = args.slice(3).join(" ");
      if (!id || !name) return message.reply("Format: pack add <id> <name>");
      THEMES.push({ id, name });
      db.packs.push({ id, name });
      saveDB(db);
      return message.reply("✅ Pack added!");
    }

    return message.reply("❓ Unknown command.");
  }
};
