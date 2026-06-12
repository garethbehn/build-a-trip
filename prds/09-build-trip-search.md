# 09 — Build-Trip Search (Entry)

## Purpose
Entry screen for the Multi-Trip Builder. A semantic search box ("Where and when?") that returns Contiki tours to combine into a package. Replaces any home-city form — the search box IS the start.

## Anatomy
```
        Multi-Trip Builder            ← eyebrow
        Build your adventure          ← Mencken hero, orange
   [supporting copy]
   ┌──────────────────────────────┐
   │ 🔍 Where and when?   [Find]   │   ← semantic search bar
   └──────────────────────────────┘
   [chip] [chip] [chip] [chip]      ← example prompts
   ─ AI understood ─ [summary]
   ── results: selectable trip cards ──
   <N> tours matched — select 2+    [Build package →]

## Design spec (ref: design-system.md)
- Hero band: `wander` (#1C4A3D) green bg, centred
- Eyebrow: "Multi-Trip Builder", white@40%, uppercase, 0.72rem, tracked
- Title: "Build your adventure", **Mencken** Bold italic, `primary-1` orange, clamp(2.2rem,5vw,3.5rem)
- Search bar: white, radius 14px, shadow-2xl, orange search icon, placeholder **"Where and when? e.g. Europe in July then Southeast Asia in September…"**, orange "Find trips" Primary button. Focus → 2px orange border.
- Chips: white@8% on green, hover → brighter. Example multi-trip prompts.
- Status + AI understood strip: same pattern as search modal (04)
- Results section: `cream-dark` bg, selectable trip cards (variant 4)

## Behaviour
- Enter / Find → POST `/api/search` with all TOURS
- Returns ranked tours with AI reasons + dates shown
- User selects 2+ (cards highlight orange, button "✓ Added")
- "Build package" enabled at 2+ selections → transitions to Timeline (10)
- Selected tours auto-sorted by `departure_date`

## Data
Tours carry TTC fields incl. `departure_date`/`end_date` (needed for gap calc downstream).

## Acceptance criteria
- [ ] Semantic "Where and when?" search (not a form)
- [ ] Mencken orange hero title on green
- [ ] AI-ranked selectable tour cards with dates
- [ ] Min 2 selection gate
- [ ] Selection sorted by departure date
- [ ] Transitions to timeline builder
