// ==================== math.js (100% Full & Final Working Code) ====================
module.exports.config = {
    name: "math",
    version: "30.0",
    hasPermssion: 0,
    credits: "Grok xAI + Siam King",
    description: "ধাপে ধাপে + HD ছবি সহ বাংলার সেরা Math Solver",
    commandCategory: "study",
    usages: "math 3x + 9 = 24",
    cooldowns: 3,
    dependencies: { "axios": "", "fs-extra": "" },
    envConfig: { "WOLFRAM": "T8J8YV-H265UQ762K" }
};

module.exports.run = async function({ api, event, args }) {
    const axios = global.nodemodule["axios"];
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;
    const send = (msg, callback) => api.sendMessage(msg, threadID, callback || null, messageID);

    const input = args.join(" ").trim();
    if (!input) return send("❌ প্রশ্ন লিখো ভাই!\nউদাহরণ: math 4x + 8 = 28");

    try {
        // এই URL টাই ম্যাজিক → 100% ধাপে ধাপে + HD ছবি আসবেই
        const url = `https://api.wolframalpha.com/v2/query?appid=${global.configModule.math.WOLFRAM}&input=${encodeURIComponent(input + " step by step solution")}&podstate=Result__Step-by-step+solution&format=plaintext,image&output=json&width=1000&fontsize=26&mag=3&plotwidth=800&imagerefresh=1`;

        const res = await axios.get(url);
        const data = res.data.queryresult;

        if (!data.success) throw new Error("No success from Wolfram");

        let reply = `গণিত সমাধান\n\nপ্রশ্ন: ${input}\n\nধাপে ধাপে সমাধান:\n\n`;
        let images = [];

        for (let pod of data.pods) {
            const title = pod.title.toLowerCase();
            if (title.includes("step") || title.includes("solution") || title.includes("result") || title.includes("plot")) {
                for (let sub of pod.subpods) {
                    if (sub.plaintext) {
                        reply += sub.plaintext.trim() + "\n\n";
                    }
                    if (sub.img && sub.img.src) {
                        images.push(sub.img.src);
                    }
                }
            }
        }

        // ছবি থাকলে পাঠাবে (HD + বড়)
        if (images.length > 0) {
            const attachments = [];
            for (let i = 0; i < Math.min(6, images.length); i++) {
                try {
                    const imgStream = (await axios.get(images[i], { responseType: "stream" })).data;
                    const path = __dirname + `/cache/math_hd_${Date.now()}_${i}.png`;
                    await new Promise(resolve => {
                        imgStream.pipe(fs.createWriteStream(path)).on("close", resolve);
                    });
                    attachments.push(fs.createReadStream(path));
                } catch (e) { }
            }

            if (attachments.length > 0) {
                return send({
                    body: reply || "সমাধান নিচের ছবিতে দেখো",
                    attachment: attachments
                }, () => {
                    attachments.forEach(att => fs.unlinkSync(att.path));
                });
            }
        }

        // যদি ছবি না আসে তাও টেক্সট পাঠাবে
        send(reply || "সমাধান পাওয়া গেছে!");

    } catch (error) {
        // Wolfram ফেল করলে নিজের ব্যাকআপ সলভার চলবে
        send(`গণিত সমাধান\n\nপ্রশ্ন: ${input}\n\nধাপে ধাপে সমাধান:\n\n` + await backupBanglaSolver(input));
    }
};

// ব্যাকআপ সলভার — Wolfram না চললেও কাজ করবে
async function backupBanglaSolver(q) {
    q = q.toLowerCase().replace(/\s/g, "").replace(/×/g, "*").replace(/÷/g, "/");

    // সাধারণ হিসাব
    if (/^[0-9+\-*/.()]+$/.test(q)) {
        try {
            const result = eval(q);
            return `${q.replace(/\*/g, "×").replace(/\//g, "÷")} = ${result}\n\nচূড়ান্ত উত্তর: ${result}`;
        } catch { return "হিসাবে ভুল 😭"; }
    }

    // x = কিছু
    if (q.startsWith("x=")) {
        const val = q.slice(2);
        return `দেওয়া আছে: x = ${val}\n\n∴ x = ${val}\n\nসমাধান সম্পূর্ণ ✅`;
    }

    // লিনিয়ার সমীকরণ (যেমন: 5x + 10 = 35)
    if (q.includes("x") && q.includes("=") && !q.includes("^") && !q.includes("²")) {
        try {
            const [left, right] = q.split("=");
            const coefMatch = left.match(/(-?\d*\.?\d*)x/);
            const constMatch = left.match(/([+-]?\d+\.?\d*)$/);
            const a = coefMatch ? parseFloat(coefMatch[1] || "1") : 1;
            const b = constMatch ? parseFloat(constMatch[1]) : 0;
            const c = parseFloat(right);

            const step1 = c - b;
            const result = step1 / a;

            return `দেওয়া: ${q}\n\n১. ${b >= 0 ? "+" : ""}${Math.abs(b)} সরিয়ে ফেলি → ${a}x = ${step1}\n২. ${a} দিয়ে ভাগ করি → x = ${result}\n\nচূড়ান্ত উত্তর: x = ${result}`;
        } catch (e) { }
    }

    // কোয়াড্রেটিক (x² + 5x + 6 = 0)
    if (q.includes("²") || q.includes("^2")) {
        try {
            const cleaned = q.replace(/²/g, "").replace(/\^2/g, "");
            const match = cleaned.match(/([0-9.]+)?x([+-][0-9.]+)?x([+-][0-9.]+)?=0/);
            if (match) {
                const a = parseFloat(match[1]) || 1;
                const b = parseFloat(match[2]) || 0;
                const c = parseFloat(match[3]) || 0;
                const d = b * b - 4 * a * c;
                if (d >= 0) {
                    const r1 = ((-b + Math.sqrt(d)) / (2 * a)).toFixed(2);
                    const r2 = ((-b - Math.sqrt(d)) / (2 * a)).toFixed(2);
                    return `সমীকরণ: ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c} = 0\nবিচারক D = ${d}\nমূল: x = ${r1} এবং x = ${r2}`;
                } else {
                    return `বিচারক D = ${d} (ঋণাত্মক)\nবাস্তব মূল নেই`;
                }
            }
        } catch (e) { }
    }

    return "এই প্রশ্নের সম্পূর্ণ ধাপে ধাপে সমাধান শীঘ্রই যোগ হবে!\nতবে Wolfram থেকে চেষ্টা করা হয়েছে ❤️";
                }
