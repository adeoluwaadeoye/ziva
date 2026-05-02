"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";

/* ─── Custom thick arrows ─────────────────────────────────── */
function NavArrowLeft() {
  return (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" aria-hidden="true">
      <line x1="39" y1="7" x2="2" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 1L2 7L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function NavArrowRight() {
  return (
    <svg width="40" height="14" viewBox="0 0 40 14" fill="none" aria-hidden="true">
      <line x1="1" y1="7" x2="38" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 1L38 7L30 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Slides ─────────────────────────────────────────────── */
const slides = [
  {
    image: "/assets/hero-bg1.jpg",
    eyebrow: "Nigerian Fashion House",
    heading: "ZIVA",
    italic: "",
    sub: "Premium Ankara, Aso-Oke, Agbada & beyond — crafted for the modern Nigerian.",
    cta: { label: "Shop Now", href: "/products" },
    accent: "#C9A84C",
  },
  {
    image: "/assets/hero-bg2.jpg",
    eyebrow: "Women's Collection",
    heading: "Draped in",
    italic: "Heritage.",
    sub: "From Ankara prints to hand-woven Aso-Oke — every piece tells a story of craft, colour and culture.",
    cta: { label: "Shop Women", href: "/products?gender=women" },
    accent: "#E8A0A0",
  },
  {
    image: "/assets/hero-bg3.jpg",
    eyebrow: "Men's Collection",
    heading: "Dressed to",
    italic: "Command.",
    sub: "Agbada, Senator, Dashiki — power dressing rooted in Nigerian tradition and master craftsmanship.",
    cta: { label: "Shop Men", href: "/products?gender=men" },
    accent: "#8BAACC",
  },
  {
    image: "/assets/hero-bg4.jpg",
    eyebrow: "New Arrivals",
    heading: "Worn",
    italic: "Worldwide.",
    sub: "Designed in Lagos. Worn from Abuja to Amsterdam — Nigerian fashion taking its place on the global stage.",
    cta: { label: "New Arrivals", href: "/products?tag=new" },
    accent: "#A8C8A0",
  },
];


const INTERVAL = 6000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => { setCurrent(idx); setAnimKey((k) => k + 1); }, []);
  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, goNext]);

  const slide = slides[current];
  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section className="relative bg-ziva-black overflow-hidden">

      {/* ══ SLIDESHOW — 100vw × 100svh, min 480px so landscape phones don't clip ══ */}
      <div className="relative overflow-hidden" style={{ width: "100vw", height: "100svh", minHeight: "480px" }}>

        {/* Slide images — Next.js Image for proper responsive focal-point control */}
        {slides.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100 z-1" : "opacity-0 z-0"
              }`}
          >
            <Image
              src={s.image}
              alt={s.eyebrow}
              fill
              priority={i === 0}
              loading="eager"
              className="object-cover hero-img-pos"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-black/5 z-10" />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60 z-10" />

        {/* ── Slide indicator — top center ── */}
        <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          <span className="font-heading text-sm font-semibold text-white/70 tabular-nums">{pad(current)}</span>
          <div className="w-16 sm:w-20 h-px bg-white/15 relative overflow-hidden">
            <div
              key={animKey}
              className="absolute inset-y-0 left-0 bg-white/55"
              style={{ animation: `heroProgress ${INTERVAL}ms linear forwards` }}
            />
          </div>
          <span className="font-heading text-[10px] text-white/25 tabular-nums">{pad(slides.length - 1)}</span>
        </div>

        {/* ── Content — left aligned, vertically centered ── */}
        <div className="absolute inset-0 z-20 flex items-center pl-5 sm:pl-14 lg:pl-28 pr-5 sm:pr-14 lg:pr-20">
          <div className="lg:ml-24 flex flex-col w-full max-w-[min(100%,560px)]">

            <span
              key={`eyebrow-${animKey}`}
              className="text-[9px] sm:text-[10px] tracking-[0.45em] uppercase font-semibold mb-4 block animate-fadeSlideIn delay-100"
              style={{ color: slide.accent }}
            >
              {slide.eyebrow}
            </span>

            <h1
              key={`h1-${animKey}`}
              className="font-heading font-bold text-white leading-none tracking-tight mb-5 animate-fadeSlideIn delay-200"
              style={{ fontSize: slide.italic ? "clamp(38px, 7.5vw, 118px)" : "clamp(52px, 11vw, 175px)" }}
            >
              {slide.heading}
              {slide.italic && (
                <>
                  <br />
                  <em className="not-italic" style={{ color: slide.accent }}>{slide.italic}</em>
                </>
              )}
            </h1>

            <p
              key={`sub-${animKey}`}
              className="text-white/55 text-xs sm:text-[15px] leading-relaxed max-w-[min(100%,380px)] mb-8 sm:mb-10 animate-fadeSlideIn delay-300"
            >
              {slide.sub}
            </p>

            {/* CTAs — equal size, no border */}
            <div
              key={`cta-${animKey}`}
              className="flex flex-wrap items-center gap-3 animate-fadeSlideIn delay-400"
            >
              <Link
                href={slide.cta.href}
                className="cta-btn"
                style={{ backgroundColor: slide.accent, color: "#1C1C1C" }}
              >
                {slide.cta.label}
                <PiArrowRight size={14} />
              </Link>
              <Link href="/products" className="cta-btn cta-btn-subtle">
                All Products
                <PiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Navigation — bottom center: ← dots → ── */}
        <div className="absolute bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5">
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="text-white/40 hover:text-white transition-colors duration-200 py-1"
          >
            <NavArrowLeft />
          </button>

          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}>
                <span className={`block rounded-full transition-all duration-500 ${i === current ? "w-6 h-1 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                  }`} />
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            aria-label="Next slide"
            className="text-white/40 hover:text-white transition-colors duration-200 py-1"
          >
            <NavArrowRight />
          </button>
        </div>

        {/* Vertical label — right */}
        <div
          className="hidden lg:flex absolute right-6 bottom-24 z-20 text-white/15 text-[7px] tracking-[0.5em] uppercase"
          style={{ writingMode: "vertical-lr" }}
        >
          Est. 2019 · Lagos · Nigeria
        </div>
      </div>

    </section>
  );
}
