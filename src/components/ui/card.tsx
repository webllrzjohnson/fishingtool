import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <h2 className="text-2xl font-black">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptyState({ title, children, className = "" }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center ${className}`}>
      <p className="font-bold">{title}</p>
      {children ? <div className="mt-1 text-sm text-slate-500">{children}</div> : null}
    </div>
  );
}

const calloutToneClasses = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-slate-50 text-slate-700",
  amber: "bg-amber-50 text-amber-900",
  red: "bg-red-50 text-red-900",
  emerald: "bg-emerald-50 text-emerald-900",
} as const;

export function Callout({
  children,
  tone = "amber",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof calloutToneClasses;
  className?: string;
}) {
  return (
    <p className={`rounded-xl p-3 text-sm leading-6 ${calloutToneClasses[tone]} ${className}`}>
      {children}
    </p>
  );
}
