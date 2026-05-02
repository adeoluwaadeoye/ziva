"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PiChatCircleText, PiEnvelope, PiPhone, PiCaretDown, PiCaretUp,
  PiPackage, PiScissors, PiArrowRight, PiQuestion,
} from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa6";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery within Lagos takes 1–3 business days. Deliveries to other states in Nigeria take 3–7 business days. Same-day delivery is available for select Lagos addresses.",
  },
  {
    q: "Can I get a custom-tailored outfit?",
    a: "Yes! When adding items to your cart, you can select the 'Custom Tailored' option and enter your measurements. Our master tailors will craft the outfit to your exact specifications.",
  },
  {
    q: "What is your return policy?",
    a: "We accept returns within 7 days of delivery for unworn, unaltered items in their original condition. Custom-tailored orders are non-refundable unless there is a defect in craftsmanship.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you will receive a notification with your tracking details. You can also check your order status by logging into your account on our website.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept card payments (Visa, Mastercard) and bank transfers via Paystack. All transactions are secured and encrypted.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within Nigeria only. International shipping is coming soon — follow us on Instagram for updates.",
  },
  {
    q: "How do I care for my ZIVA garment?",
    a: "Most of our fabrics (Aso-Oke, Adire, Ankara) should be hand-washed or dry-cleaned. Agbada and Senator suits should be dry-cleaned only. Specific care instructions are included on each product page.",
  },
  {
    q: "Can I make changes to my order after placing it?",
    a: "You can request changes within 1 hour of placing your order by contacting us on WhatsApp. After that, orders may already be in production and changes may not be possible.",
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="container-ziva py-12 lg:py-20">

      {/* Header */}
      <div className="max-w-2xl mb-12 lg:mb-16">
        <span className="gold-line mb-4 block" />
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-ziva-black mb-4">
          Help Centre
        </h1>
        <p className="text-ziva-muted text-base leading-relaxed">
          Find answers to common questions, or reach our support team directly. We&apos;re here to help.
        </p>
      </div>

      {/* Quick contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12 lg:mb-14">
        {[
          {
            icon: PiChatCircleText,
            title: "Live Chat",
            desc: "Chat with our team in real time — click the bubble on the bottom right.",
            action: null,
            label: null,
          },
          {
            icon: FaWhatsapp,
            title: "WhatsApp",
            desc: "Send us a message on WhatsApp and we'll reply within minutes.",
            action: "https://wa.me/2348012345678",
            label: "Open WhatsApp",
          },
          {
            icon: PiEnvelope,
            title: "Email Us",
            desc: "Send an email and receive a response within 24 hours on business days.",
            action: "/contact",
            label: "Send a message",
          },
        ].map(({ icon: Icon, title, desc, action, label }) => (
          <div key={title} className="bg-white border border-ziva-border p-4 sm:p-6 flex sm:flex-col gap-4 sm:gap-3">
            <div className="w-10 h-10 bg-ziva-black flex items-center justify-center shrink-0">
              <Icon size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ziva-black mb-1">{title}</p>
              <p className="text-xs text-ziva-muted leading-relaxed">{desc}</p>
              {action && label && (
                <Link
                  href={action}
                  target={action.startsWith("http") ? "_blank" : undefined}
                  rel={action.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-2 sm:mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ziva-black hover:underline underline-offset-2"
                >
                  {label} <PiArrowRight size={11} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-8 lg:gap-12">

        {/* FAQs */}
        <div>
          <h2 className="font-heading text-2xl font-semibold text-ziva-black mb-6 flex items-center gap-2">
            <PiQuestion size={22} /> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-ziva-border bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-ziva-black">{faq.q}</span>
                  {openFaq === i ? <PiCaretUp size={14} className="text-ziva-muted shrink-0" /> : <PiCaretDown size={14} className="text-ziva-muted shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 border-t border-ziva-border">
                    <p className="text-sm text-ziva-muted leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Quick links */}
          <div className="bg-white border border-ziva-border p-5">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-muted mb-4">Quick Links</p>
            <div className="space-y-2.5">
              {[
                { icon: PiPackage, label: "Track my order", href: "/account" },
                { icon: PiScissors, label: "Custom tailoring guide", href: "/products" },
                { icon: PiPhone, label: "Call us", href: "tel:+2348012345678" },
                { icon: FaWhatsapp, label: "WhatsApp support", href: "https://wa.me/2348012345678" },
                { icon: PiEnvelope, label: "Contact form", href: "/contact" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 text-sm text-ziva-black hover:text-ziva-muted transition-colors group"
                >
                  <Icon size={14} className="text-ziva-muted group-hover:text-ziva-black transition-colors shrink-0" />
                  {label}
                  <PiArrowRight size={11} className="ml-auto text-ziva-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="bg-ziva-black text-ziva-cream p-5">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-ziva-cream/50 mb-3">Support Hours</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ziva-cream/70">Mon – Sat</span>
                <span className="font-semibold">8:00am – 6:00pm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ziva-cream/70">Sunday</span>
                <span className="font-semibold">12:00pm – 4:00pm</span>
              </div>
            </div>
            <p className="text-[10px] text-ziva-cream/40 mt-4 leading-relaxed">
              All times are WAT (West Africa Time, UTC+1). WhatsApp responses may be faster outside these hours.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
