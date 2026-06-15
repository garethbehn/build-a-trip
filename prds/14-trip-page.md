# 14 — Trip Page

## Purpose
Full detail page for a single Contiki tour. Reached by clicking a trip card from search results or the homepage. The primary conversion page — everything here is designed to get the user to hit "Book now".

## URL structure
`/trip/{tourId}` — e.g. `/trip/12345`

## Data source
TTC API v4: `GET /brands/contiki/tours` filtered by id, or a dedicated `/brands/contiki/tours/{id}` if available.
All fields come from: `tour.tourOptions[0].seasons[0].content[0]` and `departures[0].sellingRegions[0]`.

## Anatomy (top to bottom)

### 1. Hero
- Full-bleed image carousel from `content.images[]`
- `opacity-dark-gradient-ascending` overlay at bottom
- Tour name overlaid: **Mencken Std Head Compressed**, lowercase, orange `#FF5900`, large
- Region + duration pill top-left
- "originals" badge top-centre (same as card)

### 2. Key facts bar (sticky below nav on scroll)
Horizontal row of quick facts using the travel icon set:
| Icon | Field | Source |
|------|-------|--------|
| Start location | `content.startPlace.city` | |
| End location | `content.endPlace.city` | |
| Duration | sum of `itinerary[].duration` | |
| Countries | `content.countriesVisited.length` | |
| Group size | `accommodation[].maxPassengers` | |
| Tour style | `content.tourStyle` | |

### 3. Departure selector
Grid of available departures from `season.departures[]`:
- Show startDate, endDate, availability status, price
- Selected departure highlights in orange
- `sellingRegions[0].availability` = `available` / `onRequest` / `unavailable`
- Price from `sellingRegions[0].fromPrice.adultPrice` + currency

### 4. Description
`content.description` — Halyard Text Regular, comfortable reading width (~680px)

### 5. Highlights
`content.highlights[]` — each has a `title` and `items[]`. Render as icon-led bullet groups in two columns.

### 6. Itinerary accordion
`content.itinerary[]` — each day:
- Day number (`startDay`), title, duration
- `locationsVisited[]` as a breadcrumb
- `text[]` as the day description
- `accommodation` name
- `meals[]` as icons (breakfast/lunch/dinner)
- Collapsed by default, open on click

### 7. What's included
`content.whatsIncluded[]` — title + items[]. Render as two-column checklist with orange tick icons.

### 8. Accommodation
`season.accommodation[]` — room types, occupancy rules. Simple table.

### 9. Pricing panel (sticky right sidebar desktop / bottom sheet mobile)
- Selected departure dates + price
- Room type selector (single/twin/triple from `roomsOccupancy`)
- Discounts if present (`sellingRegions[0].discounts[]`)
- "Was" price from `oldFullPrice` if available
- **"Book now" Primary CTA** → goes to booking journey (PRD 15)
- "Add to trip builder" Secondary CTA → adds to multi-trip builder

### 10. Map
Simple static map showing start → end city route (Google Maps embed or placeholder).

## Design spec (ref: design-system.md)
- Page bg: `dawn` (#FFFAF2)
- Hero: full-bleed, min-height 70vh
- Section headings: Halyard Display Bold, `wander` green
- Key facts bar: white bg, `border-bottom` `ui-border`, sticky z-100
- Travel icons: custom orange icon set (Material Symbols fallback)
- Accordion: border `ui-border`, Halyard, smooth max-height transition
- Pricing panel: white card, `shadow-xl`, sticky top-24, radius 16px

## States
- Loading: skeleton screens for hero + facts bar
- Tour not found: friendly error with "Back to search"
- No available departures: show tour info but disable Book now, show "Contact us"

## Acceptance criteria
- [ ] Data driven entirely from TTC API — no hardcoded content
- [ ] Hero image carousel from `content.images[]`
- [ ] Key facts bar sticky on scroll, travel icons orange
- [ ] Departure selector — all departures shown, selected highlights orange
- [ ] Itinerary accordion — all days, locations, meals, accommodation
- [ ] What's included checklist from TTC data
- [ ] Pricing panel sticky, updates on departure selection
- [ ] "Book now" → booking journey (PRD 15)
- [ ] "Add to trip builder" → persists tour to builder session
- [ ] Responsive: sidebar collapses to bottom sheet on mobile
