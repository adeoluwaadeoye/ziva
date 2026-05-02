import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  const chat = await db.collection("admin_chats").findOne({ id }, { projection: { _id: 0 } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.collection("admin_chats").updateOne({ id }, { $set: { unreadAdmin: 0 } });
  return NextResponse.json({ chat });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  const message = { from: "admin", text: text.trim(), timestamp: new Date() };
  const db = await getDb();
  await db.collection("admin_chats").updateOne(
    { id },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $push: { messages: message } as any,
      $inc: { unreadCustomer: 1 },
      $set: { updatedAt: new Date(), unreadAdmin: 0 },
    }
  );
  return NextResponse.json({ ok: true, message });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const db = await getDb();
  await db.collection("admin_chats").updateOne({ id }, { $set: body });
  return NextResponse.json({ ok: true });
}
