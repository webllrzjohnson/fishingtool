"use client";

import { useState } from "react";
import { getSetupTemplate, setupTemplates } from "@/data/curated/gear-setups";
import type { GearOutfit, RodPower, ReelType } from "@/lib/gear/types";

const rodPowers: RodPower[] = [
  "ultra-light",
  "light",
  "medium-light",
  "medium",
  "medium-heavy",
  "heavy",
  "extra-heavy",
];

const reelTypes: ReelType[] = [
  "spinning",
  "baitcasting",
  "spincast",
  "centerpin",
  "fly",
  "line-counter",
  "inline-ice",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function OutfitForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: GearOutfit;
  onSave: (outfit: GearOutfit) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [templateId, setTemplateId] = useState(initial?.templateId ?? "");
  const [lengthFt, setLengthFt] = useState(String(initial?.rod.lengthFt ?? 6));
  const [lengthIn, setLengthIn] = useState(String(initial?.rod.lengthIn ?? 6));
  const [power, setPower] = useState<RodPower>(initial?.rod.power ?? "medium");
  const [reelType, setReelType] = useState<ReelType>(initial?.reel.type ?? "spinning");
  const [sizeLabel, setSizeLabel] = useState(initial?.reel.sizeLabel ?? "35");
  const [lineTest, setLineTest] = useState(initial?.line.testLb ?? "8–10");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function applyTemplate(id: string) {
    const template = getSetupTemplate(id);
    if (!template) return;
    setTemplateId(id);
    setName(template.title);
    setPower(template.rod.powerRange[Math.min(1, template.rod.powerRange.length - 1)]);
    setReelType(template.reel.types[0]);
    setNotes(template.summary);
  }

  function submit() {
    const outfitName = name.trim() || "Custom outfit";
    onSave({
      id: initial?.id ?? (slugify(outfitName) || `outfit-${Date.now()}`),
      name: outfitName,
      templateId: templateId || undefined,
      notes: notes || undefined,
      rod: {
        lengthFt: Number(lengthFt) || 6,
        lengthIn: lengthIn ? Number(lengthIn) : undefined,
        power,
        lineRatingMinLb: initial?.rod.lineRatingMinLb,
        lineRatingMaxLb: initial?.rod.lineRatingMaxLb,
        lureRatingMinOz: initial?.rod.lureRatingMinOz,
        lureRatingMaxOz: initial?.rod.lureRatingMaxOz,
      },
      reel: {
        type: reelType,
        sizeLabel: sizeLabel.trim() || "unknown",
        gearRatio: initial?.reel.gearRatio,
        maxDragLb: initial?.reel.maxDragLb,
        monoCapacity: initial?.reel.monoCapacity,
      },
      line: {
        material: initial?.line.material ?? "mono",
        testLb: lineTest.trim() || "8–10",
      },
      leader: initial?.leader,
      safetyGear: initial?.safetyGear,
      isDefault: initial?.isDefault,
      source: initial?.source,
      confidence: initial?.confidence ?? "medium",
    });
  }

  return (
    <form
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="block text-sm font-bold">
        Start from template
        <select
          value={templateId}
          onChange={(event) => applyTemplate(event.target.value)}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3"
        >
          <option value="">Custom entry</option>
          {setupTemplates.map((template) => (
            <option key={template.id} value={template.id}>{template.title}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold">
        Outfit name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3"
          placeholder="My shore spinning combo"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-bold">
          Rod length (ft)
          <input value={lengthFt} onChange={(event) => setLengthFt(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3" />
        </label>
        <label className="text-sm font-bold">
          Inches
          <input value={lengthIn} onChange={(event) => setLengthIn(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3" />
        </label>
        <label className="text-sm font-bold">
          Power
          <select value={power} onChange={(event) => setPower(event.target.value as RodPower)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3">
            {rodPowers.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-bold">
          Reel type
          <select value={reelType} onChange={(event) => setReelType(event.target.value as ReelType)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3">
            {reelTypes.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          Reel size label
          <input value={sizeLabel} onChange={(event) => setSizeLabel(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="35, 2500, etc." />
        </label>
        <label className="text-sm font-bold">
          Main line test
          <input value={lineTest} onChange={(event) => setLineTest(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 px-3" />
        </label>
      </div>
      <label className="block text-sm font-bold">
        Notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3" />
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="min-h-11 rounded-xl bg-teal-800 px-4 font-black text-white">Save outfit</button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-slate-300 px-4 font-bold">Cancel</button>
      </div>
    </form>
  );
}
