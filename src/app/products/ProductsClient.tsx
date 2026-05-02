"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import dynamic from "next/dynamic";
const RecentlyViewed = dynamic(() => import("@/components/home/RecentlyViewed"), { ssr: false });
import {
  PiFunnel, PiX, PiCaretDown, PiMagnifyingGlass, PiSliders,
} from "react-icons/pi";

/* ─── Constants ─────────────────────────────────────────── */

const CATEGORIES = [
  { value: "ankara", label: "Ankara" },
  { value: "aso-oke", label: "Aso-Oke" },
  { value: "kaftan", label: "Kaftan" },
  { value: "gown", label: "Gowns" },
  { value: "cord", label: "Cord Sets" },
  { value: "adire", label: "Adire" },
  { value: "agbada", label: "Agbada" },
  { value: "senator", label: "Senator" },
  { value: "dashiki", label: "Dashiki" },
  { value: "native-shirt", label: "Native Shirts" },
  { value: "linen", label: "Linen" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Best Rated" },
];

const PRICE_RANGES = [
  { label: "Under ₦20,000", min: 0, max: 20000 },
  { label: "₦20,000 – ₦40,000", min: 20000, max: 40000 },
  { label: "₦40,000 – ₦70,000", min: 40000, max: 70000 },
  { label: "₦70,000 – ₦100,000", min: 70000, max: 100000 },
  { label: "Above ₦100,000", min: 100000, max: Infinity },
];

/* ─── Helpers ────────────────────────────────────────────── */

function useFilters() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const get = (key: string) => sp.get(key) ?? "";

  const set = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      });
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname]
  );

  return { get, set };
}

/* ─── FilterPanel ────────────────────────────────────────── */

interface FilterPanelProps {
  filters: ReturnType<typeof useFilters>;
  onClose?: () => void;
  isMobile?: boolean;
}

