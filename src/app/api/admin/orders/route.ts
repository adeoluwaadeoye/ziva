import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";

const VALID_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

function isAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET ?? "";
  const expected = crypto.createHash("sha256").update(secret + "ziva-admin").digest("hex");
  return req.cookies.get("admin-token")?.value === expected;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db     = await getDb();
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    /* Aggregate lightweight stats alongside the orders list */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total:        orders.length,
      todayCount:   orders.filter((o) => new Date(o.createdAt) >= today).length,
      todayRevenue: orders
        .filter((o) => new Date(o.createdAt) >= today)
        .reduce((s, o) => s + (o.total ?? 0), 0),
      allRevenue:   orders.reduce((s, o) => s + (o.total ?? 0), 0),
      customCount:  orders.filter((o) =>
        (o.items ?? []).some((i: { isCustomTailored?: boolean }) => i.isCustomTailored)
      ).length,
      byStatus: VALID_STATUSES.reduce((acc, st) => {
        acc[st] = orders.filter((o) => o.status === st).length;
        return acc;
      }, {} as Record<OrderStatus, number>),
    };

    /* Strip MongoDB _id before sending */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clean = orders.map(({ _id, ...rest }) => rest);
    return NextResponse.json({ orders: clean, stats });
  } catch (err) {
    console.error("[admin orders get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const db     = await getDb();
    const result = await db
      .collection("orders")
      .updateOne({ id }, { $set: { status, updatedAt: new Date().toISOString() } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin orders patch]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
