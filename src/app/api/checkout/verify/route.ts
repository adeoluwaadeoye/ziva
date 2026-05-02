import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();
    if (!reference) {
      return NextResponse.json({ error: "Payment reference required" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("[verify-payment] PAYSTACK_SECRET_KEY not set");
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 });
    }

    const resp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await resp.json();

    if (!resp.ok || data.data?.status !== "success") {
      console.error("[verify-payment] Failed:", data.message ?? data);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, amount: data.data.amount });
  } catch (err) {
    console.error("[verify-payment]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
