// utils/aiNotification.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLessonNotification({ initiatorRole, initiatorName, actionType, targetRole, lessonName, date, time }) {
    // Format the date nicely for fallback
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create action message based on type
    const actionText = actionType === 'scheduled' ? '📅 scheduled' :
        actionType === 'cancelled' ? '❌ cancelled' :
            actionType === 'updated' ? '✏️ updated' :
                actionType === 'deleted' ? '🗑️ deleted' : actionType;

    // Well-formatted fallback message
    const fallbackMessage = {
        subject: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}: ${lessonName}`,
        message: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           📚 SKILLGRID NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello!

${initiatorName} (${initiatorRole}) has ${actionText} a lesson with you.

📖 LESSON DETAILS
   • Subject: ${lessonName}
   • Date: ${formattedDate}
   • Time: ${time}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please log in to your SkillGrid account to view more details 
and manage your schedule.

Best regards,
The SkillGrid Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply directly.
        `.trim(),
    };

    const prompt = `
You are an assistant for an educational scheduling platform called SkillGrid.
A ${initiatorRole} named ${initiatorName} just ${actionType} a lesson "${lessonName}" scheduled on ${formattedDate} at ${time}.
Write a short, friendly email notification message that will be sent to the ${targetRole}.
Include clear context (who did what and when) and a polite closing line.
Keep it professional but warm.
Return only the subject and message in JSON format: { "subject": "", "message": "" }.
`;

    // Try to generate the notification using OpenAI
    try {
        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.warn("⚠️ OpenAI API key not configured, using fallback message");
            return fallbackMessage;
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
        });

        const result = completion.choices[0].message.content;
        const aiMessage = JSON.parse(result);

        console.log("✅ AI notification generated successfully");
        return aiMessage;

    } catch (error) {
        // Handle specific error types
        if (error.status === 429) {
            console.error("⚠️ OpenAI rate limit exceeded, using fallback message");
        } else if (error.status === 401) {
            console.error("⚠️ OpenAI API key invalid, using fallback message");
        } else if (error.code === 'insufficient_quota') {
            console.error("⚠️ OpenAI quota exceeded, using fallback message");
        } else {
            console.error("❌ AI Notification Error:", error.message);
        }

        // Always return fallback on any error
        return fallbackMessage;
    }
}