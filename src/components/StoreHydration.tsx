"use client";

import { useEffect } from "react";
import { useCartStore, useWishlistStore, useAuthStore } from "@/lib/store";

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
    // If user was already logged in (restored from localStorage),
    // load their latest cart and wishlist from the server
    if (useAuthStore.getState().user) {
      useCartStore.getState().loadFromServer();
      useWishlistStore.getState().loadFromServer();
    }
  }, []);

  return null;
}
