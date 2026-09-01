import type {
  LicenceType,
  RuleEvaluation,
  SeasonWindow,
  SpeciesRule,
  WaterbodyException,
  WeekdayAnchor,
} from "../types";

type Season = "winter" | "spring" | "summer" | "fall" | "unknown";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_DAY = /^(\d{2})-(\d{2})$/;

function validDateParts(year: number, month: number, day: number): boolean {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return validDateParts(year, month, day) ? { year, month, day } : null;
}

export function nthWeekdayOfMonth(year: number, anchor: WeekdayAnchor): string | null {
  if (anchor.month < 1 || anchor.month > 12 || anchor.nth < 1 || anchor.nth > 5) return null;
  const first = new Date(Date.UTC(year, anchor.month - 1, 1));
  const offset = (anchor.weekday - first.getUTCDay() + 7) % 7;
  const baseDay = 1 + offset + (anchor.nth - 1) * 7;
  if (!validDateParts(year, anchor.month, baseDay)) return null;
  const shifted = new Date(Date.UTC(year, anchor.month - 1, baseDay + (anchor.offsetDays ?? 0)));
  const month = shifted.getUTCMonth() + 1;
  const date = shifted.getUTCDate();
  if (!validDateParts(shifted.getUTCFullYear(), month, date)) return null;
  return `${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
}

function resolveWindow(window: SeasonWindow, year: number): { start: string; end: string; mode?: SeasonWindow["mode"] } | null {
  const start = window.startAnchor ? nthWeekdayOfMonth(year, window.startAnchor) : window.start;
  const end = window.endAnchor ? nthWeekdayOfMonth(year, window.endAnchor) : window.end;
  if (!start || !end) return null;
  if (parseMonthDay(start) === null || parseMonthDay(end) === null) return null;
  return { start, end, mode: window.mode };
}

function parseMonthDay(value: string): number | null {
  const match = MONTH_DAY.exec(value);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  // A leap year permits every month-day that can occur in a regulation window.
  return validDateParts(2000, month, day) ? month * 100 + day : null;
}

function speciesIdFor(rule: SpeciesRule): string {
  return (
    rule.speciesId ??
    rule.species
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function limitFor(rule: SpeciesRule, licenceType: LicenceType): string {
  if (licenceType === "conservation" && rule.conservationLimit) {
    return rule.conservationLimit;
  }
  return rule.sportLimit;
}

export function seasonForDate(date: string): Season {
  const parsed = parseDate(date);
  if (!parsed) return "unknown";

  if (parsed.month >= 3 && parsed.month <= 5) return "spring";
  if (parsed.month >= 6 && parsed.month <= 8) return "summer";
  if (parsed.month >= 9 && parsed.month <= 11) return "fall";
  return "winter";
}

export function isDateInWindow(date: string, start: string, end: string): boolean {
  const parsedDate = parseDate(date);
  const parsedStart = parseMonthDay(start);
  const parsedEnd = parseMonthDay(end);
  if (!parsedDate || parsedStart === null || parsedEnd === null) return false;

  const monthDay = parsedDate.month * 100 + parsedDate.day;
  if (parsedStart <= parsedEnd) {
    return monthDay >= parsedStart && monthDay <= parsedEnd;
  }
  return monthDay >= parsedStart || monthDay <= parsedEnd;
}

export function evaluateRule(
  rule: SpeciesRule,
  date: string,
  licenceType: LicenceType,
  options: {
    exceptions?: readonly WaterbodyException[];
    hasWaterbodyExceptions?: boolean;
    ambiguousBoundary?: boolean;
  } = {},
): RuleEvaluation {
  const speciesId = speciesIdFor(rule);
  const limit = limitFor(rule, licenceType);
  const exceptionIds = options.exceptions?.map((exception) => exception.id) ?? [];
  const forcedOfficialCheck = Boolean(
    exceptionIds.length || options.hasWaterbodyExceptions || options.ambiguousBoundary,
  );

  let evaluation: RuleEvaluation;

  if (!parseDate(date)) {
    evaluation = {
      speciesId,
      status: "unknown",
      label: "Date could not be evaluated",
      reason: `Invalid date: ${date}`,
      requiresOfficialCheck: true,
    };
  } else if (/^\s*closed all year\s*$/i.test(rule.season)) {
    evaluation = {
      speciesId,
      status: "closed",
      label: "Closed all year",
      reason: rule.season,
      limit,
      sizeNote: rule.sizeNote,
      requiresOfficialCheck: false,
    };
  } else if (rule.openWindows !== undefined) {
    const year = parseDate(date)?.year;
    const resolved =
      year === undefined
        ? []
        : rule.openWindows.map((window) => resolveWindow(window, year));
    const windowsAreKnown = resolved.length > 0 && resolved.every((window) => window !== null);

    if (!windowsAreKnown) {
      evaluation = {
        speciesId,
        status: "unknown",
        label: "Season window needs verification",
        reason: "One or more structured season windows are missing or invalid.",
        requiresOfficialCheck: true,
      };
    } else {
      const activeWindow = resolved.find((window) => window && isDateInWindow(date, window.start, window.end));

      if (!activeWindow) {
        evaluation = {
          speciesId,
          status: "closed",
          label: "Closed",
          reason: `The date is outside the listed ${rule.season} season.`,
          limit,
          sizeNote: rule.sizeNote,
          requiresOfficialCheck: false,
        };
      } else if (activeWindow.mode === "catch-and-release") {
        evaluation = {
          speciesId,
          status: "catch-and-release",
          label: "Catch and release only",
          reason: `Catch-and-release season: ${activeWindow.start}–${activeWindow.end}.`,
          sizeNote: rule.sizeNote,
          requiresOfficialCheck: false,
        };
      } else {
        evaluation = {
          speciesId,
          status: "open",
          label: `Open — ${limit}`,
          reason: `Open season: ${activeWindow.start}–${activeWindow.end}.`,
          limit,
          sizeNote: rule.sizeNote,
          requiresOfficialCheck: false,
        };
      }
    }
  } else if (/^\s*open all year\s*$/i.test(rule.season)) {
    evaluation = {
      speciesId,
      status: "open",
      label: `Open — ${limit}`,
      reason: rule.season,
      limit,
      sizeNote: rule.sizeNote,
      requiresOfficialCheck: false,
    };
  } else {
    evaluation = {
      speciesId,
      status: "unknown",
      label: "Season needs verification",
      reason: `No structured window is available for "${rule.season}".`,
      requiresOfficialCheck: true,
    };
  }

  if (rule.combinedGroup && !evaluation.requiresOfficialCheck) {
    evaluation = {
      ...evaluation,
      reason: `${evaluation.reason} Combined-species limit: ${rule.combinedGroup}.`,
    };
  }

  if (!forcedOfficialCheck) return evaluation;

  const reason = options.ambiguousBoundary
    ? "The waterbody boundary is ambiguous; check the official regulations."
    : exceptionIds.length
      ? `Curated exception record${exceptionIds.length === 1 ? "" : "s"}: ${exceptionIds.join(", ")}. Check the official regulations.`
      : "This waterbody has exceptions; check the official regulations.";

  return {
    ...evaluation,
    status: "exception-check-required",
    label: "Official exception check required",
    reason,
    ...(exceptionIds.length ? { exceptionIds } : {}),
    requiresOfficialCheck: true,
  };
}

export function evaluateRules(
  rules: SpeciesRule[],
  date: string,
  licenceType: LicenceType,
  options: {
    exceptions?: readonly WaterbodyException[];
    hasWaterbodyExceptions?: boolean;
    ambiguousBoundary?: boolean;
  } = {},
) {
  return rules.map((rule) => evaluateRule(rule, date, licenceType, options));
}
