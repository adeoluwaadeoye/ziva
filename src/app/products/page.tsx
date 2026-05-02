import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Shop All Products | ZIVA",
  description: "Browse our full collection of premium Nigerian fashion — Ankara, Aso-Oke, Agbada, Senator, Kaftan and more. Filter by gender, category and price.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-ziva py-20 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-ziva-muted">
            <div className="w-8 h-8 border-2 border-ziva-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm tracking-widest uppercase">Loading…</p>
          </div>
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
