import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  try {
    // Support both cookie (web) and Authorization header (mobile)
    const token =
      req.cookies.get("ziva-session")?.value ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const db      = await getDb();
    const session = await db.collection("sessions").findOne({ token });
    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const userId = session.userId as string;
    await Promise.all([
      db.collection("users").deleteOne({ id: userId }),
      db.collection("sessions").deleteMany({ userId }),
      db.collection("carts").deleteOne({ userId }),
      db.collection("wishlists").deleteOne({ userId }),
      db.collection("measurements").deleteOne({ userId }),
      db.collection("addresses").deleteMany({ userId }),
    ]);

    const res = NextResponse.json({ ok: true });
    res.cookies.delete("ziva-session");
    return res;
  } catch (err) {
    console.error("[delete account]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
