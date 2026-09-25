import Link from "next/link";

const links = [
  { href: "/", label: "Plan a trip" },
  { href: "/explore", label: "Explore Ontario" },
  { href: "/species", label: "Fish & bait guide" },
  { href: "/rules", label: "Rules check" },
  { href: "/regulations", label: "2026 regulations" },
  { href: "/trips", label: "Saved trips" },
  { href: "/gear", label: "My gear" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3" aria-label="Ontario Fishing Tool home">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-800 text-xl text-white" aria-hidden>
              ≋
            </span>
            <span>
              <span className="block text-sm font-black tracking-tight">Ontario Fishing Tool</span>
              <span className="block text-[11px] text-slate-500">Plan safer. Fish smarter.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-teal-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-5 text-slate-500">
          <p className="font-semibold text-slate-700">Planning guidance, not a legal document.</p>
          <p>
            Confirm the exact waterbody, date, species, licence, limits, sanctuaries, and exceptions in
            Ontario&apos;s current Fishing Regulations Summary and Fish ON-Line before fishing or keeping fish.
            {" "}
            <a href="/privacy" className="underline">Privacy</a>
            {" · "}
            <a href="https://www.ontario.ca/fishonline" className="underline" target="_blank" rel="noopener noreferrer">Fish ON-Line</a>
          </p>
          <p className="mt-3">
            <Link href="/privacy" className="font-semibold text-teal-800 underline">Privacy</Link>
            {" · "}
            <a href="https://www.ontario.ca/fishonline" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-800 underline">
              Fish ON-Line
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
