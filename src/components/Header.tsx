"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, useSyncExternalStore, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBagIcon, MagnifyingGlassIcon, HeartIcon, Bars3Icon, XMarkIcon,
  ChevronDownIcon, UserIcon, ArrowRightIcon, TruckIcon,
} from "@heroicons/react/24/outline";
import { useCartStore, useAuthStore } from "@/lib/store";
import { products } from "@/lib/products";
import MobileMenu from "./MobileMenu";
import MiniCart from "./MiniCart";
import Logo from "./Logo";

type SubLink = { label: string; href: string; image: string };
type NavItem = {
  label: string;
  href: string;
  isMega: boolean;
  badge?: string;
  featured?: { image: string; caption: string; href: string };
  sub: SubLink[];
};

const navItems: NavItem[] = [
  {
    label: "Women", href: "/products?gender=women", isMega: true,
    featured: { image: "/assets/gown-W2.jpg", caption: "New in Women", href: "/products?gender=women&tag=new" },
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
    label: "Men", href: "/products?gender=men", isMega: true,
    featured: { image: "/assets/agbada-M3.jpg", caption: "Artisan Collection", href: "/products?gender=men&tag=new" },
    sub: [
      { label: "Agbada", href: "/products?gender=men&category=agbada", image: "/assets/agbada-M1.jpg" },
      { label: "Senator", href: "/products?gender=men&category=senator", image: "/assets/senator-M1.jpg" },
      { label: "Dashiki", href: "/products?gender=men&category=dashiki", image: "/assets/dashiki-M1.jpg" },
      { label: "Native Shirts", href: "/products?gender=men&category=native-shirt", image: "/assets/native-shirt-M1.jpg" },
      { label: "Kaftan", href: "/products?gender=men&category=kaftan", image: "/assets/kaftan-M1.jpg" },
      { label: "Linen", href: "/products?gender=men&category=linen", image: "/assets/linen-M1.jpg" },
    ],
  },
  { label: "New Arrivals", href: "/products?tag=new", isMega: false, sub: [] },
  { label: "Sale", href: "/products?tag=sale", isMega: false, badge: "Hot", sub: [] },
  { label: "Contact", href: "/contact", isMega: false, sub: [] },
];

const QUICK_SEARCHES = ["Ankara", "Agbada", "Kaftan", "Aso-Oke", "Gowns", "Senator"];

