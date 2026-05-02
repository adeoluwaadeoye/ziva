import { NextRequest, NextResponse } from "next/server";
import { dbProducts } from "@/lib/db-products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase().trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  try {
    const all     = await dbProducts();
    const results = all
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
      .slice(0, 6)
      .map((p) => ({
        id:       p.id,
        name:     p.name,
        image:    p.image,
        category: p.category,
        price:    p.price,
      }));

    return NextResponse.json(results);
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json([]);
  }
}
