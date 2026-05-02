import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, code } = await req.json();
    if (!name || !email || !password || !code) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db   = await getDb();
    const norm = email.toLowerCase().trim();

    const otp = await db.collection("otps").findOne({ email: norm });
    if (!otp) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }
    if (new Date(otp.expiresAt) < new Date()) {
      await db.collection("otps").deleteOne({ email: norm });
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
    }
    if (otp.code !== code.trim()) {
      return NextResponse.json({ error: "Incorrect verification code." }, { status: 400 });
    }

    const existing = await db.collection("users").findOne({ email: norm });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const id           = crypto.randomBytes(16).toString("hex");
    const salt         = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);

    const user = {
      id,
      name:      name.trim(),
      email:     norm,
      passwordHash,
      salt,
      provider:  "email",
      createdAt: new Date().toISOString(),
    };
    await db.collection("users").insertOne(user);
    await db.collection("otps").deleteOne({ email: norm });

    const token = crypto.randomBytes(32).toString("hex");
    await db.collection("sessions").insertOne({
      token,
      userId:    id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    /* Best-effort welcome email */
    resend.emails.send({
      from:    process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>",
      to:      user.email,
      subject: `Welcome to ZIVA, ${user.name.split(" ")[0]}! 🎉`,
      html: `
        <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
            <h1 style="color:#B5883A;font-size:32px;letter-spacing:6px;margin:0;">ZIVA</h1>
            <p style="color:#B5883A;font-size:9px;letter-spacing:4px;margin:4px 0 0;">/ NIGERIA</p>
          </div>
          <div style="padding:40px 32px;">
            <h2 style="font-size:22px;margin-bottom:8px;font-weight:600;">Welcome, ${user.name.split(" ")[0]}!</h2>
            <p style="color:#555;line-height:1.8;margin-bottom:24px;">
              Your ZIVA account is ready. You're now part of a community that celebrates Nigerian craftsmanship at its finest.
            </p>
            <div style="background:#f7f3eb;border-left:3px solid #B5883A;padding:16px 20px;margin-bottom:28px;">
              <p style="margin:0;font-size:13px;color:#1a1a1a;font-weight:600;">What's next?</p>
              <ul style="margin:10px 0 0;padding-left:18px;color:#555;font-size:13px;line-height:2;">
                <li>Explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products?gender=women" style="color:#B5883A;">Women's Collection</a></li>
                <li>Discover our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products?gender=men" style="color:#B5883A;">Men's Artisan Wear</a></li>
                <li>Check out <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products?tag=new" style="color:#B5883A;">New Arrivals</a></li>
              </ul>
            </div>
            <div style="text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/products"
                style="display:inline-block;background:#B5883A;color:#fff;padding:14px 36px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">
                Start Shopping
              </a>
            </div>
            <p style="color:#aaa;font-size:11px;text-align:center;margin-top:32px;">
              ZIVA &middot; 15 Bode Thomas Street, Surulere, Lagos, Nigeria
            </p>
          </div>
        </div>
      `,
    }).catch((err) => console.error("[signup welcome email]", err));

    const res = NextResponse.json({
      user:  { id, name: user.name, email: user.email },
      token,
    });
    res.cookies.set("ziva-session", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });
    return res;
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
