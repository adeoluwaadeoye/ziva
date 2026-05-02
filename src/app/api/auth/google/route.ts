import { NextResponse } from "next/server";
import crypto from "crypto";

// Requires in .env.local:
//   GOOGLE_CLIENT_ID=...
//   GOOGLE_CLIENT_SECRET=...
// Authorized redirect URI in Google Cloud Console:
//   http://localhost:3000/api/auth/google/callback  (development)
//   https://yourdomain.com/api/auth/google/callback (production)

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=google_not_configured`,
    );
  }

  const state       = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "openid email profile",
    state,
    access_type:   "online",
    prompt:        "select_account",
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
  res.cookies.set("google-oauth-state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600,
    path:     "/",
  });
  return res;
}
