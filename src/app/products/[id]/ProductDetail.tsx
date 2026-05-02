"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PiHeart, PiHeartFill, PiMinus, PiPlus, PiCheck, PiTruck, PiClock, PiShield, PiStarFill, PiStar } from "react-icons/pi";
import { useCartStore, useWishlistStore, useNotificationStore } from "@/lib/store";
import { trackProductView } from "@/components/home/RecentlyViewed";
import { Product, Measurements } from "@/types";
import ProductCard from "@/components/ProductCard";

const FABRICS = [
  "Ankara Print", "Aso-Oke Handwoven", "Adire (Tie-Dye)",
  "George Fabric", "Nigerian Lace", "Babariga Cotton",
  "Premium Linen", "Dutch Wax Print",
];

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

interface Props { product: Product; related: Product[] }

export default function ProductDetail({ product, related }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customOpen, setCustomOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements>({
    chest: "", waist: "", hips: "", height: "", sleeve: "", notes: "",
  });

  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product.id));
  const show = useNotificationStore((s) => s.show);

  useEffect(() => { trackProductView(product.id); }, [product.id]);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const images = product.images.length > 0 ? product.images : [product.image];

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      show("Please select a size before adding to cart", "error");
      return;
    }
    setSizeError(false);
    const m = customOpen &&
      Object.values(measurements).some((v) => v.trim()) ? measurements : undefined;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor, selectedFabric || undefined, m);
    }
    if (m) show("Added with custom measurements · 10 business days", "info");
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  function measureChange(field: keyof Measurements, val: string) {
    setMeasurements((prev) => ({ ...prev, [field]: val }));
  }

  return (
    <div className="container-ziva py-8 sm:py-12 lg:py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-ziva-muted mb-8">
        <Link href="/" className="hover:text-ziva-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-ziva-black transition-colors">Products</Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="capitalize hover:text-ziva-black transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ziva-black font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 mb-16">

        {/* ── Image Gallery ── */}
        <div className="flex flex-col sm:flex-row gap-3 lg:sticky lg:top-24 lg:self-start">
          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-2 order-2 sm:order-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`relative w-16 h-20 sm:w-20 sm:h-24 shrink-0 overflow-hidden border-2 transition-colors ${imgIndex === i ? "border-ziva-black" : "border-ziva-border hover:border-ziva-muted"
                  }`}
              >
                <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>

          {/* Main image — shorter than full aspect-3/4 */}
          <div className="relative flex-1 aspect-3/3.5 sm:aspect-3/3.8 overflow-hidden bg-ziva-border order-1 sm:order-2 group">
            <Image
              src={images[imgIndex]}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 90vw, 45vw"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="bg-ziva-black text-ziva-cream text-[10px] font-semibold tracking-widest uppercase px-2 py-1">New</span>
              )}
              {discount && product.isSale && (
                <span className="bg-ziva-black text-white text-[10px] font-semibold tracking-widest uppercase px-2 py-1">-{discount}%</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col gap-5">

          {/* Name + category */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-ziva-black mb-1">{product.category}</p>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ziva-black leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) =>
                  s <= Math.round(product.rating)
                    ? <PiStarFill key={s} size={13} className="text-ziva-black" />
                    : <PiStar key={s} size={13} className="text-ziva-border" />
                )}
              </div>
              <span className="text-sm text-ziva-muted">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-3xl font-bold text-ziva-black">{fmt(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-ziva-muted line-through">{fmt(product.originalPrice)}</span>
            )}
            {discount && (
              <span className="text-sm font-semibold text-ziva-black bg-black/10 px-2 py-0.5">Save {discount}%</span>
            )}
          </div>

          {/* Out of stock notice */}
          {!product.inStock && (
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-zinc-700">Out of Stock</p>
                <p className="text-xs text-zinc-500 mt-0.5">Add to your wishlist and we&apos;ll notify you when it&apos;s back.</p>
              </div>
            </div>
          )}

          <div className="h-px bg-ziva-border" />

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-ziva-black tracking-wide uppercase">
                Size <span className="text-red-500">*</span>
              </p>
              <Link href="/size-guide" className="text-xs text-ziva-black hover:underline underline-offset-2">
                Size Guide
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSizeError(false); }}
                  className={`min-w-12 px-3 py-2 text-sm font-medium border transition-all duration-150 ${selectedSize === size
                      ? "border-ziva-black bg-ziva-black text-ziva-cream"
                      : "border-ziva-border text-ziva-black hover:border-ziva-black"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-red-500 text-xs mt-2 animate-fade-in-up">Please select a size before adding to cart.</p>
            )}
          </div>

          {/* Color / Print selector */}
          <div>
            <p className="text-xs font-semibold text-ziva-black tracking-widest uppercase mb-3">
              Colour / Print
            </p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-2 text-xs border transition-all duration-150 ${selectedColor === color
                      ? "border-ziva-black bg-black/10 text-ziva-black font-semibold"
                      : "border-ziva-border text-ziva-muted hover:border-ziva-black hover:text-ziva-black"
                    }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric selector */}
          <div>
            <p className="text-xs font-semibold text-ziva-black tracking-widest uppercase mb-3">
              Fabric Type <span className="text-ziva-muted font-normal normal-case tracking-normal">(optional)</span>
            </p>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="w-full border border-ziva-border bg-ziva-cream text-sm text-ziva-black px-3 py-2.5 outline-none focus:border-ziva-black transition-colors cursor-pointer"
            >
              <option value="">Use product default fabric</option>
              {FABRICS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <p className="text-xs font-semibold text-ziva-black tracking-widest uppercase mb-3">Quantity</p>
            <div className="flex items-center border border-ziva-border w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                aria-label="Decrease"
              >
                <PiMinus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-semibold text-ziva-black">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                aria-label="Increase"
              >
                <PiPlus size={14} />
              </button>
            </div>
          </div>

          {/* Custom tailoring accordion */}
          <div className="border border-ziva-border">
            <button
              onClick={() => setCustomOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-ziva-cream/50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-ziva-black">Custom Tailoring / Measurements</p>
                <p className="text-xs text-ziva-muted mt-0.5">Send us your exact measurements for a perfect fit</p>
              </div>
              <span className={`text-ziva-black text-lg font-light transition-transform duration-200 ${customOpen ? "rotate-45" : ""}`}>+</span>
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${customOpen ? "max-h-150" : "max-h-0"}`}>
              <div className="px-4 pb-4 pt-2 border-t border-ziva-border space-y-3">
                <div className="flex items-start gap-2.5 bg-black/10 border border-black/30 p-3">
                  <PiClock size={14} className="text-ziva-black shrink-0 mt-0.5" />
                  <p className="text-xs text-ziva-black leading-relaxed">
                    <strong>Custom orders deliver in 10 business days.</strong> Our master tailors will craft your garment to your exact measurements.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["chest", "waist", "hips", "height", "sleeve"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1">{field} (cm)</label>
                      <input
                        type="number"
                        min="1"
                        value={measurements[field]}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (Number.isFinite(Number(val)) && Number(val) >= 1)) {
                            measureChange(field, val);
                          }
                        }}
                        placeholder="e.g. 90"
                        className="w-full border border-ziva-border bg-white text-sm text-ziva-black px-3 py-2 outline-none focus:border-ziva-black transition-colors"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1">Additional Notes</label>
                    <textarea
                      value={measurements.notes}
                      onChange={(e) => measureChange("notes", e.target.value)}
                      placeholder="Any special requests, style preferences…"
                      rows={2}
                      className="w-full border border-ziva-border bg-white text-sm text-ziva-black px-3 py-2 outline-none focus:border-ziva-black transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add to cart + wishlist */}
          <div className="flex gap-3">
            {product.inStock ? (
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2.5 py-4 text-sm font-semibold tracking-widest uppercase transition-all duration-200 ${added
                    ? "bg-green-600 text-white"
                    : "bg-ziva-black text-ziva-cream hover:bg-ziva-black"
                  }`}
              >
                {added ? (
                  <><PiCheck size={16} /> Added to Cart</>
                ) : (
                  <>Add to Cart — {fmt(product.price * quantity)}</>
                )}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center py-4 text-sm font-semibold tracking-widest uppercase bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
              >
                Out of Stock
              </button>
            )}
            <button
              onClick={() => toggle(product.id)}
              aria-label="Wishlist"
              className={`w-14 flex items-center justify-center border transition-all duration-200 ${wished
                  ? "border-ziva-black bg-black/10 text-ziva-black"
                  : "border-ziva-border text-ziva-muted hover:border-ziva-black hover:text-ziva-black"
                }`}
            >
              {wished ? <PiHeartFill size={18} /> : <PiHeart size={18} />}
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { icon: PiTruck, text: "Free delivery over ₦50,000" },
              { icon: PiShield, text: "Authentic Nigerian craftsmanship" },
              { icon: PiClock, text: "10-day custom tailoring" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-ziva-muted">
                <Icon size={13} className="text-ziva-black shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Product details accordion */}
          <div className="border-t border-ziva-border pt-4">
            <button
              onClick={() => setDetailOpen((v) => !v)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-ziva-black hover:text-ziva-black transition-colors"
            >
              Product Details
              <span className={`text-lg font-light transition-transform duration-200 ${detailOpen ? "rotate-45" : ""}`}>+</span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${detailOpen ? "max-h-60" : "max-h-0"}`}>
              <p className="text-sm text-ziva-muted leading-relaxed pt-2 pb-4">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {[`Gender: ${product.gender}`, `Category: ${product.category}`].map((tag) => (
                  <span key={tag} className="text-[10px] border border-ziva-border px-2 py-1 text-ziva-muted capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div>
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="gold-line mb-3 block" />
              <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-ziva-black">
                You May Also Like
              </h2>
            </div>
            <Link href={`/products?category=${product.category}`} className="hidden sm:block text-sm text-ziva-muted hover:text-ziva-black transition-colors underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
