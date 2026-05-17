import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

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

    const body = await req.json();
    const db   = await getDb();

    // Password change flow
    if (body.newPassword) {
      const { currentPassword, newPassword } = body;
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      const user = await db.collection("users").findOne({ id: userId });
      if (!user?.passwordHash) {
        return NextResponse.json({ error: "Password change not available for Google accounts" }, { status: 400 });
      }
      if (hashPassword(currentPassword, user.salt) !== user.passwordHash) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      }

      const newSalt = crypto.randomBytes(16).toString("hex");
      const newHash = hashPassword(newPassword, newSalt);
      await db.collection("users").updateOne(
        { id: userId },
        { $set: { passwordHash: newHash, salt: newSalt } },
      );
      return NextResponse.json({ ok: true });
    }

    // Name update
    const { name } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

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
