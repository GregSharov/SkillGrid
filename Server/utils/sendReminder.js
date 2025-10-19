import { sendEmail } from "./sendEmail.js";
import { generateLessonNotification } from "./aiNotification.js";
import { Schedule } from "../models/scheduleSchema.js";

export async function sendReminder() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
        const scheduledLessons = await Schedule.find({});

        if (!scheduledLessons || scheduledLessons.length === 0) {
            console.log('No scheduled lessons found');
            return;
        }

        scheduledLessons.forEach(async (lesson) => {
            lesson.slots.forEach(async (slot) => {
                const slotDate = new Date(slot.date + ' ' + slot.time);
                
                if (slotDate === oneHourFromNow || slotDate === twentyFourHoursFromNow) {
                    // Send email reminder both to teacher and student
                    const aiMsg = await generateLessonNotification({
                        initiatorRole: "student",
                        initiatorName: lesson.student.firstName + ' ' + lesson.student.lastName,
                        recipientName: lesson.teacher.firstName + ' ' + lesson.teacher.lastName,
                        actionType: "reminder",
                        targetRole: "teacher",
                        lessonName: slot.lesson.name,
                        date: slot.date,
                        time: slot.time,
                    });

                    await sendEmail({
                        to: [lesson.teacher.email, lesson.student.email],
                        subject: aiMsg.subject,
                        text: aiMsg.message,
                    })
                }
            })
        });


    } catch (error) {
        console.error("Error getting scheduled lessons", error);
    }
}