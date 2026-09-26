"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-black uppercase tracking-wide text-red-800">Something went wrong</p>
      <h1 className="mt-3 text-4xl font-black">This fishing information could not be loaded.</h1>
      <p className="mt-3 text-slate-600">Try again. For rules or closures, use Ontario&apos;s official pages directly.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">Find a spot</ButtonLink>
      </div>
    </div>
  );
}
