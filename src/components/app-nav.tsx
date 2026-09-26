"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Find a spot", match: (path: string) => path === "/" },
  { href: "/rules", label: "Rules", match: (path: string) => path.startsWith("/rules") },
];

function linkClass(active: boolean, mobile = false) {
  if (mobile) {
    return active
      ? "shrink-0 rounded-full bg-teal-100 px-3 py-2 text-xs font-bold text-teal-900"
      : "shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700";
  }
  return active
    ? "rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900"
    : "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-900";
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
      {links.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active)}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden" aria-label="Mobile navigation">
      {links.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active, true)}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
