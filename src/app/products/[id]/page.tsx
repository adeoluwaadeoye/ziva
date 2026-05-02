import { notFound } from "next/navigation";
import { dbProduct, dbRelated } from "@/lib/db-products";
import ProductDetail from "./ProductDetail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await dbProduct(id);
  if (!product) return {};
  return {
    title: `${product.name} | ZIVA`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await dbProduct(id);
  if (!product) notFound();

  const related = await dbRelated(product.category, product.id);

  return <ProductDetail product={product} related={related} />;
}
