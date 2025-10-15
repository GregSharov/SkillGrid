// utils/sendEmail.js
import dotenv from "dotenv";
dotenv.config();
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text }) {
    try {
        const msg = {
            from: `"SkillGrid Notifications" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        await sgMail.send(msg);
        console.log("📩 Email sent to:", to);
    } catch (error) {
        console.error("❌ Email send failed:", error.message);
        if (error.response) {
            console.error("❌ SendGrid error details:", error.response.body);
        }
    }
}
