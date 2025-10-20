// /cronJobs/reminderCron.js
import cron from "node-cron";
import { sendReminder } from "./sendReminder.js";

export function startReminderCron() {
    // Run every hour between 7:00–20:00 (Sun–Fri)
    cron.schedule('0 6-19 * * 0-5', async () => {
        console.log('🕒 Running SkillGrid reminder check...');
        await sendReminder();
    });

    console.log("✅ Reminder cron job scheduled (Sun–Fri 07:00–20:00 hourly)");
}
