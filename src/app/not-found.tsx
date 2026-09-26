import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-sm font-black uppercase tracking-wide text-teal-800">Not found</p>
      <h1 className="mt-3 text-4xl font-black">That fishing page is not in this guide.</h1>
      <p className="mt-3 text-slate-600">Search any Ontario town, harbour, lake, or river instead.</p>
      <Link href="/" className="mt-6 inline-block rounded-xl bg-teal-800 px-5 py-3 font-bold text-white">
        Find a spot
      </Link>
    </div>
  );
}
