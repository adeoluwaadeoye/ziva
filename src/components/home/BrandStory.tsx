import Link from "next/link";
import Image from "next/image";
import { PiArrowUpRight } from "react-icons/pi";

const stats = [
  { value: "8+", label: "Years crafting" },
  { value: "50+", label: "Artisan partners" },
  { value: "36", label: "States we ship to" },
];

function CTA() {
  return (
    <Link
      href="/products"
      className="inline-flex items-center justify-center gap-2 bg-white text-ziva-black text-[11px] tracking-[0.25em] uppercase font-bold px-12 py-4 hover:bg-white/90 transition-colors duration-200"
    >
      Shop the Collection <PiArrowUpRight size={11} />
    </Link>
  );
}

export default function BrandStory() {
  return (
    <section className="bg-ziva-black overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ── Text — LEFT on desktop, FIRST on mobile ── */}
        <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-16 sm:py-20 lg:py-28">

          {/* Vertical white rule */}
          <div className="absolute left-0 top-[15%] bottom-[15%] w-px hidden lg:block"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.25) 30%, rgba(255,255,255,0.25) 70%, transparent)" }} />

          <span className="reveal text-[10px] tracking-[0.4em] uppercase text-white/50 font-medium mb-6">
            Our Story
          </span>

          <h2 className="reveal delay-100 font-heading font-bold leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: "clamp(36px, 5vw, 72px)" }}>
            <span className="block text-ziva-cream">Crafted with</span>
            <span className="block italic text-white">Heritage</span>
            <span className="block text-ziva-cream">&amp; Pride.</span>
          </h2>

          <div className="w-10 h-0.5 bg-white/30 mb-8" />

          <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-4 max-w-md">
            ZIVA was born on the streets of Lagos with one conviction — that Nigerian fashion deserves a global stage. Every piece in our collection is designed in-house and produced by skilled artisans across Nigeria.
          </p>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md">
            From the Ankara markets of Balogun to the Aso-Oke weavers of Iseyin, we source authenticity and transform it into wearable art for the modern Nigerian.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 py-7 border-y border-white/10 mb-10">
            {stats.map((s, i) => (
              <div key={s.label} className={`${i > 0 ? "pl-5 sm:pl-8 border-l border-white/10" : ""}`}>
                <p className="font-heading text-3xl sm:text-4xl font-bold text-white leading-none tracking-tight">
                  {s.value}
                </p>
                <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA — desktop only */}
          <div className="hidden lg:flex justify-center">
            <CTA />
          </div>
        </div>

        {/* ── Image — RIGHT on desktop, SECOND on mobile ── */}
        <div className="relative h-[75vw] sm:h-[55vw] lg:h-auto lg:min-h-175">
          <Image
            src="/assets/story-bg.jpg"
            alt="Nigerian master tailor at work"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-linear-to-r from-ziva-black/55 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-ziva-black/60 via-transparent to-transparent" />

          {/* Est. badge */}
          <div className="absolute top-8 right-8 bg-white px-5 py-3 text-right">
            <p className="text-[8px] tracking-[0.3em] uppercase text-black/50 leading-none mb-0.5">Est.</p>
            <p className="font-heading text-2xl font-bold text-black leading-none">2019</p>
          </div>

          {/* Bottom caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="border-l-2 border-white/40 pl-4">
              <p className="text-white/70 text-[10px] tracking-[0.3em] uppercase font-medium">Lagos · Nigeria</p>
              <p className="text-white/70 text-sm font-medium mt-0.5">Handcrafted by master artisans</p>
            </div>
          </div>
        </div>

      </div>

      {/* CTA — mobile & tablet only, after the image */}
      <div className="lg:hidden flex justify-center py-10 border-t border-white/10">
        <CTA />
      </div>
    </section>
  );
}
