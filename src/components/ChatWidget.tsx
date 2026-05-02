"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { PiChatCircleText, PiX, PiPaperPlaneTilt, PiSpinner, PiMinus } from "react-icons/pi";

interface ChatMessage {
  from: "customer" | "admin";
  text: string;
  timestamp: string;
}

const STORAGE_CHAT = "ziva_chat_id";
const STORAGE_NAME = "ziva_chat_name";
const STORAGE_EMAIL = "ziva_chat_email";
const POLL_OPEN_MS = 2500;   // fast poll while widget is open
const POLL_CLOSED_MS = 8000;   // background poll while closed (keeps unread badge live)
const ADMIN_PATHS = ["/admin", "/support"];

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customerName, setCustomerName] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customerEmail, setCustomerEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState<"open" | "closed">("open");
  const [notifPreview, setNotifPreview] = useState<{ text: string; time: string } | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevUnreadRef = useRef(0);

  const authUser = useAuthStore((s) => s.user);
  const isAdminPage = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  /* ── Auto-dismiss in-app notification preview after 5s ── */
  useEffect(() => {
    if (!notifPreview) return;
    const t = setTimeout(() => setNotifPreview(null), 5000);
    return () => clearTimeout(t);
  }, [notifPreview]);

  /* ── Restore session ── */
  useEffect(() => {
    const id = localStorage.getItem(STORAGE_CHAT);
    const name = localStorage.getItem(STORAGE_NAME);
    const email = localStorage.getItem(STORAGE_EMAIL);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (id) { setChatId(id); }
    if (name) { setCustomerName(name); }
    if (email) { setCustomerEmail(email); }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  /* ── Clear stale chat when a different user logs in ── */
  useEffect(() => {
    if (!authUser) return;
    const storedEmail = localStorage.getItem(STORAGE_EMAIL);
    if (storedEmail && storedEmail !== authUser.email) {
      localStorage.removeItem(STORAGE_CHAT);
      localStorage.removeItem(STORAGE_NAME);
      localStorage.removeItem(STORAGE_EMAIL);
      /* eslint-disable react-hooks/set-state-in-effect */
      setChatId(null);
      setCustomerName("");
      setCustomerEmail("");
      setMessages([]);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [authUser]);

  const fetchMessages = useCallback(async (id: string) => {
    try {
      // markRead=1 only when widget is open — tells the server to reset unreadCustomer.
      // Background polls must NOT reset it so the count accumulates across admin messages.
      const r = await fetch(`/api/chats?chatId=${id}${open ? "&markRead=1" : ""}`);
      if (!r.ok) return;
      const data = await r.json();
      setMessages(data.chat?.messages ?? []);
      setStatus(data.chat?.status ?? "open");
      const newUnread: number = data.chat?.unreadCustomer ?? 0;
      if (!open) setUnread(newUnread);
    } catch { /* ignore */ }
  }, [open]);

  useEffect(() => {
    if (!chatId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages(chatId);
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!chatId || status === "closed") return;
    // Always poll: fast when open (messages visible), slow when closed (badge + notification)
    pollRef.current = setInterval(() => fetchMessages(chatId), open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [chatId, open, status, fetchMessages]);

  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      if (unread > 0) setUnread(0);
      setNotifPreview(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, unread]);

  /* ── Scroll messages container ── */
  useEffect(() => {
    const el = messagesRef.current;
    if (el && open) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  /* ── In-app notification preview when admin replies while widget is closed ── */
  useEffect(() => {
    if (unread > prevUnreadRef.current && !open) {
      const lastAdmin = [...messages].reverse().find((m) => m.from === "admin");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (lastAdmin) setNotifPreview({ text: lastAdmin.text, time: lastAdmin.timestamp });
    }
    prevUnreadRef.current = unread;
  }, [unread, open, messages]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const name = authUser?.name ?? inputName;
    const email = authUser?.email ?? inputEmail;
    if (!name.trim() || !inputText.trim()) return;
    setStarting(true);
    const r = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name, customerEmail: email, text: inputText }),
    });
    const data = await r.json();
    setStarting(false);
    if (!r.ok) return;
    const { chatId: id, customerName: cName } = data;
    localStorage.setItem(STORAGE_CHAT, id);
    localStorage.setItem(STORAGE_NAME, cName);
    localStorage.setItem(STORAGE_EMAIL, email);
    setChatId(id);
    setCustomerName(cName);
    setCustomerEmail(email);
    setMessages([{ from: "customer", text: inputText.trim(), timestamp: new Date().toISOString() }]);
    setInputText("");
    setInputName("");
    setInputEmail("");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;
    const text = inputText.trim();
    setInputText("");
    setSending(true);
    const msg: ChatMessage = { from: "customer", text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setSending(false);
  }

  function resetChat() {
    localStorage.removeItem(STORAGE_CHAT);
    localStorage.removeItem(STORAGE_NAME);
    localStorage.removeItem(STORAGE_EMAIL);
    setChatId(null);
    setCustomerName("");
    setCustomerEmail("");
    setMessages([]);
    setInputName("");
    setInputEmail("");
    setInputText("");
  }

  if (isAdminPage) return null;

  const hasChat = !!chatId;

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

          {/* In-app notification preview */}
          {notifPreview && (
            <button
              onClick={() => { setOpen(true); setMinimised(false); }}
              className="bg-white border border-ziva-border shadow-xl rounded-sm p-3 w-64 text-left hover:shadow-2xl transition-shadow"
            >
              <p className="text-[9px] font-semibold tracking-widest uppercase text-ziva-muted mb-1">ZIVA Support</p>
              <p className="text-xs text-ziva-black leading-relaxed line-clamp-2">{notifPreview.text}</p>
              <p className="text-[9px] text-ziva-muted mt-1.5">
                {new Date(notifPreview.time).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </button>
          )}

          <span className="bg-ziva-black text-white text-[10px] font-semibold tracking-wide px-3 py-1.5 shadow-lg rounded-sm">
            Chat with us
          </span>
          <button
            onClick={() => { setOpen(true); setMinimised(false); }}
            className="w-14 h-14 rounded-full bg-ziva-black text-white flex items-center justify-center shadow-xl hover:bg-zinc-800 active:scale-95 transition-all duration-200 relative"
            aria-label="Open chat"
          >
            <PiChatCircleText size={24} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 flex flex-col shadow-2xl border border-ziva-border bg-white overflow-hidden"
          style={{ maxHeight: "min(560px, calc(100vh - 80px))" }}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-ziva-black to-zinc-800 text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <PiChatCircleText size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">ZIVA Support</p>
                <p className="text-[10px] text-white/50">
                  {customerName ? `Hi, ${customerName}` : status === "closed" ? "Chat closed" : "Usually replies in minutes"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMinimised((v) => !v)} className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                <PiMinus size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
                <PiX size={14} />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-ziva-cream/20">
                {!hasChat ? (
                  /* Start form */
                  <form onSubmit={handleStart} className="space-y-3 pt-1">
                    <div className="text-center pb-1">
                      <div className="w-10 h-10 rounded-full bg-ziva-black flex items-center justify-center mx-auto mb-2">
                        <PiChatCircleText size={18} className="text-white" />
                      </div>
                      <p className="text-xs font-semibold text-ziva-black">How can we help?</p>
                      <p className="text-[10px] text-ziva-muted mt-0.5">Start a chat and we&apos;ll reply shortly.</p>
                    </div>

                    {authUser ? (
                      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-ziva-cream/60 border border-ziva-border">
                        <div className="w-7 h-7 rounded-full bg-ziva-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {authUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-ziva-black truncate">{authUser.name}</p>
                          <p className="text-[9px] text-ziva-muted truncate">{authUser.email}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          value={inputName}
                          onChange={(e) => setInputName(e.target.value)}
                          placeholder="Your name *"
                          required
                          className="w-full border border-ziva-border px-3 py-2 text-sm outline-none focus:border-ziva-black bg-white transition-colors"
                        />
                        <input
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                          placeholder="Email (optional)"
                          type="email"
                          className="w-full border border-ziva-border px-3 py-2 text-sm outline-none focus:border-ziva-black bg-white transition-colors"
                        />
                      </>
                    )}

                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Your message *"
                      required
                      rows={3}
                      className="w-full border border-ziva-border px-3 py-2 text-sm outline-none focus:border-ziva-black bg-white resize-none transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={starting}
                      className="w-full flex items-center justify-center gap-2 bg-ziva-black text-white py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
                    >
                      {starting ? <PiSpinner size={13} className="animate-spin-slow" /> : <><PiPaperPlaneTilt size={13} /> Start Chat</>}
                    </button>
                  </form>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-ziva-muted text-center py-8">No messages yet.</p>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === "customer" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-3 py-2.5 text-xs leading-relaxed ${msg.from === "customer"
                          ? "bg-ziva-black text-white rounded-2xl rounded-br-sm"
                          : "bg-white border border-ziva-border text-ziva-black rounded-2xl rounded-bl-sm shadow-sm"
                        }`}>
                        {msg.from === "admin" && (
                          <p className="text-[9px] font-semibold tracking-widest uppercase text-ziva-muted mb-1">ZIVA</p>
                        )}
                        {msg.text}
                        <p className="text-[9px] mt-1.5 opacity-40">
                          {new Date(msg.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {status === "closed" && hasChat && (
                  <div className="text-center mt-2">
                    <p className="text-[10px] text-ziva-muted py-2 border-t border-ziva-border">
                      This chat has been closed.
                    </p>
                    <button onClick={resetChat} className="text-[10px] text-ziva-black underline underline-offset-2 hover:opacity-70 transition-opacity">
                      Start new chat
                    </button>
                  </div>
                )}
              </div>

              {/* Input bar */}
              {hasChat && status === "open" && (
                <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-ziva-border bg-white shrink-0">
                  <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 border border-ziva-border px-3 py-2 text-sm outline-none focus:border-ziva-black bg-ziva-cream/30 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="w-9 h-9 flex items-center justify-center bg-ziva-black text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 rounded-sm"
                  >
                    {sending ? <PiSpinner size={13} className="animate-spin-slow" /> : <PiPaperPlaneTilt size={13} />}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