function FilterPanel({ filters, onClose, isMobile }: FilterPanelProps) {
  const { get, set } = filters;
  const gender = get("gender");
  const category = get("category");
  const priceKey = get("price");
  const tag = get("tag");

  return (
    <div className={isMobile ? "h-full flex flex-col" : ""}>
      {isMobile && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-ziva-border shrink-0">
          <h2 className="font-heading text-xl font-semibold text-ziva-black">Filters</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-ziva-black hover:text-ziva-black transition-colors"
          >
            <PiX size={20} />
          </button>
        </div>
      )}

      <div className={`space-y-6 ${isMobile ? "flex-1 overflow-y-auto px-5 py-5" : ""}`}>
        {/* Gender */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-ziva-muted mb-3">
            Gender
          </p>
          <div className="flex flex-col gap-2">
            {[
              { value: "", label: "All" },
              { value: "women", label: "Women" },
              { value: "men", label: "Men" },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => set({ gender: g.value || null })}
                className={`flex items-center gap-2.5 text-sm text-left transition-colors ${gender === g.value
                    ? "text-ziva-black font-semibold"
                    : "text-ziva-black hover:text-ziva-black"
                  }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${gender === g.value
                      ? "border-ziva-black bg-ziva-black"
                      : "border-ziva-border"
                    }`}
                >
                  {gender === g.value && (
                    <span className="block w-2 h-2 bg-white" />
                  )}
                </span>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-ziva-border" />

        {/* Category */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-ziva-muted mb-3">
            Category
          </p>
          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  set({ category: category === cat.value ? null : cat.value })
                }
                className={`flex items-center gap-2.5 text-sm text-left transition-colors ${category === cat.value
                    ? "text-ziva-black font-semibold"
                    : "text-ziva-black hover:text-ziva-black"
                  }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${category === cat.value
                      ? "border-ziva-black bg-ziva-black"
                      : "border-ziva-border"
                    }`}
                >
                  {category === cat.value && (
                    <span className="block w-2 h-2 bg-white" />
                  )}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-ziva-border" />

        {/* Price range */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-ziva-muted mb-3">
            Price Range
          </p>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map((range) => {
              const key = `${range.min}-${range.max}`;
              const isActive = priceKey === key;
              return (
                <button
                  key={key}
                  onClick={() => set({ price: isActive ? null : key })}
                  className={`flex items-center gap-2.5 text-sm text-left transition-colors ${isActive ? "text-ziva-black font-semibold" : "text-ziva-black hover:text-ziva-black"
                    }`}
                >
                  <span
                    className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${isActive ? "border-ziva-black bg-ziva-black" : "border-ziva-border"
                      }`}
                  >
                    {isActive && <span className="block w-2 h-2 bg-white" />}
                  </span>
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-ziva-border" />

        {/* Tags */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-ziva-muted mb-3">
            Collections
          </p>
          <div className="flex flex-col gap-2">
            {[
              { value: "new", label: "New Arrivals" },
              { value: "sale", label: "On Sale" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => set({ tag: tag === t.value ? null : t.value })}
                className={`flex items-center gap-2.5 text-sm text-left transition-colors ${tag === t.value ? "text-ziva-black font-semibold" : "text-ziva-black hover:text-ziva-black"
                  }`}
              >
                <span
                  className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${tag === t.value ? "border-ziva-black bg-ziva-black" : "border-ziva-border"
                    }`}
                >
                  {tag === t.value && <span className="block w-2 h-2 bg-white" />}
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="px-5 py-4 border-t border-ziva-border shrink-0">
          <button
            onClick={onClose}
            className="w-full btn-primary justify-center text-xs"
          >
            Show Results
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── ActiveFilterPills ───────────────────────────────────── */

function ActiveFilterPills({ filters }: { filters: ReturnType<typeof useFilters> }) {
  const { get, set } = filters;
  const gender = get("gender");
  const category = get("category");
  const price = get("price");
  const tag = get("tag");
  const q = get("q");

  const pills = [
    gender && { label: gender === "women" ? "Women" : "Men", clear: () => set({ gender: null }) },
    category && { label: CATEGORIES.find((c) => c.value === category)?.label ?? category, clear: () => set({ category: null }) },
    price && { label: PRICE_RANGES.find((r) => `${r.min}-${r.max}` === price)?.label ?? price, clear: () => set({ price: null }) },
    tag && { label: tag === "new" ? "New Arrivals" : "On Sale", clear: () => set({ tag: null }) },
    q && { label: `"${q}"`, clear: () => set({ q: null }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {pills.map((pill) => (
        <button
          key={pill.label}
          onClick={pill.clear}
          className="flex items-center gap-1.5 text-xs bg-ziva-black text-ziva-cream px-3 py-1.5 hover:bg-ziva-black transition-colors"
        >
          {pill.label}
          <PiX size={11} />
        </button>
      ))}
      <button
        onClick={() => set({ gender: null, category: null, price: null, tag: null, q: null })}
        className="text-xs text-ziva-muted hover:text-ziva-black underline underline-offset-2 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */

export default function ProductsClient() {
  const filters = useFilters();
  const { get, set } = filters;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [prodsLoading, setProdsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => { })
      .finally(() => setProdsLoading(false));
  }, []);

  const gender = get("gender");
  const category = get("category");
  const priceKey = get("price");
  const tag = get("tag");
  const q = get("q");
  const sort = get("sort") || "featured";

  /* ── Filter + sort products ── */
  const filtered = useMemo(() => {
    let list = [...allProducts];

    if (gender) list = list.filter((p) => p.gender === gender);
    if (category) list = list.filter((p) => p.category === category);
    if (tag === "new") list = list.filter((p) => p.isNew);
    if (tag === "sale") list = list.filter((p) => p.isSale);
    if (q) list = list.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()) ||
      p.description.toLowerCase().includes(q.toLowerCase())
    );
    if (priceKey) {
      const [min, max] = priceKey.split("-").map(Number);
      list = list.filter((p) => p.price >= min && p.price <= max);
    }

    switch (sort) {
      case "newest": list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [allProducts, gender, category, tag, q, priceKey, sort]);

  const activeFilterCount = [gender, category, priceKey, tag, q].filter(Boolean).length;

  /* ── Show spinner while loading products ── */
  if (prodsLoading) {
    return (
      <div className="container-ziva py-20 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-ziva-muted">
          <div className="w-8 h-8 border-2 border-ziva-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  const pageTitle =
    gender === "women" ? "Women's Collection"
      : gender === "men" ? "Men's Collection"
        : tag === "new" ? "New Arrivals"
          : tag === "sale" ? "Sale"
            : category ? (CATEGORIES.find((c) => c.value === category)?.label ?? "Products")
              : "All Products";

  return (
    <>
      {/* Mobile filter drawer */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />
      <aside
        className={`fixed top-0 left-0 h-full z-60 w-80 max-w-[85vw] bg-ziva-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <FilterPanel
          filters={filters}
          onClose={() => setDrawerOpen(false)}
          isMobile
        />
      </aside>

      {/* Page layout */}
      <div className="container-ziva py-8 sm:py-10 lg:py-14">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-ziva-muted mb-6 sm:mb-8">
          <Link href="/" className="hover:text-ziva-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-ziva-black font-medium">{pageTitle}</span>
        </nav>

        {/* Page title row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="gold-line mb-3" />
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-ziva-black">
              {pageTitle}
            </h1>
          </div>
          <p className="text-sm text-ziva-muted">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <PiMagnifyingGlass size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ziva-muted pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => set({ q: e.target.value || null })}
            placeholder="Search products — ankara, agbada, kaftan…"
            className="w-full pl-10 pr-4 py-2.5 bg-ziva-white border border-ziva-border text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
          />
          {q && (
            <button
              onClick={() => set({ q: null })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ziva-muted hover:text-ziva-black transition-colors"
            >
              <PiX size={14} />
            </button>
          )}
        </div>

        {/* Toolbar: mobile filter button + sort */}
        <div className="flex items-center justify-between gap-3 mb-6">
          {/* Mobile filter button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-medium text-ziva-black border border-ziva-border px-4 py-2 hover:border-ziva-black hover:text-ziva-black transition-colors"
          >
            <PiSliders size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-4 h-4 bg-ziva-black text-white text-[9px] font-bold rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-ziva-black border border-ziva-border px-4 py-2 hover:border-ziva-black hover:text-ziva-black transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline text-ziva-muted">Sort:</span>
                {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Featured"}
                <PiCaretDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-ziva-white border border-ziva-border shadow-lg z-20 min-w-44">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { set({ sort: opt.value === "featured" ? null : opt.value }); setSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === opt.value
                            ? "bg-ziva-cream text-ziva-black font-semibold"
                            : "text-ziva-black hover:bg-ziva-cream hover:text-ziva-black"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        <ActiveFilterPills filters={filters} />

        {/* Main two-col layout */}
        <div className="flex gap-8 xl:gap-10">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-52 xl:w-60 shrink-0">
            <div className="sticky top-28 space-y-0 border border-ziva-border p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-ziva-black flex items-center gap-2">
                  <PiFunnel size={13} /> Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => set({ gender: null, category: null, price: null, tag: null, q: null })}
                    className="text-[10px] text-ziva-muted hover:text-ziva-black underline underline-offset-2 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel filters={filters} />
            </div>
          </aside>

          {/* ── Product grid ── */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 border-2 border-dashed border-ziva-border rounded-full flex items-center justify-center mb-5">
                  <PiFunnel size={20} className="text-ziva-muted" />
                </div>
                <h3 className="font-heading text-2xl font-semibold text-ziva-black mb-2">
                  No pieces found
                </h3>
                <p className="text-sm text-ziva-muted max-w-xs">
                  Try adjusting your filters or search term to discover our collection.
                </p>
                <button
                  onClick={() => set({ gender: null, category: null, price: null, tag: null, q: null, sort: null })}
                  className="mt-6 btn-outline text-xs"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-8 sm:gap-y-10">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RecentlyViewed />
    </>
  );
}
