import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("ziva-session")?.value;
  if (!token) return null;
  const db = await getDb();
  const session = await db.collection("sessions").findOne({ token });
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return session.userId as string;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ ids: [] });
    const db = await getDb();
    const wishlist = await db.collection("wishlists").findOne({ userId });
    return NextResponse.json({ ids: wishlist?.ids ?? [] });
  } catch (err) {
    console.error("[wishlist get]", err);
    return NextResponse.json({ ids: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { ids } = await req.json();
    const db = await getDb();
    await db.collection("wishlists").updateOne(
      { userId },
      { $set: { ids, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[wishlist put]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
