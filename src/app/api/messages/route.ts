// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface EmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message }: EmailRequest = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch admin email (the user email in your User table)
    const adminUser = await prisma.user.findFirst();
    if (!adminUser?.email) {
      return NextResponse.json({ error: "Admin email not configured" }, { status: 500 });
    }

    // Save message in DB
    const savedMessage = await prisma.message.create({
      data: {
        name,
        email,
        subject,
        message,
        user: { connect: { id: adminUser.id } },
      },
    });

    // Build email content with better design and structure
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject || "No subject"}</p>
      <p>${message}</p>
    `;

    // Send email to admin
    await sendEmail(adminUser.email, `New message from ${name}`, html);

    return NextResponse.json({
      success: true,
      message: "Message received and email sent successfully",
      data: savedMessage,
    });
  } catch (err) {
    console.error("Email API Error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
