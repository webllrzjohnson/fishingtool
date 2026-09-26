import type { ReactNode } from "react";

export const inputClass = {
  light: "mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal",
  dark: "mt-1.5 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-white",
} as const;

export const selectClass = inputClass;

export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-bold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function DarkField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`text-sm font-bold ${className}`}>
      {label}
      {children}
    </label>
  );
}
