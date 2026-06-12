# 12 — Package, Price & Save

## Purpose
The end of the guided journey. Compiles the full chain — outbound flight, every Contiki trip, every gap flight + hotel, return flight — into one priced, saveable package. Booking is a placeholder for now.

## Anatomy
```
┌─ modal ────────────────────────────┐
│ [green hero] Your adventure         │
│   London → Bangkok → … → home       │
│   Days | Tours | Flights | Est. cost│
│ ──────────────────────────────────  │
│ ✈️ Outbound London→Bangkok   $610   │
│ 🗺️ Trip 1: SE Asia           $2,200 │
│ ✈️ Connect Hanoi→Tokyo        $280  │
│ 🏨 Hotel near Tokyo (2 nts)   $240  │
│ 🗺️ Trip 2: Japan Uncovered   $2,900 │
│ ✈️ Return Osaka→London        $590  │
│ ── Estimated total: $6,820 pp ──     │
│ ⚠ Prices may change until booked     │
│ [Save my trip]                       │
│ [Book now — coming soon]             │
│ [Back to editing]                    │
└──────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- Overlay: `opacity-dark`, blur, centred. Box white, radius 20px, max-width 640px, scrollable.
- Hero: `wander` green, "Your adventure" Mencken orange title; sub = origin → … → home; stat columns (Days / Tours / Flights / Est. cost).
- Items in journey order: outbound flight, then per trip [trip, gap flight, gap hotel], then return flight. Each row = coloured icon tile + label/name/detail + price.
  - Flight tiles blue, trip tiles dark, hotel tiles orange.
- Total row: `cream-dark`, big orange figure, "per person".
- **Price caveat:** prominent but tasteful line — "⚠ Prices may change until your trip is booked." (Required.)
- CTAs:
  - **Save my trip** — Primary orange. Persists the package (localStorage for demo, or note where it would save). Confirm "Saved!".
  - **Book now** — present but disabled / "coming soon" tag (booking API not yet available).
  - **Back to editing** — secondary.

## Behaviour
- Built from `journey`: outboundFlight + segments[] (trips, gap flights, gap hotels) + returnFlight.
- Total = Σ tour from_price + Σ selected flight prices + Σ selected hotel prices (hotels may be indicative).
- Save → store journey object; show confirmation; (future: sync to account/CRM).
- Book → placeholder; explain booking is coming and offer "enquire" fallback.

## Acceptance criteria
- [ ] Full chain listed in journey order (outbound → trips/gaps → return)
- [ ] Per-item prices; correct total
- [ ] "Prices may change until booked" caveat shown prominently
- [ ] Save persists the package + confirms
- [ ] Book CTA present but clearly "coming soon" (not functional)
- [ ] Mencken orange hero on green
- [ ] Back to editing returns to builder
