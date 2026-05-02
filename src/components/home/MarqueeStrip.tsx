const items = [
  "Free Delivery over ₦50,000",
  "Made in Nigeria",
  "Premium Fabrics",
  "Authentic African Design",
  "Hassle-Free Returns",
  "Secure Checkout",
  "Tailored to Perfection",
  "Nationwide Shipping",
];

export default function MarqueeStrip() {
  const doubled = [...items, ...items];

  return (
    <div className="bg-black py-3 overflow-hidden select-none">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {doubled.map((text, i) => (
          <span key={i} className="flex items-center text-white text-xs font-semibold tracking-[0.18em] uppercase">
            {text}
            <span className="mx-6 text-white/40">✦</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
