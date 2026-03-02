import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { isAllowedEmail, createMagicLinkToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isAllowedEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Only @scrum-academy.com email addresses are allowed" },
        { status: 403 }
      );
    }

    const token = await createMagicLinkToken(normalizedEmail);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLink = `${appUrl}/api/auth/verify?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "AACM <onboarding@resend.dev>", // TODO: change to noreply@scrum-academy.com after domain verification
      to: normalizedEmail,
      subject: "Sign in to AACM",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #222; margin-bottom: 24px;">Sign in to AACM</h2>
          <p style="color: #666; line-height: 1.6;">Click the button below to sign in to the Agile Academy Content Machine.</p>
          <a href="${magicLink}" style="display: inline-block; background: #3FC06B; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0;">Sign in</a>
          <p style="color: #999; font-size: 14px; margin-top: 24px;">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send magic link:", error);
    return NextResponse.json(
      { error: "Failed to send login email. Please try again." },
      { status: 500 }
    );
  }
}
