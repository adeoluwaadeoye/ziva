import Link from "next/link";
import Image from "next/image";
import { PiArrowUpRight } from "react-icons/pi";

const categories = [
  {
    label: "Women",
    sub: "Ankara · Aso-Oke · Gowns",
    href: "/products?gender=women",
    src: "/assets/category-W.jpg",
    obj: "object-top",
  },
  {
    label: "Men",
    sub: "Agbada · Senator · Kaftan",
    href: "/products?gender=men",
    src: "/assets/category-M.jpg",
    obj: "object-top",
  },
  {
    label: "New Arrivals",
    sub: "Fresh drops every week",
    href: "/products?tag=new",
    src: "/assets/category-new.jpg",
    obj: "object-center",
    badge: "New",
  },
  {
    label: "Sale",
    sub: "Up to 40% off",
    href: "/products?tag=sale",
    src: "/assets/category-sale.jpg",
    obj: "object-center",
    badge: "Sale",
  },
];

export default function ShopCategories() {
  return (
    <section className="w-full bg-white">

      {/* Section header */}
      <div className="container-ziva pt-12 pb-8 sm:pt-16 sm:pb-10 flex items-end justify-between">
        <div>
          <span className="reveal block text-[9px] tracking-[0.5em] uppercase text-black/55 font-semibold mb-3">
            Shop by Category
          </span>
          <h2
            className="reveal delay-100 font-heading font-bold text-black leading-none"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            Explore the Collection
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase font-semibold text-black/70 hover:text-black transition-colors border border-black/20 hover:border-black px-4 py-2"
        >
          View All <PiArrowUpRight size={11} />
        </Link>
      </div>

      {/* Category grid: 2×2 */}
      <div className="grid grid-cols-2">
        {categories.map((cat, i) => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`relative overflow-hidden group bg-black border-white/10 ${
              ["border-r border-b", "border-b", "border-r", ""][i]
            }`}
            style={{ height: "clamp(300px, 52vw, 600px)" }}
          >
            <Image
              src={cat.src}
              alt={cat.label}
              fill
              className={`${cat.obj} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] opacity-85 group-hover:opacity-75`}
              sizes="(max-width: 1023px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />

            {/* Badge */}
            {cat.badge && (
              <span className="absolute top-4 left-4 sm:top-5 sm:left-5 text-[8px] tracking-[0.4em] uppercase font-semibold border border-white/40 text-white/90 px-2.5 py-0.5 bg-black/20 backdrop-blur-sm">
                {cat.badge}
              </span>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8">
              <p className="font-heading font-bold text-white leading-tight text-xl sm:text-2xl lg:text-3xl drop-shadow-sm">
                {cat.label}
              </p>
              <p className="text-white/65 text-[10px] sm:text-xs tracking-wide mt-1">
                {cat.sub}
              </p>
              <span className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] text-white/80 tracking-[0.35em] uppercase font-semibold opacity-50 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                Explore <PiArrowUpRight size={9} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile "View all" */}
      <div className="sm:hidden flex justify-center py-7">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase font-semibold text-black/70 hover:text-black transition-colors border border-black/25 hover:border-black px-5 py-2.5"
        >
          View All <PiArrowUpRight size={11} />
        </Link>
      </div>

    </section>
  );
}
