export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12" role="status">
      <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-12 max-w-2xl animate-pulse rounded-xl bg-slate-200" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
      <span className="sr-only">Loading fishing information</span>
    </div>
  );
}
