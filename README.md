# Fishing Tool

Shore-first Ontario fishing trip planner.

## Goal

Answer five questions before you leave:

1. Where can I fish?
2. What is commonly caught there?
3. What bait, lures, and rigs should I take?
4. What rules likely apply on my date?
5. Are access, weather, and safety acceptable?

This is a **planning assistant**, not legal advice. Always confirm the exact waterbody, species, season, size limits, and exceptions on [Fish ON-Line](https://www.ontario.ca/fishonline) and the current [Ontario Fishing Regulations Summary](https://www.ontario.ca/document/ontario-fishing-regulations-summary).

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Next.js (usually `http://localhost:3000`).

## Verify

```bash
npm test
npm run data:validate
npm run lint
npm run build
```

## Your default setup

- Rod/reel: Ugly Stik GX2 6'6" Medium spinning combo (6–15 lb)
- Licence: Ontario Outdoors Card + Sport Fishing Licence
- Area: Toronto / GTA first, with popular Ontario destinations beyond the GTA

## Current features

- 30+ curated Ontario destinations with shore-suitability labels
- Species and bait guide for common Ontario sport fish
- Date-aware zone-wide windows for all 20 Fisheries Management Zones, plus conservative waterbody-exception warnings
- Official access-point and FMZ lookups from Ontario Open Data
- 7-day wind and weather from Open-Meteo
- Local saved trips, checklists, copy, and print
- PWA install support in production

## Updating legal data

See [docs/legal-data-updates.md](docs/legal-data-updates.md).
