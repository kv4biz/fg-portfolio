// lib/email.ts
import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST!;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER!;
const smtpPass = process.env.SMTP_PASSWORD!;
const fromEmail = smtpUser;

/**
 * Create a transporter using SMTP credentials
 */
export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for 587
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

/**
 * Send email utility
 * @param to recipient email
 * @param subject email subject
 * @param html HTML body content
 */
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Elvora Studio" <${fromEmail}>`,
      replyTo: to,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Email send failed");
  }
}
