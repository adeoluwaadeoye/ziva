import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getFeatured } from "@/lib/products";

export default function FeaturedProducts() {
  const products = getFeatured().slice(0, 8);

  return (
    <section className="container-ziva py-14 sm:py-20 lg:py-28">
      {/* Header */}
      <div className="flex items-end justify-between mb-7 sm:mb-10">
        <div>
          <span className="reveal gold-line mb-3 sm:mb-4" />
          <h2 className="reveal delay-100 font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-ziva-black">
            Featured Pieces
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase font-semibold text-ziva-black/70 hover:text-ziva-black transition-colors border border-ziva-black/25 hover:border-ziva-black px-4 py-2"
        >
          View all
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-7 sm:gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase font-semibold text-ziva-black/70 hover:text-ziva-black transition-colors border border-ziva-black/25 hover:border-ziva-black px-5 py-2.5"
        >
          View all products
        </Link>
      </div>
    </section>
  );
}
