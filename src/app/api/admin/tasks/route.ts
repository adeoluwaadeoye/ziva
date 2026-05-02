import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const tasks = await db.collection("admin_tasks")
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { text, priority } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  const task = {
    id: randomUUID(),
    text: text.trim(),
    done: false,
    priority: (priority ?? "medium") as "low" | "medium" | "high",
    createdAt: new Date(),
  };
  const db = await getDb();
  await db.collection("admin_tasks").insertOne({ ...task });
  return NextResponse.json({ task });
}
