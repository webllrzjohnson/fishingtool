import type { GearOutfit } from "@/lib/gear/types";

/** Verified Ugly Stik GX2 USGXSP662M/35CBO specifications. */
export const defaultOutfit: GearOutfit = {
  id: "ugly-stik-gx2",
  name: 'Ugly Stik GX2 6\'6" Medium spinning combo (USGXSP662M/35CBO)',
  isDefault: true,
  confidence: "high",
  rod: {
    lengthFt: 6,
    lengthIn: 6,
    power: "medium",
    pieces: 2,
    lineRatingMinLb: 6,
    lineRatingMaxLb: 15,
    lureRatingMinOz: 0.125,
    lureRatingMaxOz: 0.625,
  },
  reel: {
    type: "spinning",
    sizeLabel: "35",
    gearRatio: "5.2:1",
    maxDragLb: 12,
    monoCapacity: "175/10",
  },
  line: {
    material: "mono",
    testLb: "8–10",
  },
  leader: {
    material: "fluoro",
    testLb: "12–15",
    length: "2–4 ft when needed",
  },
  safetyGear: ["Needle-nose pliers", "Line cutters", "PFD for exposed shore"],
  notes:
    "A versatile shore spinning combo. Add a wire or heavy fluorocarbon leader for pike. It is not muskie gear.",
  source: {
    name: "Ugly Stik GX2 Spinning Combo",
    url: "https://www.uglystik.com/products/gx2-spinning-combo-1624485",
    lastVerified: "2026-09-24",
    kind: "official",
  },
};
