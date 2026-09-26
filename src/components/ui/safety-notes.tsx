import { GENERIC_SAFETY_BULLETS } from "@/lib/copy";

export function SafetyNotes({ cautions }: { cautions: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">Safety notes</h2>
      {cautions.length ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>
      ) : null}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-bold text-slate-700">General safety reminders</summary>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {GENERIC_SAFETY_BULLETS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
