import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  const message = { from: "customer", text: text.trim(), timestamp: new Date() };
  const db = await getDb();
  const result = await db.collection("admin_chats").updateOne(
    { id },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { messages: message } as any,
      $inc: { unreadAdmin: 1 },
      $set: { updatedAt: new Date() },
    }
  );
  if (result.matchedCount === 0) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  return NextResponse.json({ ok: true, message });
}
