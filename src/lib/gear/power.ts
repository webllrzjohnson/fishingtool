import type { RodPower } from "@/lib/gear/types";

export const POWER_ORDER: Record<RodPower, number> = {
  "ultra-light": 1,
  light: 2,
  "medium-light": 3,
  medium: 4,
  "medium-heavy": 5,
  heavy: 6,
  "extra-heavy": 7,
};

export function powerIndex(power: RodPower) {
  return POWER_ORDER[power];
}

export function parseLineTestLb(value: string): number | undefined {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

export function formatRodLength(rod: { lengthFt: number; lengthIn?: number }) {
  if (rod.lengthIn) return `${rod.lengthFt}'${rod.lengthIn}"`;
  return `${rod.lengthFt}'`;
}
