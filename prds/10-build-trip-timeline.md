# 10 — Build-Trip Timeline

## Purpose
The package canvas. Selected Contiki tours render in date order down a vertical timeline; gaps between them auto-generate Gap Cards (11). This is where the package takes shape.

## Anatomy
```
[← Back]  Europe + Asia          [View package →]
          Jul – Sep 2026
─────────────────────────────────────
 ●──┐ [Tour 1 card (compact)]        ← orange dot
    │
 ●──┤ [GAP CARD: flights + hotel]    ← blue dot (component 11)
    │
 ●──┘ [Tour 2 card (compact)]
─────────────────────────────────────
[footer: Tours · Days · Est. cost · View package]

## Design spec (ref: design-system.md)
- Top bar: `wander` green, Back button (white@10%), title = combined geographies (Mencken orange), sub = date range
- Timeline track: vertical gradient line (orange→blue→orange @ 25% opacity), left-padded 52px
- Dots: 16px, orange for tours, blue for gaps, with cream ring + coloured glow
- **Tour segment:** compact trip card (variant 3) — 96px tall, photo left (120px) with originals badge, name/dates/price right, delete ✕
- **Gap segment:** Gap Card (component 11)
- Sticky footer: `wander` green, stats (Tours / Total days / Est. cost), "View package" Primary CTA. Slides up when ≥1 tour.

## Behaviour
- Tours render sorted by `departure_date`
- Between each consecutive pair, compute gap = `diffDays(tourA.end_date, tourB.departure_date)`; if >0, insert Gap Card and auto-load flights
- Remove tour → rebuild gaps; if <2 tours, return to search
- Footer cost = Σ tour from_price + Σ selected flight prices

## Acceptance criteria
- [ ] Tours in date order on vertical timeline
- [ ] Gaps auto-detected and inserted between tours
- [ ] Compact tour cards with delete
- [ ] Live footer totals (tours + selected flights)
- [ ] Back returns to search; <2 tours auto-returns
- [ ] Colour-coded dots (orange tour / blue gap)
