import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth?error=google_not_configured`,
    );
  }

  const mobile = req.nextUrl.searchParams.get("mobile") === "true";
  const nonce  = crypto.randomBytes(16).toString("hex");

  // Encode { nonce, mobile } so the callback can detect mobile requests
  const statePayload = Buffer.from(JSON.stringify({ nonce, mobile })).toString("base64url");
  const redirectUri  = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         "openid email profile",
    state:         statePayload,
    access_type:   "online",
    prompt:        "select_account",
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
  // Store only the nonce in the CSRF cookie
  res.cookies.set("google-oauth-nonce", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600,
    path:     "/",
  });
  return res;
}
