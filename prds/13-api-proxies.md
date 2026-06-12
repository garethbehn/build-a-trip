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

## `/api/hotels` — LiteAPI (hotel search)

Docs: https://docs.liteapi.travel/reference/overview
Auth: `X-API-key` header
Set `LITEAPI_KEY` in Vercel environment variables.

### Request
```json
POST {
  "location": "Rome",
  "check_in": "2026-07-18",
  "check_out": "2026-07-21",
  "country_code": "IT",        // optional, auto-derived if absent
  "lat": 41.9028,              // optional — use for geo-fenced radius search
  "lng": 12.4964,
  "radius_meters": 5000
}
```

### Logic (two-step)

**Step 1: GET hotel IDs**
- If `lat`/`lng` provided → geo-fenced radius search (preferred for gap-city use case):
  `GET /v3.0/data/hotels?latitude={lat}&longitude={lng}&radius={radius_meters}&limit=20`
- Else city search:
  `GET /v3.0/data/hotels?countryCode={cc}&cityName={city}&limit=20`
- Returns hotel IDs to feed into step 2.

**Step 2: POST /hotels/rates** for live availability and pricing
```json
POST /v3.0/hotels/rates
{
  "hotelIds": ["id1", "id2", ...],
  "checkin": "2026-07-18",
  "checkout": "2026-07-21",
  "occupancies": [{ "adults": 1 }],
  "currency": "USD",
  "guestNationality": "GB"
}
```
Returns rates with `offerId` (usable for prebook → book flow), room type, price, cancellation policy.

### Response shape
```js
{
  id, name, address, rating, price_per_night, currency,
  room_type, cancellation, offer_id, photo, maps_url
}
```

### Key upgrade (LiteAPI vs a generic places API)
- Returns real hotel rates and availability, not just names/addresses
- `offer_id` enables a full booking flow (prebook → book) in future
- Geo-fenced lat/lng search scopes exactly to gap city area
- No key → mock hotels (`_mock: true`)

---

## Shared
- All three: CORS headers, OPTIONS preflight, POST-only, try/catch → graceful error or mock.
- Runtime: `export const config = { runtime: 'edge' }`
- Never log keys.

## Acceptance criteria
- [ ] All keys server-side only; never in client
- [ ] Each proxy returns realistic mock when key absent
- [ ] Duffel: single call w/ return_offers, direct-only, feasibility-filtered
- [ ] Hotels: LiteAPI two-step (hotel IDs then rates), X-API-key header, geo-fenced by lat/lng when available
- [ ] Search: TTC live when token present, keyword fallback when no Anthropic key
- [ ] CORS + OPTIONS + POST-only on all
