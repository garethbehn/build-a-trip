# 13 — API Proxies (Backend)

> Three Vercel Edge Functions. All keys server-side only. Each degrades to mock data when its key is absent so the demo always works.

## `/api/search` — Anthropic semantic search (+ optional live TTC)

### Request
```json
POST { "query": "Europe in July then Asia in September", "trips": [...] }
```

### Logic
1. If `TTC_API_TOKEN` set → fetch live tours from `https://api.ttc.com/brands/contiki/tours` (Basic auth `token:{TTC_API_TOKEN}`, Accept `application/vnd.ttc.v4+json`), normalise to internal shape. Else use client-supplied `trips`.
2. If `ANTHROPIC_API_KEY` set → call Messages API (`claude-sonnet-4-20250514`, max_tokens 1000) with system prompt instructing JSON-only ranking. Else → keyword fallback.
3. Return `{ summary, matches: [{ id, reason, score }] }`.

### System prompt (search)
```
You are a Contiki travel expert helping 18-35 year olds find group trips.
Given a free-text query, rank the best matching trips (up to 6) and explain
briefly why each fits. Respond ONLY with valid JSON, no markdown:
{"summary":"...","matches":[{"id":"...","reason":"...","score":0.0}]}
```

### TTC normalisation
```
tour → { id, name, geography, destinations[], duration_days,
         departure_date, end_date, from_price, currency, image, tags[] }
```

---

## `/api/flights` — Duffel (mirrors multi-trip-concierge tool)

### Request
```json
POST {
  "origin": "FCO", "destination": "BKK",
  "departure_date": "2026-07-18",
  "trip_b_start_iso": "2026-09-06T00:00:00Z",
  "min_buffer_hours": 4,
  "city_transfer_minutes": 120
}
```

### Logic (exact)
1. POST `https://api.duffel.com/air/offer_requests?return_offers=true`
   - Headers: `Authorization: Bearer {DUFFEL_API_KEY}`, `Duffel-Version: v2`, `Content-Type: application/json`
   - Body: single slice (origin/destination/departure_date, origin_type/destination_type `airport`), 1 adult, economy
2. From `data.offers`, keep **direct only** (`slices[0].segments.length === 1`)
3. **Feasibility filter:** if `trip_b_start_iso` given, compute
   `latestArrival = tripBStart − min_buffer_hours − city_transfer_minutes`;
   keep offers whose `segments[0].arriving_at <= latestArrival`
4. Return up to 5: `{ offer_id, flight: "{carrier}{number}", airline, departing_at, arriving_at, price, currency, booking_url }`, plus `direct_possible`
5. No key → mock offers (`_mock: true`)

### Reference implementation (Decagon tool)
```js
// single call with return_offers=true
// filter segments.length === 1 (direct)
// arrival <= tripB_start - buffer - transfer
```

---

## `/api/hotels` — Google Places (New API)

### Request
```json
POST { "location": "Rome", "check_in": "2026-07-18", "check_out": "2026-07-21" }
```

### Logic (exact — New Places API)
1. POST `https://places.googleapis.com/v1/places:searchText`
   - Headers: `Content-Type: application/json`, `X-Goog-Api-Key: {GOOGLE_PLACES_API_KEY}`,
     `X-Goog-FieldMask: places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.priceLevel,places.id`
   - Body: `{ "textQuery": "hotels in {location}" }`
2. Map up to 5: `{ id, name, address, rating, reviews, price_level, photo_name, maps_url }`
3. `maps_url` = `https://www.google.com/maps/place/?q=place_id:{id}`
4. No key → mock hotels (`_mock: true`)

> Geo-fencing: the textQuery scopes to the chosen city. For tighter geo-fence, can add `locationBias` with the city's lat/lng + radius in a future iteration.

---

## Shared
- All three: CORS headers, OPTIONS preflight, POST-only, try/catch → graceful error or mock.
- Runtime: `export const config = { runtime: 'edge' }`
- Never log keys.

## Acceptance criteria
- [ ] All keys server-side only; never in client
- [ ] Each proxy returns realistic mock when key absent
- [ ] Duffel: single call w/ return_offers, direct-only, feasibility-filtered
- [ ] Places: New API w/ X-Goog-FieldMask, not legacy textsearch
- [ ] Search: TTC live when token present, keyword fallback when no Anthropic key
- [ ] CORS + OPTIONS + POST-only on all
