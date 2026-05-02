"use client";

import Image from "next/image";
import Link from "next/link";
import { PiMinus, PiPlus, PiTrash, PiShoppingBag, PiArrowRight, PiTruck, PiShield } from "react-icons/pi";
import { useCartStore, useNotificationStore } from "@/lib/store";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }
const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3500;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.totalPrice());
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const show = useNotificationStore((s) => s.show);

  if (items.length === 0) {
    return (
      <div className="container-ziva py-20 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
        <div className="w-20 h-20 border-2 border-dashed border-ziva-border rounded-full flex items-center justify-center">
          <PiShoppingBag size={28} className="text-ziva-muted" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ziva-black">Your cart is empty</h1>
        <p className="text-sm text-ziva-muted max-w-xs">
          Discover our collection of premium Nigerian attire and add your favourites.
        </p>
        <Link href="/products" className="btn-primary text-xs mt-2">
          Start Shopping <PiArrowRight size={14} />
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
            Shopping Cart
          </h1>
        </div>
        <button
          onClick={() => { clearCart(); show("Cart cleared", "info"); }}
          className="text-xs text-ziva-muted hover:text-red-500 transition-colors underline underline-offset-2"
        >
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 xl:gap-12 items-start">

        {/* ── Cart items ── */}
        <div className="space-y-0 border border-ziva-border divide-y divide-ziva-border">
          {/* Column labels */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_80px] gap-4 px-5 py-3 text-[10px] uppercase tracking-widest text-ziva-muted font-semibold bg-ziva-cream/50">
            <span>Product</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Price</span>
            <span />
          </div>

          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_100px_80px] sm:items-center gap-4 px-5 py-5">
              {/* Image + info */}
              <div className="flex gap-4">
                <Link href={`/products/${item.product.id}`} className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 overflow-hidden bg-ziva-border">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="96px" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.id}`} className="text-sm font-semibold text-ziva-black hover:text-ziva-black transition-colors line-clamp-2 leading-snug">
                    {item.product.name}
                  </Link>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-xs text-ziva-muted">Size: <span className="text-ziva-black">{item.selectedSize}</span></p>
                    {item.selectedColor && <p className="text-xs text-ziva-muted">Colour: <span className="text-ziva-black">{item.selectedColor}</span></p>}
                    {item.selectedFabric && <p className="text-xs text-ziva-muted">Fabric: <span className="text-ziva-black">{item.selectedFabric}</span></p>}
                  </div>
                  {item.isCustomTailored && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ziva-black border border-black/30 bg-black/8 px-2 py-1 w-fit">
                      <span>✂</span> Custom Tailored · 10 business days
                    </div>
                  )}
                  {/* Mobile price */}
                  <p className="sm:hidden text-sm font-bold text-ziva-black mt-2">
                    {fmt(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>

              {/* Qty */}
              <div className="flex items-center border border-ziva-border w-fit sm:mx-auto">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-9 h-9 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                  aria-label="Decrease"
                >
                  <PiMinus size={12} />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                  aria-label="Increase"
                >
                  <PiPlus size={12} />
                </button>
              </div>

              {/* Price — desktop */}
              <p className="hidden sm:block text-sm font-bold text-ziva-black text-right">
                {fmt(item.product.price * item.quantity)}
              </p>

              {/* Remove */}
              <div className="sm:flex sm:justify-end">
                <button
                  onClick={() => { show(`${item.product.name} removed`, "info"); removeItem(item.id); }}
                  aria-label="Remove"
                  className="flex items-center gap-1.5 text-xs text-ziva-muted hover:text-red-500 transition-colors sm:justify-center"
                >
                  <PiTrash size={13} /> <span className="sm:hidden">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ── */}
        <div className="border border-ziva-border p-6 lg:sticky lg:top-28 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-ziva-black">Order Summary</h2>
          <div className="h-px bg-ziva-border" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ziva-muted">Subtotal</span>
              <span className="font-semibold">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ziva-muted">Shipping</span>
              <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                {shipping === 0 ? "FREE" : fmt(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[11px] text-ziva-muted bg-ziva-cream p-2.5">
                Add {fmt(SHIPPING_THRESHOLD - subtotal)} more for free delivery
              </p>
            )}
          </div>

          <div className="h-px bg-ziva-border" />

          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-4 text-sm font-semibold tracking-widest uppercase hover:bg-ziva-black transition-colors"
          >
            Proceed to Checkout <PiArrowRight size={14} />
          </Link>

          <Link
            href="/products"
            className="w-full flex items-center justify-center py-3 border border-ziva-border text-sm text-ziva-muted hover:border-ziva-black hover:text-ziva-black transition-colors"
          >
            Continue Shopping
          </Link>

          {/* Trust */}
          <div className="pt-2 space-y-2">
            {[
              { icon: PiTruck, text: "Free delivery on orders over ₦50,000" },
              { icon: PiShield, text: "Secure checkout · All payments encrypted" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-ziva-muted">
                <Icon size={12} className="text-ziva-black shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
