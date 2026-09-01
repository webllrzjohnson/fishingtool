# Updating Ontario fishing legal data

This app stores **planning summaries**, not the legal text. Refresh curated rule tables whenever Ontario publishes a new Fishing Regulations Summary or variation orders.

## Annual checklist

1. Open the current [Ontario Fishing Regulations Summary](https://www.ontario.ca/document/ontario-fishing-regulations-summary).
2. Update structured windows in `src/lib/fmz-rules.ts` for **all 20 FMZs** from the current Ontario Fishing Regulations Summary. Zones 16 and 20 remain the most frequently used GTA tables.
3. Download the latest [recreational fishing regulations exceptions spreadsheet](https://data.ontario.ca/dataset/recreational-fishing-regulations-data).
4. Update `src/data/curated/exceptions.ts` from the exceptions spreadsheet. Each entry must identify one curated `locationId`, use that location's FMZ, include its effective date, and cite an official source; do not encode exception status only in a location caution or prose summary.
5. Run `npm run data:validate` to reject orphaned, duplicate, mismatched-FMZ, malformed, or non-official curated exception records.
6. Change `lastVerified` dates on source records in `src/lib/sources.ts`, `src/lib/fishing-locations.ts`, and `src/data/curated/species.ts`.
7. Run `npm test`, `npm run lint`, and `npm run build`.
8. If a season uses “first Saturday in May” or similar, either leave the season unstructured (so the checker returns `unknown`) or record the exact calendar dates for that licence year only.

## Review gate

- Treat a regulation refresh as a reviewed data change: retain the official source URL and effective date for every changed rule or exception, and have a second reviewer compare changes against the current Ontario publication before merge or deploy.
- A curated exception must force `exception-check-required` in location guidance. It is a safety flag, not a substitute for modelling a waterbody-specific limit.
- If an exception cannot be linked to a curated location or accurately structured, leave the relevant outcome unresolved and direct the angler to Fish ON-Line; never infer an `open` status from prose.

## Never do this

- Do not scrape regulation HTML during a user request.
- Do not mark a fish `open` to keep when the FMZ, date, licence, exception, or boundary is unresolved.
- Do not treat Destination Ontario or community reports as legal authority.

## Cache policy

- Weather: 30 minutes (`src/app/api/weather/route.ts`).
- Ontario access points and FMZ lookups: 24 hours.
- Curated location and species data: version-controlled in git.
