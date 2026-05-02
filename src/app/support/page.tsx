"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  PiSpinner, PiSignOut, PiArrowRight, PiUsersThree, PiEnvelope,
  PiCalendar, PiTrash, PiPencilSimple, PiCheck, PiX, PiMagnifyingGlass,
  PiShoppingBag, PiArrowLeft, PiPackage, PiCaretDown, PiCaretUp,
  PiChatCircleText, PiPaperPlaneTilt, PiCircle, PiCheckCircle, PiBell,
} from "react-icons/pi";

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface Order {
  id: string;
  reference: string;
  status: string;
  total: number;
  createdAt: string;
  items: { product: { name: string }; quantity: number }[];
}

interface ChatMessage {
  from: "customer" | "admin";
  text: string;
  timestamp: string;
}

interface AdminChat {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "open" | "closed";
  messages: ChatMessage[];
  unreadAdmin: number;
  createdAt: string;
  updatedAt: string;
}

async function checkAuth() {
  const r = await fetch("/api/admin/customers");
  return r.status !== 401;
}

export default function SupportPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [tab, setTab] = useState<"customers" | "chats">("customers");

  /* ── Customers ──────────────────────────────── */
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [custOrders, setCustOrders] = useState<Record<string, Order[]>>({});
  const [ordersLoading, setOrdersLoading] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ── Chats ──────────────────────────────────── */
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [activeChat, setActiveChat] = useState<AdminChat | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeChatRef = useRef<string | null>(null);
  const notifWrapRef = useRef<HTMLDivElement>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/customers");
      const data = await r.json();
      setCustomers(data.customers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChats = useCallback(async (showSpinner = true) => {
    if (showSpinner) setChatsLoading(true);
    try {
      const r = await fetch("/api/admin/chats");
      const data = await r.json();
      const fetched: AdminChat[] = data.chats ?? [];
      // Zero out unread for the currently open chat — admin is already reading it
      setChats(fetched.map((c) => c.id === activeChatRef.current ? { ...c, unreadAdmin: 0 } : c));
    } finally {
      if (showSpinner) setChatsLoading(false);
    }
  }, []);

  const refreshActiveChat = useCallback(async (chatId: string) => {
    const r = await fetch(`/api/admin/chats/${chatId}`);
    const data = await r.json();
    if (data.chat) {
      setActiveChat(data.chat);
      setChats((prev) => prev.map((c) => c.id === chatId ? { ...data.chat, unreadAdmin: 0 } : c));
    }
  }, []);

  /* ── Close notification panel on outside click ── */
  useEffect(() => {
    if (!notifOpen) return;
    function handleClick(e: MouseEvent) {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  useEffect(() => {
    checkAuth().then((ok) => {
      setAuthed(ok);
      if (ok) { loadCustomers(); loadChats(true); }
    }).catch(() => setAuthed(false));
  }, [loadCustomers, loadChats]);

  /* ── Auto-poll chat list every 5s to surface new unread messages ── */
  useEffect(() => {
    if (!authed) return;
    listPollRef.current = setInterval(() => loadChats(false), 5000);
    return () => { if (listPollRef.current) clearInterval(listPollRef.current); };
  }, [authed, loadChats]);

  /* Poll active chat every 5s */
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeChat || activeChat.status === "closed") return;
    pollRef.current = setInterval(() => refreshActiveChat(activeChat.id), 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id, refreshActiveChat]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeChat?.messages]);


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
    loadCustomers();
    loadChats(true);
    setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false); setCustomers([]); setChats([]); setPassword("");
  }

  async function expandCustomer(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (custOrders[id]) return;
    setOrdersLoading(id);
    try {
      const r = await fetch(`/api/admin/customers/${id}`);
      const data = await r.json();
      setCustOrders((prev) => ({ ...prev, [id]: data.orders ?? [] }));
    } finally {
      setOrdersLoading(null);
    }
  }

  function startEdit(c: Customer) {
    setEditId(c.id); setEditName(c.name); setEditEmail(c.email); setEditErr("");
  }

  async function handleSaveEdit() {
    if (!editName.trim() && !editEmail.trim()) return;
    setEditSaving(true); setEditErr("");
    const res = await fetch(`/api/admin/customers/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, email: editEmail }),
    });
    if (!res.ok) { setEditErr("Failed to save changes."); setEditSaving(false); return; }
    setCustomers((prev) => prev.map((c) =>
      c.id === editId ? { ...c, name: editName.trim() || c.name, email: editEmail.trim() || c.email } : c
    ));
    setEditId(null); setEditSaving(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (expanded === id) setExpanded(null);
    setDeletingId(null); setConfirmDel(null);
  }

  async function openChat(chat: AdminChat) {
    activeChatRef.current = chat.id;
    setNotifOpen(false);
    setActiveChat(chat);
    if (chat.unreadAdmin > 0) {
      await refreshActiveChat(chat.id);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;
    const text = replyText.trim();
    setReplyText("");
    setReplying(true);
    const r = await fetch(`/api/admin/chats/${activeChat.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await r.json();
    if (data.ok) {
      const newMsg: ChatMessage = { from: "admin", text, timestamp: new Date().toISOString() };
      setActiveChat((prev) => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
    }
    setReplying(false);
  }

  async function handleCloseChat(id: string) {
    await fetch(`/api/admin/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed" }),
    });
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, status: "closed" } : c));
    setActiveChat((prev) => prev?.id === id ? { ...prev, status: "closed" } : prev);
  }

  async function handleReopenChat(id: string) {
    await fetch(`/api/admin/chats/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "open" }),
    });
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, status: "open" } : c));
    setActiveChat((prev) => prev?.id === id ? { ...prev, status: "open" } : prev);
  }

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const filteredChats = useMemo(() => {
    const q = chatSearch.toLowerCase().trim();
    if (!q) return chats;
    return chats.filter(
      (c) => c.customerName.toLowerCase().includes(q) || c.customerEmail.toLowerCase().includes(q)
    );
  }, [chats, chatSearch]);

  const totalUnread = chats.reduce((s, c) => s + (c.unreadAdmin ?? 0), 0);
  const unreadChats = chats.filter((c) => (c.unreadAdmin ?? 0) > 0);

  /* ── Loading ──────────────────────────────── */
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream">
        <PiSpinner size={28} className="animate-spin-slow text-ziva-muted" />
      </div>
    );
  }

  /* ── Login gate ───────────────────────────── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-[0.15em] text-ziva-black">ZIVA</h1>
            <p className="text-xs text-ziva-muted mt-1.5 tracking-widest uppercase">Customer Support</p>
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
            <button type="submit" disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 bg-ziva-black text-ziva-cream py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
            >
              {loginLoading ? <PiSpinner size={14} className="animate-spin-slow" /> : <>Sign In <PiArrowRight size={13} /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ────────────────────────────── */
  return (
    <div className="min-h-screen bg-ziva-cream/30">

      {/* Top bar */}
      <div className="bg-linear-to-r from-ziva-black to-zinc-900 text-ziva-cream px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl font-semibold tracking-[0.15em]">ZIVA</span>
          <span className="text-[9px] text-ziva-cream/40 tracking-widest uppercase border-l border-ziva-cream/20 pl-3">Support</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/50 hover:text-ziva-cream transition-colors">
            <PiArrowLeft size={13} /> Orders
          </Link>
          <Link href="/admin/products" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/50 hover:text-ziva-cream transition-colors">
            <PiPackage size={13} /> Products
          </Link>

          {/* Notification bell */}
          <div className="relative" ref={notifWrapRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative flex items-center text-ziva-cream/50 hover:text-ziva-cream transition-colors p-1"
              title="Notifications"
            >
              <PiBell size={17} />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-ziva-border shadow-2xl z-50 rounded-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-ziva-border flex items-center justify-between bg-ziva-cream/30">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-ziva-black">Notifications</p>
                  {totalUnread > 0 && (
                    <span className="text-[9px] font-semibold text-red-500">{totalUnread} unread</span>
                  )}
                </div>
                {unreadChats.length === 0 ? (
                  <div className="py-10 text-center">
                    <PiBell size={20} className="text-ziva-muted mx-auto mb-2" />
                    <p className="text-xs text-ziva-muted">No new notifications</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-ziva-border/50">
                    {unreadChats.map((chat) => {
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      return (
                        <button
                          key={chat.id}
                          onClick={() => { setTab("chats"); openChat(chat); }}
                          className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-ziva-cream/40 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-ziva-black text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {chat.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-ziva-black leading-snug">
                              <span className="font-semibold">{chat.customerName}</span>{" "}
                              <span className="text-ziva-muted">messaged you</span>
                            </p>
                            {lastMsg && (
                              <p className="text-[9px] text-ziva-muted/70 mt-0.5">
                                {new Date(lastMsg.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {chat.unreadAdmin > 9 ? "9+" : chat.unreadAdmin}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-ziva-cream/50 hover:text-ziva-cream transition-colors">
            <PiSignOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Tab switcher */}
        <div className="flex items-center gap-0 border-b border-ziva-border">
          <button
            onClick={() => setTab("customers")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${tab === "customers" ? "border-ziva-black text-ziva-black" : "border-transparent text-ziva-muted hover:text-ziva-black"
              }`}
          >
            <PiUsersThree size={14} /> Customers
            <span className="text-[10px] text-ziva-muted">({customers.length})</span>
          </button>
          <button
            onClick={() => setTab("chats")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold border-b-2 -mb-px transition-colors ${tab === "chats" ? "border-ziva-black text-ziva-black" : "border-transparent text-ziva-muted hover:text-ziva-black"
              }`}
          >
            <PiChatCircleText size={14} /> Live Chats
            {totalUnread > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* ── Customers Tab ── */}
        {tab === "customers" && (
          <>
            {/* Header + search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-semibold text-ziva-black flex items-center gap-2">
                  <PiUsersThree size={22} /> Customers
                </h2>
                <p className="text-xs text-ziva-muted mt-1">{customers.length} registered accounts</p>
              </div>
              <div className="relative w-full sm:w-72">
                <PiMagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ziva-muted pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or email…"
                  className="w-full pl-9 pr-4 py-2.5 border border-ziva-border bg-white text-sm outline-none focus:border-ziva-black transition-colors"
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Customers", value: customers.length.toString() },
                { label: "Total Orders", value: customers.reduce((s, c) => s + c.orderCount, 0).toString() },
                { label: "Total Revenue", value: "₦" + customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString("en-NG") },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-ziva-border p-4">
                  <p className="text-[10px] tracking-widest uppercase text-ziva-muted font-semibold mb-1">{label}</p>
                  <p className="text-xl font-bold text-ziva-black font-heading">{value}</p>
                </div>
              ))}
            </div>

            {/* Customer list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <PiSpinner size={24} className="animate-spin-slow text-ziva-muted" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="bg-white border border-ziva-border p-12 text-center">
                <PiUsersThree size={28} className="text-ziva-muted mx-auto mb-3" />
                <p className="text-sm text-ziva-muted">{search ? "No customers match your search." : "No customers yet."}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((cust) => {
                  const isExpanded = expanded === cust.id;
                  const isEditing = editId === cust.id;
                  const isConfirming = confirmDel === cust.id;
                  const orders = custOrders[cust.id] ?? [];
                  const joinDate = new Date(cust.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  });

                  return (
                    <div key={cust.id} className="bg-white border border-ziva-border">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                        <div className="w-9 h-9 rounded-full bg-ziva-black flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 border border-ziva-border px-2.5 py-1.5 text-sm outline-none focus:border-ziva-black" placeholder="Name" />
                              <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                                className="flex-1 border border-ziva-border px-2.5 py-1.5 text-sm outline-none focus:border-ziva-black" placeholder="Email" />
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-ziva-black truncate">{cust.name}</p>
                              <p className="text-[11px] text-ziva-muted flex items-center gap-1">
                                <PiEnvelope size={10} /> {cust.email}
                              </p>
                            </>
                          )}
                          {editErr && isEditing && <p className="text-xs text-red-500 mt-1">{editErr}</p>}
                        </div>
                        <div className="hidden sm:flex items-center gap-6 shrink-0 text-center">
                          <div>
                            <p className="text-xs font-bold text-ziva-black">{cust.orderCount}</p>
                            <p className="text-[10px] text-ziva-muted">orders</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ziva-black">₦{cust.totalSpent.toLocaleString("en-NG")}</p>
                            <p className="text-[10px] text-ziva-muted">spent</p>
                          </div>
                          <div>
                            <p className="text-xs text-ziva-muted flex items-center gap-1">
                              <PiCalendar size={10} /> {joinDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isEditing ? (
                            <>
                              <button onClick={handleSaveEdit} disabled={editSaving}
                                className="w-8 h-8 flex items-center justify-center bg-ziva-black text-white hover:bg-zinc-800 transition-colors disabled:opacity-60">
                                {editSaving ? <PiSpinner size={12} className="animate-spin-slow" /> : <PiCheck size={13} />}
                              </button>
                              <button onClick={() => setEditId(null)}
                                className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-red-500 transition-colors">
                                <PiX size={13} />
                              </button>
                            </>
                          ) : isConfirming ? (
                            <>
                              <button onClick={() => handleDelete(cust.id)} disabled={deletingId === cust.id}
                                className="text-[10px] font-semibold text-red-600 hover:underline disabled:opacity-60">
                                {deletingId === cust.id ? <PiSpinner size={10} className="animate-spin-slow" /> : "Confirm delete"}
                              </button>
                              <button onClick={() => setConfirmDel(null)} className="text-[10px] text-ziva-muted hover:text-ziva-black">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(cust)}
                                className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-ziva-black hover:border-ziva-black transition-colors" title="Edit">
                                <PiPencilSimple size={13} />
                              </button>
                              <button onClick={() => setConfirmDel(cust.id)}
                                className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-red-500 hover:border-red-300 transition-colors" title="Delete">
                                <PiTrash size={13} />
                              </button>
                              <button onClick={() => expandCustomer(cust.id)}
                                className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-ziva-black hover:border-ziva-black transition-colors" title="View orders">
                                {isExpanded ? <PiCaretUp size={12} /> : <PiCaretDown size={12} />}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-ziva-border bg-ziva-cream/30 p-4">
                          <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-3">Order History</p>
                          {ordersLoading === cust.id ? (
                            <div className="flex items-center gap-2 py-4">
                              <PiSpinner size={14} className="animate-spin-slow text-ziva-muted" />
                              <span className="text-xs text-ziva-muted">Loading orders…</span>
                            </div>
                          ) : orders.length === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-ziva-muted py-2">
                              <PiShoppingBag size={14} /> No orders placed yet.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {orders.map((order) => (
                                <div key={order.id} className="bg-white border border-ziva-border p-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <PiPackage size={13} className="text-ziva-muted shrink-0" />
                                    <div>
                                      <p className="text-xs font-bold text-ziva-black font-mono">#{order.id}</p>
                                      <p className="text-[10px] text-ziva-muted">
                                        {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                                        {" · "}{order.items.reduce((s, i) => s + i.quantity, 0)} items
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className={`text-[9px] tracking-widest uppercase font-semibold px-2 py-0.5 border ${order.status === "delivered" ? "bg-green-50 text-green-700 border-green-200"
                                        : order.status === "shipped" ? "bg-purple-50 text-purple-700 border-purple-200"
                                          : order.status === "cancelled" ? "bg-red-50 text-red-500 border-red-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                      }`}>
                                      {order.status}
                                    </span>
                                    <span className="text-sm font-bold text-ziva-black">₦{order.total.toLocaleString("en-NG")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Chats Tab ── */}
        {tab === "chats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[calc(100vh-240px)]">

            {/* Chat list */}
            <div className="md:col-span-1 flex flex-col gap-3 md:overflow-hidden">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold text-ziva-black">Live Chats</h2>
                <button onClick={() => loadChats(true)} className="text-xs text-ziva-muted hover:text-ziva-black transition-colors">Refresh</button>
              </div>

              <div className="relative">
                <PiMagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ziva-muted pointer-events-none" />
                <input
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search chats…"
                  className="w-full pl-8 pr-4 py-2 border border-ziva-border bg-white text-sm outline-none focus:border-ziva-black transition-colors"
                />
              </div>

              {chatsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <PiSpinner size={20} className="animate-spin-slow text-ziva-muted" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="bg-white border border-ziva-border p-8 text-center">
                  <PiChatCircleText size={24} className="text-ziva-muted mx-auto mb-2" />
                  <p className="text-xs text-ziva-muted">No customer chats yet.</p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
                  {filteredChats.map((chat) => {
                    const isActive = activeChat?.id === chat.id;
                    const lastMsg = chat.messages[chat.messages.length - 1];
                    const timeAgo = lastMsg
                      ? new Date(lastMsg.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                      : "";
                    return (
                      <button
                        key={chat.id}
                        onClick={() => openChat(chat)}
                        className={`w-full text-left p-3 border transition-colors ${isActive
                            ? "bg-ziva-black text-white border-ziva-black"
                            : "bg-white border-ziva-border hover:border-ziva-black"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? "bg-white text-ziva-black" : "bg-ziva-black text-white"}`}>
                              {chat.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-ziva-black"}`}>
                                {chat.customerName}
                              </p>
                              <p className={`text-[10px] truncate ${isActive ? "text-white/60" : "text-ziva-muted"}`}>
                                {lastMsg?.text ?? "No messages"}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`text-[9px] ${isActive ? "text-white/50" : "text-ziva-muted"}`}>{timeAgo}</span>
                            {chat.unreadAdmin > 0 && (
                              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                                {chat.unreadAdmin}
                              </span>
                            )}
                            {chat.status === "closed" && (
                              <span className={`text-[8px] font-semibold tracking-widest uppercase ${isActive ? "text-white/50" : "text-ziva-muted"}`}>closed</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat window */}
            <div className="md:col-span-2 bg-white border border-ziva-border flex flex-col overflow-hidden h-[65vh] md:h-auto">
              {!activeChat ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <PiChatCircleText size={32} className="text-ziva-muted mx-auto mb-3" />
                    <p className="text-sm text-ziva-muted">Select a chat to view the conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="px-5 py-4 border-b border-ziva-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-ziva-black flex items-center justify-center text-sm font-bold text-white">
                        {activeChat.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ziva-black">{activeChat.customerName}</p>
                        {activeChat.customerEmail && (
                          <p className="text-[10px] text-ziva-muted">{activeChat.customerEmail}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 border ${activeChat.status === "open"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                        }`}>
                        {activeChat.status === "open" ? <PiCircle size={8} /> : <PiCheckCircle size={8} />}
                        {activeChat.status}
                      </span>
                      {activeChat.status === "open" ? (
                        <button
                          onClick={() => handleCloseChat(activeChat.id)}
                          className="text-[10px] font-semibold text-ziva-muted hover:text-red-500 border border-ziva-border hover:border-red-300 px-2.5 py-1 transition-colors"
                        >
                          Close Chat
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopenChat(activeChat.id)}
                          className="text-[10px] font-semibold text-ziva-muted hover:text-ziva-black border border-ziva-border hover:border-ziva-black px-2.5 py-1 transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3 bg-ziva-cream/10">
                    {activeChat.messages.length === 0 && (
                      <p className="text-xs text-ziva-muted text-center py-8">No messages yet.</p>
                    )}
                    {activeChat.messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 text-xs leading-relaxed ${msg.from === "admin"
                            ? "bg-ziva-black text-white rounded-2xl rounded-br-sm"
                            : "bg-white border border-ziva-border text-ziva-black rounded-2xl rounded-bl-sm shadow-sm"
                          }`}>
                          {msg.from === "customer" && (
                            <p className="text-[9px] font-semibold tracking-widest uppercase text-ziva-muted mb-1">{activeChat.customerName}</p>
                          )}
                          {msg.text}
                          <p className={`text-[9px] mt-1.5 ${msg.from === "admin" ? "text-white/40" : "text-ziva-muted"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply input */}
                  {activeChat.status === "open" ? (
                    <form onSubmit={handleReply} className="flex items-center gap-2 p-4 border-t border-ziva-border bg-white shrink-0">
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to customer…"
                        className="flex-1 border border-ziva-border px-3 py-2.5 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30"
                      />
                      <button
                        type="submit"
                        disabled={replying || !replyText.trim()}
                        className="flex items-center gap-2 bg-ziva-black text-white px-4 py-2.5 text-xs font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-40"
                      >
                        {replying ? <PiSpinner size={13} className="animate-spin-slow" /> : <PiPaperPlaneTilt size={13} />}
                        Send
                      </button>
                    </form>
                  ) : (
                    <div className="px-4 py-3 border-t border-ziva-border bg-zinc-50 text-center">
                      <p className="text-xs text-ziva-muted">This chat is closed. Reopen to reply.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
