"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  PiPackage, PiSpinner, PiSignOut, PiCaretDown, PiCaretUp,
  PiScissors, PiTruck, PiArrowRight, PiDownload, PiUsersThree,
  PiChartBar, PiBell, PiCheckSquare, PiCalendar, PiDevices,
  PiPlus, PiTrash, PiCheck, PiCaretLeft, PiCaretRight, PiX,
  PiChatCircleText,
} from "react-icons/pi";

type Status = "paid" | "processing" | "shipped" | "delivered" | "cancelled";
const ALL_STATUSES: Status[] = ["paid", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLE: Record<Status, string> = {
  paid: "bg-amber-50 text-amber-700 border border-amber-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border border-purple-200",
  delivered: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
};

interface Item {
  product: { name: string; price: number };
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  selectedFabric?: string;
  isCustomTailored?: boolean;
  measurements?: Record<string, string>;
}

interface Order {
  id: string;
  reference: string;
  status: Status;
  items: Item[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: { name: string; email: string; phone: string };
  delivery: { address: string; city: string; state: string; notes?: string; type: string };
  createdAt: string;
}

interface Stats {
  total: number;
  todayCount: number;
  todayRevenue: number;
  allRevenue: number;
  customCount: number;
  byStatus: Record<Status, number>;
}

interface AdminTask {
  id: string;
  text: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

interface CalEvent {
  id: string;
  date: string;
  title: string;
  color: string;
}

interface AdminChat {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "open" | "closed";
  messages: { from: string; text: string; timestamp: string }[];
  unreadAdmin: number;
  updatedAt: string;
}

function fmt(n: number) { return "₦" + n.toLocaleString("en-NG"); }

async function fetchDashboard() {
  const r = await fetch("/api/admin/orders");
  if (r.status === 401) return null;
  return r.json() as Promise<{ orders: Order[]; stats: Stats }>;
}

const PRIORITY_COLOR = {
  low: "bg-blue-50  text-blue-600  border-blue-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  high: "bg-red-50   text-red-600   border-red-200",
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function AdminPage() {
  /* ── Auth / orders ─────────────────────────────── */
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* ── Tools panel ────────────────────────────────── */
  const [toolsOpen, setToolsOpen] = useState(false);

  /* ── Tasks ─────────────────────────────────────── */
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");

  /* ── Calendar ──────────────────────────────────── */
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [calEvents, setCalEvents] = useState<CalEvent[]>([]);
  const [calSelected, setCalSelected] = useState<string | null>(null);
  const [calInput, setCalInput] = useState("");

  /* ── Device stats ──────────────────────────────── */
  const [deviceStats, setDeviceStats] = useState<{ mobile: number; tablet: number; desktop: number } | null>(null);

  /* ── Chart hover ──────────────────────────────────── */
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  /* ── Chat notifications ─────────────────────────── */
  const [chatUnread, setChatUnread] = useState(0);

  /* ── Load helpers ──────────────────────────────── */
  const loadTasks = useCallback(async () => {
    const r = await fetch("/api/admin/tasks");
    const data = await r.json();
    setTasks(data.tasks ?? []);
  }, []);

  const loadCalendar = useCallback(async (month: Date) => {
    const ms = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    const r = await fetch(`/api/admin/calendar?month=${ms}`);
    const data = await r.json();
    setCalEvents(data.events ?? []);
  }, []);

  const loadDeviceStats = useCallback(async () => {
    const r = await fetch("/api/admin/device-stats");
    const data = await r.json();
    setDeviceStats(data.totals ?? null);
  }, []);

  const loadChatUnread = useCallback(async () => {
    const r = await fetch("/api/admin/chats");
    const data = await r.json();
    const total: number = (data.chats as AdminChat[] ?? []).reduce((s, c) => s + (c.unreadAdmin ?? 0), 0);
    setChatUnread(total);
  }, []);

  useEffect(() => {
    fetchDashboard().then((data) => {
      if (!data) { setAuthed(false); return; }
      setOrders(data.orders);
      setStats(data.stats);
      setAuthed(true);
    }).catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    loadTasks();
    loadCalendar(calMonth);
    loadDeviceStats();
    loadChatUnread();
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authed) loadCalendar(calMonth);
  }, [calMonth, authed, loadCalendar]);

  /* ── Auth handlers ─────────────────────────────── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true); setLoginErr("");
    const res = await fetch("/api/admin/auth", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) { setLoginErr("Incorrect password"); setLoginLoading(false); return; }
    const data = await fetchDashboard();
    if (data) { setOrders(data.orders); setStats(data.stats); }
    setAuthed(true); setLoginLoading(false);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false); setOrders([]); setStats(null); setPassword("");
  }

  async function updateStatus(orderId: string, status: Status) {
    setUpdating(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    if (stats) {
      setStats((s) => {
        if (!s) return s;
        const old = orders.find((o) => o.id === orderId)?.status;
        if (!old) return s;
        return {
          ...s,
          byStatus: {
            ...s.byStatus,
            [old]: Math.max(0, (s.byStatus[old] ?? 1) - 1),
            [status]: (s.byStatus[status] ?? 0) + 1,
          },
        };
      });
    }
    setUpdating(null);
  }

  /* ── Task handlers ─────────────────────────────── */
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const r = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTaskText, priority: taskPriority }),
    });
    const data = await r.json();
    setTasks((prev) => [data.task, ...prev]);
    setNewTaskText("");
  }

  async function handleToggleTask(task: AdminTask) {
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
  }

  async function handleDeleteTask(id: string) {
    await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  /* ── Calendar handlers ─────────────────────────── */
  async function handleAddCalEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!calSelected || !calInput.trim()) return;
    const r = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: calSelected, title: calInput }),
    });
    const data = await r.json();
    setCalEvents((prev) => [...prev, data.event]);
    setCalInput("");
  }

  async function handleDeleteCalEvent(id: string) {
    await fetch(`/api/admin/calendar?id=${id}`, { method: "DELETE" });
    setCalEvents((prev) => prev.filter((e) => e.id !== id));
  }

  /* ── Computed analytics ────────────────────────── */
  const weeklyRevenue = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d.toISOString().slice(0, 10);
    });
    return days.map((date) => ({
      date,
      label: new Date(date + "T12:00:00").toLocaleDateString("en-NG", { weekday: "short" }).slice(0, 3),
      revenue: orders
        .filter((o) => o.createdAt.slice(0, 10) === date && o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0),
    }));
  }, [orders]);

  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.revenue), 1);

  const weekTotal = weeklyRevenue.reduce((s, d) => s + d.revenue, 0);

  const paymentRows = useMemo(() => {
    if (!stats) return [];
    const total = Object.values(stats.byStatus).reduce((a, b) => a + b, 0) || 1;
    return ALL_STATUSES.map((st) => ({
      status: st,
      count: stats.byStatus[st] ?? 0,
      pct: Math.round(((stats.byStatus[st] ?? 0) / total) * 100),
    }));
  }, [stats]);

  const deviceTotal = deviceStats
    ? (deviceStats.mobile + deviceStats.tablet + deviceStats.desktop) || 1
    : 1;

  /* ── Calendar grid ─────────────────────────────── */
  const calGrid = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysIn = new Date(year, month + 1, 0).getDate();
    const cells: (string | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysIn; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [calMonth]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const selectedEvents = calSelected
    ? calEvents.filter((e) => e.date === calSelected)
    : [];

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const pendingTasks = tasks.filter((t) => !t.done).length;
  const newPaidOrders = stats?.byStatus.paid ?? 0;
  const totalNotif = chatUnread + newPaidOrders;

  /* ── Loading ────────────────────────────────────── */
  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream">
        <PiSpinner size={28} className="animate-spin-slow text-ziva-muted" />
      </div>
    );
  }

  /* ── Login gate ─────────────────────────────────── */
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ziva-cream px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-semibold tracking-[0.15em] text-ziva-black">ZIVA</h1>
            <p className="text-xs text-ziva-muted mt-1.5 tracking-widest uppercase">Admin Dashboard</p>
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

  /* ── Dashboard ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-ziva-cream/30">

      {/* Top bar */}
      <div className="bg-linear-to-r from-ziva-black to-zinc-900 text-ziva-cream px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-heading text-xl font-semibold tracking-[0.15em]">ZIVA</span>
          <span className="text-[9px] text-ziva-cream/40 tracking-widest uppercase border-l border-ziva-cream/20 pl-3">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/80 hover:text-ziva-cream transition-colors">
            <PiPackage size={13} /> Products
          </Link>
          <Link href="/support" className="hidden sm:flex items-center gap-1.5 text-xs text-ziva-cream/80 hover:text-ziva-cream transition-colors">
            <PiUsersThree size={13} /> Support
          </Link>
          {/* Notification bell */}
          <Link href="/support" className="relative text-ziva-cream/80 hover:text-ziva-cream transition-colors">
            <PiBell size={16} />
            {totalNotif > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center animate-pulse">
                {totalNotif > 9 ? "9+" : totalNotif}
              </span>
            )}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-ziva-cream/50 hover:text-ziva-cream transition-colors">
            <PiSignOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { label: "Total Orders", value: stats.total.toString(), sub: `${stats.byStatus.paid ?? 0} awaiting fulfilment`, accent: "border-l-amber-400" },
              { label: "All-Time Revenue", value: fmt(stats.allRevenue), sub: `across ${stats.total} orders`, accent: "border-l-green-500" },
              { label: "Today's Revenue", value: fmt(stats.todayRevenue), sub: `${stats.todayCount} orders today`, accent: "border-l-blue-400" },
              { label: "Custom Tailored", value: stats.customCount.toString(), sub: "orders with measurements", accent: "border-l-purple-400" },
            ] as const).map(({ label, value, sub, accent }) => (
              <div key={label} className={`bg-white border border-ziva-border border-l-4 ${accent} p-5 hover:shadow-sm transition-shadow`}>
                <p className="text-[10px] tracking-widest uppercase text-ziva-muted font-semibold mb-2">{label}</p>
                <p className="text-2xl font-bold text-ziva-black font-heading leading-none">{value}</p>
                <p className="text-[11px] text-ziva-muted mt-2">{sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tools & Insights ── */}
        <div className="bg-white border border-ziva-border">
          <button
            onClick={() => setToolsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-ziva-cream/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <PiChartBar size={16} className="text-ziva-muted" />
              <span className="text-sm font-semibold text-ziva-black">Insights &amp; Tools</span>
              <div className="flex items-center gap-2 ml-2">
                {pendingTasks > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5">
                    <PiCheckSquare size={10} /> {pendingTasks} tasks
                  </span>
                )}
                {chatUnread > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5">
                    <PiChatCircleText size={10} /> {chatUnread} chats
                  </span>
                )}
              </div>
            </div>
            {toolsOpen ? <PiCaretUp size={14} className="text-ziva-muted" /> : <PiCaretDown size={14} className="text-ziva-muted" />}
          </button>

          {toolsOpen && (
            <div className="border-t border-ziva-border p-5 space-y-5">

              {/* Row 1: Weekly Revenue | Payment Overview | Device Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Weekly Revenue */}
                <div className="bg-ziva-cream/30 border border-ziva-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted">7-Day Revenue</p>
                    <p className="text-xs font-bold text-ziva-black">{fmt(weekTotal)}</p>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {weeklyRevenue.map((day) => {
                      const h = day.revenue > 0 ? Math.max((day.revenue / maxRevenue) * 100, 8) : 0;
                      const isHovered = hoveredBar === day.date;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center gap-1 relative group cursor-pointer"
                          onMouseEnter={() => setHoveredBar(day.date)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {/* Tooltip */}
                          {isHovered && day.revenue > 0 && (
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ziva-black text-white text-[9px] font-semibold px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                              {fmt(day.revenue)}
                            </div>
                          )}
                          <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                            <div
                              className={`w-full rounded-sm transition-all duration-300 ${isHovered
                                  ? "bg-ziva-black scale-y-105 origin-bottom"
                                  : day.date === todayStr
                                    ? "bg-ziva-black"
                                    : "bg-ziva-muted/40 hover:bg-ziva-muted/60"
                                }`}
                              style={{ height: `${h}%` }}
                            />
                          </div>
                          <span className={`text-[9px] transition-colors ${isHovered ? "text-ziva-black font-semibold" : "text-ziva-muted"}`}>
                            {day.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Overview (order status breakdown) */}
                <div className="bg-ziva-cream/30 border border-ziva-border p-4">
                  <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-3">Order Status</p>
                  <div className="space-y-2">
                    {paymentRows.map(({ status, count, pct }) => (
                      <div key={status} className="group cursor-default">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] capitalize text-ziva-black font-medium group-hover:font-semibold transition-all">{status}</span>
                          <span className="text-[10px] text-ziva-muted group-hover:text-ziva-black transition-colors">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-ziva-border rounded-full overflow-hidden group-hover:h-2 transition-all duration-200">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${status === "delivered" ? "bg-green-500"
                                : status === "shipped" ? "bg-purple-500"
                                  : status === "paid" ? "bg-amber-500"
                                    : status === "cancelled" ? "bg-red-400"
                                      : "bg-blue-500"
                              }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Stats */}
                <div className="bg-ziva-cream/30 border border-ziva-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted">Devices (7 days)</p>
                    <PiDevices size={14} className="text-ziva-muted" />
                  </div>
                  {!deviceStats || (deviceStats.mobile + deviceStats.tablet + deviceStats.desktop) === 0 ? (
                    <p className="text-xs text-ziva-muted text-center py-4">No visit data yet. Visits are tracked as customers browse the store.</p>
                  ) : (
                    <div className="space-y-3">
                      {([
                        { label: "Desktop", key: "desktop", color: "bg-ziva-black" },
                        { label: "Mobile", key: "mobile", color: "bg-zinc-500" },
                        { label: "Tablet", key: "tablet", color: "bg-zinc-300" },
                      ] as const).map(({ label, key, color }) => {
                        const count = deviceStats[key];
                        const pct = Math.round((count / deviceTotal) * 100);
                        return (
                          <div key={key} className="group cursor-default">
                            <div className="flex items-center justify-between mb-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${color}`} />
                                <span className="text-[10px] text-ziva-black font-medium group-hover:font-semibold transition-all">{label}</span>
                              </div>
                              <span className="text-[10px] text-ziva-muted group-hover:text-ziva-black transition-colors">{count} ({pct}%)</span>
                            </div>
                            <div className="h-1.5 bg-ziva-border rounded-full overflow-hidden group-hover:h-2 transition-all duration-200">
                              <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-[9px] text-ziva-muted text-right">{deviceTotal} total visits</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Tasks | Calendar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Tasks */}
                <div className="bg-ziva-cream/30 border border-ziva-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <PiCheckSquare size={14} className="text-ziva-muted" />
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted">Tasks</p>
                    {pendingTasks > 0 && (
                      <span className="ml-auto text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5">{pendingTasks} open</span>
                    )}
                  </div>

                  {/* Add task */}
                  <form onSubmit={handleAddTask} className="flex items-center gap-2 mb-3">
                    <input
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="New task…"
                      className="flex-1 border border-ziva-border px-2.5 py-1.5 text-xs outline-none focus:border-ziva-black bg-white"
                    />
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as "low" | "medium" | "high")}
                      className="border border-ziva-border text-[10px] px-1.5 py-1.5 outline-none focus:border-ziva-black bg-white appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Med</option>
                      <option value="high">High</option>
                    </select>
                    <button type="submit" className="w-8 h-8 flex items-center justify-center bg-ziva-black text-white hover:bg-zinc-800 transition-colors">
                      <PiPlus size={13} />
                    </button>
                  </form>

                  {/* Task list */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {tasks.length === 0 && (
                      <p className="text-xs text-ziva-muted text-center py-3">No tasks yet.</p>
                    )}
                    {tasks.map((task) => (
                      <div key={task.id} className={`flex items-center gap-2.5 p-2 border ${task.done ? "border-ziva-border bg-white/50 opacity-50" : "border-ziva-border bg-white"}`}>
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${task.done ? "bg-ziva-black border-ziva-black" : "border-ziva-border hover:border-ziva-black"}`}
                        >
                          {task.done && <PiCheck size={9} className="text-white" />}
                        </button>
                        <span className={`flex-1 text-xs ${task.done ? "line-through text-ziva-muted" : "text-ziva-black"}`}>
                          {task.text}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 border capitalize ${PRIORITY_COLOR[task.priority]}`}>
                          {task.priority}
                        </span>
                        <button onClick={() => handleDeleteTask(task.id)} className="text-ziva-muted hover:text-red-500 transition-colors shrink-0">
                          <PiTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-ziva-cream/30 border border-ziva-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <PiCalendar size={14} className="text-ziva-muted" />
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted">
                        {calMonth.toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                        className="w-6 h-6 flex items-center justify-center text-ziva-muted hover:text-ziva-black transition-colors"
                      >
                        <PiCaretLeft size={11} />
                      </button>
                      <button
                        onClick={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                        className="w-6 h-6 flex items-center justify-center text-ziva-muted hover:text-ziva-black transition-colors"
                      >
                        <PiCaretRight size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {WEEKDAYS.map((d) => (
                      <div key={d} className="text-center text-[9px] text-ziva-muted font-semibold py-0.5">{d}</div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {calGrid.map((dateStr, i) => {
                      if (!dateStr) return <div key={`empty-${i}`} />;
                      const hasEvent = calEvents.some((e) => e.date === dateStr);
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === calSelected;
                      const day = parseInt(dateStr.slice(8));
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setCalSelected(isSelected ? null : dateStr)}
                          className={`relative aspect-square flex items-center justify-center text-[10px] font-medium transition-colors rounded-sm ${isSelected ? "bg-ziva-black text-white"
                              : isToday ? "bg-ziva-cream border border-ziva-black text-ziva-black font-bold"
                                : "hover:bg-ziva-cream text-ziva-black"
                            }`}
                        >
                          {day}
                          {hasEvent && (
                            <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-ziva-black"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected date events */}
                  {calSelected && (
                    <div className="mt-3 pt-3 border-t border-ziva-border">
                      <p className="text-[9px] tracking-widest uppercase text-ziva-muted font-semibold mb-2">
                        {new Date(calSelected + "T12:00:00").toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      {selectedEvents.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {selectedEvents.map((ev) => (
                            <div key={ev.id} className="flex items-center gap-2 bg-white border border-ziva-border px-2 py-1">
                              <span className="text-[10px] flex-1 text-ziva-black">{ev.title}</span>
                              <button onClick={() => handleDeleteCalEvent(ev.id)} className="text-ziva-muted hover:text-red-500 transition-colors">
                                <PiX size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={handleAddCalEvent} className="flex gap-1.5">
                        <input
                          value={calInput}
                          onChange={(e) => setCalInput(e.target.value)}
                          placeholder="Add note…"
                          className="flex-1 border border-ziva-border px-2 py-1 text-xs outline-none focus:border-ziva-black bg-white"
                        />
                        <button type="submit" className="w-7 h-7 flex items-center justify-center bg-ziva-black text-white hover:bg-zinc-800 transition-colors">
                          <PiPlus size={11} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Notifications row */}
              {(chatUnread > 0 || newPaidOrders > 0) && (
                <div className="border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PiBell size={14} className="text-amber-600" />
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-amber-700">Notifications</p>
                  </div>
                  <div className="space-y-1.5">
                    {newPaidOrders > 0 && (
                      <p className="text-xs text-amber-800">
                        <span className="font-bold">{newPaidOrders}</span> order{newPaidOrders !== 1 ? "s" : ""} awaiting fulfilment
                        <Link href="#orders" className="ml-2 underline underline-offset-2">View orders</Link>
                      </p>
                    )}
                    {chatUnread > 0 && (
                      <p className="text-xs text-amber-800">
                        <span className="font-bold">{chatUnread}</span> unread chat message{chatUnread !== 1 ? "s" : ""} from customers
                        <Link href="/support" className="ml-2 underline underline-offset-2">Open chats</Link>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div id="orders" className="border-b border-ziva-border flex items-center gap-0 overflow-x-auto">
          {(["all", ...ALL_STATUSES] as const).map((st) => {
            const count = st === "all" ? orders.length : (stats?.byStatus[st] ?? 0);
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${filter === st
                    ? "border-ziva-black text-ziva-black"
                    : "border-transparent text-ziva-muted hover:text-ziva-black"
                  }`}
              >
                {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
                <span className={`ml-1.5 text-[10px] ${filter === st ? "text-ziva-black" : "text-ziva-muted"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white border border-ziva-border p-12 text-center">
              <PiPackage size={28} className="text-ziva-muted mx-auto mb-3" />
              <p className="text-sm text-ziva-muted">No orders in this category</p>
            </div>
          )}

          {filtered.map((order) => {
            const isExpanded = expanded === order.id;
            const date = new Date(order.createdAt).toLocaleDateString("en-NG", {
              day: "numeric", month: "short", year: "numeric",
            });
            const itemCount = order.items.reduce((a, i) => a + i.quantity, 0);
            const hasCustom = order.items.some((i) => i.isCustomTailored);

            return (
              <div key={order.id} className="bg-white border border-ziva-border">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PiPackage size={16} className="text-ziva-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ziva-black font-mono tracking-wider">#{order.id}</p>
                      <p className="text-[10px] text-ziva-muted">{date} · {itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ziva-black truncate">{order.customer.name}</p>
                    <p className="text-[11px] text-ziva-muted truncate">{order.customer.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {hasCustom && <PiScissors size={14} className="text-amber-600" title="Contains custom tailored items" />}
                    <span className="text-sm font-bold text-ziva-black">{fmt(order.total)}</span>
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                        disabled={updating === order.id}
                        className={`text-[10px] font-semibold tracking-widest uppercase pl-2.5 pr-6 py-1.5 outline-none cursor-pointer appearance-none rounded-none disabled:opacity-60 ${STATUS_STYLE[order.status]}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                        ))}
                      </select>
                      {updating === order.id
                        ? <PiSpinner size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin-slow pointer-events-none" />
                        : <PiCaretDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />}
                    </div>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="w-8 h-8 flex items-center justify-center border border-ziva-border text-ziva-muted hover:text-ziva-black hover:border-ziva-black transition-colors"
                    >
                      {isExpanded ? <PiCaretUp size={12} /> : <PiCaretDown size={12} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-ziva-border bg-ziva-cream/30 p-5 space-y-5">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-3">Items</p>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => {
                          const mEntries = item.measurements
                            ? Object.entries(item.measurements).filter(([k, v]) => v && k !== "notes")
                            : [];
                          const mLine = mEntries.map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}cm`).join(" · ");
                          return (
                            <div key={idx} className="bg-white border border-ziva-border p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-ziva-black">{item.product.name}</p>
                                  <p className="text-xs text-ziva-muted mt-0.5">
                                    Size: {item.selectedSize}
                                    {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                                    {item.selectedFabric ? ` · ${item.selectedFabric}` : ""}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-ziva-black">{fmt(item.product.price * item.quantity)}</p>
                                  <p className="text-[10px] text-ziva-muted">× {item.quantity}</p>
                                </div>
                              </div>
                              {item.isCustomTailored && (
                                <div className="mt-3 bg-amber-50 border border-amber-200 p-3">
                                  <p className="text-[10px] font-bold text-amber-700 tracking-widest uppercase mb-2">✂ Custom Tailored — Measurements</p>
                                  {mLine ? <p className="text-xs text-amber-800">{mLine}</p> : <p className="text-xs text-amber-600 italic">No measurements entered</p>}
                                  {item.measurements?.notes && (
                                    <p className="text-xs text-amber-700 italic mt-1.5">Notes: &ldquo;{item.measurements.notes}&rdquo;</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-2">Delivery</p>
                        <div className="bg-white border border-ziva-border p-4 space-y-1.5">
                          <p className="text-xs text-ziva-black">{order.delivery.address}</p>
                          <p className="text-xs text-ziva-muted">{order.delivery.city}, {order.delivery.state}</p>
                          {order.delivery.type === "sameday" && (
                            <p className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold">
                              <PiTruck size={11} /> Same-Day Delivery
                            </p>
                          )}
                          {order.delivery.notes && <p className="text-[11px] text-ziva-muted italic">{order.delivery.notes}</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-2">Customer</p>
                        <div className="bg-white border border-ziva-border p-4 space-y-1.5">
                          <p className="text-xs font-semibold text-ziva-black">{order.customer.name}</p>
                          <p className="text-xs text-ziva-muted">{order.customer.email}</p>
                          <p className="text-xs text-ziva-muted">{order.customer.phone}</p>
                          <p className="text-[10px] text-ziva-muted font-mono mt-1">Ref: {order.reference}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = `/api/user/orders/${order.id}/invoice`;
                          link.download = `ZIVA-Invoice-${order.id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-ziva-border text-xs font-semibold text-ziva-black hover:bg-ziva-cream transition-colors"
                      >
                        <PiDownload size={13} /> Download Invoice PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
