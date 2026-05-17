import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code  = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      return NextResponse.redirect(`${BASE}/auth?error=google_cancelled`);
    }

    // Decode the state payload { nonce, mobile }
    let nonce: string;
    let mobile = false;
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
      nonce  = decoded.nonce;
      mobile = decoded.mobile === true;
    } catch {
      // Legacy plain-hex state (backward compat)
      nonce = state;
    }

    const savedNonce = req.cookies.get("google-oauth-nonce")?.value
                    ?? req.cookies.get("google-oauth-state")?.value;
    if (!savedNonce || savedNonce !== nonce) {
      return NextResponse.redirect(`${BASE}/auth?error=invalid_state`);
    }

    const clientId     = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri  = `${BASE}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return NextResponse.redirect(`${BASE}/auth?error=token_exchange_failed`);
    }

    const userRes    = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(`${BASE}/auth?error=no_email`);
    }

    const db   = await getDb();
    const norm = googleUser.email.toLowerCase().trim();

    const existingUser = await db.collection("users").findOne({ email: norm });
    let userId: string;
    let userName: string;

    if (!existingUser) {
      userId   = crypto.randomBytes(16).toString("hex");
      userName = googleUser.name ?? googleUser.email.split("@")[0];
      await db.collection("users").insertOne({
        id:        userId,
        name:      userName,
        email:     norm,
        googleId:  googleUser.id,
        picture:   googleUser.picture ?? null,
        provider:  "google",
        createdAt: new Date().toISOString(),
      });
    } else {
      userId   = existingUser.id as string;
      userName = existingUser.name as string;
      if (!existingUser.googleId) {
        await db.collection("users").updateOne(
          { email: norm },
          { $set: { googleId: googleUser.id, picture: googleUser.picture ?? null } },
        );
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    await db.collection("sessions").insertOne({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (mobile) {
      // For mobile: redirect to the app deep link with the token in the URL.
      // openAuthSessionAsync intercepts this and returns it to the app.
      const deepLink = `ziva://auth-callback?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&name=${encodeURIComponent(userName)}&email=${encodeURIComponent(norm)}`;
      const res = NextResponse.redirect(deepLink);
      res.cookies.delete("google-oauth-nonce");
      res.cookies.delete("google-oauth-state");
      return res;
    }

    // Web: set httpOnly session cookie and redirect to sync page with token for Zustand
    const res = NextResponse.redirect(`${BASE}/auth/sync?t=${token}`);
    res.cookies.set("ziva-session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:   process.env.NODE_ENV === "production",
      maxAge:   30 * 24 * 60 * 60,
      path:     "/",
    });
    res.cookies.delete("google-oauth-nonce");
    res.cookies.delete("google-oauth-state");
    return res;
  } catch (err) {
    console.error("[google callback]", err);
    return NextResponse.redirect(`${BASE}/auth?error=server_error`);
  }
}
