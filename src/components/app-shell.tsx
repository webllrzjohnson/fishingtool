import Link from "next/link";
import { DesktopNav, MobileNav } from "@/components/app-nav";
import { TextLink } from "@/components/ui/button";

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
          <DesktopNav />
        </div>
        <MobileNav />
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs leading-5 text-slate-500">
          <p className="font-semibold text-slate-700">Planning guidance, not a legal document.</p>
          <p>
            Confirm the exact waterbody, date, species, licence, limits, sanctuaries, and exceptions in
            Ontario&apos;s current Fishing Regulations Summary and Fish ON-Line before fishing or keeping fish.
          </p>
          <p className="mt-3">
            <TextLink href="/privacy" className="font-semibold">Privacy</TextLink>
            {" · "}
            <TextLink href="/species" className="font-semibold">Fish guide</TextLink>
            {" · "}
            <TextLink href="/trips" className="font-semibold">Saved trips</TextLink>
            {" · "}
            <TextLink href="https://www.ontario.ca/fishonline" external className="font-semibold">
              Fish ON-Line
            </TextLink>
          </p>
        </div>
      </footer>
    </div>
  );
}
