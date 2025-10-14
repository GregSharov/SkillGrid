// utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendEmail({ to, subject, text }) {
    try {
        const info = await transporter.sendMail({
            from: `"SkillGrid Notifications" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });
        console.log("📩 Email sent:", info.response);
    } catch (error) {
        console.error("❌ Email send failed:", error);
    }
}
