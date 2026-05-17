import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const db   = await getDb();
    const user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
    if (!user || hashPassword(password, user.salt) !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await db.collection("sessions").insertOne({
      token,
      userId:    user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const res = NextResponse.json({
      user:  { id: user.id, name: user.name, email: user.email },
      token,
    });
    res.cookies.set("ziva-session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });
    return res;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
