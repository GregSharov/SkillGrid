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
        const scheduledLessons = await Schedule.find({});

        if (!scheduledLessons || scheduledLessons.length === 0) {
            console.log('No scheduled lessons found');
            return;
        }

        scheduledLessons.forEach(async (lesson) => {
            const teacher = await Teacher.findById(lesson.teacher._id);
            const student = await Student.findById(lesson.student._id);

            lesson.slots.forEach(async (slot) => {
                if (!slot.reminderSent) {
                    slot.reminderSent = true;
                    await slot.save();
                    console.log('ReminderSent set to true');
                    
                    const slotDate = new Date(slot.date + ' ' + slot.time);
                    const slotDateInMs = slotDate.getTime();

                    if (now === slotDateInMs || oneHourFromNow === slotDateInMs || twentyFourHoursFromNow === slotDateInMs) {
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
                }
            })
        });


    } catch (error) {
        console.error("Error getting scheduled lessons", error);
    }
}