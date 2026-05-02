import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/* Stateless admin auth — the cookie stores sha256(ADMIN_SECRET + "ziva-admin").
   Changing ADMIN_SECRET automatically invalidates all existing admin sessions. */
function makeToken(secret: string) {
  return crypto.createHash("sha256").update(secret + "ziva-admin").digest("hex");
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure:   process.env.NODE_ENV === "production",
  path:     "/",
  maxAge:   60 * 60 * 24,
};

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const secret = process.env.ADMIN_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Admin access not configured" }, { status: 503 });
    }

    if (!password || password !== secret) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin-token", makeToken(secret), COOKIE_OPTS);
    return res;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin-token", "", { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
