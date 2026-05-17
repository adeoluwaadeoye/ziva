"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PiUser, PiEnvelope, PiCalendar, PiPencilSimple, PiCheck, PiX,
  PiSignOut, PiShoppingBag, PiHeart, PiSpinner, PiArrowRight, PiTrash,
  PiPackage, PiDownload,
} from "react-icons/pi";
import { useAuthStore, useCartStore, useWishlistStore, useNotificationStore } from "@/lib/store";

export default function AccountPage() {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const show = useNotificationStore((s) => s.show);

  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  type Order = {
    id: string; reference: string; status: string; total: number;
    subtotal: number; shipping: number; createdAt: string;
    items: { name: string; image: string; quantity: number; selectedSize: string }[];
    customer: { name: string; email: string; phone: string };
    delivery: { address: string; city: string; state: string; notes: string };
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) router.replace("/auth");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => { })
      .finally(() => setOrdersLoading(false));
  }, [user]);


  if (!user) return null;

  async function handleSaveName() {
    if (!nameVal.trim()) return;
    setSaving(true); setSaveErr("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameVal.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveErr(data.error); return; }
      setUser(data.user, token!);
      setEditing(false);
      show("Profile updated successfully");
    } catch {
      setSaveErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/me", { method: "DELETE" });
    show("You've been signed out", "info");
    logout();
    router.push("/");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    await fetch("/api/auth/account", { method: "DELETE" });
    logout();
    router.push("/");
  }

  const joinedDate = user && "createdAt" in user
    ? new Date((user as { createdAt?: string }).createdAt ?? "").toLocaleDateString("en-NG", {
      day: "numeric", month: "long", year: "numeric",
    })
    : null;

  return (
    <div className="container-ziva py-10 lg:py-16">

      {/* Header */}
      <div className="mb-10">
        <span className="gold-line mb-3 block" />
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-ziva-black">My Account</h1>
        <p className="text-sm text-ziva-muted mt-1">Manage your profile and preferences</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-12">

        {/* ── Sidebar ── */}
        <div className="space-y-3">
          {/* Avatar — horizontal on mobile, vertical on desktop */}
          <div className="flex lg:flex-col items-center lg:items-center gap-4 lg:gap-0 py-5 lg:py-8 px-5 lg:px-0 border border-ziva-border bg-ziva-cream/30">
            <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-full bg-ziva-black flex items-center justify-center text-xl lg:text-2xl font-bold text-white shrink-0 lg:mb-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="lg:text-center min-w-0">
              <p className="font-semibold text-ziva-black truncate">{user.name}</p>
              <p className="text-xs text-ziva-muted truncate">{user.email}</p>
              {joinedDate && (
                <p className="text-[10px] text-ziva-muted mt-1">Joined {joinedDate}</p>
              )}
            </div>
          </div>

          {/* Quick links — horizontal scroll on mobile */}
          <div className="flex lg:flex-col lg:divide-y lg:divide-ziva-border border border-ziva-border overflow-x-auto lg:overflow-visible">
            {[
              { href: "/cart", icon: PiShoppingBag, label: "Cart", badge: cartCount },
              { href: "/wishlist", icon: PiHeart, label: "Wishlist", badge: wishlistCount },
              { href: "/products", icon: PiArrowRight, label: "Shop", badge: 0 },
            ].map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between px-4 py-3 lg:py-3.5 text-sm text-ziva-black hover:bg-ziva-cream/50 transition-colors shrink-0 lg:shrink border-r lg:border-r-0 border-ziva-border last:border-r-0"
              >
                <div className="flex items-center gap-2 lg:gap-3 whitespace-nowrap">
                  <Icon size={15} className="text-ziva-muted" />
                  {label}
                </div>
                {badge > 0 && (
                  <span className="ml-2 w-5 h-5 rounded-full bg-ziva-black text-white text-[10px] font-bold flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-500 hover:bg-red-50 transition-colors text-sm disabled:opacity-60"
          >
            {loggingOut ? <PiSpinner size={14} className="animate-spin-slow" /> : <PiSignOut size={14} />}
            Sign Out
          </button>
        </div>

        {/* ── Main ── */}
        <div className="space-y-6">

          {/* Profile card */}
          <div className="border border-ziva-border p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-ziva-black">Profile Details</h2>
              {!editing && (
                <button
                  onClick={() => { setEditing(true); setNameVal(user.name); setSaveErr(""); }}
                  className="flex items-center gap-1.5 text-xs text-ziva-black hover:underline underline-offset-2"
                >
                  <PiPencilSimple size={12} /> Edit
                </button>
              )}
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-black/10 border border-black/30 flex items-center justify-center shrink-0 mt-0.5">
                  <PiUser size={14} className="text-ziva-black" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-widest uppercase text-ziva-muted mb-1 font-semibold">Full Name</p>
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        value={nameVal}
                        onChange={(e) => setNameVal(e.target.value)}
                        className="flex-1 border border-ziva-border bg-ziva-cream/50 px-3 py-2 text-sm text-ziva-black outline-none focus:border-ziva-black transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="w-9 h-9 flex items-center justify-center bg-ziva-black text-white hover:bg-black/70 hover:text-white transition-colors"
                        aria-label="Save"
                      >
                        {saving ? <PiSpinner size={13} className="animate-spin-slow" /> : <PiCheck size={14} />}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setNameVal(user.name); setSaveErr(""); }}
                        className="w-9 h-9 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-red-500 transition-colors"
                        aria-label="Cancel"
                      >
                        <PiX size={14} />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-ziva-black">{user.name}</p>
                  )}
                  {saveErr && <p className="text-red-500 text-xs mt-1">{saveErr}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-black/10 border border-black/30 flex items-center justify-center shrink-0 mt-0.5">
                  <PiEnvelope size={14} className="text-ziva-black" />
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-ziva-muted mb-1 font-semibold">Email Address</p>
                  <p className="text-sm text-ziva-black">{user.email}</p>
                </div>
              </div>

              {/* Joined */}
              {joinedDate && (
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-black/10 border border-black/30 flex items-center justify-center shrink-0 mt-0.5">
                    <PiCalendar size={14} className="text-ziva-black" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-ziva-muted mb-1 font-semibold">Member Since</p>
                    <p className="text-sm text-ziva-black">{joinedDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="border border-ziva-border p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ziva-black mb-6">Order History</h2>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-10">
                <PiSpinner size={22} className="animate-spin-slow text-ziva-muted" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 border-2 border-dashed border-ziva-border rounded-full flex items-center justify-center mb-4">
                  <PiShoppingBag size={22} className="text-ziva-muted" />
                </div>
                <p className="text-sm font-medium text-ziva-black mb-1">No orders yet</p>
                <p className="text-xs text-ziva-muted max-w-xs mb-5">
                  Your completed orders will appear here. Start exploring our collection.
                </p>
                <Link href="/products" className="btn-primary text-xs">
                  Shop Now <PiArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-130 overflow-y-auto pr-1">
                {orders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  });
                  const itemCount = order.items.reduce((a, i) => a + i.quantity, 0);
                  return (
                    <div key={order.id} className="border border-ziva-border p-4 space-y-3">
                      {/* Order header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <PiPackage size={15} className="text-ziva-muted shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-ziva-black tracking-wider">#{order.id}</p>
                            <p className="text-[10px] text-ziva-muted">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200">
                            {order.status}
                          </span>
                          <span className="text-sm font-bold text-ziva-black">
                            ₦{order.total.toLocaleString("en-NG")}
                          </span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="relative w-9 h-10 border-2 border-white overflow-hidden bg-ziva-border shrink-0"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-ziva-muted">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                          {order.items.length > 4 && ` · +${order.items.length - 4} more`}
                        </p>
                      </div>

                      {/* Delivery address */}
                      <p className="text-[10px] text-ziva-muted leading-relaxed">
                        {order.delivery.address}, {order.delivery.city}, {order.delivery.state}
                      </p>

                      {/* Invoice download */}
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `/api/user/orders/${order.id}/invoice`;
                          link.download = `ZIVA-Invoice-${order.id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] text-ziva-muted hover:text-ziva-black transition-colors pt-0.5"
                      >
                        <PiDownload size={11} /> Download Invoice
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="border border-red-200 p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-ziva-muted mb-5">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-500 text-sm hover:bg-red-50 transition-colors"
              >
                <PiTrash size={14} /> Delete My Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-red-600">Are you absolutely sure? This cannot be reversed.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
                  >
                    {deleting ? <PiSpinner size={13} className="animate-spin-slow" /> : <PiTrash size={13} />}
                    Yes, delete permanently
                  </button>
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="px-5 py-2.5 border border-ziva-border text-ziva-muted text-sm hover:border-ziva-black hover:text-ziva-black transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
