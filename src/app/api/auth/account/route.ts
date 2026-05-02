import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("ziva-session")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const db      = await getDb();
    const session = await db.collection("sessions").findOne({ token });
    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    await db.collection("users").deleteOne({ id: session.userId });
    await db.collection("sessions").deleteMany({ userId: session.userId });

    const res = NextResponse.json({ ok: true });
    res.cookies.delete("ziva-session");
    return res;
  } catch (err) {
    console.error("[delete account]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
