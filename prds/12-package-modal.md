# 12 — Package Modal (Bookable Output)

## Purpose
"Done" state. Compiles tours + selected flights + selected hotels into one reviewable, bookable package with a total. The booking handoff point (booking API not yet available).

## Anatomy
```
┌─ modal ────────────────────────────┐
│ [green hero] Your package           │
│   2 tours · 1 flight included       │
│   Days | Tours | Est. cost          │
│ ──────────────────────────────────  │
│ 🗺️ Tour 1            $2,900          │
│ ✈️ Flight Rome→BKK   $189            │
│ 🏨 Hotel Rome        —               │
│ 🗺️ Tour 2            $2,200          │
│ ── Estimated total: $5,289 pp ──     │
│ [Enquire & book →]                   │
│ [Back to editing]                    │
└──────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- Overlay: `opacity-dark`, blur, centred
- Box: white, radius 20px, max-width 620px, scrollable
- Hero: `wander` green, "Your package" Mencken orange title, summary sub, 3 stat columns (Total days / Tours / Est. cost)
- Items: each row = icon tile + label/name/detail + price. Tour=dark tile, flight=blue tile, hotel=orange tile
- Total row: `cream-dark`, "Estimated total per person", big orange figure
- Note: small print re from-prices / flight availability / indicative hotels
- CTA: "Enquire & book →" Primary orange (booking API placeholder); "Back to editing" secondary

## Behaviour
- Built from current selectedTours + each gap's selectedFlight/selectedHotel
- Total = Σ tour prices + Σ selected flight prices
- "Enquire & book" → placeholder (future booking API)

## Acceptance criteria
- [ ] Lists all tours, selected flights, selected hotels in order
- [ ] Per-item prices; flights priced, hotels indicative
- [ ] Correct total (tours + flights)
- [ ] Mencken orange hero title on green
- [ ] Disclaimer note present
- [ ] Book CTA (placeholder) + back to editing
