module.exports.config = {
  name: "theme",
  version: "1.0",
  credits: "SIYAM",
  description: "Test theme command",
  commandCategory: "test",
  usages: "theme",
  cooldowns: 3
};

module.exports.run = function({ api, event, args }) {
  const msg = args.join(" ") || "No text given";
  api.sendMessage(`✅ THEME COMMAND WORKS!\n\nYour input: ${msg}`, event.threadID);
};
