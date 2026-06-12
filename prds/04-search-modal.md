# 04 — Search Modal (Semantic Search)

## Purpose
The AI search experience. Opens from the nav search pill as a full-width dropdown. User types free-text intent; Claude returns ranked trips with reasoning. This is the headline "wow" moment of the homepage.

## Anatomy
```
┌─ overlay (dims page) ──────────────────────┐
│ ┌─ modal (slides down from top) ─────────┐ │
│ │ Search                            ✕    │ │
│ │ ┌────────────────────────────────────┐ │ │
│ │ │ 📍 WHERE                           │ │ │
│ │ │ Describe your dream trip…  [Search]│ │ │
│ │ └────────────────────────────────────┘ │ │
│ │ Try: [chip] [chip] [chip]              │ │
│ │ ─ AI understood ─                      │ │
│ │ [summary of what AI parsed]            │ │
│ │ ┌─ results grid (dark container) ────┐ │ │
│ │ │ [trip card] [trip card] [card] ... │ │ │
│ │ └────────────────────────────────────┘ │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- **Overlay:** fixed inset 0, `opacity-dark-40`, backdrop-blur 2px, z-300, `overflow: hidden` (locks page scroll)
- **Modal:** absolute top, full-width, `dawn`/white bg, padding 40px 60px, slides down via `transform: translateY(-100%)` → 0, `transition-modal`. **`overflow-y: auto; max-height: 100vh`** so results scroll inside the modal, not the page.
- **Body scroll lock:** add `body.modal-open { overflow: hidden }` when open.
- **Heading:** "Search", Halyard bold, 1.6rem, `wander` green
- **Search bar:** matches Figma SRP search — field with "WHERE" label (orange pin icon), input "Describe your dream trip…", orange Search button (Primary). Orange focus border.
- **Suggestion chips:** outline pills, hover → orange border + text
- **Status:** animated orange dots + "Finding your perfect trips…" while loading
- **AI understood strip:** `opacity-light` cream/orange-soft bg, orange label "✦ AI understood", parsed summary text
- **Results grid:** dark `#161616` container (radius 14px, padding 16px) holding 4-col trip cards so they sit borderless

## States
- Closed (default) → Open (chips + popular trips shown) → Searching (status) → Results (AI summary + cards) → Empty (no matches message)

## Interactions
- Nav search pill / hero CTA → `openSearch()` (adds `.open` + `body.modal-open`)
- ✕ / overlay click / Esc → `closeSearch()`
- Enter or Search button → `doSearch()` → POST `/api/search`
- Chip click → fills input + searches

## Data flow
```
input → POST /api/search { query, trips[] }
     → { summary, matches: [{ id, reason, score }] }
     → merge with trip data → render AI-reasoned trip cards (variant 2)
```

## Acceptance criteria
- [ ] Page scroll locked when open; results scroll inside modal
- [ ] Slides down smoothly (transition-modal)
- [ ] Search field matches Figma (WHERE label, orange pin, orange button)
- [ ] AI understood summary shown above results
- [ ] Results use AI-reasoned trip card variant (amber reason strip)
- [ ] Results grid on dark container so cards are borderless
- [ ] Esc / overlay / ✕ all close
