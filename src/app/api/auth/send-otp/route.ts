import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const db   = await getDb();
    const norm = email.toLowerCase().trim();

    const existing = await db.collection("users").findOne({ email: norm });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const code      = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.collection("otps").updateOne(
      { email: norm },
      { $set: { code, expiresAt, createdAt: new Date().toISOString() } },
      { upsert: true },
    );

    /* In development, print the OTP so you can test without a verified Resend domain */
    if (process.env.NODE_ENV === "development") {
      console.log(`\n[ZIVA OTP] ✉ ${norm} → code: ${code}\n`);
    }

    const { error: resendError } = await resend.emails.send({
      from:    process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>",
      to:      email,
      subject: "Your ZIVA verification code",
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
            <h1 style="color:#B5883A;font-size:32px;letter-spacing:6px;margin:0;">ZIVA</h1>
            <p style="color:#B5883A;font-size:9px;letter-spacing:4px;margin:4px 0 0;">/ NIGERIA</p>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="font-size:20px;margin-bottom:8px;font-weight:600;">Verify your email</h2>
            <p style="color:#555;line-height:1.7;margin-bottom:28px;">
              Enter the code below to complete your ZIVA account registration.
              This code expires in <strong>10 minutes</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <div style="display:inline-block;background:#f7f3eb;border:2px solid #B5883A;padding:20px 48px;border-radius:4px;">
                <span style="font-size:40px;font-weight:700;letter-spacing:14px;color:#1a1a1a;font-family:monospace;">${code}</span>
              </div>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;margin-top:24px;">
              If you didn&rsquo;t request this, you can safely ignore this email.
            </p>
            <p style="color:#aaa;font-size:11px;text-align:center;margin-top:8px;">
              ZIVA &middot; 15 Bode Thomas Street, Surulere, Lagos, Nigeria
            </p>
          </div>
        </div>
      `,
    });

    if (resendError) {
      console.error("[send-otp] Resend error:", resendError);
      /* Still return ok in dev so the OTP flow can be tested via console */
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ ok: true, warning: "Email delivery failed — check server console for OTP code." });
      }
      return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }
}
