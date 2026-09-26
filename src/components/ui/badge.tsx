import type { ReactNode } from "react";

const toneClasses = {
  teal: "bg-teal-100 text-teal-900",
  slate: "bg-slate-200 text-slate-700",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-100 text-red-900",
  emerald: "bg-emerald-100 text-emerald-900",
} as const;

const sizeClasses = {
  sm: "px-2 py-1 text-[11px] font-bold",
  md: "px-2.5 py-1 text-xs font-bold",
  lg: "px-3 py-1 text-xs font-black",
} as const;

type BadgeTone = keyof typeof toneClasses;
type BadgeSize = keyof typeof sizeClasses;

export function Badge({
  children,
  tone = "teal",
  size = "md",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full uppercase tracking-wide ${toneClasses[tone]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
