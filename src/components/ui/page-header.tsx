import Link from "next/link";
import type { ReactNode } from "react";

const eyebrowToneClasses = {
  teal: "text-teal-800",
  red: "text-red-800",
} as const;

export function PageHeader({
  eyebrow,
  title,
  intro,
  backHref,
  backLabel = "← Back",
  tone = "teal",
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  backHref?: string;
  backLabel?: string;
  tone?: keyof typeof eyebrowToneClasses;
  children?: ReactNode;
}) {
  return (
    <header>
      {backHref ? (
        <Link href={backHref} className="text-sm font-bold text-teal-800 underline">
          {backLabel}
        </Link>
      ) : null}
      {eyebrow ? (
        <p className={`${backHref ? "mt-6" : ""} text-sm font-black uppercase tracking-[0.18em] ${eyebrowToneClasses[tone]}`}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
      {intro ? <div className="mt-3 max-w-3xl leading-7 text-slate-600">{intro}</div> : null}
      {children}
    </header>
  );
}
