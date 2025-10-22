// /utils/cronReminder.js
import cron from "node-cron";
import { sendReminder } from "./sendReminder.js";

export function startReminderCron() {
    // Run every half of an hour between 06:00–19:00 (Sun–Fri) IL time
    cron.schedule("*/15 6-19 * * 0-5", async () => {
        const utcNow = new Date().toLocaleString("en-IL", { timeZone: "UTC" });
        const ilNow = new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" });
        console.log(`🕒 Running SkillGrid reminder check (IL time: ${ilNow}, UTC: ${utcNow})`);

        await sendReminder();
    }, {
        timezone: "Asia/Jerusalem",
    });

    console.log("✅ Reminder cron job scheduled (Sun–Fri 06:00–19:00 IL time — one hour before lessons start)");
}
