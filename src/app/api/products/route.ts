import { NextResponse } from "next/server";
import { dbProducts } from "@/lib/db-products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await dbProducts();
    return NextResponse.json(all);
  } catch (err) {
    console.error("[products]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
