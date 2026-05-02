import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("contacts").insertOne({
      id:        crypto.randomBytes(8).toString("hex"),
      name:      name.trim(),
      email:     email.trim(),
      subject:   subject || "General Enquiry",
      message:   message.trim(),
      createdAt: new Date().toISOString(),
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    await Promise.all([
      resend.emails.send({
        from:    process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>",
        to:      process.env.ADMIN_EMAIL ?? "hello@ziva.ng",
        subject: `New enquiry: ${subject || "General Enquiry"} — from ${name}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#1a1a1a;padding:24px;text-align:center;">
              <h1 style="color:#D4AF37;font-size:28px;letter-spacing:5px;margin:0;">ZIVA</h1>
            </div>
            <div style="padding:32px;">
              <h2 style="margin-bottom:4px;">New Contact Enquiry</h2>
              <p style="color:#888;font-size:13px;margin-bottom:24px;">${new Date().toLocaleString("en-NG")}</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#888;width:100px;">Name</td><td><strong>${name}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#888;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:8px 0;color:#888;">Subject</td><td>${subject || "General Enquiry"}</td></tr>
              </table>
              <div style="margin-top:20px;background:#f8f6f0;padding:20px;border-left:3px solid #D4AF37;">
                <p style="margin:0;line-height:1.7;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <div style="margin-top:24px;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || "Your Enquiry")}"
                   style="background:#D4AF37;color:#1a1a1a;padding:12px 24px;font-size:12px;letter-spacing:2px;text-decoration:none;font-weight:700;text-transform:uppercase;">
                  Reply to ${name}
                </a>
              </div>
            </div>
          </div>
        `,
      }),
      resend.emails.send({
        from:    process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>",
        to:      email,
        subject: "We received your message — ZIVA",
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
            <div style="background:#1a1a1a;padding:32px;text-align:center;">
              <h1 style="color:#D4AF37;font-size:36px;letter-spacing:6px;margin:0;">ZIVA</h1>
              <p style="color:#D4AF37;font-size:10px;letter-spacing:4px;margin:4px 0 0;">/ NIGERIA</p>
            </div>
            <div style="padding:40px 32px;">
              <h2 style="font-size:20px;margin-bottom:12px;">Thank you, ${name.split(" ")[0]}.</h2>
              <p style="color:#555;line-height:1.7;">
                We've received your message and our team will respond within <strong>24 hours</strong> on business days.
              </p>
              <div style="margin:24px 0;background:#f8f6f0;padding:20px;border-left:3px solid #D4AF37;">
                <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Your message</p>
                <p style="margin:0;line-height:1.7;font-size:14px;">${message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="color:#555;font-size:14px;line-height:1.7;">
                For urgent matters, reach us on WhatsApp at <strong>+234 801 234 5678</strong>.
              </p>
              <div style="margin:24px 0;text-align:center;">
                <a href="${siteUrl}/products"
                   style="background:#D4AF37;color:#1a1a1a;padding:12px 28px;font-size:11px;letter-spacing:3px;text-decoration:none;font-weight:700;text-transform:uppercase;">
                  Continue Shopping
                </a>
              </div>
              <p style="color:#888;font-size:12px;text-align:center;">
                ZIVA · 15 Bode Thomas Street, Surulere, Lagos, Nigeria
              </p>
            </div>
          </div>
        `,
      }),
    ]);

    return NextResponse.json({ message: "Message sent! We'll be in touch within 24 hours." });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
