"use client";

import { useState, useEffect, useRef, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  XMarkIcon, ChevronDownIcon, HeartIcon, ShoppingBagIcon,
  UserIcon, MagnifyingGlassIcon, ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useCartStore, useAuthStore } from "@/lib/store";
import { products } from "@/lib/products";
import Logo from "./Logo";

const QUICK_SEARCHES = ["Ankara", "Agbada", "Kaftan", "Aso-Oke", "Gowns", "Senator"];

type SubLink = { label: string; href: string; image: string };
type NavSection = {
  label: string;
  href: string;
  featured?: { image: string; caption: string };
  sub: SubLink[];
};

const navSections: NavSection[] = [
  {
    label: "Women", href: "/products?gender=women",
    featured: { image: "/assets/gown-W2.jpg", caption: "New Collection 2025" },
    sub: [
      { label: "Ankara", href: "/products?gender=women&category=ankara", image: "/assets/ankara-W1.jpg" },
      { label: "Aso-Oke", href: "/products?gender=women&category=aso-oke", image: "/assets/aso-oke-W1.jpg" },
      { label: "Kaftan", href: "/products?gender=women&category=kaftan", image: "/assets/kaftan-W1.jpg" },
      { label: "Gowns", href: "/products?gender=women&category=gown", image: "/assets/gown-W1.jpg" },
      { label: "Cord Sets", href: "/products?gender=women&category=cord", image: "/assets/cord-W1.jpg" },
      { label: "Adire", href: "/products?gender=women&category=adire", image: "/assets/adire-W1.jpg" },
    ],
  },
  {
    label: "Men", href: "/products?gender=men",
    featured: { image: "/assets/agbada-M3.jpg", caption: "Artisan Collection" },
    sub: [
      { label: "Agbada", href: "/products?gender=men&category=agbada", image: "/assets/agbada-M1.jpg" },
      { label: "Senator", href: "/products?gender=men&category=senator", image: "/assets/senator-M1.jpg" },
      { label: "Dashiki", href: "/products?gender=men&category=dashiki", image: "/assets/dashiki-M1.jpg" },
      { label: "Native Shirts", href: "/products?gender=men&category=native-shirt", image: "/assets/native-shirt-M1.jpg" },
      { label: "Kaftan", href: "/products?gender=men&category=kaftan", image: "/assets/kaftan-M1.jpg" },
      { label: "Linen", href: "/products?gender=men&category=linen", image: "/assets/linen-M1.jpg" },
    ],
  },
  { label: "New Arrivals", href: "/products?tag=new", sub: [] },
  { label: "Sale", href: "/products?tag=sale", sub: [] },
  { label: "Contact", href: "/contact", sub: [] },
];

interface Props { open: boolean; onClose: () => void }