export default function Header() {
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartBounce, setCartBounce] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTotal = useRef(0);
  const cartRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const desktopFormRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; prevTotal.current = totalItems; return; }
    if (totalItems > prevTotal.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      prevTotal.current = totalItems;
      return () => clearTimeout(t);
    }
    prevTotal.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    if (!cartOpen) return;
    const h = (e: MouseEvent) => {
      // Mobile/tablet uses a portal backdrop to close — skip the DOM-contains
      // check there because portal content is not inside cartRef in the DOM.
      if (window.innerWidth < 1024) return;
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) setCartOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [cartOpen]);

  /* Close desktop suggestion dropdown on outside click */
  useEffect(() => {
    if (!showDropdown) return;
    const h = (e: MouseEvent) => {
      if (desktopFormRef.current && !desktopFormRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showDropdown]);

  /* Body lock for search overlay */
  useEffect(() => {
    document.body.style.overflow = searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [searchOpen]);

  /* Auto-focus search input when overlay opens */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 60);
  }, [searchOpen]);

  /* Build suggestions from product list — useMemo avoids setState-in-effect warning */
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
      if (results.length >= 6) break;
    }
    return results;
  }, [searchQuery]);

  const openMenu = useCallback((label: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(label);
  }, []);
  const closeMenu = useCallback(() => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 130);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/products?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setSearchOpen(false);
      setShowDropdown(false);
    }
  }

  function pickSuggestion(term: string) {
    router.push(`/products?q=${encodeURIComponent(term)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setShowDropdown(false);
  }

  const activeMegaItem = navItems.find((n) => n.label === activeMenu);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-ziva-border shadow-sm">

        {/* ── ROW 1: Announcement bar ── */}
        <div className={`bg-ziva-black overflow-hidden transition-all duration-300 ${scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
          <div className="container-ziva flex items-center justify-center gap-3 md:gap-8 lg:gap-10 py-2.5 overflow-hidden">
            <div className="flex items-center gap-2 text-white/75 min-w-0 shrink-0">
              <TruckIcon className="size-3.25 shrink-0" />
              <span className="text-[10px] sm:text-[11px] tracking-[0.16em] uppercase whitespace-nowrap">
                Free delivery on orders over ₦50,000
              </span>
            </div>
            <span className="hidden md:block text-white/20 text-xs shrink-0">·</span>
            <span className="hidden md:block text-white/55 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase shrink-0 whitespace-nowrap">
              Handcrafted in Nigeria
            </span>
            <span className="hidden lg:block text-white/20 text-xs shrink-0">·</span>
            <span className="hidden lg:block text-white/55 text-[10px] sm:text-[11px] tracking-[0.16em] uppercase shrink-0 whitespace-nowrap">
              48 hr Lagos delivery
            </span>
          </div>
        </div>

        {/* ── ROW 2: Logo | Search | Icons ── */}
        <div className="container-ziva">
          <div className="relative flex items-center h-16 lg:h-14">

            {/* Mobile left: Hamburger + Search */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="p-2.5 text-ziva-black hover:text-ziva-muted transition-colors"
              >
                <Bars3Icon className="size-5.5" />
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2.5 text-ziva-black hover:text-ziva-muted transition-colors"
              >
                <MagnifyingGlassIcon className="size-5" />
              </button>
            </div>

            {/* Desktop left: Logo */}
            <div className="hidden lg:block shrink-0">
              <Logo size="md" variant="dark" href="/" />
            </div>

            {/* Mobile center: Logo (absolute so it doesn't shift layout) */}
            <div className="absolute left-1/2 -translate-x-1/2 lg:hidden pointer-events-none">
              <Logo size="sm" variant="dark" href="/" className="pointer-events-auto" />
            </div>

            {/* Desktop center: Search with suggestion dropdown */}
            <div className="hidden lg:flex flex-1 justify-center px-6">
              <div ref={desktopFormRef} className="relative w-full max-w-xl">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-3 w-full bg-ziva-cream border border-ziva-border rounded-full px-5 py-2.5 hover:border-ziva-black/40 focus-within:border-ziva-black focus-within:bg-white focus-within:shadow-sm transition-all duration-200 group"
                >
                  <MagnifyingGlassIcon className="size-3.5 text-ziva-muted shrink-0 group-focus-within:text-ziva-black transition-colors" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search ankara, kaftan, agbada…"
                    className="flex-1 bg-transparent text-sm text-ziva-black placeholder:text-ziva-muted outline-none min-w-0"
                  />
                  {searchQuery && (
                    <button
                      type="submit"
                      className="text-[9px] tracking-[0.25em] uppercase font-bold text-ziva-black shrink-0 border-l border-ziva-border pl-3 hover:text-ziva-muted transition-colors"
                    >
                      Search
                    </button>
                  )}
                </form>

                {/* Suggestion dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ziva-border shadow-xl z-20 py-2 animate-slide-down">
                    {searchQuery.length === 0 ? (
                      <div className="px-4 py-2">
                        <p className="text-[9px] tracking-[0.3em] uppercase text-ziva-muted font-semibold mb-2.5">
                          Popular searches
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_SEARCHES.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onMouseDown={(e) => { e.preventDefault(); pickSuggestion(term); }}
                              className="px-2.5 py-1 border border-ziva-border text-xs text-ziva-muted hover:border-ziva-black hover:text-ziva-black transition-colors tracking-widest uppercase"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ziva-cream transition-colors text-left"
                        >
                          <MagnifyingGlassIcon className="size-3 text-ziva-muted shrink-0" />
                          <span className="text-sm text-ziva-black">{s}</span>
                          <ArrowRightIcon className="size-2.5 ml-auto text-ziva-muted shrink-0" />
                        </button>
                      ))
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile right: Login + Cart */}
            <div className="flex items-center ml-auto lg:hidden">
              <Link
                href={mounted && user ? "/account" : "/auth"}
                aria-label="Account"
                className="flex flex-col items-center gap-0.5 px-2.5 py-2 text-ziva-black hover:text-ziva-muted transition-colors group"
              >
                <UserIcon className="size-5 transition-transform group-hover:-translate-y-0.5 duration-200" />
                {mounted && user && (
                  <span className="text-[8px] tracking-widest uppercase font-medium text-ziva-muted truncate max-w-13">
                    {user.name.split(" ")[0]}
                  </span>
                )}
              </Link>
              <div ref={cartRef} className="relative">
                <button
                  onClick={() => setCartOpen((v) => !v)}
                  aria-label="Cart"
                  className="p-2.5 text-ziva-black hover:text-ziva-muted transition-colors"
                >
                  <div className="relative">
                    <ShoppingBagIcon className="size-5" />
                    {mounted && totalItems > 0 && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full bg-red-500 text-white ${cartBounce ? "animate-cart-bounce" : ""}`}
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </div>
                </button>
                {cartOpen && <MiniCart onClose={() => setCartOpen(false)} />}
              </div>
            </div>

            {/* Desktop right: Account + Wishlist + Cart */}
            <div className="hidden lg:flex items-center gap-0 shrink-0">
              <Link
                href={mounted && user ? "/account" : "/auth"}
                aria-label="Account"
                className="flex flex-col items-center gap-0.5 px-2.5 py-2 text-ziva-black hover:text-ziva-muted transition-colors group"
              >
                <UserIcon className="size-4.5 transition-transform group-hover:-translate-y-0.5 duration-200" />
                <span className="text-[8px] tracking-widest uppercase font-medium text-ziva-muted truncate max-w-15">
                  {mounted && user ? user.name.split(" ")[0] : "Account"}
                </span>
              </Link>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="flex flex-col items-center gap-0.5 px-2.5 py-2 text-ziva-black hover:text-ziva-muted transition-colors group"
              >
                <HeartIcon className="size-4.5 transition-transform group-hover:-translate-y-0.5 duration-200" />
                <span className="text-[8px] tracking-widest uppercase font-medium text-ziva-muted">Wishlist</span>
              </Link>

              <div ref={cartRef} className="relative">
                <button
                  onClick={() => setCartOpen((v) => !v)}
                  aria-label="Cart"
                  className="flex flex-col items-center gap-0.5 px-2.5 py-2 text-ziva-black hover:text-ziva-muted transition-colors group"
                >
                  <div className="relative">
                    <ShoppingBagIcon className="size-4.5 transition-transform group-hover:-translate-y-0.5 duration-200" />
                    {mounted && totalItems > 0 && (
                      <span
                        className={`absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full bg-red-500 text-white ${cartBounce ? "animate-cart-bounce" : ""}`}
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] tracking-widest uppercase font-medium text-ziva-muted">Cart</span>
                </button>
                {cartOpen && <MiniCart onClose={() => setCartOpen(false)} />}
              </div>
            </div>

          </div>
        </div>

        {/* ── ROW 3: Nav links (desktop only) ── */}
        <div className="hidden lg:block border-t border-ziva-border">
          <div className="container-ziva">
            <nav className="flex items-center justify-center gap-8 xl:gap-12 h-10">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.isMega && openMenu(item.label)}
                  onMouseLeave={() => item.isMega && closeMenu()}
                >
                  {item.isMega ? (
                    <button
                      className="group flex items-center gap-1 text-sm font-medium tracking-wide text-ziva-black hover:text-ziva-muted transition-colors py-4"
                      aria-expanded={activeMenu === item.label}
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute -bottom-0.5 left-0 right-0 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-ziva-black" />
                      </span>
                      <ChevronDownIcon
                        className={`size-2.75 transition-transform duration-200 opacity-40 ${activeMenu === item.label ? "rotate-180 opacity-70!" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 text-sm font-medium tracking-wide text-ziva-black hover:text-ziva-muted transition-colors py-4"
                    >
                      <span className="relative">
                        {item.label}
                        <span className="absolute -bottom-0.5 left-0 right-0 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 bg-ziva-black" />
                      </span>
                      {item.badge && (
                        <span className="text-[8px] px-1.5 py-0.5 tracking-wider uppercase font-bold bg-ziva-black text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* ── MEGA MENU ── */}
        {activeMegaItem?.isMega && (
          <div
            onMouseEnter={() => openMenu(activeMegaItem.label)}
            onMouseLeave={closeMenu}
            className="absolute top-full left-0 right-0 bg-white border-b border-ziva-border shadow-2xl z-40 animate-slide-down"
          >
            <div className="container-ziva py-8 lg:py-10">
              <div className="grid grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr] gap-8 xl:gap-12">
                {activeMegaItem.featured && (
                  <Link
                    href={activeMegaItem.featured.href}
                    className="relative overflow-hidden group block"
                    style={{ height: "260px" }}
                  >
                    <Image
                      src={activeMegaItem.featured.image}
                      alt={activeMegaItem.label}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="300px"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[9px] text-white/60 uppercase tracking-widest mb-1">
                        {activeMegaItem.featured.caption}
                      </p>
                      <p className="font-heading text-xl font-bold text-white leading-tight">
                        Shop All {activeMegaItem.label}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-white/70 tracking-widest uppercase mt-2 group-hover:text-white transition-colors">
                        Explore <ArrowRightIcon className="size-2.25" />
                      </span>
                    </div>
                  </Link>
                )}

                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {activeMegaItem.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="flex items-center gap-3 p-3 hover:bg-ziva-cream transition-colors group"
                      >
                        <div className="relative w-12 h-12 shrink-0 overflow-hidden bg-ziva-border">
                          <Image
                            src={sub.image}
                            alt={sub.label}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="48px"
                          />
                        </div>
                        <span className="text-sm font-semibold text-ziva-black group-hover:text-ziva-black transition-colors">
                          {sub.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-ziva-border">
                    <Link
                      href={activeMegaItem.href}
                      className="inline-flex items-center gap-2 text-sm font-bold text-ziva-black hover:text-ziva-muted transition-colors tracking-wide"
                    >
                      View All {activeMegaItem.label} <ArrowRightIcon className="size-3.25" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Search overlay (with body lock) ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-200 flex flex-col">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          />
          <div className="relative z-10 bg-white shadow-2xl animate-slide-down mt-26 lg:mt-34">
            <div className="container-ziva py-5">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-4 border-b-2 border-ziva-black pb-4">
                  <MagnifyingGlassIcon className="size-4.5 text-ziva-black shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ankara, agbada, kaftan…"
                    className="flex-1 text-lg bg-transparent text-ziva-black placeholder:text-ziva-muted outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="p-1 text-ziva-muted hover:text-ziva-black shrink-0"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                {/* Dynamic suggestions in overlay */}
                {suggestions.length > 0 && (
                  <div className="mt-3 flex flex-col gap-0.5">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => pickSuggestion(s)}
                        className="flex items-center gap-3 py-2.5 px-1 hover:bg-ziva-cream rounded-sm transition-colors text-left"
                      >
                        <MagnifyingGlassIcon className="size-3.25 text-ziva-muted shrink-0" />
                        <span className="text-sm text-ziva-black">{s}</span>
                        <ArrowRightIcon className="size-2.75 ml-auto text-ziva-muted shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick search pills (empty state) */}
                {searchQuery.length === 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => pickSuggestion(term)}
                        className="px-3 py-1.5 border border-ziva-border text-xs text-ziva-muted hover:border-ziva-black hover:text-ziva-black transition-colors tracking-widest uppercase"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
