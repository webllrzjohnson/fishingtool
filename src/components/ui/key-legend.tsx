import type { ReactNode } from "react";

export type KeyLegendItem = {
  label: string;
  meaning: string;
  swatchClassName: string;
};

export function KeyLegend({
  title = "Key",
  items,
  className = "",
}: {
  title?: string;
  items: readonly KeyLegendItem[];
  className?: string;
}) {
  return (
    <div className={`text-[11px] leading-5 text-slate-600 ${className}`}>
      <p className="font-bold text-slate-500">{title}</p>
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${item.swatchClassName}`}
              aria-hidden
            >
              {item.label}
            </span>
            <span>{item.meaning}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KeyLegendNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] leading-5 text-slate-600 ${className}`}>{children}</p>;
}
