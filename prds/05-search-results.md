# 05 — Search Results

## Purpose
Render ranked trips returned by the AI inside the search modal (and reusable on a full SRP if needed). Each result shows the trip card plus AI reasoning.

## Anatomy
- Results header: "<N> trips matched" (orange count) — left; optional sort — right
- Grid: responsive trip cards (AI-reasoned variant)
- AI summary strip above grid (owned by Search Modal, see 04)

## Design spec
- Grid: 4 cols desktop / 3 @1024 / 2 @768 / 1 @480, gap 16px
- On dark `#161616` container (so charcoal cards are borderless)
- Cards: trip-card **variant 2** (AI-reasoned) — amber reason strip with ✦ and one-sentence "why this fits"
- Stagger entrance: fade + rise, 0.04s incremental delay per card

## States
- Loading (skeleton or status in modal)
- Populated
- Empty: centred 🌍 + "No trips matched — try a different description"

## Data shape
```js
match = { ...trip, aiReason: string, score: 0..1 }
```

## Acceptance criteria
- [ ] AI reason on every card
- [ ] Match count in orange
- [ ] Responsive grid on dark container
- [ ] Staggered entrance animation
- [ ] Empty state handled
