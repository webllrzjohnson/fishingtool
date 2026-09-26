import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base = "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold transition-colors";

const variantClasses = {
  primary: "bg-teal-800 text-white hover:bg-teal-900",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  danger: "bg-red-900 text-white hover:bg-red-950",
  ghost: "border border-slate-600 text-white hover:bg-slate-800",
  accent: "bg-amber-400 font-black text-slate-950 hover:bg-amber-300",
  soft: "bg-teal-50 text-teal-900 hover:bg-teal-100",
  softDanger: "bg-red-50 text-red-800 hover:bg-red-100",
} as const;

type ButtonVariant = keyof typeof variantClasses;

function classFor(variant: ButtonVariant, className = "") {
  return `${base} ${variantClasses[variant]} ${className}`;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button type={type} className={classFor(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classFor(variant, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classFor(variant, className)}>
      {children}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
  external = false,
  size = "sm",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  size?: "xs" | "sm";
}) {
  const sizeClass = size === "xs" ? "text-xs" : "text-sm";
  const classes = `${sizeClass} font-bold text-teal-800 underline ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-xl border border-teal-300 bg-white px-4 py-3 text-sm font-black text-teal-950 underline"
    >
      {children}
    </a>
  );
}
