module.exports.config = {
  name: "siamtag",
  version: "1.0",
  hasPermission: 0,
  credits: "SIYAM",
  description: "Auto reply when someone types @siam islam siam",
  commandCategory: "no prefix",
  usages: "",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const text = event.body.toLowerCase();

  // ✅ Trigger text
  if (!text.includes("@siam islam siam")) return;

  // ✅ Reply list (add more anytime)
  const replies = [
  "বস এখন কাজে ব্যস্ত আছে 😎",
  "বস এখন নামাজে আছেন 🕌",
  "বস এই মুহূর্তে ঘুমাচ্ছে 😴",
  "বস mood off 😒",
  "বস এখন game খেলতেছে 🎮",
  "বস এখন online কিন্তু reply দিবে না 😏",
  "বস এখন চা খাচ্ছে ☕",
  "বস কাউকে reply দেয় না 😤",
  "বস এখন Busy, পরে এসো ⏳",
  "বস এখন নিজের সময় কাটাচ্ছে 😌",
  "বস এখন শুধু VIP মানুষদের reply দেয় 💎",
  "বস mobile silent রেখেছে 📵",
  "বস এখন বাইরে, পরে কথা হবে 🚶‍♂️",
  "বস এখন lecture দিচ্ছে 📚",
  "বস এখন only Allah এর সাথে কথা বলছে 🤲",
  "বস এখন mood swing এ আছে 🎭",
  "বস এখন recharge নাই 🔕",
  "বস এখন break এ আছে 🍔",
  "বস এখন status off রেখেছে 🚫",
  "বস এখন gym এ আছে 🏋️",
  "বস এখন driving করছে 🚗",
  "বস এখন batteries low 🔋",
  "বস এখন no service area তে 📡",
  "বস এখন coding করতেছে 💻",
  "বস এখন movie দেখতেছে 🎬",
  "বস এখন exam pressure এ আছে 😫",
  "বস এখন tea break এ ☕",
  "বস এখন shopping এ 🛒",
  "বস এখন relatives দের সাথে 🏡",
  "বস এখন boss mode অন 😎",
  "বস এখন mobile charge দিতেছে 🔌",
  "বস এখন boss level mood 💣",
  "বস এখন sleep mode অন 😴",
  "বস এখন disturb করিও না ⚠️",
  "বস এখন silent observer 👀",
  "বস এখন mood killer দের block করছে 🚫",
  "বস এখন happy mode এ 😄",
  "বস এখন sad কিন্তু strong 😔💪",
  "বস এখন master plan বানাচ্ছে 🧠",
  "বস এখন future design করছে 🔮",
  "বস এখন secret meeting এ 🤐",
  "বস এখন focus mode অন 🎯",
  "বস এখন offline in real life 😑",
  "বস এখন energy save mode এ ⚡",
  "বস এখন air plane mode এ ✈️",
  "বস এখন don’t disturb 😴",
  "বস এখন zoning out 👤",
  "বস এখন inner peace খুঁজছে ☮️",
  "বস এখন power charging 🔋",
  "বস এখন disappearing mode 🫥",
  "বস এখন boss balance ঠিক করছে ⚖️",
  "বস এখন robot mode এ 🤖",
  "বস এখন mad scientist mode 🔬",
  "বস এখন coffee addicted ☕",
  "বস এখন dream chasing 🏃",
  "বস এখন nostalgia mood 🥀",
  "বস এখন boss vibe only 😎🔥",
  "বস এখন unplugged life 🌿",
  "বস এখন recharge soon... 🔄",
  "বস এখন invisible mode 👻",
  "বস এখন life debugging করছে 🐞",
  "বস এখন upgrade waiting ⏫",
  "বস এখন mission impossible 😤",
  "বস এখন beast mode 🐺",
  "বস এখন introvert mode 🙊",
  "বস এখন extrovert mood 🎉",
  "বস এখন looking for motivation 💡",
  "বস এখন hardware problem 🧩",
  "বস এখন software update 🔃",
  "বস এখন reboot required ♻️",
  "বস এখন test mode 🧪",
  "বস এখন relax mode 🍃",
  "বস এখন risk taking 😈",
  "বস এখন blessing mode 🤲",
  "বস এখন pray then progress 🕌🚀",
  "বস এখন destiny believe করছে 🌙",
  "বস এখন dream builder 🏗️",
  "বস এখন life explorer 🧭",
  "বস এখন mission busy 🚀",
  "বস এখন comeback plan 📈",
  "বস এখন faith strong 💎",
  "বস এখন golden heart 💛",
  "বস এখন soulful silence 🤫",
  "বস এখন mind sharp 🔪",
  "বস এখন power loading 🌀",
  "বস এখন code & coffee 💻☕",
  "বস এখন fast & focused 🏎️",
  "বস এখন mini vacation 🏖️",
  "বস এখন night owl 🦉",
  "বস এখন sunrise lover 🌅",
  "বস এখন star gazing ✨",
  "বস এখন moon dreaming 🌙",
  "বস এখন Allah trust 🤲💚",
  "বস এখন sabr testing ⏳",
  "বস এখন dua loading 📿",
  "বস এখন sirat walking 🕋"
];


  // ✅ Random Reply
  const random = replies[Math.floor(Math.random() * replies.length)];

  api.sendMessage(random, event.threadID, event.messageID);
};

module.exports.run = () => {};
