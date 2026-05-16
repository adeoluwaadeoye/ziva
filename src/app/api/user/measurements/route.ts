import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const db = await getDb();
    const doc = await db.collection("measurements").findOne({ userId });
    return NextResponse.json({ measurements: doc?.measurements ?? null });
  } catch (err) {
    console.error("[measurements get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { measurements } = await req.json();
    const db = await getDb();
    await db.collection("measurements").updateOne(
      { userId },
      { $set: { measurements, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[measurements put]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