export default function MobileMenu({ open, onClose }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setExpanded(null); setSearchQuery(""); }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const seen = new Set<string>();
    const results: string[] = [];
    for (const p of products) {
      if (p.name.toLowerCase().includes(q) && !seen.has(p.name)) {
        seen.add(p.name);
        results.push(p.name);
      }
      if (results.length >= 5) break;
    }
    return results;
  }, [searchQuery]);

  const toggle = (label: string) =>
    setExpanded((prev) => (prev === label ? null : label));

  function handlePickSuggestion(term: string) {
    router.push(`/products?q=${encodeURIComponent(term)}`);
    setSearchFocused(false);
    onClose();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
      onClose();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-60 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Panel */}
      <aside
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 z-70 h-full w-full max-w-sm sm:max-w-md bg-white flex flex-col shadow-2xl transition-transform duration-400 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ziva-border shrink-0">
          <Logo size="sm" variant="dark" href="/" className="shrink-0" />
          <button onClick={onClose} aria-label="Close" className="p-2 text-ziva-black hover:text-ziva-black transition-colors">
            <XMarkIcon className="size-5.5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-ziva-border shrink-0">
          <div className="relative">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-ziva-cream border border-ziva-border px-3 py-2">
              <MagnifyingGlassIcon className="size-3.5 text-ziva-muted shrink-0" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search products…"
                className="flex-1 bg-transparent text-sm text-ziva-black placeholder:text-ziva-muted outline-none"
              />
              {searchQuery && (
                <button type="submit" className="text-[10px] text-ziva-black tracking-widest uppercase font-semibold shrink-0">
                  Go
                </button>
              )}
            </form>

            {/* Autocomplete dropdown */}
            {searchFocused && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-ziva-border shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchQuery.length === 0 ? (
                  <div className="p-3">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-ziva-muted font-semibold mb-2.5">
                      Popular searches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handlePickSuggestion(term); }}
                          className="px-2.5 py-1 border border-ziva-border text-xs text-ziva-muted hover:border-ziva-black hover:text-ziva-black transition-colors tracking-widest uppercase"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-1">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); handlePickSuggestion(s); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ziva-cream transition-colors text-left"
                      >
                        <MagnifyingGlassIcon className="size-3 text-ziva-muted shrink-0" />
                        <span className="text-sm text-ziva-black flex-1 text-left">{s}</span>
                        <ArrowRightIcon className="size-2.5 text-ziva-muted shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-3 text-xs text-ziva-muted">No results for &ldquo;{searchQuery}&rdquo;</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nav body */}
        <nav className="flex-1 overflow-y-auto overscroll-contain">
          {navSections.map((section) => (
            <div key={section.label} className="border-b border-ziva-border">
              {section.sub.length > 0 ? (
                <button
                  onClick={() => toggle(section.label)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-heading text-xl font-semibold text-ziva-black">
                    {section.label}
                  </span>
                  <ChevronDownIcon
                    className={`size-4.5 text-ziva-muted transition-transform duration-300 ${expanded === section.label ? "rotate-180 text-ziva-black" : ""
                      }`}
                  />
                </button>
              ) : (
                <Link
                  href={section.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="font-heading text-xl font-semibold text-ziva-black hover:text-ziva-black transition-colors">
                    {section.label}
                  </span>
                  {section.label === "Sale" && (
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-white bg-ziva-black px-2 py-0.5">Hot</span>
                  )}
                  {section.label === "New Arrivals" && (
                    <span className="text-[10px] tracking-widest uppercase font-semibold text-white bg-ziva-black px-2 py-0.5">New</span>
                  )}
                </Link>
              )}

              {section.sub.length > 0 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded === section.label ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  {section.featured && (
                    <Link
                      href={section.href}
                      onClick={onClose}
                      className="relative block mx-4 mb-3 h-32 overflow-hidden group"
                    >
                      <Image
                        src={section.featured.image}
                        alt={section.label}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        sizes="400px"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <p className="text-[9px] text-ziva-black uppercase tracking-widest">{section.featured.caption}</p>
                        <p className="font-heading text-base font-semibold text-white">Shop All {section.label}</p>
                      </div>
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-px bg-ziva-border mx-4 mb-4">
                    {section.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        onClick={onClose}
                        className="relative flex items-center gap-2.5 bg-ziva-cream px-3 py-2.5 hover:bg-white group transition-colors"
                      >
                        <div className="relative w-9 h-9 shrink-0 overflow-hidden">
                          <Image
                            src={sub.image}
                            alt={sub.label}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="40px"
                          />
                        </div>
                        <span className="text-sm font-medium text-ziva-black group-hover:text-ziva-black transition-colors">
                          {sub.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-ziva-border px-5 py-4 space-y-3 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            <Link
              href={mounted && user ? "/account" : "/auth"}
              onClick={onClose}
              className="flex flex-col items-center gap-1 py-2.5 border border-ziva-border text-xs text-ziva-black hover:border-ziva-black hover:text-ziva-black transition-colors"
            >
              <UserIcon className="size-4" />
              <span>{mounted && user ? user.name.split(" ")[0] : "Account"}</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-1 py-2.5 border border-ziva-border text-xs text-ziva-black hover:border-ziva-black hover:text-ziva-black transition-colors"
            >
              <HeartIcon className="size-4" />
              <span>Wishlist</span>
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="relative flex flex-col items-center gap-1 py-2.5 bg-ziva-black text-ziva-cream text-xs hover:bg-ziva-black transition-colors"
            >
              <ShoppingBagIcon className="size-4" />
              <span>Cart</span>
              {mounted && totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center bg-ziva-black text-white text-[9px] font-bold rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-ziva-muted">Follow us</p>
            <div className="flex gap-3">
              <Link href="#" aria-label="Instagram" className="text-ziva-muted hover:text-ziva-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
              <Link href="#" aria-label="X / Twitter" className="text-ziva-muted hover:text-ziva-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
