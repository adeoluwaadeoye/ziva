import { Product } from "@/types";
import { getDb } from "@/lib/mongodb";
import { products } from "@/lib/products";

let seeded = false;

async function seedOnce() {
  if (seeded) return;
  const db = await getDb();
  const count = await db.collection("products").countDocuments();
  if (count === 0) {
    await db.collection("products").insertMany(products.map((p) => ({ ...p })));
  }
  seeded = true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(doc: Record<string, any>): Product {
  const { _id, ...rest } = doc;
  void _id;
  return rest as Product;
}

export async function dbProducts(): Promise<Product[]> {
  await seedOnce();
  const db = await getDb();
  const docs = await db.collection("products").find({}).toArray();
  return docs.map(toProduct);
}

export async function dbProduct(id: string): Promise<Product | null> {
  await seedOnce();
  const db = await getDb();
  const doc = await db.collection("products").findOne({ id });
  return doc ? toProduct(doc) : null;
}

export async function dbRelated(category: string, excludeId: string): Promise<Product[]> {
  const db = await getDb();
  const docs = await db.collection("products")
    .find({ category, id: { $ne: excludeId } })
    .limit(4)
    .toArray();
  return docs.map(toProduct);
}
