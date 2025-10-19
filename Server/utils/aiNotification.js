// utils/aiNotification.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLessonNotification({ initiatorRole, initiatorName, recipientName, actionType, targetRole, lessonName, date, time }) {
    console.log('Recipietn Name: ', recipientName);
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
            actionType === 'reminder' ? '📝 reminder' :
                actionType === 'deleted' ? '🗑️ deleted' :
                    actionType === 'updated' ? '✏️ updated' : actionType;

    // Well-formatted fallback message
    const fallbackMessage = {
        subject: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}: ${lessonName}`,
        message: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           📚 SKILLGRID NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName}!

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
Write a short, friendly email notification message that will be sent to the ${targetRole} named ${recipientName}.
Include clear context (who did what and when) and a polite closing line.
Keep it professional but warm.
If ${actionType} is 'reminder', both teacher and student will receive the same message.
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

export async function sendInformationEmail({ recipientName, recipientEmail, actionType }) {
    const actionText = actionType === 'signed up' ? '📝 signed up' : '❌ deleted';

    const fallbackMessage = {
        subject: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}: ${recipientName}`,
        message: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           📚 SKILLGRID NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello ${recipientName}!

You have ${actionText} for the SkillGrid platform.

${actionType === 'signed up'
                ? "We're excited to have you on board! If you have any questions, please feel free to contact us."
                : "Your account has been successfully deleted. We're sorry to see you go."}

Best regards,
The SkillGrid Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated message. Please do not reply directly.
        `.trim(),
    };

    const prompt = `
    You are an assistant for an educational scheduling platform called SkillGrid.
    A new user named ${recipientName} just ${actionText} for the platform.
    Write a short, friendly email notification message that will be sent to the ${recipientName} ${recipientEmail}.
    Include clear context (who did and what) and a polite closing line.
    Keep it professional but warm.
    Return only the subject and message in JSON format: { "subject": "", "message": "" }.
    `;

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
        return aiMessage;

    } catch (error) {
        if (error.status === 429) {
            console.error("⚠️ OpenAI rate limit exceeded, using fallback message");
        } else if (error.status === 401) {
            console.error("⚠️ OpenAI API key invalid, using fallback message");
        } else if (error.code === 'insufficient_quota') {
            console.error("⚠️ OpenAI quota exceeded, using fallback message");
        } else {
            console.error("❌ Congratulations Email Error:", error.message);
        }
        return fallbackMessage;
    }
}