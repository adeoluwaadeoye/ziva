"use client";

import { useState } from "react";
import Link from "next/link";
import { PiArrowRight, PiTrash } from "react-icons/pi";
import { products } from "@/lib/products";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

const STORAGE_KEY = "ziva-recently-viewed";
const MAX_STORED = 4;

export function trackProductView(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const deduped = [productId, ...ids.filter((id) => id !== productId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped.slice(0, MAX_STORED)));
  } catch { }
}

export default function RecentlyViewed() {
  const [viewed, setViewed] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const ids: string[] = JSON.parse(raw);
      return ids
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[];
    } catch {
      return [];
    }
  });

  function handleClear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { }
    setViewed([]);
  }

  if (viewed.length === 0) return null;

  return (
    <section className="container-ziva py-14 sm:py-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10">
        <div>
          <span className="gold-line mb-3 sm:mb-4" />
          <h2 className="font-heading text-3xl sm:text-4xl font-semibold text-ziva-black">
            Recently Viewed
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleClear}
            className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-muted hover:text-red-500 transition-colors tracking-wide"
          >
            <PiTrash size={13} /> Clear
          </button>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-ziva-muted hover:text-ziva-black transition-colors tracking-wide"
          >
            Browse all <PiArrowRight size={13} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {viewed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mobile clear button */}
      <div className="sm:hidden flex justify-center mt-6">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-ziva-muted hover:text-red-500 transition-colors border border-ziva-border px-4 py-2"
        >
          <PiTrash size={13} /> Clear Recently Viewed
        </button>
      </div>
    </section>
  );
}
