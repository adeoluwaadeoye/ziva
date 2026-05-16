import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const db   = await getDb();
    const user = await db.collection("users").findOne({ id: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt, isAdmin: user.isAdmin ?? false },
    });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const db = await getDb();
    await db.collection("users").updateOne({ id: userId }, { $set: { name: name.trim() } });
    const user = await db.collection("users").findOne({ id: userId });

    return NextResponse.json({ user: { id: user!.id, name: user!.name, email: user!.email } });
  } catch (err) {
    console.error("[me patch]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token =
      req.cookies.get("ziva-session")?.value ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token) {
      const db = await getDb();
      await db.collection("sessions").deleteOne({ token });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.delete("ziva-session");
    return res;
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
