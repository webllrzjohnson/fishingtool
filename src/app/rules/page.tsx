import type { Metadata } from "next";
import { LicenceFmzGuide } from "@/components/rules/licence-fmz-guide";
import { RulesChecker } from "@/components/rules/rules-checker";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { fmzLabels } from "@/lib/fmz-rules";
import type { FmzId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ontario fishing rules",
  description: "Check Ontario fishing seasons, limits, and licence requirements by zone and date.",
};

function readFmz(value: string | string[] | undefined): FmzId | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate in fmzLabels ? (candidate as FmzId) : undefined;
}

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFmz = readFmz(params.fmz);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Rules"
        tone="red"
        title="Check before you cast or keep"
        intro="Choose the zone, date, licence, and fish. This is conservative and always links to Ontario's official source."
      />

      <div className="mt-7">
        <RulesChecker initialFmz={initialFmz} />
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-black tracking-tight">Licences and zone summaries</h2>
        <div className="mt-4">
          <LicenceFmzGuide />
        </div>
      </div>
    </PageShell>
  );
}
