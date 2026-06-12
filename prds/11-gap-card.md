# 11 — Gap Card (Flight + Hotels Between Trips)

> The connective tissue between two Contiki trips in the guided journey (10). A feasibility-checked flight plus geo-fenced hotels positioning the traveller for the NEXT trip's start.

## Purpose
For the gap between Trip N (ends city X, date) and Trip N+1 (starts city Y, date):
1. Suggest a **direct, feasibility-checked flight** X → Y (Duffel back-to-back checker)
2. Suggest **hotels geo-fenced around Y** (the next trip's start) so the traveller is positioned to depart — via LiteAPI lat/lng radius search

> KEY CHANGE from prior version: hotels are always near the NEXT trip's start location (Y), not a user-chosen city. The traveller needs to be where the next tour begins.

## Anatomy
```
┌─ dashed blue card ───────────────────────┐
│ ✈ Connecting · Rome → Bangkok            │
│   Trip 1 ends 18 Jul · Trip 2 starts 21 Jul│
│ ── Feasible flight ──                     │
│ [TG911 Direct  10:00→05:30+1   $640](sel) │
│   ✓ Arrives 2 days before Trip 2          │
│ ── Hotels near Bangkok (your next start) ─│
│ [🏨 Hotel near departure  ★4  $120](sel)  │
│ [🏨 …]                                     │
└───────────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- Card: dashed 1.5px `blue-border`, `blue-soft` bg, radius 14px
- Header: blue ✈ icon, "Connecting · X → Y", date sub showing both trip boundaries
- **Flight section:**
  - Auto-loads on gap creation (no button)
  - Direct only, feasibility-checked (arrives before Trip N+1 start − 4h buffer − 120min transfer)
  - Each option: airline/flight no., Direct badge, times, price (green). Feasibility note ("✓ Arrives X before next trip"). Cheapest auto-selected.
  - Empty: "No feasible direct flight — try removing this trip or choosing another."
- **Hotels section (geo-fenced to NEXT start, Y):**
  - Label: "Hotels near {Y} (your next start)"
  - LiteAPI lat/lng radius search around Y
  - Each: name, address, star rating, price/night, room type, cancellation policy, Maps link, offer_id (for future booking). Selectable → orange border. First auto-selected.
  - Loading + empty states.

## Behaviour
```
on gap created:
  loadFlights → POST /api/flights { origin: X_iata, destination: Y_iata,
                  departure_date, trip_b_start_iso, min_buffer_hours:4,
                  city_transfer_minutes:120 }
  loadHotels  → POST /api/hotels { location: Y, lat: Y_lat, lng: Y_lng,
                  radius_meters: 5000, check_in, check_out }
```

## Acceptance criteria
- [ ] Flight auto-loads, direct-only, feasibility-checked, cheapest pre-selected
- [ ] Feasibility note shown ("arrives before next trip")
- [ ] Hotels ALWAYS geo-fenced to the NEXT trip's start city (not user-chosen)
- [ ] Hotel offer_id captured for future booking
- [ ] Loading + empty states for both
- [ ] Selecting updates package totals
- [ ] No-feasible-flight case handled without dead-ending
