"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Measurements, Product } from "@/types";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ── Cart ── */
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, fabric?: string, measurements?: Measurements) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  isInCart: (productId: string) => boolean;
  loadFromServer: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product, size, color, fabric, measurements) {
        const isCustom = !!measurements;
        if (!isCustom) {
          const existing = get().items.find(
            (i) => i.product.id === product.id && i.selectedSize === size && !i.isCustomTailored,
          );
          if (existing) {
            set((s) => ({
              items: s.items.map((i) =>
                i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            }));
            useNotificationStore.getState().show(`${product.name} quantity updated`);
            serverSyncCart(get().items);
            return;
          }
        }
        set((s) => ({
          items: [
            ...s.items,
            {
              id: uid(), product, quantity: 1,
              selectedSize: size, selectedColor: color,
              selectedFabric: fabric, measurements,
              isCustomTailored: isCustom,
            },
          ],
        }));
        useNotificationStore.getState().show(`${product.name} added to cart`);
        serverSyncCart(get().items);
      },

      removeItem(itemId) {
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
        serverSyncCart(get().items);
      },

      updateQuantity(itemId, qty) {
        if (qty < 1) { get().removeItem(itemId); return; }
        set((s) => ({
          items: s.items.map((i) => i.id === itemId ? { ...i, quantity: qty } : i),
        }));
        serverSyncCart(get().items);
      },

      clearCart() {
        set({ items: [] });
        serverSyncCart([]);
      },

      totalItems: () => get().items.reduce((a, i) => a + (i.product ? i.quantity : 0), 0),
      totalPrice: () => get().items.reduce((a, i) => a + (i.product ? i.product.price * i.quantity : 0), 0),
      isInCart: (productId) => get().items.some((i) => i.product && i.product.id === productId),

      async loadFromServer() {
        try {
          const res = await fetch("/api/user/cart");
          if (!res.ok) return;
          const data = await res.json();
          // Filter out flat mobile-format items (no nested product object)
          const valid = (data.items ?? []).filter(
            (i: CartItem) => i.product != null && typeof i.product.price === "number",
          );
          // Only overwrite local cart if the server has saved items — avoids
          // wiping a guest/pre-login cart on first Google sign-in.
          if (valid.length > 0) set({ items: valid });
        } catch { }
      },
    }),
    {
      name: "ziva-cart",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items.filter(
            (i) => i.product != null && typeof i.product.price === "number",
          );
        }
      },
    },
  ),
);

/* ── Wishlist ── */
interface WishlistStore {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clearIds: () => void;
  loadFromServer: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle(id) {
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        }));
        serverSyncWishlist(get().ids);
      },

      has: (id) => get().ids.includes(id),
      clearIds: () => set({ ids: [] }),

      async loadFromServer() {
        try {
          const res = await fetch("/api/user/wishlist");
          if (!res.ok) return;
          const data = await res.json();
          set({ ids: data.ids ?? [] });
        } catch { }
      },
    }),
    { name: "ziva-wishlist", skipHydration: true },
  ),
);

/* ── Notifications (toast) ── */
export interface ToastMsg {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  exiting?: boolean;
}

interface NotificationStore {
  toasts: ToastMsg[];
  show: (message: string, type?: ToastMsg["type"]) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  toasts: [],
  show(message, type = "success") {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t) }));
    }, 3150);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.map((t) => t.id === id ? { ...t, exiting: true } : t) }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 350);
  },
}));

/* ── Auth (client-side session) ── */
interface AuthStore {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  setUser: (user: AuthStore["user"], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser(user, token) {
        set({ user, token });
        // Restore this user's cart and wishlist from the server
        useCartStore.getState().loadFromServer();
        useWishlistStore.getState().loadFromServer();
      },
      logout() {
        // Clear local stores — server data is preserved for next login
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearIds();
        set({ user: null, token: null });
      },
    }),
    { name: "ziva-auth", skipHydration: true },
  ),
);

/* ── Server sync helpers (fire-and-forget) ── */
function serverSyncCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  if (!useAuthStore.getState().user) return;
  fetch("/api/user/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch(() => { });
}

function serverSyncWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  if (!useAuthStore.getState().user) return;
  fetch("/api/user/wishlist", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  }).catch(() => { });
}
