"use client";

import { useState, useEffect, useMemo, useRef, Fragment } from "react";
import Link from "next/link";
import {
  PiSpinner, PiSignOut, PiArrowRight, PiPlus, PiPencilSimple,
  PiTrash, PiCheck, PiX, PiPackage, PiArrowLeft, PiUsersThree,
  PiMagnifyingGlass, PiFunnel, PiList, PiSquaresFour, PiCaretDown,
} from "react-icons/pi";
import type { Product, Gender, Category } from "@/types";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "ankara", label: "Ankara" },
  { value: "aso-oke", label: "Aso-Oke" },
  { value: "kaftan", label: "Kaftan" },
  { value: "gown", label: "Gown" },
  { value: "cord", label: "Cord Set" },
  { value: "adire", label: "Adire" },
  { value: "agbada", label: "Agbada" },
  { value: "senator", label: "Senator" },
  { value: "dashiki", label: "Dashiki" },
  { value: "native-shirt", label: "Native Shirt" },
  { value: "linen", label: "Linen" },
];

type ProductForm = {
  name: string; price: string; originalPrice: string;
  gender: Gender; category: Category; description: string;
  sizes: string; colors: string; fabrics: string; images: string;
  isNew: boolean; isSale: boolean; isFeatured: boolean; inStock: boolean;
};

const BLANK: ProductForm = {
  name: "", price: "", originalPrice: "", gender: "women", category: "ankara",
  description: "", sizes: "", colors: "", fabrics: "", images: "",
  isNew: false, isSale: false, isFeatured: false, inStock: true,
};

