# Fishing Tool — Project Status

_Last updated: 2026-08-31_

## Snapshot

| Item | Value |
| --- | --- |
| Project | Ontario Fishing Tool |
| Path | `D:\Factory\fishing-tool` |
| Stack | Next.js 16, React 19, TypeScript, Tailwind 4, MapLibre, Open-Meteo, Ontario GIS |
| Purpose | Shore-first Ontario trip planner: locations, species, bait, rules, weather, saved trips |

## What it does now

- Plan a trip from the home page by date, target fish, and licence
- Explore 30+ curated destinations on cards or a map
- Open location pages with access, species, weather, official nearby access points, and FMZ guidance
- Use a species/bait guide with gear-fit notes for the Ugly Stik GX2 combo
- Check date-aware zone-wide windows for all 20 FMZs; waterbody exceptions still require official confirmation
- Save trips and checklists in the browser
- Install as a PWA in production

## Verification

```bash
npm test
npm run data:validate
npm run lint
npm run build
```

## Next actions

1. Walk a real GTA shore trip and a closed-season target in the UI.
2. Refresh FMZ tables when Ontario publishes the next regulations summary.
3. Add more southern shore-access waters if a trip needs them.

## Constraints

- Local-first; no accounts or social catch feeds
- Official Ontario sources remain the authority
- Never infer “legal to keep” when the zone, date, exception, or boundary is unresolved
