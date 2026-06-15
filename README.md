# Contiki AI Demo — Claude Code Handover

## What this is
An AI-powered Contiki demo with semantic trip search and a guided multi-trip builder.
Password-gated (`Go-Wander-2026`). Static HTML + Tailwind + vanilla JS on Vercel.

## What's built (working)
- `index.html` — Homepage with hero, trip rails, and AI semantic search modal
- `build-trip.html` — Multi-trip builder (needs guided flow rebuild per PRD 10)
- `api/search.js` — Anthropic semantic search + live TTC tour data
- `api/flights.js` — Duffel direct/feasibility-checked flights
- `api/hotels.js` — LiteAPI geo-fenced hotel search with rates
- `api/booking.js` — TTC booking proxy (iTravel-shaped)

## What needs building next (in order)
1. **`trip.html`** — Individual trip detail page (PRD 14). Read `prds/14-trip-page.md`.
2. **`booking.html`** — 5-step booking wizard (PRD 15). Read `prds/15-booking-journey.md`.
3. **Rebuild `build-trip.html`** — Guided journey flow (PRDs 09+10+11+12). The current file has an old multi-select UI. The new flow is: origin → start location → outbound flight → first trips → chained trips by flight reachability → gap flights+hotels → return flight → package.
4. **Wire trip card links** — `cardHTML()` in `index.html` currently has `href="#" onclick="return false"`. Update to `href="/trip/${t.id}"`.

## Vercel environment variables (all set)
- `ANTHROPIC_API_KEY` — Claude semantic search
- `TTC_API_TOKEN` — Live Contiki tour data
- `DUFFEL_API_KEY` — Live flights
- `LITEAPI_KEY` — Live hotels

## Key architectural decisions
- All API keys server-side only — never in client HTML/JS
- No mock/fallback data — all proxies return real errors if keys missing
- TTC API v4 schema: content at `tour.tourOptions[0].seasons[0].content[0]`, prices at `departures[0].sellingRegions[0]`
- LiteAPI rates require `includeHotelData: true` to return hotel names
- Duffel: single call with `?return_offers=true`, direct-only (`segments.length===1`), feasibility-filtered
- Booking contract is iTravel-shaped — ready for TTC booking API via `departure.links.book`

## Design system
Read `prds/design-system.md` before touching any UI.
- Orange `#FF5900` · Green `#1C4A3D` · Sale yellow `#FFE100` · Black `#0A0C0A` · Cream `#FFFAF2`
- Hero font: Mencken Std Head Compressed (Playfair Display fallback in dev)
- Body font: Halyard Display/Text (Inter fallback in dev)

## Development lifecycle
Read `CLAUDE.md`. Use `/spec → /design-review → /build → /self-test → /refine → /ship`.
