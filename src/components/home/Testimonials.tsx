"use client";

import Image from "next/image";
import { PiStarFill, PiQuotes } from "react-icons/pi";

type Review = {
  name: string; location: string; text: string;
  rating: number; item: string; avatar: string; image?: string;
};

const reviews: Review[] = [
  {
    name: "Adesuyi Adebanji",
    location: "Victoria Island, Lagos",
    text: "I wore the Aso-Oke gown to my cousin's wedding and I was the most photographed guest. The quality is exceptional — you can tell real craftsmanship went into every stitch.",
    rating: 5,
    item: "Àṣà Aso-Oke Evening Gown",
    avatar: "AO",
    image: "/assets/client.jpg",
  },
  {
    name: "Caroline Nwosu",
    location: "Abuja",
    text: "My Grand Agbada set arrived two days before my son's naming ceremony. Perfect fit, immaculate embroidery. ZIVA has become my go-to for every traditional event.",
    rating: 5,
    item: "Emeka Grand Agbada Set",
    avatar: "EN",
  },
  {
    name: "Fatima Abdullahi",
    location: "Kano",
    text: "The Adire midi dress is absolutely stunning. I love that each piece is unique. Fast delivery and the packaging was gorgeous. Already ordered two more.",
    rating: 5,
    item: "Chioma Adire Midi Dress",
    avatar: "FA",
  },
];

function Stars({ count, size = 12 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <PiStarFill key={i} size={size} className="text-ziva-black" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [featured, ...secondary] = reviews;

  return (
    <>
      {/* ── Founder / CEO Statement ── */}
      <section className="bg-ziva-black overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Image — LEFT */}
          <div className="relative h-[75vw] sm:h-[55vw] lg:h-auto lg:min-h-175 order-2 lg:order-1">
            <Image
              src="/assets/founder2.jpg"
              alt="Anthonia Zane — Founder & CEO, ZIVA"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-ziva-black/50" />
            <div className="absolute inset-0 bg-linear-to-t from-ziva-black/70 via-transparent to-transparent" />

            {/* Name badge on image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="border-l-2 border-white/40 pl-4">
                <p className="text-white font-semibold text-sm sm:text-base">Anthonia Zane</p>
                <p className="text-white/60 text-[10px] tracking-[0.3em] uppercase">Founder &amp; CEO, ZIVA</p>
              </div>
            </div>
          </div>

          {/* Quote — RIGHT */}
          <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-16 sm:py-20 lg:py-28 order-1 lg:order-2">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/50 font-medium mb-8">
              Founder&apos;s Vision
            </span>

            <PiQuotes size={40} className="text-white/25 mb-6" />

            <blockquote className="font-heading font-semibold leading-snug text-white mb-8"
              style={{ fontSize: "clamp(22px, 2.8vw, 40px)" }}>
              &ldquo;Nigerian fashion is not merely clothing — it is a living archive of our culture, history, and identity.
              At ZIVA, we don&apos;t just sell clothes; we preserve heritage and make it wearable for the modern world.
              Every thread tells a story that deserves to be heard.&rdquo;</blockquote>

            <div className="w-10 h-0.5 bg-white/30 mb-8" />

            <div className="space-y-1 mb-8">
              <p className="text-white font-semibold text-lg">Anthonia Zane</p>
              <p className="text-white/60 text-xs tracking-widest uppercase">Founder &amp; Chief Executive Officer</p>
              <p className="text-white/35 text-xs tracking-wider">Est. 2019 · Lagos, Nigeria</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Heritage First", "Made in Nigeria", "Artisan Partners", "Sustainable Fashion"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-widest uppercase border border-white/15 text-white/40 px-3 py-1.5 hover:border-white/40 hover:text-white/70 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section className="bg-[#f9f5f0] py-16 sm:py-20 lg:py-28">
        <div className="container-ziva">

          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[10px] tracking-[0.4em] uppercase text-ziva-black font-medium">
              Verified Reviews
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-ziva-black mt-2 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2.5">
              <Stars count={5} size={14} />
              <span className="text-sm text-ziva-muted">4.9 average · 12,000+ happy customers</span>
            </div>
          </div>

          {/* Featured testimonial */}
          <div className="relative bg-ziva-black overflow-hidden mb-4 sm:mb-5">
            {/* Giant decorative quote */}
            <div
              aria-hidden
              className="absolute -top-4 right-6 font-heading font-bold text-white/4 select-none pointer-events-none leading-none"
              style={{ fontSize: "clamp(120px, 18vw, 220px)" }}
            >
              &ldquo;
            </div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-14">
              <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">

                {/* Quote body */}
                <div className="flex-1">
                  <Stars count={featured.rating} size={15} />
                  <PiQuotes size={20} className="text-white/25 mt-5 mb-5" />
                  <p className="font-heading font-semibold text-white leading-snug mb-8"
                    style={{ fontSize: "clamp(20px, 2.4vw, 32px)" }}>
                    {featured.text}
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Customer photo */}
                    {featured.image ? (
                      <div className="relative w-14 h-14 shrink-0 overflow-hidden ring-2 ring-white/30">
                        <Image
                          src={featured.image}
                          alt={featured.name}
                          fill
                          className="object-cover object-top"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-white flex items-center justify-center text-sm font-bold text-ziva-black shrink-0">
                        {featured.avatar}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{featured.name}</p>
                      <p className="text-white/40 text-xs tracking-wide">{featured.location}</p>
                    </div>
                  </div>
                </div>

                {/* Item tag + image hint */}
                <div className="shrink-0 lg:pb-1 flex flex-col items-start lg:items-end gap-4">
                  {featured.image && (
                    <div className="relative w-28 h-36 overflow-hidden hidden lg:block ring-1 ring-white/10">
                      <Image
                        src={featured.image}
                        alt={`${featured.name} wearing ${featured.item}`}
                        fill
                        className="object-cover object-top"
                        sizes="112px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="border border-white/20 px-5 py-3.5 inline-block">
                    <p className="text-[9px] tracking-[0.3em] uppercase text-white/30 mb-1">Item Purchased</p>
                    <p className="text-white text-sm font-medium">{featured.item}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Two smaller reviews */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {secondary.map((r) => (
              <div
                key={r.name}
                className="bg-white border border-ziva-border p-6 sm:p-8 flex flex-col gap-4 hover:border-black/30 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <Stars count={r.rating} size={11} />
                  <span className="text-[9px] tracking-widest uppercase text-ziva-muted border border-ziva-border px-2 py-1 shrink-0 group-hover:border-black/30 group-hover:text-ziva-black transition-colors duration-200">
                    {r.item}
                  </span>
                </div>

                <PiQuotes size={14} className="text-ziva-black/30" />

                <p className="text-ziva-black text-sm leading-relaxed flex-1">{r.text}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-ziva-border">
                  <div className="w-9 h-9 bg-ziva-black flex items-center justify-center text-xs font-bold text-white shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {r.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ziva-black">{r.name}</p>
                    <p className="text-xs text-ziva-muted">{r.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust stats */}
          <div className="mt-12 pt-10 border-t border-ziva-border grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-0 lg:divide-x lg:divide-ziva-border">
            {[
              { stat: "4.9 / 5", label: "Average Rating" },
              { stat: "12,000+", label: "Happy Customers" },
              { stat: "98%", label: "Would Recommend" },
              { stat: "10,000+", label: "Orders Fulfilled" },
            ].map((b) => (
              <div key={b.label} className="text-center sm:px-6">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-ziva-black">{b.stat}</p>
                <p className="text-[10px] text-ziva-muted tracking-widest uppercase mt-1.5">{b.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
