// utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // or smtp server
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendEmail({ to, subject, text }) {
    try {
        await transporter.sendMail({
            from: `"SkillGrid Notifications" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log("📩 Email sent to:", to);
    } catch (error) {
        console.error("❌ Email send failed:", error);
    }
}
