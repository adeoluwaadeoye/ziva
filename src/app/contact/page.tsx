"use client";

import { useState } from "react";
import {
  PiMapPin, PiEnvelope, PiClock, PiPaperPlaneTilt, PiSpinner, PiCheck, PiPhone,
} from "react-icons/pi";
import { FaInstagram, FaXTwitter, FaFacebookF, FaWhatsapp } from "react-icons/fa6";

const SUBJECTS = [
  "General Enquiry",
  "Order Support",
  "Custom Tailoring",
  "Returns & Exchanges",
  "Wholesale / Partnership",
  "Press & Media",
];

const infoItems = [
  {
    icon: PiMapPin,
    label: "Visit Us",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-100",
    lines: ["15 Bode Thomas Street", "Surulere, Lagos, Nigeria"],
  },
  {
    icon: PiPhone,
    label: "Call Us",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    iconBorder: "border-slate-200",
    lines: ["+234 801 234 5678", "+234 901 234 5678"],
    hrefs: ["tel:+2348012345678", "tel:+2349012345678"],
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    iconBorder: "border-green-100",
    lines: ["+234 801 234 5678"],
    hrefs: ["https://wa.me/2348012345678"],
  },
  {
    icon: PiEnvelope,
    label: "Email Us",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBorder: "border-blue-100",
    lines: ["hello@ziva.ng", "support@ziva.ng"],
    hrefs: ["mailto:hello@ziva.ng", "mailto:support@ziva.ng"],
  },
  {
    icon: PiClock,
    label: "Working Hours",
    iconBg: "bg-ziva-cream",
    iconColor: "text-ziva-muted",
    iconBorder: "border-ziva-border",
    lines: ["Mon – Sat: 8:00am – 6:00pm", "Sunday: 12:00pm – 4:00pm"],
  },
] as {
  icon: React.ElementType;
  label: string;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  lines: string[];
  hrefs?: string[];
}[];

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "#", hoverClass: "hover:text-pink-500 hover:border-pink-200 hover:bg-pink-50" },
  { icon: FaXTwitter, label: "Twitter", href: "#", hoverClass: "hover:text-ziva-black hover:border-ziva-black" },
  { icon: FaFacebookF, label: "Facebook", href: "#", hoverClass: "hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50" },
  { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/2348012345678", hoverClass: "hover:text-green-600 hover:border-green-200 hover:bg-green-50" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="container-ziva py-12 lg:py-20">

      {/* Header */}
      <div className="max-w-2xl mb-12 lg:mb-16">
        <span className="gold-line mb-4 block" />
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-ziva-black mb-4">
          Get in Touch
        </h1>
        <p className="text-ziva-muted text-base leading-relaxed">
          Whether you have a question about an order, need custom tailoring advice, or simply want to say hello — our team is here for you.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-12 lg:gap-16">

        {/* ── Contact info ── */}
        <div className="space-y-6">
          <div className="space-y-3">
            {infoItems.map(({ icon: Icon, label, iconBg, iconColor, iconBorder, lines, hrefs }) => (
              <div
                key={label}
                className="flex gap-4 p-4 bg-white border border-ziva-border hover:border-ziva-black/30 hover:shadow-sm transition-all rounded-sm"
              >
                <div className={`w-10 h-10 ${iconBg} border ${iconBorder} flex items-center justify-center shrink-0 mt-0.5 rounded-sm`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-ziva-muted mb-1">{label}</p>
                  {lines.map((line, i) => (
                    hrefs?.[i]
                      ? (
                        <a
                          key={line}
                          href={hrefs[i]}
                          target={hrefs[i].startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="block text-sm text-ziva-black hover:underline underline-offset-2 font-medium"
                        >
                          {line}
                        </a>
                      )
                      : <p key={line} className="text-sm text-ziva-black">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Socials */}
          <div className="p-4 bg-white border border-ziva-border rounded-sm">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-ziva-muted mb-3">Follow Us</p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, label, href, hoverClass }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`w-10 h-10 border border-ziva-border flex items-center justify-center text-ziva-muted transition-all ${hoverClass}`}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Response guarantee */}
          <div className="bg-ziva-black text-ziva-cream p-5 rounded-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <PiCheck size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Quick Response Guarantee</p>
                <p className="text-xs text-ziva-cream/65 leading-relaxed">
                  We respond to all enquiries within <strong className="text-ziva-cream">24 hours</strong> on business days.
                  For urgent matters, please call or WhatsApp us directly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact form ── */}
        <div>
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-ziva-border bg-white rounded-sm">
              <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-4">
                <PiCheck size={28} className="text-green-600" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-ziva-black mb-2">Message Sent!</h2>
              <p className="text-sm text-ziva-muted max-w-xs">{message}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm text-ziva-black hover:underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-ziva-border p-6 sm:p-8 shadow-sm rounded-sm">
              <div className="pb-4 border-b border-ziva-border">
                <h2 className="font-heading text-2xl font-semibold text-ziva-black">Send a Message</h2>
                <p className="text-xs text-ziva-muted mt-1">We&apos;ll get back to you as soon as possible.</p>
              </div>

              {status === "error" && (
                <div className="border border-red-200 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-sm">{message}</div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm text-ziva-black outline-none focus:border-ziva-black transition-colors cursor-pointer"
                >
                  <option value="">Select a subject…</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-ziva-muted mb-1.5 font-semibold">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you…"
                  required
                  rows={6}
                  className="w-full border border-ziva-border bg-ziva-cream/40 px-4 py-3 text-sm text-ziva-black placeholder:text-ziva-muted outline-none focus:border-ziva-black transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2.5 bg-ziva-black text-ziva-cream py-4 text-sm font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-60"
              >
                {status === "loading" ? (
                  <><PiSpinner size={15} className="animate-spin-slow" /> Sending…</>
                ) : (
                  <><PiPaperPlaneTilt size={14} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
