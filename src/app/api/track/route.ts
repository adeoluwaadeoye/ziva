import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const { device } = await req.json();
  if (!["mobile", "tablet", "desktop"].includes(device)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const today = new Date().toISOString().slice(0, 10);
  const db = await getDb();
  await db.collection("visit_stats").updateOne(
    { date: today },
    { $inc: { [device]: 1 } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
