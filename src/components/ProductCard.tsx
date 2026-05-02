"use client";

import Link from "next/link";
import Image from "next/image";
import { PiHeart, PiHeartFill, PiEye, PiStar, PiStarFill } from "react-icons/pi";
import { useWishlistStore } from "@/lib/store";
import { Product } from "@/types";

function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

export default function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product.id));
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="group flex flex-col p-2 -m-2 rounded-sm transition-colors duration-300 hover:bg-white hover:shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Image container */}
      <div className="relative overflow-hidden bg-ziva-border aspect-3/4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          className={`object-cover transition-transform duration-700 ease-out ${product.inStock ? "group-hover:scale-108" : "grayscale opacity-60"}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {!product.inStock && (
          <div className="absolute inset-0 bg-white/25" />
        )}

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-linear-to-t from-ziva-black/25 via-ziva-black/5 to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-1.5">
          {!product.inStock && (
            <span className="bg-zinc-600 text-white text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-1.5 sm:px-2 py-0.5">
              Sold Out
            </span>
          )}
          {product.isNew && (
            <span className="bg-ziva-black text-ziva-cream text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-1.5 sm:px-2 py-0.5">
              New
            </span>
          )}
          {product.isSale && discount && (
            <span className="bg-ziva-black text-white text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-1.5 sm:px-2 py-0.5">
              -{discount}%
            </span>
          )}
        </div>

        {/* Action icons — always visible on mobile, hover-reveal on desktop */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2 sm:translate-x-10 sm:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => toggle(product.id)}
            aria-label="Wishlist"
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white shadow-sm transition-all duration-200 active:scale-90 ${wished
                ? "bg-ziva-black text-white scale-110"
                : "text-ziva-black hover:bg-ziva-black hover:text-white hover:scale-110"
              }`}
          >
            {wished
              ? <PiHeartFill size={13} />
              : <PiHeart size={13} />}
          </button>
          <Link
            href={`/products/${product.id}`}
            aria-label="View details"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-white text-ziva-black shadow-sm hover:bg-ziva-black hover:text-white hover:scale-110 active:scale-90 transition-all duration-200"
          >
            <PiEye size={13} />
          </Link>
        </div>

        {/* Quick Add — slides up on hover */}
        {product.inStock ? (
          <Link
            href={`/products/${product.id}`}
            className="absolute bottom-0 inset-x-0 bg-ziva-black text-white text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-medium py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hover:bg-zinc-800 hover:text-white active:bg-zinc-800 active:text-white"
          >
            Quick Add
          </Link>
        ) : (
          <div className="absolute bottom-0 inset-x-0 bg-zinc-500 text-white text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-medium py-2.5 sm:py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out cursor-default">
            Sold Out
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2.5 sm:pt-3 flex flex-col gap-0.5 sm:gap-1 transition-transform duration-500 ease-out group-hover:-translate-y-0.5">
        <Link
          href={`/products/${product.id}`}
          className="text-xs sm:text-sm font-medium text-ziva-black hover:text-ziva-black transition-colors leading-snug line-clamp-1"
        >
          {product.name}
        </Link>

        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) =>
                s <= Math.round(product.rating)
                  ? <PiStarFill key={s} size={9} className="text-ziva-black" />
                  : <PiStar key={s} size={9} className="text-ziva-border" />
              )}
            </div>
            <span className="text-[10px] text-ziva-muted">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
          <span className="text-xs sm:text-sm font-semibold text-ziva-black">
            {formatNaira(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-xs text-ziva-muted line-through">
              {formatNaira(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
