import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
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
    const userId = await getSessionUserId(req);
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
