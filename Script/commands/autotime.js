const schedule = require('node-schedule');
const moment = require('moment-timezone');
const chalk = require('chalk');

module.exports.config = {
    name: 'autosent',
    version: '10.0.1',
    hasPermssion: 0,
    credits: 'siyam Islam',
    description: 'Automatically sends messages at scheduled times (BD Time)',
    commandCategory: 'group messenger',
    usages: '[]',
    cooldowns: 3
};

const messages = [
  { time: '12:00 AM', message: '🕛 Time Check\nএখন সময় রাত 12টা।\nদিন শেষ, ঘুমানোর প্রস্তুতি নাও! 😴\n~ONLY SIYAM' },
  { time: '1:00 AM', message: '🕐 Time Check\nএখন সময় রাত 1টা।\nএখনো জেগে আছো নাকি? ঘুমাও! 🛌\n~ONLY SIYAM' },
  { time: '2:00 AM', message: '🕑 Time Check\nএখন সময় রাত 2টা।\nচোখ বন্ধ করো, কাল নতুন দিন! 🌙\n~ONLY SIYAM' },
  { time: '3:00 AM', message: '🕒 Time Check\nএখন সময় রাত 3টা।\nঘুম তোমাকে ডাকছে... 😴\n~ONLY SIYAM' },
  { time: '4:00 AM', message: '🕓 Time Check\nএখন সময় ভোর 4টা।\nকিছুক্ষণের মধ্যেই ফজরের আজান। 🕌\n~ONLY SIYAM' },
  { time: '5:00 AM', message: '🕔 Time Check\nএখন সময় ভোর 5টা।\nফজরের সময়, নামাজে দাঁড়াও। 🤲\n~ONLY SIYAM' },
  { time: '6:00 AM', message: '🕕 Time Check\nএখন সময় সকাল 6টা।\nনতুন দিন শুরু, উঠে পড়ো! 🌅\n~ONLY SIYAM' },
  { time: '7:00 AM', message: '🕖 Time Check\nএখন সময় সকাল 7টা।\nফ্রেশ হয়ে কাজে লেগে যাও। 🚿\n~ONLY SIYAM' },
  { time: '8:00 AM', message: '🕗 Time Check\nএখন সময় সকাল 8টা।\nসকালের নাস্তা করেছো তো? ☕🍞\n~ONLY SIYAM' },
  { time: '9:00 AM', message: '🕘 Time Check\nএখন সময় সকাল 9টা।\nদিন শুরু হয়েছে, কাজের ফোকাস অন! 💼\n~ONLY SIYAM' },
  { time: '10:00 AM', message: '🕙 Time Check\nএখন সময় সকাল 10টা।\nনিজের লক্ষ্য ভুলে যেও না! 🎯\n~ONLY SIYAM' },
  { time: '11:00 AM', message: '🕚 Time Check\nএখন সময় সকাল 11টা।\nআরও এক ধাপ এগিয়ে যাও! 🚀\n~ONLY SIYAM' },
  { time: '12:00 PM', message: '🕛 Time Check\nএখন সময় দুপুর ১২টা।\nসূর্য মাথার উপর, সময় লাঞ্চের প্রস্তুতির! 🍛\n~ONLY SIYAM' },
  { time: '1:00 PM', message: '🕐 Time Check\nএখন সময় দুপুর ১টা।\nজোহরের নামাজ ভুলে যেও না। 🕌\n~ONLY SIYAM' },
  { time: '2:00 PM', message: '🕑 Time Check\nএখন সময় দুপুর ২টা।\nলাঞ্চ শেষ? একটু বিশ্রাম নাও। 😌\n~ONLY SIYAM' },
  { time: '3:00 PM', message: '🕒 Time Check\nএখন সময় বিকেল ৩টা।\nক্লান্তি আসছে? কফি খাও! ☕\n~ONLY SIYAM' },
  { time: '4:00 PM', message: '🕓 Time Check\nএখন সময় বিকেল ৪টা।\nশেষ বিকেলের কাজগুলো গুছাও। 📝\n~ONLY SIYAM' },
  { time: '5:00 PM', message: '🕔 Time Check\nএখন সময় বিকেল ৫টা।\nদিন প্রায় শেষ, ধীরে ধীরে রিলাক্স। 😌\n~ONLY SIYAM' },
  { time: '6:00 PM', message: '🕕 Time Check\nএখন সময় সন্ধ্যা ৬টা।\nমাগরিবের প্রস্তুতি নাও। 🌇\n~ONLY SIYAM' },
  { time: '7:00 PM', message: '🕖 Time Check\nএখন সময় সন্ধ্যা ৭টা।\nপরিবারের সাথে সময় দাও। ❤️\n~ONLY SIYAM' },
  { time: '8:00 PM', message: '🕗 Time Check\nএখন সময় রাত ৮টা।\nডিনারের সময়! 🍽️\n~ONLY SIYAM' },
  { time: '9:00 PM', message: '🕘 Time Check\nএখন সময় রাত ৯টা।\nদিনের গল্প শেয়ার করো। 📖\n~ONLY SIYAM' },
  { time: '10:00 PM', message: '🕙 Time Check\nএখন সময় রাত ১০টা।\nঘুমের প্রস্তুতি নাও। 😴\n~ONLY SIYAM' },
  { time: '11:00 PM', message: '🕚 Time Check\nএখন সময় রাত ১১টা।\nস্মার্টফোন বন্ধ, চোখ বন্ধ! 📵\n~ONLY SIYAM' }
];

module.exports.onLoad = ({ api }) => {
    console.log(chalk.bold.hex("#00c300")("============ AUTOSENT COMMAND LOADED (BD TIME) ============"));

    messages.forEach(({ time, message }) => {
        const [hour, minute, period] = time.split(/[: ]/);
        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour !== '12') {
            hour24 += 12;
        } else if (period === 'AM' && hour === '12') {
            hour24 = 0;
        }

        const rule = new schedule.RecurrenceRule();
        rule.tz = 'Asia/Dhaka';
        rule.hour = hour24;
        rule.minute = parseInt(minute, 10);

        schedule.scheduleJob(rule, () => {
            if (!global.data?.allThreadID) return;
            global.data.allThreadID.forEach(threadID => {
                api.sendMessage(message, threadID, (error) => {
                    if (error) {
                        console.error(`Failed to send message to ${threadID}:`, error);
                    }
                });
            });
        });

        console.log(chalk.hex("#00FFFF")(`Scheduled (BDT): ${time} => ${message}`));
    });
};

module.exports.run = () => {
    // Main logic is in onLoad
};
