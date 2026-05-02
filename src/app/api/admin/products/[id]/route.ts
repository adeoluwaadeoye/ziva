import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    // Prevent overwriting immutable fields
    const { id: _id, _id: _mongoId, ...updates } = body as Record<string, unknown>;
    void _id; void _mongoId;
    const db = await getDb();
    await db.collection("products").updateOne({ id }, { $set: updates });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin products patch]", err);
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
    await db.collection("products").deleteOne({ id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin products delete]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
