"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PiX, PiMinus, PiPlus, PiShoppingBag, PiTrash } from "react-icons/pi";
import { useCartStore } from "@/lib/store";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

interface Props { onClose: () => void }

export default function MiniCart({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-ziva-border shadow-2xl z-100 flex flex-col max-h-[80vh] animate-slide-down"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-ziva-border shrink-0">
        <div className="flex items-center gap-2">
          <PiShoppingBag size={16} className="text-ziva-black" />
          <span className="text-sm font-semibold text-ziva-black tracking-wide">
            Cart ({totalItems})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-ziva-muted hover:text-ziva-black transition-colors"
          aria-label="Close cart"
        >
          <PiX size={16} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-5">
            <PiShoppingBag size={36} className="text-ziva-border mb-3" />
            <p className="text-sm text-ziva-muted">Your cart is empty</p>
            <Link
              href="/products"
              onClick={onClose}
              className="mt-4 text-xs text-ziva-black hover:underline underline-offset-2 tracking-widest uppercase"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ziva-border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 px-4 py-3.5 hover:bg-ziva-cream/50 transition-colors">
                {/* Image */}
                <div className="relative w-16 h-20 shrink-0 overflow-hidden bg-ziva-border">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.id}`}
                    onClick={onClose}
                    className="text-xs font-medium text-ziva-black hover:text-black/70 transition-colors line-clamp-2 leading-snug"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-[10px] text-ziva-muted mt-0.5">
                    {item.selectedSize}
                    {item.selectedColor && ` · ${item.selectedColor}`}
                    {item.selectedFabric && ` · ${item.selectedFabric}`}
                  </p>
                  {item.isCustomTailored && (
                    <span className="inline-block mt-1 text-[9px] tracking-widest uppercase bg-black/10 text-ziva-black px-1.5 py-0.5 font-semibold">
                      Custom
                    </span>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center border border-ziva-border">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <PiMinus size={10} />
                      </button>
                      <span className="w-7 text-center text-xs font-medium text-ziva-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-ziva-muted hover:text-ziva-black hover:bg-ziva-cream transition-colors"
                        aria-label="Increase quantity"
                      >
                        <PiPlus size={10} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ziva-black">
                        {fmt(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ziva-muted hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <PiTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-ziva-border px-5 py-4 shrink-0 space-y-3 bg-ziva-cream/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ziva-muted">Subtotal</span>
            <span className="font-semibold text-ziva-black">{fmt(totalPrice)}</span>
          </div>
          <p className="text-[10px] text-ziva-muted">
            {totalPrice >= 50000
              ? "🎉 Free delivery on this order"
              : `Add ${fmt(50000 - totalPrice)} more for free delivery`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-center py-2.5 border border-ziva-black text-xs font-medium tracking-widest uppercase text-ziva-black hover:bg-ziva-black hover:text-ziva-cream transition-colors"
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex items-center justify-center py-2.5 bg-ziva-black text-white text-xs font-medium tracking-widest uppercase hover:bg-black/80 transition-colors"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
