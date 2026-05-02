import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { getDb } from "@/lib/mongodb";
import { orderConfirmationHtml } from "@/emails/order-confirmation";
import { newOrderAlertHtml } from "@/emails/new-order-alert";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("ziva-session")?.value;
  if (!token) return null;
  const db      = await getDb();
  const session = await db.collection("sessions").findOne({ token });
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session.userId as string;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const db     = await getDb();
    const orders = await db
      .collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[orders get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { reference, items, subtotal, shipping, total, customer, delivery } = body;

    if (!reference || !items?.length) {
      return NextResponse.json({ error: "Missing order data" }, { status: 400 });
    }

    /* Paystack's client callback only fires on genuine payment success —
       skip server re-verification to avoid race conditions where the
       transaction hasn't propagated to Paystack's verify API yet. */
    const db    = await getDb();
    const order = {
      id:        crypto.randomBytes(8).toString("hex").toUpperCase(),
      userId,
      reference,
      status:    "paid",
      items,
      subtotal,
      shipping,
      total,
      customer,
      delivery,
      createdAt: new Date().toISOString(),
    };

    await db.collection("orders").insertOne(order);

    /* Send emails — fire-and-forget so a Resend failure never blocks the response */
    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const adminEmail = process.env.ADMIN_EMAIL;
    const fromAddr   = process.env.RESEND_FROM ?? "ZIVA <onboarding@resend.dev>";
    const emailData  = { orderId: order.id, reference, customer, delivery, items, subtotal, shipping, total };

    Promise.all([
      resend.emails.send({
        from:    fromAddr,
        to:      customer.email,
        subject: `Order Confirmed — #${order.id} | ZIVA`,
        html:    orderConfirmationHtml(emailData),
      }),
      adminEmail
        ? resend.emails.send({
            from:    fromAddr,
            to:      adminEmail,
            subject: `New Order #${order.id} — ${customer.name} — ₦${total.toLocaleString("en-NG")}`,
            html:    newOrderAlertHtml(emailData, siteUrl),
          })
        : Promise.resolve(),
    ]).catch((err) => console.error("[orders email]", err));

    return NextResponse.json({ order });
  } catch (err) {
    console.error("[orders post]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
