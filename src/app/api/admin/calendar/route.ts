import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const month = new URL(req.url).searchParams.get("month"); // "2026-04"
  const db = await getDb();
  const query = month ? { date: { $regex: `^${month}` } } : {};
  const events = await db.collection("admin_calendar")
    .find(query, { projection: { _id: 0 } })
    .toArray();
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, title, color } = await req.json();
  if (!date || !title?.trim()) {
    return NextResponse.json({ error: "date and title required" }, { status: 400 });
  }
  const event = {
    id: randomUUID(),
    date,
    title: title.trim(),
    color: color ?? "black",
    createdAt: new Date(),
  };
  const db = await getDb();
  await db.collection("admin_calendar").insertOne({ ...event });
  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDb();
  await db.collection("admin_calendar").deleteOne({ id });
  return NextResponse.json({ ok: true });
}
