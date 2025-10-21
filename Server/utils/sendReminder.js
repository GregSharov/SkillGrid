import { sendEmail } from "./sendEmail.js";
import { generateLessonNotification } from "./aiNotification.js";
import { Schedule } from "../models/scheduleSchema.js";
import Student from "../models/studentSchema.js";
import Teacher from "../models/teacherSchema.js";

export async function sendReminder() {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000).getTime();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000).getTime();

    try {
        const ilNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
        const nowMs = ilNow.getTime();
        const scheduledLessons = await Schedule.find({});

        if (!scheduledLessons || scheduledLessons.length === 0) {
            console.log('No scheduled lessons found');
            return;
        }

        for (const lesson of scheduledLessons) {
            const teacher = await Teacher.findById(lesson.teacher._id);
            const student = await Student.findById(lesson.student._id);

            for (const slot of lesson.slots) {
                if (!slot.reminderSent) {
                    // Construct IL datetime from slot.date + slot.time
                    const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);
                    const slotIL = new Date(slotDateTime.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
                    const diffMinutes = (slotIL - ilNow) / (1000 * 60);
                    console.log('Slot Date Time: ', slotDateTime);
                    console.log('Slot IL: ', slotIL);
                    console.log('Diff Minutes: ', diffMinutes);

                    // 🔔 Send reminder ~1 hour before
                    if (diffMinutes <= 30 && diffMinutes > 0) {
                        if (!teacher?.email || !student?.email) {
                            console.warn('Missing teacher/student email for', lesson._id);
                            return;
                        }

                        // Send email reminder both to teacher and student
                        const aiMsg = await generateLessonNotification({
                            initiatorRole: "system",
                            initiatorName: "SkillGrid Reminder",
                            recipientName: `${teacher.firstName} ${teacher.lastName} and ${student.firstName} ${student.lastName}`,
                            actionType: "reminder",
                            targetRole: "both",
                            lessonName: slot.lesson.name,
                            date: slot.date,
                            time: slot.time,
                        });

                        await sendEmail({
                            to: [teacher.email, student.email],
                            subject: aiMsg.subject,
                            text: aiMsg.message,
                        });

                        console.log(`📩 Reminder sent for ${slot.lesson.name} at ${slot.date} ${slot.time}`);
                    }

                    await Schedule.updateOne(
                        { _id: lesson._id, "slots._id": slot._id },
                        { $set: { "slots.$.reminderSent": true } }
                    );
                    console.log(`ReminderSent set to true for slot ${slot._id}`);
                } else {
                    console.log('No scheduled lessons for now');
                }
            }
        };


    } catch (error) {
        console.error("Error getting scheduled lessons", error);
    }
}