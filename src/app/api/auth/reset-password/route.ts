import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "No admin user found" }, { status: 404 });
    }

    if (user.email !== email) {
      return NextResponse.json({ error: "Email does not match admin account" }, { status: 403 });
    }

    // Generate a new random password
    const newPassword = generateRandomPassword(10);

    // Hash and update it in the DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Email plain new password to admin
    const subject = "🔐 Your New Admin Password - ElVora CMS";
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
        <h2>ElVora Admin Password Reset</h2>
        <p>Hello ${user.firstName || "Admin"},</p>
        <p>Your new password has been successfully generated:</p>
        <p style="font-size:18px;font-weight:bold;color:#111;">${newPassword}</p>
        <p>Please log in using this password and update it once you're signed in.</p>
        <br/>
        <p>— ElVora CMS Security System</p>
      </div>
    `;

    await sendEmail(user.email, subject, html);

    return NextResponse.json({
      success: true,
      message: "A new password has been sent to your email.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}

/**
 * Generate a random password with letters, numbers, and symbols
 */
function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
