"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PiArrowLeft, PiArrowRight, PiCheck, PiLock,
  PiTruck, PiShield, PiClock,
} from "react-icons/pi";
import { useCartStore, useAuthStore, useNotificationStore } from "@/lib/store";

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

interface PaystackHandler { openIframe: () => void; }
interface PaystackPopStatic { setup: (config: Record<string, unknown>) => PaystackHandler; }
declare global { interface Window { PaystackPop?: PaystackPopStatic; } }

const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3500;
const SAMEDAY_FEE = 5000;

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.totalPrice());
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const show = useNotificationStore((s) => s.show);

  const [deliveryType, setDeliveryType] = useState<"standard" | "sameday">("standard");

  const shipping = deliveryType === "sameday"
    ? SAMEDAY_FEE
    : (subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE);
  const total = subtotal + shipping;

  const [step, setStep] = useState<1 | 2>(1);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  /* Step 1 — contact */
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  /* Step 2 — delivery */
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [notes, setNotes] = useState("");

  /* Load Paystack script once */
  useEffect(() => {
    if (window.PaystackPop) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { try { document.body.removeChild(s); } catch { } };
  }, []);

  /* ── Empty cart guard ── */
  if (items.length === 0 && !placed) {
    return (
      <div className="container-ziva py-20 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5">
        <div className="w-20 h-20 border-2 border-dashed border-ziva-border rounded-full flex items-center justify-center">
          <PiLock size={24} className="text-ziva-muted" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ziva-black">Your cart is empty</h1>
        <p className="text-sm text-ziva-muted">Add items to your cart before checking out.</p>
        <Link href="/products" className="btn-primary text-xs mt-2 inline-flex items-center gap-2">
          Browse Collection <PiArrowRight size={13} />
        </Link>
      </div>
    );
  }

  /* ── Success screen ── */
  if (placed) {
    return (
      <div className="container-ziva py-20 flex flex-col items-center justify-center min-h-[60vh] text-center gap-5 max-w-md mx-auto">
        <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center">
          <PiCheck size={32} className="text-green-600" />
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ziva-black">Order Placed!</h1>
        <p className="text-sm text-ziva-muted leading-relaxed">
          Thank you, <strong>{name}</strong>. Your order has been received and our team will be in touch within 24 hours to confirm delivery.
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/" className="btn-primary text-xs">Back to Home</Link>
          <Link href="/products" className="px-5 py-3 border border-ziva-border text-xs font-semibold tracking-widest uppercase text-ziva-black hover:border-ziva-black transition-colors">
            Keep Shopping
          </Link>
        </div>
      </div>
    );
  }

  function handlePay() {
    const PaystackPop = window.PaystackPop;
    if (!PaystackPop) {
      show("Payment is loading — please wait a moment and try again.", "error");
      return;
    }
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!key) {
      show("Payment is not configured. Please contact support.", "error");
      return;
    }

    setPlacing(true);
    try {
      const ref = `ZIVA-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const handler = PaystackPop.setup({
        key,
        email,
        amount: total * 100,
        currency: "NGN",
        ref,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: name },
            { display_name: "Delivery Address", variable_name: "delivery_address", value: `${address}, ${city}, ${state}` },
            { display_name: "Phone", variable_name: "phone", value: phone },
          ],
        },
        callback: function (response: { reference: string }) {
          /* Save order fire-and-forget — don't block the success screen */
          fetch("/api/user/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              items,
              subtotal,
              shipping,
              total,
              customer: { name, email, phone },
              delivery: { address, city, state, notes, type: deliveryType },
            }),
          }).catch((err) => console.error("[checkout] order save error:", err));

          clearCart();
          setPlaced(true);
          setPlacing(false);
        },
        onClose: function () {
          setPlacing(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error("[checkout] Paystack error:", err);
      setPlacing(false);
      show("Failed to open payment. Please refresh and try again.", "error");
    }
  }

  const stepLabel = ["Contact", "Delivery"];

  return (
    <div className="container-ziva py-8 sm:py-12 lg:py-16">

      {/* Back link */}
      <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-ziva-muted hover:text-ziva-black transition-colors mb-8">
        <PiArrowLeft size={14} /> Back to Cart
      </Link>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10 max-w-xs">
        {stepLabel.map((label, i) => {
          const n = (i + 1) as 1 | 2;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-ziva-black text-white" :
                    active ? "bg-ziva-black text-ziva-cream" :
                      "bg-ziva-border text-ziva-muted"
                  }`}>
                  {done ? <PiCheck size={13} /> : n}
                </div>
                <span className={`text-[10px] tracking-widest uppercase ${active ? "text-ziva-black font-semibold" : "text-ziva-muted"}`}>
                  {label}
                </span>
              </div>
              {i < 1 && <div className={`flex-1 h-px mx-2 mb-4 ${step > n ? "bg-ziva-black" : "bg-ziva-border"}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-10 items-start">

        {/* ── Left: form steps ── */}
        <div className="border border-ziva-border p-6 sm:p-8 space-y-6">

          {/* Step 1 — Contact */}
          {step === 1 && (
            <>
              <h2 className="font-heading text-2xl font-semibold text-ziva-black">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Full Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Email Address *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Phone / WhatsApp *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000"
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors" />
                </div>
              </div>
              <button
                onClick={() => {
                  if (!name || !email || !phone) {
                    show("Please fill in all contact fields before continuing.", "error");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-4 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors"
              >
                Continue to Delivery <PiArrowRight size={14} />
              </button>
            </>
          )}

          {/* Step 2 — Delivery + Pay */}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-semibold text-ziva-black">Delivery Address</h2>
                <button onClick={() => setStep(1)} className="text-xs text-ziva-black hover:underline">Edit contact</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Street Address *</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no., street, area"
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">City *</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lagos"
                      className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">State *</label>
                    <select value={state} onChange={(e) => setState(e.target.value)}
                      className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors cursor-pointer">
                      <option value="">Select state…</option>
                      {["Lagos", "Abuja (FCT)", "Rivers", "Kano", "Oyo", "Delta", "Anambra", "Kaduna", "Enugu", "Imo", "Kwara", "Ogun", "Osun", "Ondo", "Ekiti", "Edo", "Benue", "Plateau", "Nasarawa", "Niger", "Kogi", "Taraba", "Adamawa", "Gombe", "Bauchi", "Yobe", "Borno", "Sokoto", "Kebbi", "Zamfara", "Jigawa", "Katsina", "Cross River", "Akwa Ibom", "Bayelsa", "Abia", "Ebonyi"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">
                    Delivery Notes <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    placeholder="Landmark, gate colour, or access instructions…"
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors resize-none" />
                </div>
              </div>

              {/* Delivery options — selectable */}
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    { key: "standard", icon: PiTruck, title: "Standard Delivery", body: "3–5 business days", fee: subtotal >= SHIPPING_THRESHOLD ? "FREE" : "₦3,500" },
                    { key: "sameday", icon: PiClock, title: "Lagos Same-Day", body: "Order before 12pm", fee: "₦5,000" },
                  ] as { key: "standard" | "sameday"; icon: typeof PiTruck; title: string; body: string; fee: string }[]
                ).map(({ key, icon: Icon, title, body, fee }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDeliveryType(key)}
                    className={`flex items-start gap-3 border p-3 text-left w-full transition-colors ${deliveryType === key
                        ? "border-ziva-black bg-ziva-cream/60"
                        : "border-ziva-border bg-ziva-cream/40 hover:border-ziva-black/40"
                      }`}
                  >
                    <Icon size={16} className="text-ziva-black shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-ziva-black">{title}</p>
                        {deliveryType === key && <PiCheck size={12} className="text-ziva-black shrink-0" />}
                      </div>
                      <p className="text-[11px] text-ziva-muted">{body} · {fee}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pay via Paystack */}
              <button
                onClick={() => {
                  if (!address || !city || !state) {
                    show("Please fill in your full delivery address before paying.", "error");
                    return;
                  }
                  handlePay();
                }}
                disabled={placing}
                className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-4 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
              >
                <PiLock size={14} />
                {placing ? "Opening Payment…" : `Pay Securely · ${fmt(total)}`}
              </button>

              <p className="text-center text-xs text-ziva-muted">
                Card · Bank Transfer · USSD — powered by Paystack
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-ziva-muted">
                <PiShield size={12} className="text-ziva-black" />
                Secured by 256-bit SSL encryption
              </div>
            </>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <div className="border border-ziva-border p-6 lg:sticky lg:top-28 space-y-4">
          <h2 className="font-heading text-lg font-semibold text-ziva-black">Order Summary</h2>
          <div className="h-px bg-ziva-border" />

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-14 h-16 shrink-0 bg-ziva-border overflow-hidden">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="56px" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ziva-black text-[9px] font-bold text-white flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ziva-black line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-ziva-muted">{item.selectedSize} · {item.selectedColor}</p>
                  {item.isCustomTailored && (
                    <p className="text-[10px] text-ziva-black">✂ Custom Tailored</p>
                  )}
                  <p className="text-xs font-semibold text-ziva-black mt-0.5">{fmt(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-ziva-border" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ziva-muted">
              <span>Subtotal</span>
              <span className="font-medium text-ziva-black">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ziva-muted">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-medium text-ziva-black"}>
                {shipping === 0 ? "FREE" : fmt(shipping)}
              </span>
            </div>
          </div>
          <div className="h-px bg-ziva-border" />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span><span>{fmt(total)}</span>
          </div>

          <div className="pt-1 space-y-1.5">
            {[
              { icon: PiTruck, text: "Free delivery on orders over ₦50,000" },
              { icon: PiShield, text: "Authentic Nigerian craftsmanship" },
              { icon: PiClock, text: "Custom orders: 10 business days" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-ziva-muted">
                <Icon size={11} className="text-ziva-black shrink-0" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
