import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { customerName, customerEmail, text } = await req.json();
  if (!customerName?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "Name and message required" }, { status: 400 });
  }
  const chat = {
    id: randomUUID(),
    customerName: customerName.trim(),
    customerEmail: customerEmail?.trim() ?? "",
    status: "open",
    messages: [{ from: "customer", text: text.trim(), timestamp: new Date() }],
    unreadAdmin: 1,
    unreadCustomer: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const db = await getDb();
  await db.collection("admin_chats").insertOne({ ...chat });
  return NextResponse.json({ chatId: chat.id, customerName: chat.customerName });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chatId   = searchParams.get("chatId");
  const markRead = searchParams.get("markRead") === "1";
  if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });
  const db = await getDb();
  const chat = await db.collection("admin_chats").findOne({ id: chatId }, { projection: { _id: 0 } });
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Only reset the counter when the customer has the chat window open (markRead=1).
  // Background polls must NOT reset it — otherwise the count never accumulates past 1
  // and the notification badge stops updating after the first admin message.
  if (markRead && (chat.unreadCustomer as number) > 0) {
    await db.collection("admin_chats").updateOne({ id: chatId }, { $set: { unreadCustomer: 0 } });
  }
  return NextResponse.json({ chat });
}
