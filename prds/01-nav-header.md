# 01 — Nav / Header

## Purpose
Persistent top navigation on every page. Houses brand logo, primary links, and the search trigger that opens the semantic search modal.

## Anatomy
```
[ Explore Trips ▾ ] [ Build Trip ▾ ] [ About ▾ ]   « left cluster
              [ contiki ]                            « centred logo (absolute)
                          [ 🔍 Search ] [ 👤 ▾ ]    « right cluster
```

## Design spec (ref: design-system.md)
- **Height:** 64px desktop, 56px mobile
- **Background:** `dawn` (#FFFAF2)
- **Border-bottom:** 1px `ui-border` (#E5E0D8)
- **Position:** sticky top, z-index 200
- **Logo:** "contiki" wordmark, italic, `primary-1` orange (#FF5900), weight 800, ~1.6rem, absolutely centred. (Use Contiki logomark image asset if available; else styled text.)
- **Nav links:** Halyard, 0.85rem, weight 600, `ui-black`. Chevron-down icon (Material Symbols `expand_more`, opacity 0.5).
- **Search pill:** pill button (radius 100px), 1.5px `primary-1` border, transparent fill, orange search icon + "Search" label. Hover: `primary-1` @ 6% fill. (See `03` button spec — this is a Tertiary/outline pill.)
- **Account pill:** 1.5px `ui-border`, person icon + chevron.

## States
- **Build Trip active** (on build-trip.html): link colour → `primary-1`.
- **Search pill hover:** background `rgba(255,89,0,0.06)`.
- **Mobile (≤768px):** hide left nav links + account pill; keep logo + search. Search pill becomes icon-only ≤480px.

## Interactions
- Search pill → `openSearch()` (homepage) or links to `/` (other pages).
- Logo → `/`.
- Links → respective sections/pages.

## Data shape
Static. No data dependency.

## Acceptance criteria
- [ ] Logo perfectly centred (absolute positioning), not affected by link width
- [ ] Orange is exactly `#FF5900`
- [ ] Sticky, stays above content (z-200), below modals (z-300+)
- [ ] Build Trip link highlights when active
- [ ] Collapses correctly at 768 / 480
- [ ] Material Symbols Rounded for chevrons/icons
