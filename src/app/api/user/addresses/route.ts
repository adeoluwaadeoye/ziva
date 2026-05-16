import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import { getSessionUserId } from "@/lib/get-session";

export async function GET(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const db = await getDb();
    const doc = await db.collection("addresses").findOne({ userId });
    return NextResponse.json({ addresses: doc?.addresses ?? [] });
  } catch (err) {
    console.error("[addresses get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const address = await req.json();
    const db = await getDb();
    const doc = await db.collection("addresses").findOne({ userId });
    const addresses = doc?.addresses ?? [];
    const newAddress = { ...address, id: crypto.randomBytes(8).toString("hex") };
    if (newAddress.isDefault) {
      addresses.forEach((a: { isDefault: boolean }) => (a.isDefault = false));
    }
    addresses.push(newAddress);
    await db.collection("addresses").updateOne(
      { userId },
      { $set: { addresses, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
    return NextResponse.json({ address: newAddress });
  } catch (err) {
    console.error("[addresses post]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { id, ...updates } = await req.json();
    const db = await getDb();
    const doc = await db.collection("addresses").findOne({ userId });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const addresses = (doc.addresses ?? []).map((a: { id: string; isDefault: boolean }) => {
      if (updates.isDefault) a.isDefault = false;
      return a.id === id ? { ...a, ...updates } : a;
    });
    await db.collection("addresses").updateOne({ userId }, { $set: { addresses } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[addresses patch]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const db = await getDb();
    const doc = await db.collection("addresses").findOne({ userId });
    if (!doc) return NextResponse.json({ ok: true });
    const addresses = (doc.addresses ?? []).filter((a: { id: string }) => a.id !== id);
    await db.collection("addresses").updateOne({ userId }, { $set: { addresses } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[addresses delete]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
