# 11 — Gap Card (Flights + Hotels)

> The signature feature of the builder. Between two locked Contiki tours, this card fills the gap: feasibility-aware flights (Duffel) + user-chosen city hotels (Google Places, geo-fenced).

## Purpose
For the gap between Tour A ending (city X, date) and Tour B starting (city Y, date):
1. Suggest **direct, feasible flights** X→Y (Duffel)
2. Let the user **choose which city to stay in** during the gap (X or Y)
3. Suggest **hotels geo-fenced around the chosen city** (Google Places)

## Anatomy
```
┌─ dashed blue card ───────────────────────┐
│ ✈ 3-day gap · Rome → Bangkok             │
│   18 Jul – 21 Jul                         │
│ ── Available flights ──                   │
│ [BA Direct  08:00→10:30      $189] (sel)  │
│ [U2 Direct  14:00→16:45      $124]        │
│ ── Where would you like to stay? ──       │
│ [📍 Rome (end Tour 1)] [📍 Bangkok (start)]│  ← city picker
│ ── Hotels near Rome ──                     │
│ [🏨 Hotel name ★4.5 (1.2k)      View →]   │
└───────────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- Card: dashed 1.5px `blue-border` (#BFDBFE), `blue-soft` (#EFF6FF) bg, radius 14px
- Header: blue circle icon (✈), "N-day gap · X → Y" (blue, weight 700), date sub
- **Flights:**
  - Loading: spinner + "Searching flights X → Y…"
  - Each option: white card, airline code chip, flight number + green "Direct" badge, dep→arr times, price (green, weight 800). Selectable (click → blue border + bg). Cheapest auto-selected.
  - Empty: "No direct flights found for these dates."
- **Stay-city selector** (the key UX):
  - Label: "🏨 Where would you like to stay during the gap?"
  - Two buttons: `📍 {endCity} (End of Tour N)` and `📍 {startCity} (Start of Tour N+1)`
  - Selected → blue fill, white text
- **Hotels** (only after city chosen):
  - Loading: spinner + "Finding hotels near {city}…"
  - Each: white card, 🏨 thumb, name, address, rating (orange ★ + review count), "View →" Maps link (opens place). Selectable → orange border.
  - Empty: "No hotels found. Try the other city."

## Behaviour
```
on gap created:
  loadGapFlights(gap)  → POST /api/flights
                          { origin, destination, departure_date,
                            trip_b_start_iso, min_buffer_hours: 4,
                            city_transfer_minutes: 120 }
                       → direct + feasible offers; auto-select cheapest

on stay-city chosen:
  loadGapHotels(gap)   → POST /api/hotels { location: chosenCity,
                            check_in: gap.fromDate, check_out: gap.toDate }
                       → geo-fenced hotels; auto-select first
```

### Flight feasibility (mirrors multi-trip-concierge tool)
- Direct only (`segments.length === 1`)
- Must arrive before `tripB_start − buffer(4h) − cityTransfer(120min)`
- See 13-api-proxies for exact logic.

## Acceptance criteria
- [ ] Flights auto-load on gap creation (no button)
- [ ] Direct-only, feasibility-filtered, cheapest auto-selected
- [ ] City picker: user chooses end-city OR start-city to stay in
- [ ] Hotels load only after city chosen, geo-fenced to that city
- [ ] Maps link per hotel
- [ ] Loading + empty states for both
- [ ] Selecting flight/hotel updates package totals
