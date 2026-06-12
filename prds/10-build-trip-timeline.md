# 10 — Trip Builder (Guided Journey)

> REPLACES the earlier multi-select builder. This is a guided, conversational, step-by-step journey where the user assembles a multi-trip Contiki itinerary one decision at a time. The flight is the connective tissue between every segment.

## Core principle
A complete journey is a chain of **Contiki tours bridged by flights**, with **hotels filling the gaps**. Nothing chains by exact city match — everything chains by **flight reachability** (Duffel feasibility checker). The builder walks the user through it conversationally and never dead-ends.

```
ORIGIN ──✈──> START ──[Trip 1]──> endA ──✈ + 🏨──> startB ──[Trip 2]──> endB ──✈──> HOME
(coming      (where you                  (feasible flight +                   (return
 from)        begin)                      hotels near next start)              flight)
```

## The guided flow (step by step)

### Step 1 — Where are you coming from?
- Prompt: **"Where are you coming from?"**
- Free-text origin (home city / departure airport). Resolve to IATA.
- Stored as `journey.origin`.

### Step 2 — Where do you want to start?
- Prompt: **"Where do you want to start your adventure?"**
- Free-text start location. Resolve to city + IATA.
- Stored as `journey.startLocation`.

### Step 3 — Outbound flight (origin → start)
- If origin ≠ start, immediately suggest an **outbound flight** (Duffel) from origin to start location.
- Show feasible flight options; user selects one (or skips).
- This becomes the first segment on the timeline.

### Step 4 — First trip (departing from start)
- Show **real Contiki trips that depart from the start location** (TTC API filtered by departure city/region).
- Prompt: **"Here are Contiki trips starting in {startLocation}"**
- User picks one → becomes Trip 1 on the timeline.

### Step 5 — Bridge to next trip (the repeating core)
After any trip is added, offer to continue:
- Prompt: **"Add another trip?"** → if yes:
  - Show **trips reachable from the previous trip's end city** — i.e. trips whose start city is:
    (a) the same as / near the end city, OR
    (b) reachable by a **feasible direct flight** from the end city (Duffel back-to-back feasibility checker: arrival before next trip start − buffer − transfer)
  - Rank by reachability + appeal (AI-assisted).
  - User picks the next trip.
- Between the two trips, auto-generate the **gap** (see Step 6).

### Step 6 — Fill the gap (flight + hotels)
For the gap between Trip N end and Trip N+1 start:
- **Flight:** Duffel feasibility-checked direct flight (end city → next start city), arriving before next trip start − 4h buffer − 120min transfer. Cheapest auto-selected.
- **Hotels:** LiteAPI **geo-fenced** around the **next trip's start location** (lat/lng + radius) so the traveller is positioned for the next departure. Show top options; user selects one.
- (If end city == next start city and dates are back-to-back, no flight needed — just hotels if there's a night gap.)

### Step 7 — Continue or end
- After each addition: **"Add another trip?"** [Yes, add another] / [No, I'm done]
- Loop Steps 5–6 until the user ends.

### Step 8 — Going home?
- Prompt: **"Are you heading home after?"** [Yes] / [No, ending here]
- If yes → suggest a **return flight** (Duffel) from the last trip's end city back to `journey.origin`. User selects.

### Step 9 — Package, price, save
- Compile the full journey: outbound flight + [Trip → gap flight → gap hotel]* + return flight.
- Price it (Σ tour from-prices + Σ selected flight prices; hotels indicative).
- **"Save my trip"** — persist the package (mention **"Prices may change"**).
- **"Book"** — placeholder CTA (booking API not yet available; show "coming soon" / enquiry).

## Design spec (ref: design-system.md)
- Same visual language as before: `wander` green top bar, vertical timeline with colour-coded dots (green=flight/transit, orange=trip, blue=gap-hotel), `dusk` cards, Mencken titles, orange accents.
- Each step appears as a focused prompt card; resolved steps collapse into timeline segments.
- Conversational prompts use Halyard; the journey reads top-to-bottom like a story.
- Sticky footer: running total (tours / flights / nights / est. cost) + "View package".

## Segment types on the timeline
| Segment | Dot | Source |
|---------|-----|--------|
| Outbound flight | green | Duffel (origin → start) |
| Trip | orange | TTC Contiki tour |
| Gap flight | green | Duffel (end → next start, feasibility-checked) |
| Gap hotel | blue | LiteAPI (geo-fenced near next start) |
| Return flight | green | Duffel (last end → origin) |

## Data shape
```js
journey = {
  origin: { city, iata },
  startLocation: { city, iata },
  outboundFlight: offer | null,
  segments: [
    { type:'trip', tour:{...TTC fields} },
    { type:'gap', flight: offer|null, hotel: hotel|null,
      fromCity, toCity, fromDate, toDate },
    ...
  ],
  returnFlight: offer | null,
}
```

## Behaviour rules
- Trips filtered by **departure location** at each step (TTC `destinations[0]` / departure city).
- Next-trip candidates determined by **flight reachability** from previous end city (call Duffel to verify feasible connection exists, or pre-filter by region + date proximity then verify on selection).
- All flights direct + feasibility-checked (see 11 & 13).
- Hotels geo-fenced to next start location (lat/lng radius via LiteAPI).
- Never dead-end: if no trips are reachable, offer "end here" + return flight.

## Acceptance criteria
- [ ] Step 1 asks origin; Step 2 asks start location (separate)
- [ ] Outbound flight suggested when origin ≠ start
- [ ] First trips filtered to those departing from start location (real TTC data)
- [ ] Each subsequent trip filtered to those reachable by feasible flight from previous end
- [ ] Gap between trips: feasibility-checked flight + geo-fenced hotels near NEXT start
- [ ] Loops "add another trip?" until user ends
- [ ] Asks "going home?" → return flight to origin if yes
- [ ] Packages tours + flights + hotels, prices it
- [ ] Save with "prices may change" caveat
- [ ] Book CTA present as placeholder (not yet functional)
- [ ] Never dead-ends; always offers a way forward
