import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const db    = await getDb();
    const norm  = email.toLowerCase().trim();
    const exists = await db.collection("newsletters").findOne({ email: norm });
    if (exists) {
      return NextResponse.json({ message: "You are already subscribed!" });
    }

    await db.collection("newsletters").insertOne({
      email:        norm,
      subscribedAt: new Date().toISOString(),
    });

    // Email send is best-effort — never fail the subscription because of it
    resend.emails.send({
      from:    process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>",
      to:      email,
      subject: "Welcome to ZIVA — You're on the list",
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#1a1a1a;padding:32px;text-align:center;">
            <h1 style="color:#D4AF37;font-size:36px;letter-spacing:6px;margin:0;">ZIVA</h1>
            <p style="color:#D4AF37;font-size:10px;letter-spacing:4px;margin:4px 0 0;">/ NIGERIA</p>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="font-size:22px;margin-bottom:12px;">Welcome to ZIVA</h2>
            <p style="color:#555;line-height:1.7;">
              You&rsquo;re now part of an exclusive community celebrating the finest Nigerian fashion.
              Expect early access to new collections, style edits, and exclusive offers &mdash; delivered straight to your inbox.
            </p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/products"
                 style="background:#D4AF37;color:#1a1a1a;padding:14px 32px;font-size:12px;letter-spacing:3px;text-decoration:none;font-weight:700;text-transform:uppercase;">
                Shop the Collection
              </a>
            </div>
            <p style="color:#888;font-size:12px;text-align:center;">
              ZIVA &middot; 15 Bode Thomas Street, Surulere, Lagos, Nigeria
            </p>
          </div>
        </div>
      `,
    }).catch((err) => console.error("[newsletter email]", err));

    return NextResponse.json({ message: "You're subscribed! Check your inbox for a welcome email." });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
