"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaInstagram, FaXTwitter, FaFacebookF, FaTiktok, FaWhatsapp,
  FaCcVisa, FaCcMastercard,
} from "react-icons/fa6";
import { PiEnvelope, PiPhone, PiMapPin, PiCheck, PiSpinner, PiShieldCheck } from "react-icons/pi";
import Logo from "./Logo";

type FooterLink = { label: string; href: string | null };

const shopLinks: FooterLink[] = [
  { label: "New Arrivals",       href: "/products?tag=new"     },
  { label: "Women's Collection", href: "/products?gender=women" },
  { label: "Men's Collection",   href: "/products?gender=men"  },
  { label: "Sale",               href: "/products?tag=sale"    },
  { label: "Gift Cards",         href: null                    },
];

const helpLinks: FooterLink[] = [
  { label: "Help Centre",        href: "/help"    },
  { label: "Size Guide",         href: null       },
  { label: "Shipping & Returns", href: null       },
  { label: "Track My Order",     href: null       },
  { label: "Contact Us",         href: "/contact" },
];

const companyLinks: FooterLink[] = [
  { label: "Our Story",      href: null },
  { label: "Sustainability", href: null },
  { label: "Careers",        href: null },
  { label: "Press",          href: null },
];

const socials = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaXTwitter,  href: "#", label: "X / Twitter" },
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaTiktok,    href: "#", label: "TikTok" },
  { icon: FaWhatsapp,  href: "#", label: "WhatsApp" },
];

function NavLink({ link }: { link: FooterLink }) {
  if (link.href) {
    return (
      <Link
        href={link.href}
        className="text-sm text-white/55 hover:text-white transition-colors duration-200"
      >
        {link.label}
      </Link>
    );
  }
  return (
    <span className="text-sm text-white/22 select-none flex items-center gap-2">
      {link.label}
      <span className="text-[7px] tracking-widest uppercase text-white/18 border border-white/10 px-1 py-px leading-none">
        soon
      </span>
    </span>
  );
}

function NewsletterForm() {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res  = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        setTimeout(() => { setStatus("idle"); setMessage(""); }, 6000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 bg-white/6 border border-white/15 px-4 py-3.5 max-w-sm w-full">
        <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
          <PiCheck size={11} className="text-white" />
        </div>
        <p className="text-sm text-white/75">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 bg-white/5 border border-white/12 border-r-0 px-4 py-3 text-sm text-white placeholder:text-white/28 outline-none focus:border-white/30 focus:bg-white/8 transition-all"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-white text-ziva-black px-5 py-3 text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-60 shrink-0"
        >
          {status === "loading"
            ? <PiSpinner size={13} className="animate-spin-slow" />
            : "Subscribe"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2 pl-1">{message}</p>
      )}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white">

      {/* ── Newsletter band ── */}
      <div className="border-b border-white/[0.07]">
        <div className="footer-nl-band container-ziva py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-10 lg:gap-16">

            <div className="max-w-md shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-px bg-[#c9a96e]" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#c9a96e] font-semibold">
                  Stay Connected
                </span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                Fashion stories. New drops. Exclusive offers.
              </h3>
              <p className="text-sm text-white/45 leading-relaxed">
                Join the ZIVA community and be first to know.
              </p>
            </div>

            <div className="w-full sm:max-w-sm">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="footer-main-grid container-ziva py-10 sm:py-12 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-6 gap-y-10 sm:gap-8 lg:gap-8">

          {/* Brand column — full width on mobile, 1 col on md+ */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" variant="light" href="/" className="mb-5" />

            <p className="text-sm text-white/45 leading-relaxed mb-7 max-w-65">
              Premium Nigerian attire for every occasion. Crafted with heritage, worn with pride.
            </p>

            {/* Contact */}
            <ul className="space-y-3 mb-8">
              {[
                { icon: PiMapPin,   text: "15 Bode Thomas St, Surulere, Lagos" },
                { icon: PiPhone,    text: "+234 801 234 5678" },
                { icon: PiEnvelope, text: "hello@ziva.ng" },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm text-white/50">
                  <Icon size={13} className="text-white/35 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-2 flex-wrap">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center border border-white/12 text-white/35 hover:border-white/40 hover:text-white/80 transition-all duration-200"
                >
                  <Icon size={13} />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/50 mb-5">
              Shop
            </p>
            <ul className="space-y-3.5">
              {shopLinks.map((l) => (
                <li key={l.label}><NavLink link={l} /></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/50 mb-5">
              Help
            </p>
            <ul className="space-y-3.5">
              {helpLinks.map((l) => (
                <li key={l.label}><NavLink link={l} /></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/50 mb-5">
              Company
            </p>
            <ul className="space-y-3.5">
              {companyLinks.map((l) => (
                <li key={l.label}><NavLink link={l} /></li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-white/[0.07]" />

      {/* ── Bottom bar ── */}
      <div className="container-ziva py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">

          {/* Left: copyright + legal */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
            <p className="text-xs text-white/45">
              © {new Date().getFullYear()} ZIVA Fashion. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/28 flex-wrap">
              <span className="cursor-default flex items-center gap-1.5">
                Privacy Policy
                <span className="text-[7px] border border-white/10 text-white/20 px-1 leading-none">soon</span>
              </span>
              <span className="text-white/12 hidden sm:inline">·</span>
              <span className="cursor-default flex items-center gap-1.5">
                Terms of Service
                <span className="text-[7px] border border-white/10 text-white/20 px-1 leading-none">soon</span>
              </span>
            </div>
          </div>

          {/* Right: payment + trust */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-white/38">
              <PiShieldCheck size={13} className="text-white/30" />
              <span>Secured by Paystack</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <FaCcVisa       size={26} className="text-white/40" title="Visa" />
              <FaCcMastercard size={26} className="text-white/40" title="Mastercard" />
            </div>
          </div>

        </div>

        {/* Powered by */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 flex-wrap text-center">
          <span className="text-[10px] text-white/22 tracking-wide">Made in Nigeria 🇳🇬 · Designed &amp; built by</span>
          <Link
            href="https://adeoluwadeoye.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors duration-200 underline underline-offset-2 decoration-white/20 hover:decoration-white/50"
          >
            Adeoluwa Adeoye
          </Link>
        </div>

      </div>

    </footer>
  );
}
