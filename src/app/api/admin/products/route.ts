import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin-auth";
import { dbProducts } from "@/lib/db-products";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const prods = await dbProducts();
    return NextResponse.json({ products: prods });
  } catch (err) {
    console.error("[admin products get]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, price, originalPrice, gender, category, description, sizes, colors, fabrics, images, isNew, isSale, isFeatured, inStock } = body;

    if (!name?.trim() || !price || !gender || !category || !images?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = `p-${Date.now().toString(36)}`;
    const product = {
      id,
      name:     name.trim(),
      price:    Number(price),
      image:    images[0],
      images,
      gender,
      category,
      description: description?.trim() ?? "",
      sizes:    sizes  ?? [],
      colors:   colors ?? [],
      isNew:      !!isNew,
      isSale:     !!isSale,
      isFeatured: !!isFeatured,
      inStock:    inStock !== false,
      rating:     0,
      reviewCount: 0,
      ...(originalPrice ? { originalPrice: Number(originalPrice) } : {}),
      ...(fabrics?.length ? { fabrics } : {}),
    };

    const db = await getDb();
    await db.collection("products").insertOne({ ...product });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("[admin products post]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
