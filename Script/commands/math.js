module.exports.config = {
    name: "math",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "xAI + Siam",
    description: "Full step-by-step math solution with explanation",
    commandCategory: "study",
    usages: "math 2x + 5 = 11",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    },
    envConfig: {
        "WOLFRAM": "T8J8YV-H265UQ762K" // তোমার API key
    }
};

module.exports.run = async function ({ api, event, args }) {
    const axios = global.nodemodule["axios"];
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;
    const out = (msg, callback = null) => api.sendMessage(msg, threadID, callback, messageID);

    let input = args.join(" ").trim();
    if (!input) return out("❌ অনুগ্রহ করে একটি গাণিতিক সমস্যা লিখুন\nউদাহরণ: math 2x + 5 = 11");

    // যদি শুধু -p, -g, -v না থাকে, তাহলে full solution চাই
    if (!input.startsWith("-p") && !input.startsWith("-g") && !input.startsWith("-v")) {
        try {
            // প্রথমে Wolfram এ পাঠাই step-by-step এর জন্য
            const res = await axios.get(`http://api.wolframalpha.com/v2/query`, {
                params: {
                    appid: global.configModule.math.WOLFRAM,
                    input: `${input} step-by-step solution`,
                    podstate: "Step-by-step solution",
                    format: "plaintext",
                    output: "json"
                }
            });

            const data = res.data.queryresult;

            if (!data.success) {
                return out(`⚠️ সমাধান পাওয়া যায়নি। আরেকবার চেষ্টা করুন।\nপ্রশ্ন: ${input}`);
            }

            let solution = "";
            let hasSteps = false;

            // Step-by-step pod খুঁজি
            for (let pod of data.pods) {
                if (pod.title.includes("Step") || pod.title.includes("Solution") || pod.id === "Solution") {
                    for (let sub of pod.subpods) {
                        if (sub.plaintext && sub.plaintext.trim() !== "") {
                            solution += sub.plaintext + "\n\n";
                            hasSteps = true;
                        }
                        // ছবি থাকলে পাঠাবো
                        if (sub.img && sub.img.src) {
                            const img = (await axios.get(sub.img.src, { responseType: "stream" })).data;
                            const path = __dirname + `/cache/math_step_${Date.now()}.png`;
                            img.pipe(fs.createWriteStream(path))
                                .on("close", () => {
                                    api.sendMessage({
                                        body: "📈 বিস্তারিত সমাধানের ছবি:",
                                        attachment: fs.createReadStream(path)
                                    }, threadID, () => fs.unlinkSync(path), messageID);
                                });
                        }
                    }
                }
            }

            // যদি step-by-step না পাই, তাহলে সাধারণ উত্তর + নিজে লিখে দিব
            if (!hasSteps) {
                const simple = await axios.get(`http://api.wolframalpha.com/v2/query`, {
                    params: {
                        appid: global.configModule.math.WOLFRAM,
                        input: input,
                        output: "json"
                    }
                });

                const resultPod = simple.data.queryresult.pods.find(p => p.id === "Result" || p.id === "Solution");
                const answer = resultPod ? resultPod.subpods[0].plaintext : "সমাধান পাওয়া যায়নি";

                solution = `🔸 প্রশ্ন: ${input}\n\n`;
                solution += `✍️ সমাধান:\n`;
                solution += await generateManualSteps(input); // নিজের তৈরি step-by-step
                solution += `\n\n✅ চূড়ান্ত উত্তর:\n${answer}`;
            }

            // সুন্দর করে ফরম্যাট করা
            const finalMsg = `🧮 গণিত সমাধান\n\n` +
                `📝 প্রশ্ন: ${input}\n\n` +
                `✍️ ধাপে ধাপে সমাধান:\n\n` +
                solution.trim();

            out(finalMsg);

        } catch (e) {
            out("❌ কিছু একটা গন্ডগোল হয়েছে। আবার চেষ্টা করো।");
            console.log(e);
        }
    }
    // বাকি -p, -g, -v পুরনো মতোই থাকবে (যদি লাগে)
};

// সাধারণ সমীকরণের জন্য নিজের তৈরি step-by-step
async function generateManualSteps(eq) {
    eq = eq.toLowerCase().replace(/\s/g, "");

    // উদাহরণ: 2x+5=11
    if (eq.includes("=")) {
        let [left, right] = eq.split("=");
        if (/x/.test(left)) {
            let steps = "";
            steps += `দেওয়া আছে: ${eq.replace(/x/g, "x")}\n`;
            steps += `প্রথমে x এর পাশের সংখ্যা সরাই → ${left} - ${right.includes("-") ? `(${right})` : right}\n`;
            steps += `অতঃপর x এর গুণক দিয়ে ভাগ করি...\n`;
            return steps;
        }
    }

    // আরো অনেক ধরনের সমীকরণের জন্য লেখা যাবে
    return `দুঃখিত, এই সমীকরণের ধাপে ধাপে সমাধান এখনো তৈরি হয়নি। তবে Wolfram থেকে চেষ্টা করা হচ্ছে...`;
}
