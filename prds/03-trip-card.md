# 03 — Trip Card

> The most reused component. Appears in search results, homepage rails, popular trips, and (compact variant) the builder timeline. Must match the Figma card exactly.

## Purpose
Display a single Contiki tour: photography, title lockup, metadata, pricing. The hero unit of the catalogue.

## Anatomy
```
┌──────────────────────────┐  ← charcoal #1C1C1C wrap, radius 16px
│ ┌──────────────────────┐ │  ← photo inset 7px, radius 12px
│ │     [originals]      │ │  ← orange badge, centred top
│ │   [travel photo]     │ │
│ │                      │ │
│ │  european            │ │  ← Mencken title, lowercase, overlaid
│ │  HIGHLIGHTS          │ │  ← Halyard spaced-caps subtitle
│ └──────────────────────┘ │
│ [Black Friday] [Hot NR]  │  ← tag chips
│ European Highlights      │  ← trip name (Halyard bold)
│ 📅 14 days  🌍 7 Countries│  ← stats, orange icons, underlined vals
│ From $2,900 pp  Was $3,225│  ← price + strikethrough
└──────────────────────────┘
```

## Design spec (ref: design-system.md)

### Card wrapper
- Background: `#1C1C1C` (charcoal — sits invisibly on dark sections, defined edge on cream)
- Radius: 16px, `overflow: hidden`
- Hover: `translateY(-3px)` + `shadow-xl`
- No border.

### Photo
- Inset 7px top/left/right (margin), radius 12px
- Height: 200–220px
- `object-fit: cover`
- Overlay: `opacity-dark-gradient-ascending` (dark at bottom → transparent) so title text is legible
- Use `<img>` tag (not CSS bg) for reliable cross-origin loading; `onerror` falls back to a solid colour block.

### "originals" badge
- Position: absolute, top 12px, centred horizontally
- Background: `primary-1` (#FF5900), white text
- Font: italic, weight 800, lowercase, 0.65rem, letter-spacing 0.05em
- Padding 4px 14px, radius 6px

### Title lockup (overlaid on photo, bottom)
- **Line 1:** first word, **Mencken Std Head Compressed** Bold (Playfair fallback), lowercase, ~1.6rem, white, line-height 0.95
- **Line 2:** remaining words, **Halyard** Bold, UPPERCASE, 0.58rem, letter-spacing 0.22em, white @ 75%

### Body (below photo)
- Padding 12px 14px 16px
- **Tags row:** 
  - Sale tag: `burst` (#FFE100) bg, dusk text, weight 800, 0.6rem
  - Other tags ("Hot NR", "New Trip"): outline chips, 1px white @ 20%, white @ 65% text, optional orange icon
- **Trip name:** Halyard bold, 0.95rem, white
- **Stats:** flex row, 0.75rem, white @ 55%
  - Calendar icon (Material Symbols `calendar_today`) + "14 days"
  - Globe icon (Material Symbols `public`) + "7 Countries"
  - Icons in `primary-1` orange; values underlined (text-underline-offset 2px)
- **Price row:**
  - "From" label (white @ 45%) + "$" + amount (1.35rem, weight 800, white) + "pp"
  - "Was $X,XXX pp" strikethrough, white @ 32%, margin-left 10px

## Variants
1. **Default** (search results, rails) — full card as above
2. **AI-reasoned** (semantic search) — adds amber reason strip at bottom: `#1A0800` bg, `#FFB380` text, ✦ icon, 0.72rem, "why this trip fits" sentence
3. **Compact** (builder timeline) — horizontal layout, 96–100px tall, photo left (120–140px), metadata right, no title overlay
4. **Selectable** (builder search) — adds 2px transparent border that turns `primary-1` when selected; "+ Add to package" button

## Data shape (TTC API v4)
```js
{
  id, name, geography, destinations[], duration_days,
  departure_date, end_date, from_price, currency,
  image, // images[0].url in live API
  tags[], // derived from is_new/is_hot/has_promotion
}
```

## Acceptance criteria
- [ ] Charcoal `#1C1C1C` wrap, no border, radius 16px
- [ ] Photo inset 7px, radius 12px, `<img>` with onerror fallback
- [ ] Title line 1 Mencken lowercase, line 2 Halyard spaced caps
- [ ] originals badge orange `#FF5900`, centred top
- [ ] Sale tag uses `burst` yellow `#FFE100`
- [ ] Stats icons orange, values underlined
- [ ] Strikethrough "Was" price present
- [ ] Hover lifts with shadow-xl
- [ ] All 4 variants implemented
