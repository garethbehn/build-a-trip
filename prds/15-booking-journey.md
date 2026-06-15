# 15 — Booking Journey

## Purpose
A multi-step flow that takes a selected tour + departure and converts it into a confirmed (demo) booking. Mirrors the iTravel contract shape so the real TTC booking API can be wired in with minimal frontend changes.

## Booking contract (iTravel-shaped)
All data collected maps to this shape, matching the CTO's Uniworld implementation:

```js
booking = {
  // Package
  tourId:        string,
  departureId:   string,          // from TTC departure.id
  operatingStartDate: string,
  roomType:      'single'|'twin'|'triple'|'quad',

  // Passengers (array — 1..N)
  passengers: [{
    type:         'adult'|'child',
    firstName:    string,
    lastName:     string,
    dob:          string,          // YYYY-MM-DD
    nationality:  string,          // ISO country code
    passportNumber: string,
    passportExpiry: string,
    dietaryRequirements: string,
    emergencyContact: { name, phone, relationship },
  }],

  // Lead booker (passenger[0] + extras)
  leadBooker: {
    email:   string,
    phone:   string,
    address: { line1, city, postCode, country },
  },

  // Pricing (from TTC departure)
  pricing: {
    basePrice:      number,
    discounts:      [{ code, amount }],
    totalPrice:     number,
    currency:       string,
    depositAmount:  number,        // typically 10–20%
    depositDueDate: string,
    balanceDueDate: string,
  },

  // Payment (demo — no real card processing)
  payment: {
    method:        'card'|'deposit',
    status:        'demo'|'pending'|'confirmed',
    reference:     string,         // generated reference
  },

  // Status
  status:         'draft'|'confirmed'|'cancelled',
  bookingReference: string,        // generated on confirm
  createdAt:      string,
}
```

## Steps (5-step wizard)

### Step 1 — Review your trip
- Tour name, dates, duration, departure city
- Room type selector (updates price)
- Departure price breakdown: base, discounts, total
- Deposit amount + due date
- Balance due date
- "Prices may change — confirming reserves your spot" note
- CTA: "Continue to passengers →"

### Step 2 — Passenger details
- Number of passengers selector (1–8)
- Per passenger: first name, last name, DOB, nationality, passport number + expiry
- Lead booker extras: email, phone, address
- Dietary requirements (optional, per passenger)
- Emergency contact (per passenger: name, phone, relationship)
- Validation: all required fields before proceeding
- CTA: "Continue to review →"

### Step 3 — Review & confirm
- Full booking summary: tour, dates, all passengers, room type, total price
- T&Cs checkbox (link to Contiki T&Cs)
- Cancellation policy from `sellingRegions[0].discounts[].notes` + standard Contiki policy
- Deposit vs full payment toggle
- CTA: "Confirm booking →"

### Step 4 — Payment (DEMO)
- Show a realistic but clearly demo payment form
- Pre-fill with test card details (Stripe test: `4242 4242 4242 4242`)
- Label: "Demo mode — no real payment will be taken"
- Fields: card number, expiry, CVV, cardholder name
- CTA: "Pay deposit $XXX" or "Pay in full $XXX"
- On submit → generate booking reference, transition to Step 5

### Step 5 — Confirmation
- Large ✓, booking reference (e.g. `CTK-2026-XXXXX`)
- Full booking summary
- "What happens next" — email confirmation (demo: shown on screen), deposit receipt, balance due date reminder
- CTAs: "Download itinerary (PDF placeholder)", "Add to calendar (placeholder)", "Back to search"
- Note: "A real booking confirmation would be sent to {email}"

## Technical implementation

### State management
Single `bookingState` object passed through all steps:
```js
bookingState = {
  step: 1..5,
  tour: { ...TTC tour data },
  departure: { ...TTC departure data },
  roomType: 'twin',
  passengers: [],
  leadBooker: {},
  pricing: {},
  payment: {},
  bookingReference: null,
}
```

### API call (demo)
On Step 4 confirm → POST `/api/booking`:
```json
{
  "tourId": "12345",
  "departureId": "dep-abc",
  "roomType": "twin",
  "passengers": [...],
  "leadBooker": {...},
  "pricing": {...},
  "payment": { "method": "card", "demo": true }
}
```

### `/api/booking` proxy (new Edge Function)
- Receives booking payload
- Validates required fields
- Generates `bookingReference`: `CTK-${year}-${random5digits}`
- In production: would POST to TTC booking API (`departure.links.book`) and IBS iTravel `createBooking`
- Returns `{ bookingReference, status: 'confirmed', confirmationEmail: leadBooker.email }`
- Stores nothing server-side (demo) — reference is generated client-side as fallback if API fails

## Design spec (ref: design-system.md)
- Page bg: `dawn` (#FFFAF2)
- Step indicator: horizontal progress bar, `primary-1` orange fill, `ui-border` track, step numbers + labels
- Form cards: white, `shadow-md`, radius 16px, orange focus borders
- Passenger cards: collapsible, numbered (Passenger 1, 2…)
- Step 4 payment: grey demo badge, "🔒 Secure demo environment" note
- Step 5 confirmation: `wander` green hero, large ✓, orange booking reference
- Primary CTA each step: full-width Primary orange button
- Back: Secondary/Tertiary, left-aligned

## Validation rules
- DOB: must be 18–35 (Contiki age requirement — warn if outside range)
- Passport expiry: must be > 6 months after tour end date
- Email: valid format
- All required fields: inline error on blur, block progression if invalid

## Acceptance criteria
- [ ] 5 steps with progress indicator
- [ ] Booking state persists across steps (no data loss on back)
- [ ] Room type selector updates pricing
- [ ] Per-passenger forms: all iTravel fields present
- [ ] Age validation (18–35 warning)
- [ ] Passport expiry validation (6 months post-tour)
- [ ] Review step shows complete summary before payment
- [ ] Payment step clearly labelled "Demo — no real payment"
- [ ] Booking reference generated on confirm (`CTK-{year}-{5digits}`)
- [ ] Confirmation step shows full summary + "what next"
- [ ] `/api/booking` proxy handles request + returns reference
- [ ] iTravel-shaped booking object ready for real API wiring
- [ ] Responsive: full mobile flow
