import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    label: "Women",
    sub: "Ankara · Aso-Oke · Gowns",
    href: "/products?gender=women",
    image: "/assets/category-W.jpg",
    colSpan: "col-span-2 md:col-span-2 lg:col-span-2",
    rowSpan: "row-span-2",
    height: "h-[52vw] sm:h-[45vw] md:h-[50vw] lg:h-full min-h-[260px] lg:min-h-[520px]",
  },
  {
    label: "Men",
    sub: "Agbada · Senator · Kaftan",
    href: "/products?gender=men",
    image: "/assets/category-M.jpg",
    colSpan: "col-span-2 md:col-span-2 lg:col-span-2",
    rowSpan: "row-span-2",
    height: "h-[52vw] sm:h-[45vw] md:h-[50vw] lg:h-full min-h-[260px] lg:min-h-[520px]",
  },
  {
    label: "New Arrivals",
    sub: "Fresh drops weekly",
    href: "/products?tag=new",
    image: "/assets/category-new.jpg",
    colSpan: "col-span-2 md:col-span-2 lg:col-span-2",
    rowSpan: "",
    height: "h-[44vw] sm:h-[36vw] md:h-[38vw] lg:h-[260px] min-h-[200px]",
  },
  {
    label: "Sale",
    sub: "Up to 40% off",
    href: "/products?tag=sale",
    image: "/assets/category-sale.jpg",
    colSpan: "col-span-2 md:col-span-2 lg:col-span-2",
    rowSpan: "",
    height: "h-[44vw] sm:h-[36vw] md:h-[38vw] lg:h-[260px] min-h-[200px]",
  },
];

export default function CategoriesSection() {
  return (
    <section className="container-ziva py-14 sm:py-20 lg:py-28">
      {/* Heading */}
      <div className="flex items-end justify-between mb-8 sm:mb-10">
        <div>
          <span className="gold-line mb-3 sm:mb-4" />
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-ziva-black">
            Shop by Category
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex text-sm text-ziva hover:text-ziva-black transition-colors tracking-wide underline underline-offset-4"
        >
          View all
        </Link>
      </div>

      {/* Desktop grid — true masonry feel */}
      <div className="hidden lg:grid grid-cols-6 grid-rows-2 gap-3 h-135">
        {categories.map((cat, i) => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`relative overflow-hidden group ${cat.colSpan} ${cat.rowSpan}`}
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <CategoryLabel cat={cat} large={i < 2} />
          </Link>
        ))}
      </div>

      {/* Mobile / tablet grid — 2-col */}
      <div className="lg:hidden grid grid-cols-2 gap-2.5 sm:gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`relative overflow-hidden group ${cat.height}`}
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <CategoryLabel cat={cat} large={false} />
          </Link>
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="mt-6 text-center sm:hidden">
        <Link href="/products" className="btn-outline text-xs">
          Browse all products
        </Link>
      </div>
    </section>
  );
}

function CategoryLabel({
  cat,
  large,
}: {
  cat: { label: string; sub: string };
  large: boolean;
}) {
  return (
    <div className="absolute bottom-0 left-0 p-4 sm:p-5 lg:p-7">
      <p
        className={`font-heading font-semibold text-white leading-tight ${large ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"
          }`}
      >
        {cat.label}
      </p>
      <p className="text-[10px] sm:text-xs text-white/70 tracking-wide mt-1">{cat.sub}</p>
      <span className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-white/70 tracking-widest uppercase font-medium">
        Shop now →
      </span>
    </div>
  );
}