function EditForm({
  form, setForm, saving, formErr, editProd, onSave, onCancel,
}: {
  form: ProductForm;
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>;
  saving: boolean;
  formErr: string;
  editProd: Product | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white border border-ziva-black p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-ziva-black">
          {editProd ? `Editing — ${editProd.name}` : "New Product"}
        </h3>
        <button onClick={onCancel} className="text-ziva-muted hover:text-ziva-black transition-colors">
          <PiX size={18} />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Product Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="e.g. Adunola Ankara Wrap Dress"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Gender *</label>
          <select
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30 appearance-none"
          >
            {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Price (NGN) *</label>
          <input
            type="number" value={form.price} min="0"
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="28500"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Original Price (if on sale)</label>
          <input
            type="number" value={form.originalPrice} min="0"
            onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="35000"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30 appearance-none"
          >
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Description</label>
          <textarea
            value={form.description} rows={2}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30 resize-none"
            placeholder="Describe the product…"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Sizes (comma-separated)</label>
          <input
            value={form.sizes}
            onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="S, M, L, XL, 2XL"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Colors (comma-separated)</label>
          <input
            value={form.colors}
            onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="Champagne Gold, Royal Purple"
          />
        </div>

        <div>
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">Fabrics (optional)</label>
          <input
            value={form.fabrics}
            onChange={(e) => setForm((f) => ({ ...f, fabrics: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
            placeholder="Lace, Silk, Cotton"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted block mb-1">
            Image URLs * <span className="normal-case font-normal">(one URL per line — first is the main image)</span>
          </label>
          <textarea
            value={form.images} rows={3}
            onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
            className="w-full border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30 resize-none font-mono"
            placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-5">
          {([
            ["isNew", "New Arrival"],
            ["isSale", "On Sale"],
            ["isFeatured", "Featured"],
            ["inStock", "In Stock"],
          ] as [keyof ProductForm, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${form[key] ? "bg-ziva-black" : "bg-ziva-border"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-ziva-black">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {formErr && <p className="text-xs text-red-500">{formErr}</p>}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-ziva-black text-ziva-cream px-6 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
        >
          {saving ? <PiSpinner size={13} className="animate-spin-slow" /> : <PiCheck size={13} />}
          {editProd ? "Save Changes" : "Create Product"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 border border-ziva-border text-xs text-ziva-muted hover:text-ziva-black hover:border-ziva-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

async function checkAuth() {
  const r = await fetch("/api/admin/products");
  return r.status !== 401;
}

export default function AdminProductsPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [prods, setProds] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<ProductForm>(BLANK);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  /* ── Search / filter / sort / view ── */
  const [searchQ, setSearchQ] = useState("");
  const [filterGender, setFilterGender] = useState<"" | "women" | "men" | "unisex">("");
  const [filterStock, setFilterStock] = useState<"" | "in" | "out">("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const addFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth().then((ok) => {
      setAuthed(ok);
      if (ok) loadProducts();
    }).catch(() => setAuthed(false));
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/products");
      const data = await r.json();
      setProds(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true); setLoginErr("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setLoginErr("Incorrect password"); setLoginLoading(false); return; }
    setAuthed(true);
    loadProducts();
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false); setProds([]); setPassword("");
  }

  async function handleSave() {
    const images = form.images.split("\n").map((u) => u.trim()).filter(Boolean);
    if (!form.name.trim() || !form.price || !images.length) {
      setFormErr("Name, price, and at least one image URL are required.");
      return;
    }
    setSaving(true); setFormErr("");

    const body = {
      name: form.name.trim(),
      price: Number(form.price),
      gender: form.gender,
      category: form.category,
      description: form.description.trim(),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      fabrics: form.fabrics.split(",").map((s) => s.trim()).filter(Boolean),
      images,
      image: images[0],
      isNew: form.isNew,
      isSale: form.isSale,
      isFeatured: form.isFeatured,
      inStock: form.inStock,
      ...(form.originalPrice ? { originalPrice: Number(form.originalPrice) } : {}),
    };

    const wasEditing = !!editProd;

    if (editProd) {
      await fetch(`/api/admin/products/${editProd.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setProds((prev) => prev.map((p) => p.id === editProd.id ? { ...p, ...body } as Product : p));
    } else {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.product) setProds((prev) => [data.product, ...prev]);
    }

    cancelForm();
    setSaving(false);
    const msg = wasEditing ? "Product updated successfully" : "Product created successfully";
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3500);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProds((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
    setConfirmDel(null);
  }

  async function toggleStock(prod: Product) {
    setTogglingId(prod.id);
    await fetch(`/api/admin/products/${prod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !prod.inStock }),
    });
    setProds((prev) => prev.map((p) => p.id === prod.id ? { ...p, inStock: !prod.inStock } : p));
    setTogglingId(null);
  }

  function startEdit(prod: Product) {
    if (viewMode === "grid") setViewMode("list");
    setEditProd(prod);
    setShowAdd(false);
    setFormErr("");
    setForm({
      name: prod.name,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice?.toString() ?? "",
      gender: prod.gender,
      category: prod.category,
      description: prod.description,
      sizes: prod.sizes.join(", "),
      colors: prod.colors.join(", "),
      fabrics: prod.fabrics?.join(", ") ?? "",
      images: prod.images.join("\n"),
      isNew: !!prod.isNew,
      isSale: !!prod.isSale,
      isFeatured: !!prod.isFeatured,
      inStock: prod.inStock,
    });
  }

  function cancelForm() {
    setEditProd(null);
    setShowAdd(false);
    setForm(BLANK);
    setFormErr("");
  }

  function openAdd() {
    setShowAdd(true);
    setEditProd(null);
    setForm(BLANK);
    setFormErr("");
    setTimeout(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  const filteredProds = useMemo(() => {
    let list = [...prods];
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (filterGender) list = list.filter((p) => p.gender === filterGender);
    if (filterStock === "in") list = list.filter((p) => p.inStock);
    if (filterStock === "out") list = list.filter((p) => !p.inStock);
    switch (sortBy) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      default: list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [prods, searchQ, filterGender, filterStock, sortBy]);

  const activeFilterCount = [filterGender, filterStock].filter(Boolean).length;

  /* ── Auth loading ── */
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream">
        <PiSpinner size={28} className="animate-spin-slow text-ziva-muted" />
      </div>
    );
  }

  /* ── Login gate ── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-[0.15em] text-ziva-black">ZIVA</h1>
            <p className="text-xs text-ziva-muted mt-1.5 tracking-widest uppercase">Product Management</p>
          </div>
          <form onSubmit={handleLogin} className="border border-ziva-border bg-white p-8 space-y-5">
            <div>
              <label className="block text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-2">
                Admin Password
              </label>
              <input
                type="password" value={password} autoFocus required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-ziva-border px-4 py-3 text-sm outline-none focus:border-ziva-black transition-colors bg-ziva-cream/40"
              />
            </div>
            {loginErr && <p className="text-xs text-red-500">{loginErr}</p>}
            <button
              type="submit" disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loginLoading ? <PiSpinner size={14} className="animate-spin-slow" /> : <>Sign In <PiArrowRight size={13} /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-ziva-cream/30">

      {/* Top bar */}
      <div className="bg-ziva-black text-ziva-cream px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl font-semibold tracking-[0.15em]">ZIVA</span>
          <span className="text-[9px] text-ziva-cream/40 tracking-widest uppercase border-l border-ziva-cream/20 pl-3">Products</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/80 hover:text-ziva-cream transition-colors">
            <PiArrowLeft size={13} /> Orders
          </Link>
          <Link href="/support" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/80 hover:text-ziva-cream transition-colors">
            <PiUsersThree size={13} /> Support
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-ziva-cream/80 hover:text-ziva-cream transition-colors"
          >
            <PiSignOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-ziva-black">Product Catalogue</h2>
            <p className="text-xs text-ziva-muted mt-1">{prods.length} products · changes appear immediately on the store</p>
          </div>
          {!showAdd && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-ziva-black text-ziva-cream px-5 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors"
            >
              <PiPlus size={13} /> Add Product
            </button>
          )}
        </div>

        {/* Add form (top, for new products) */}
        {showAdd && (
          <div ref={addFormRef}>
            <EditForm
              form={form} setForm={setForm} saving={saving} formErr={formErr}
              editProd={null} onSave={handleSave} onCancel={cancelForm}
            />
          </div>
        )}

        {/* Search + filter toolbar */}
        {!loading && prods.length > 0 && (
          <div className="bg-white border border-ziva-border">
            {/* Search row */}
            <div className="flex items-center gap-2 p-3 border-b border-ziva-border">
              <div className="relative flex-1">
                <PiMagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ziva-muted pointer-events-none" />
                <input
                  type="search" value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search by name or category…"
                  className="w-full pl-9 pr-4 py-2 border border-ziva-border text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black bg-ziva-cream/30 transition-colors"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ziva-muted hover:text-ziva-black">
                    <PiX size={13} />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-ziva-border shrink-0">
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-ziva-black text-white" : "text-ziva-muted hover:text-ziva-black"}`}
                  title="List view"
                >
                  <PiList size={15} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-ziva-black text-white" : "text-ziva-muted hover:text-ziva-black"}`}
                  title="Grid view"
                >
                  <PiSquaresFour size={15} />
                </button>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border transition-colors shrink-0 ${filtersOpen || activeFilterCount > 0
                    ? "bg-ziva-black text-white border-ziva-black"
                    : "border-ziva-border text-ziva-muted hover:border-ziva-black hover:text-ziva-black"
                  }`}
              >
                <PiFunnel size={13} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-ziva-black text-[9px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <PiCaretDown size={11} className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Collapsible filter row */}
            <div className={`overflow-hidden transition-all duration-200 ${filtersOpen ? "max-h-32" : "max-h-0"}`}>
              <div className="px-3 py-3 flex flex-wrap items-center gap-3 border-b border-ziva-border">
                {/* Gender filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-ziva-muted uppercase tracking-widest mr-1">Gender:</span>
                  {([["", "All"], ["women", "Women"], ["men", "Men"]] as const).map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setFilterGender(val as "" | "women" | "men")}
                      className={`text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 border transition-colors ${filterGender === val
                          ? "bg-ziva-black text-white border-ziva-black"
                          : "text-ziva-muted border-ziva-border hover:border-ziva-black hover:text-ziva-black"
                        }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <span className="text-ziva-border hidden sm:inline">|</span>

                {/* Stock filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-ziva-muted uppercase tracking-widest mr-1">Stock:</span>
                  {([["", "All"], ["in", "In Stock"], ["out", "Out"]] as const).map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setFilterStock(val as "" | "in" | "out")}
                      className={`text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1 border transition-colors ${filterStock === val
                          ? "bg-ziva-black text-white border-ziva-black"
                          : "text-ziva-muted border-ziva-border hover:border-ziva-black hover:text-ziva-black"
                        }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <span className="text-ziva-border hidden sm:inline">|</span>

                {/* Sort */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-ziva-muted uppercase tracking-widest">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "price-asc" | "price-desc")}
                    className="border border-ziva-border text-xs px-2.5 py-1 outline-none focus:border-ziva-black bg-ziva-cream/30 text-ziva-black appearance-none cursor-pointer"
                  >
                    <option value="name">Name A–Z</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                  </select>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterGender(""); setFilterStock(""); }}
                    className="text-[10px] text-ziva-muted hover:text-ziva-black underline underline-offset-2 ml-auto"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            <div className="px-3 py-2">
              <p className="text-[10px] text-ziva-muted">
                {filteredProds.length} of {prods.length} products
              </p>
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <PiSpinner size={24} className="animate-spin-slow text-ziva-muted" />
          </div>
        ) : prods.length === 0 ? (
          <div className="bg-white border border-ziva-border p-12 text-center">
            <PiPackage size={28} className="text-ziva-muted mx-auto mb-3" />
            <p className="text-sm text-ziva-muted">No products yet. Add your first product above.</p>
          </div>
        ) : filteredProds.length === 0 ? (
          <div className="bg-white border border-ziva-border p-10 text-center">
            <p className="text-sm text-ziva-muted">No products match your search or filters.</p>
            <button
              onClick={() => { setSearchQ(""); setFilterGender(""); setFilterStock(""); }}
              className="mt-3 text-xs text-ziva-black underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === "list" ? (

          /* ── List view ── */
          <div className="space-y-0 border border-ziva-border divide-y divide-ziva-border">
            {filteredProds.map((prod) => {
              const isConfirmingDel = confirmDel === prod.id;
              const isEditing = editProd?.id === prod.id;
              return (
                <Fragment key={prod.id}>
                  <div className={`bg-white p-4 flex items-center gap-4 transition-colors ${isEditing ? "bg-ziva-cream/60" : ""}`}>
                    {/* Image */}
                    <div className="w-14 h-16 bg-ziva-cream border border-ziva-border shrink-0 overflow-hidden">
                      {prod.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PiPackage size={20} className="text-ziva-muted" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ziva-black truncate">{prod.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] tracking-widest uppercase text-ziva-muted">{prod.category}</span>
                        <span className="text-ziva-border">·</span>
                        <span className="text-[10px] text-ziva-muted capitalize">{prod.gender}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-sm font-bold text-ziva-black">₦{prod.price.toLocaleString("en-NG")}</p>
                      {prod.originalPrice && (
                        <p className="text-[10px] text-ziva-muted line-through">₦{prod.originalPrice.toLocaleString("en-NG")}</p>
                      )}
                    </div>

                    {/* Stock toggle */}
                    <div className="shrink-0">
                      <button
                        onClick={() => toggleStock(prod)}
                        disabled={togglingId === prod.id}
                        className={`text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border transition-colors disabled:opacity-60 ${prod.inStock
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                          }`}
                      >
                        {togglingId === prod.id
                          ? <PiSpinner size={10} className="animate-spin-slow" />
                          : prod.inStock ? "In Stock" : "Out of Stock"
                        }
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isConfirmingDel ? (
                        <>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            disabled={deletingId === prod.id}
                            className="text-[10px] font-semibold text-red-600 hover:underline disabled:opacity-60"
                          >
                            {deletingId === prod.id ? <PiSpinner size={10} className="animate-spin-slow" /> : "Confirm"}
                          </button>
                          <button onClick={() => setConfirmDel(null)} className="text-[10px] text-ziva-muted hover:text-ziva-black">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => isEditing ? cancelForm() : startEdit(prod)}
                            className={`w-8 h-8 flex items-center justify-center border transition-colors ${isEditing
                                ? "border-ziva-black bg-ziva-black text-white"
                                : "border-ziva-border text-ziva-muted hover:text-ziva-black hover:border-ziva-black"
                              }`}
                            title={isEditing ? "Close edit" : "Edit"}
                          >
                            {isEditing ? <PiX size={13} /> : <PiPencilSimple size={13} />}
                          </button>
                          <button
                            onClick={() => setConfirmDel(prod.id)}
                            className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-red-500 hover:border-red-300 transition-colors"
                            title="Delete"
                          >
                            <PiTrash size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div className="border-t border-ziva-black">
                      <EditForm
                        form={form} setForm={setForm} saving={saving} formErr={formErr}
                        editProd={editProd} onSave={handleSave} onCancel={cancelForm}
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

        ) : (

          /* ── Grid view ── */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProds.map((prod) => {
              const isConfirmingDel = confirmDel === prod.id;
              return (
                <div key={prod.id} className="bg-white border border-ziva-border overflow-hidden group">
                  <div className="relative aspect-3/4 overflow-hidden bg-ziva-cream">
                    {prod.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PiPackage size={28} className="text-ziva-muted" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 ${prod.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                      {prod.inStock ? "In Stock" : "Sold Out"}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-semibold text-ziva-black line-clamp-1">{prod.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-widest uppercase text-ziva-muted">{prod.category}</span>
                      <span className="text-ziva-border">·</span>
                      <span className="text-[10px] text-ziva-muted capitalize">{prod.gender}</span>
                    </div>
                    <p className="text-sm font-bold text-ziva-black">₦{prod.price.toLocaleString("en-NG")}</p>
                    <div className="flex items-center gap-1.5 pt-1 border-t border-ziva-border">
                      <button
                        onClick={() => toggleStock(prod)}
                        disabled={togglingId === prod.id}
                        className={`flex-1 text-[9px] font-semibold tracking-widest uppercase py-1.5 border transition-colors disabled:opacity-60 ${prod.inStock
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                          }`}
                      >
                        {togglingId === prod.id ? <PiSpinner size={9} className="animate-spin-slow mx-auto" /> : prod.inStock ? "In Stock" : "Out of Stock"}
                      </button>
                      {isConfirmingDel ? (
                        <>
                          <button onClick={() => handleDelete(prod.id)} disabled={deletingId === prod.id} className="text-[9px] text-red-600 font-semibold">
                            {deletingId === prod.id ? <PiSpinner size={9} className="animate-spin-slow" /> : "✓"}
                          </button>
                          <button onClick={() => setConfirmDel(null)} className="text-[9px] text-ziva-muted">✕</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(prod)}
                            className="w-7 h-7 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-ziva-black hover:border-ziva-black transition-colors"
                            title="Edit (switches to list view)"
                          >
                            <PiPencilSimple size={12} />
                          </button>
                          <button
                            onClick={() => setConfirmDel(prod.id)}
                            className="w-7 h-7 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-red-500 hover:border-red-300 transition-colors"
                            title="Delete"
                          >
                            <PiTrash size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {saveMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-green-600 text-white px-5 py-3 text-sm font-semibold shadow-xl">
          <PiCheck size={16} />
          {saveMsg}
        </div>
      )}
    </div>
  );
}
