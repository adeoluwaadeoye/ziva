import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, amount, reference, callbackUrl } = await req.json();

    if (!email || !amount || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("[checkout/initialize] PAYSTACK_SECRET_KEY not set");
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
    }

    const resp = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // naira → kobo
        reference,
        callback_url: callbackUrl,
      }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.status) {
      console.error("[checkout/initialize] Paystack error:", data.message);
      return NextResponse.json(
        { error: data.message ?? "Payment initialization failed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error("[checkout/initialize]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
