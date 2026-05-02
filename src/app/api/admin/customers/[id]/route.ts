import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const db = await getDb();
    const user = await db.collection("users").findOne(
      { id },
      { projection: { passwordHash: 0, salt: 0 } }
    );
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const orders = await db
      .collection("orders")
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const { _id, ...cleanUser } = user;
    void _id;
    const cleanOrders = orders.map(({ _id: __, ...o }) => { void __; return o; });

    return NextResponse.json({ customer: cleanUser, orders: cleanOrders });
  } catch (err) {
    console.error("[admin customer get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const { name, email } = await req.json();
    const update: Record<string, string> = {};
    if (name?.trim()) update.name = name.trim();
    if (email?.trim()) update.email = email.trim().toLowerCase();
    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    const db = await getDb();
    await db.collection("users").updateOne({ id }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin customer patch]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const db = await getDb();
    await Promise.all([
      db.collection("users").deleteOne({ id }),
      db.collection("sessions").deleteMany({ userId: id }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin customer delete]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
