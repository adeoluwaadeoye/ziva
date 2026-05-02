"use client";

import Link from "next/link";
import Image from "next/image";
import { PiHeart, PiTrash, PiArrowRight, PiStarFill, PiStar } from "react-icons/pi";
import { useWishlistStore } from "@/lib/store";
import { products } from "@/lib/products";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
      <div className="container-ziva py-20 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
        <div className="w-20 h-20 border-2 border-dashed border-ziva-border rounded-full flex items-center justify-center">
          <PiHeart size={28} className="text-ziva-muted" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ziva-black">Your wishlist is empty</h1>
        <p className="text-sm text-ziva-muted max-w-xs">
          Save your favourite pieces and come back to them anytime.
        </p>
        <Link href="/products" className="btn-primary text-xs mt-2">
          Browse Collection <PiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-ziva py-10 lg:py-14">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="gold-line mb-3 block" />
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ziva-black">
            My Wishlist
          </h1>
          <p className="text-sm text-ziva-muted mt-1">{wishlistProducts.length} saved {wishlistProducts.length === 1 ? "piece" : "pieces"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {wishlistProducts.map((product) => {
          const discount = product.originalPrice
            ? Math.round((1 - product.price / product.originalPrice) * 100)
            : null;

          return (
            <div key={product.id} className="group flex flex-col">
              {/* Image */}
              <div className="relative overflow-hidden bg-ziva-border aspect-3/4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isNew && (
                    <span className="bg-ziva-black text-ziva-cream text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5">New</span>
                  )}
                  {product.isSale && discount && (
                    <span className="bg-ziva-black text-white text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5">-{discount}%</span>
                  )}
                </div>

                {/* Remove from wishlist */}
                <button
                  onClick={() => toggle(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 text-ziva-black shadow-sm hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  <PiTrash size={13} />
                </button>

                {/* Quick Add — slides up on hover */}
                <Link
                  href={`/products/${product.id}`}
                  className="absolute bottom-0 inset-x-0 bg-ziva-black text-white text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-medium py-2.5 sm:py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-zinc-800 hover:text-white"
                >
                  Quick Add
                </Link>

              </div>

              {/* Info */}
              <div className="pt-3 flex flex-col gap-1">
                <Link
                  href={`/products/${product.id}`}
                  className="text-xs sm:text-sm font-medium text-ziva-black hover:text-ziva-black transition-colors leading-snug line-clamp-1"
                >
                  {product.name}
                </Link>

                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) =>
                    s <= Math.round(product.rating)
                      ? <PiStarFill key={s} size={9} className="text-ziva-black" />
                      : <PiStar key={s} size={9} className="text-ziva-border" />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-ziva-black">{fmt(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-ziva-muted line-through">{fmt(product.originalPrice)}</span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
