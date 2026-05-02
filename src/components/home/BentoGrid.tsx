import Link from "next/link";
import Image from "next/image";
import { PiArrowUpRight } from "react-icons/pi";

type Tile = {
  label: string;
  sub: string;
  href: string;
  src: string;
  obj: string;
  badge?: string;
  index: string;
};

const tiles: Tile[] = [
  {
    label: "Women",
    sub: "Ankara · Aso-Oke · Gowns",
    href: "/products?gender=women",
    src: "/assets/aso-oke-W4.jpg",
    obj: "object-top",
    index: "02",
  },
  {
    label: "Men",
    sub: "Agbada · Senator · Kaftan",
    href: "/products?gender=men",
    src: "/assets/agbada-M4.jpg",
    obj: "object-top",
    index: "03",
  },
  {
    label: "New Arrivals",
    sub: "Fresh drops every week",
    href: "/products?tag=new",
    src: "/assets/ankara-W2.jpg",
    obj: "object-center",
    badge: "New",
    index: "04",
  },
  {
    label: "Sale",
    sub: "Up to 40% off selected styles",
    href: "/products?tag=sale",
    src: "/assets/adire-W4.jpg",
    obj: "object-center",
    badge: "Sale",
    index: "05",
  },
];

export default function BentoGrid() {
  return (
    <section className="w-full bg-black">

      {/* ══ ROW 1 — Hero (left ⅔) + Women & Men stacked (right ⅓) ══ */}
      <div className="flex flex-col lg:flex-row lg:h-[min(90vh,820px)] lg:min-h-135">

        {/* ─ Hero ─ */}
        <Link
          href="/products"
          className="relative h-[80vw] sm:h-[58vw] lg:h-auto lg:flex-2 overflow-hidden group"
        >
          <Image
            src="/assets/gown-W1.jpg"
            alt="ZIVA Heritage 2025 Collection"
            fill
            priority
            className="object-cover object-center transition-transform duration-1200 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          {/* base overlay */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/58 transition-colors duration-700" />
          {/* left-side gradient for text legibility */}
          <div className="absolute inset-y-0 left-0 w-3/4 bg-linear-to-r from-black/45 to-transparent" />

          {/* index number */}
          <div className="absolute top-5 left-6 sm:top-7 sm:left-8">
            <span className="text-[9px] tracking-[0.45em] uppercase text-white/25 font-medium">01</span>
          </div>

          {/* bottom text block */}
          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-8 sm:px-12 sm:pb-14 lg:px-16 lg:pb-16">
            <span className="block text-[9px] tracking-[0.55em] uppercase text-white/40 font-medium mb-3 sm:mb-5">
              New Season · 2025
            </span>
            <h1
              className="font-heading font-black text-white leading-none tracking-tight mb-3 sm:mb-5"
              style={{ fontSize: "clamp(36px, 7.5vw, 112px)" }}
            >
              Heritage<br />Reimagined.
            </h1>
            <p className="text-white/45 text-sm max-w-xs leading-relaxed mb-6 sm:mb-8 hidden sm:block">
              Nigerian fashion at its finest — designed in Lagos, crafted by master artisans, worn worldwide.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2.5 bg-white text-black text-[10px] tracking-[0.3em] uppercase font-bold px-7 py-3.5 transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:ring-1 group-hover:ring-white/30">
                Shop Collection <PiArrowUpRight size={11} />
              </span>
              <span className="hidden sm:block text-white/25 text-[9px] tracking-[0.45em] uppercase">
                Est. 2019 · Lagos
              </span>
            </div>
          </div>

          {/* watermark */}
          <div className="absolute bottom-8 right-8 hidden lg:block text-right pointer-events-none select-none">
            <span className="font-heading text-[88px] font-black text-white/5 leading-none">2025</span>
          </div>
        </Link>

        {/* ─ Women + Men stacked ─ */}
        <div className="flex flex-row lg:flex-col lg:flex-1 border-t border-white/8 lg:border-t-0 lg:border-l lg:border-white/8 h-[56vw] sm:h-[42vw] lg:h-auto">
          {[tiles[0], tiles[1]].map((tile, i) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`relative flex-1 overflow-hidden group ${i === 0
                ? "border-r border-white/8 lg:border-r-0 lg:border-b lg:border-white/8"
                : ""
                }`}
            >
              <Image
                src={tile.src}
                alt={tile.label}
                fill
                className={`${tile.obj} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]`}
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/52 group-hover:bg-black/65 transition-colors duration-500" />

              {/* index */}
              <span className="absolute top-4 left-4 text-[8px] tracking-[0.4em] text-white/20 uppercase">
                {tile.index}
              </span>

              {/* content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-7">
                <p className="font-heading font-bold text-white text-xl sm:text-2xl lg:text-3xl leading-tight">
                  {tile.label}
                </p>
                <p className="text-white/40 text-[9px] tracking-wide mt-0.5 hidden sm:block">{tile.sub}</p>

                {/* reveal CTA */}
                <span className="mt-3 inline-flex items-center gap-1.5 text-[9px] text-white/70 tracking-[0.35em] uppercase font-semibold opacity-0 translate-y-2.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  Explore <PiArrowUpRight size={9} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ══ ROW 2 — New Arrivals (⅓) + Sale (⅔) ══ */}
      <div
        className="flex flex-row border-t border-white/8"
        style={{ height: "clamp(180px, 36vw, 380px)" }}
      >
        {[tiles[2], tiles[3]].map((tile, i) => (
          <Link
            key={tile.label}
            href={tile.href}
            className={`relative overflow-hidden group ${i === 0
              ? "flex-1 border-r border-white/8"
              : "flex-2"
              }`}
          >
            <Image
              src={tile.src}
              alt={tile.label}
              fill
              className={`${tile.obj} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]`}
              sizes={i === 0 ? "33vw" : "66vw"}
            />
            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/68 transition-colors duration-500" />

            {/* index */}
            <span className="absolute top-4 left-4 sm:top-5 sm:left-5 text-[8px] tracking-[0.4em] text-white/20 uppercase">
              {tile.index}
            </span>

            {/* content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
              {tile.badge && (
                <span className="self-start text-[8px] tracking-[0.4em] uppercase font-semibold border border-white/30 text-white/60 px-2.5 py-0.5 mb-3">
                  {tile.badge}
                </span>
              )}
              <p
                className="font-heading font-bold text-white leading-none tracking-tight"
                style={{ fontSize: i === 1 ? "clamp(28px, 4.5vw, 60px)" : "clamp(22px, 3vw, 40px)" }}
              >
                {tile.label}
              </p>
              <p className="text-white/40 text-[10px] tracking-wide mt-1.5 hidden sm:block">{tile.sub}</p>

              {/* reveal CTA */}
              <span className="mt-3 inline-flex items-center gap-1.5 text-[9px] text-white/70 tracking-[0.35em] uppercase font-semibold opacity-0 translate-y-2.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                Explore <PiArrowUpRight size={9} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ══ Brand Story Strip — inverted (white bg) ══ */}
      <Link href="/about" className="relative block bg-white overflow-hidden group border-t border-black/8">
        <Image
          src="/assets/kaftan-W1.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-700"
          sizes="100vw"
        />
        <div className="relative z-10 container-ziva py-14 sm:py-20 lg:py-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 sm:gap-8 lg:gap-16">

            {/* headline */}
            <div className="shrink-0">
              <span className="block text-[9px] tracking-[0.55em] uppercase text-black/35 font-medium mb-5">
                Our Heritage
              </span>
              <h2
                className="font-heading font-black text-black leading-none tracking-tight"
                style={{ fontSize: "clamp(34px, 6vw, 88px)" }}
              >
                Crafted with<br />
                <em className="not-italic text-black">Pride.</em>
              </h2>
            </div>

            {/* body */}
            <p className="text-black/40 text-sm leading-relaxed max-w-sm hidden md:block">
              From the Ankara markets of Balogun to the Aso-Oke weavers of Iseyin —
              authenticity transformed into wearable art, worn across the globe.
            </p>

            {/* CTA */}
            <span className="shrink-0 inline-flex items-center gap-2.5 border border-black/25 text-black text-[10px] tracking-[0.35em] uppercase font-semibold px-7 py-4 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 whitespace-nowrap">
              Read Our Story <PiArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </Link>

    </section>
  );
}
