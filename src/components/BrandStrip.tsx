import Link from "next/link";

const brands = [
  {
    name: "Orange Culture",
    logo: "https://orangeculture.com.ng/cdn/shop/files/Orange_logo.png?v=1684261509",
    href: "/products?brand=orange-culture",
  },
  {
    name: "Emmy Kasbit",
    logo: "https://emmykasbit.com/wp-content/uploads/2025/08/IMG_4556.png",
    href: "/products?brand=emmy-kasbit",
  },
  {
    name: "Fruché",
    logo: "https://frucheofficial.com/wp-content/uploads/2022/08/cropped-85B499DC-B969-4C91-B454-FD2D0470D872.png",
    href: "/products?brand=fruche",
  },
  {
    name: "David Wej",
    logo: "https://davidwej.com/wp-content/uploads/2021/01/DavidWej-white.svg",
    href: "/products?brand=david-wej",
  },
];

export default function BrandStrip() {
  return (
    <section className="w-full bg-white border-b border-ziva-border/30">
      <div className="container-ziva py-12 sm:py-16">
        <p className="text-center text-[12px] tracking-[0.55em] uppercase text-ziva-muted font-semibold mb-10 sm:mb-12">
          Brands We Carry
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group flex flex-col items-center justify-center px-4 py-8 sm:py-10 hover:bg-ziva-cream/30 transition-colors duration-300 rounded-sm"
              title={brand.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-14 sm:h-16 lg:h-20 w-auto max-w-40 sm:max-w-50 object-contain brightness-0 group-hover:scale-105 transition-all duration-300 ease-out"
              />
              <span className="mt-4 text-[9px] tracking-[0.3em] uppercase text-ziva-muted/60 group-hover:text-ziva-muted transition-colors duration-300">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
