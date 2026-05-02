import Link from "next/link";
import { LuScissors } from "react-icons/lu";

interface Props {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export default function Logo({
  variant = "dark",
  size = "md",
  href = "/",
  className = "",
}: Props) {
  const ink = variant === "dark" ? "text-ziva-black" : "text-white";
  const lineClr = variant === "dark" ? "bg-ziva-black/35" : "bg-white/40";
  const muted = variant === "dark" ? "text-ziva-muted" : "text-white/55";
  const diamond = variant === "dark" ? "text-ziva-black/40" : "text-white/45";
  const iconClr = variant === "dark" ? "text-ziva-black/65" : "text-white/70";
  const sepClr = variant === "dark" ? "bg-ziva-black/15" : "bg-white/20";

  const sizes = {
    sm: {
      row: "gap-1",          // tight — scissors sits close to text
      iconSz: 24,               // compact for mobile header
      title: "text-[14px] tracking-[0.22em]",
      divGap: "my-[2px]",
      line: "h-px",
      dot: "text-[4px]",
      sub: "text-[5.5px] tracking-[0.35em]",
    },
    md: {
      row: "gap-1.5",
      iconSz: 40,
      title: "text-[22px] tracking-[0.35em]",
      divGap: "my-[3px]",
      line: "h-px",
      dot: "text-[6px]",
      sub: "text-[8px] tracking-[0.5em]",
    },
    lg: {
      row: "gap-2.5",
      iconSz: 58,
      title: "text-[32px] tracking-[0.4em]",
      divGap: "my-1",
      line: "h-px",
      dot: "text-[8px]",
      sub: "text-[9px] tracking-[0.55em]",
    },
  };

  const s = sizes[size];

  const inner = (
    <div className={`inline-flex flex-row items-center select-none ${s.row} ${className}`}>

      {/* Scissors — rotated vertical, no border */}
      <LuScissors
        size={s.iconSz}
        strokeWidth={1.1}
        style={{ transform: "rotate(90deg)" }}
        className={`${iconClr} shrink-0`}
      />

      {/* Thin vertical rule */}
      <div className={`w-px self-stretch ${sepClr}`} />

      {/* Text stack */}
      <div className="flex flex-col items-start">
        <span className={`font-heading font-bold uppercase leading-none ${s.title} ${ink}`}>
          ZIVA
        </span>
        <div className={`flex items-center w-full ${s.divGap}`}>
          <div className={`flex-1 ${s.line} ${lineClr}`} />
          <span className={`leading-none ${s.dot} ${diamond} px-1`}>◆</span>
          <div className={`flex-1 ${s.line} ${lineClr}`} />
        </div>
        <span className={`uppercase font-medium leading-none ${s.sub} ${muted}`}>
          Nigeria
        </span>
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex group" aria-label="ZIVA — Nigerian Fashion">
      <div className="transition-all duration-300 group-hover:opacity-70 group-hover:scale-[0.97]">
        {inner}
      </div>
    </Link>
  );
}
