# Contiki Design System — Source of Truth

> Every component PRD references this file. Tokens here are the single source of truth and map 1:1 to the Figma token names. When building in Tailwind, these become `tailwind.config.js` theme extensions.

---

## 1. Brand Colours

Exact values from the Contiki Brand Design guide (Section 07).

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `primary-1` | Contiki GO | `#FF5900` | Primary brand orange. CTAs, accents, logo, highlights. The hero colour. |
| `primary-go-alt` | Contiki GO/Alt | `#FF7300` | Alternate orange for higher readability on UI. |
| `wander-1` | Contiki WANDER | `#1C4A3D` | Deep brand green. Headings, dark sections, secondary brand. |
| `wander-alt` | Contiki WANDER/Alt | `#1C6348` | Alternate green for readability. |
| `burst-1` | Contiki BURST | `#FFE100` | Retail/sale CTA yellow. Use **once per layout** max. Sale badges. |
| `dusk-1` | Contiki DUSK | `#0A0C0A` | Brand black. Backgrounds, dark cards, text. Not pure black. |
| `dawn-1` | Contiki DAWN | `#FFFAF2` | Brand off-white / cream. Page backgrounds, light sections. |

### Supporting neutrals (derived)
| Token | Hex | Usage |
|-------|-----|-------|
| `ui-black` | `#0A0C0A` | Body text on light backgrounds (= DUSK) |
| `ui-grey80` | `#6B6B6B` | Muted text, secondary labels |
| `ui-border` | `#E5E0D8` | Hairline borders on cream |
| `card-dark` | `#1C1C1C` | Trip card charcoal surround |

**Tailwind mapping:**
```js
colors: {
  go:      { DEFAULT: '#FF5900', alt: '#FF7300' },
  wander:  { DEFAULT: '#1C4A3D', alt: '#1C6348' },
  burst:   '#FFE100',
  dusk:    '#0A0C0A',
  dawn:    '#FFFAF2',
  'ui-grey80': '#6B6B6B',
  'ui-border': '#E5E0D8',
}
```

---

## 2. Typography

Two type families. **Mencken Std** for display/hero. **Halyard** for everything else.

### Hero font — Mencken Std Head Compressed
- **Family:** `Mencken Std Head Compressed` (Adobe Fonts / Typofonderie)
- **Hero "GO WANDER" lockup:** Bold, UPPERCASE, **20 tracking, 75% leading**
- High-contrast vertical-axis Didot style. Used for the biggest headlines only.
- Fallback stack: `'Mencken Std Head', 'Playfair Display', Georgia, serif`

### Secondary font — Halyard
Three cuts, each purpose-built:
- **Halyard Display** (Book / Bold / Black) — subheads, large display, occasional headlines
- **Halyard Text** (Regular / Italic / Bold) — body copy, optimised for readability
- Fallback stack: `'Halyard Display', 'Halyard Text', 'Inter', system-ui, sans-serif`

### Type tokens
| Token | Font | Weight | Use |
|-------|------|--------|-----|
| `title-3xl` | Mencken Std Head Compressed | Bold | Hero titles (GO WANDER) |
| `pretitle-3xl` | Halyard Display | Bold | Eyebrow / pretitle above hero |
| `subtitle-3xl` | Halyard Display | Bold | Section subtitles |
| `paragraph-3xl` | Halyard Text | Regular | Body copy |

### Web font loading
```html
<!-- Adobe Fonts (Typekit) for Mencken + Halyard -->
<link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css">
<!-- Fallback: Playfair Display + Inter from Google Fonts during dev -->
```
> NOTE: Mencken and Halyard are Adobe Fonts — require a Typekit kit ID. During dev, fall back to Playfair Display (hero) + Inter (body). Flag to user that production needs the Adobe kit.

---

## 3. Opacity Scale

Image overlay tokens. Two ramps — dark (black) and light (white) — at fixed steps, plus gradients.

| Token | Value | Token | Value |
|-------|-------|-------|-------|
| `opacity-dark-95` | rgba(0,0,0,.95) | `opacity-light-95` | rgba(255,255,255,.95) |
| `opacity-dark-90` | rgba(0,0,0,.90) | `opacity-light-90` | rgba(255,255,255,.90) |
| `opacity-dark-88` | rgba(0,0,0,.88) | `opacity-light-88` | rgba(255,255,255,.88) |
| `opacity-dark-80` | rgba(0,0,0,.80) | `opacity-light-80` | rgba(255,255,255,.80) |
| `opacity-dark-75` | rgba(0,0,0,.75) | `opacity-light-75` | rgba(255,255,255,.75) |
| `opacity-dark-70…5` | … .70 to .05 | `opacity-light-70…5` | … .70 to .05 |
| `opacity-dark-gradient-descending` | linear-gradient(to bottom, rgba(0,0,0,.8), transparent) | | |
| `opacity-dark-gradient-ascending` | linear-gradient(to top, rgba(0,0,0,.8), transparent) | | |
| `opacity-light-gradient-descending` | linear-gradient(to bottom, rgba(255,255,255,.9), transparent) | | |
| `opacity-light-gradient-ascending` | linear-gradient(to top, rgba(255,255,255,.9), transparent) | | |

**Trip card image overlay** uses `opacity-dark-gradient-ascending` (dark at bottom, fades up) so white title text stays legible.

---

## 4. Shadows

| Token | Value |
|-------|-------|
| `shadow-none` | none |
| `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) |
| `shadow-md` | 0 4px 6px rgba(0,0,0,0.07) |
| `shadow-lg` | 0 10px 15px rgba(0,0,0,0.1) |
| `shadow-xl` | 0 20px 25px rgba(0,0,0,0.1) |
| `shadow-2xl` | 0 25px 50px rgba(0,0,0,0.25) |
| `shadow-inner` | inset 0 2px 4px rgba(0,0,0,0.06) |

> These map directly to Tailwind's default shadow scale — use Tailwind's `shadow-sm`, `shadow-md` etc. as-is.

---

## 5. Icons

Three icon sources:

### Google Material Symbols (UI chrome)
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,0,0" />
```
```css
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
```
Settings: **Rounded** style, weight 300, FILL 0, optical size 24.

### Custom Travel Icons (trip info points)
Orange (`primary-1`) line icons for trip detail points. From the brand "Trip page info points icon list":
`Start location · End location · Transportation · Group size · Hostel · Hotel · Special stay · Tent · Safari lodge · Cruise · Overnight travel · Included Experiences · All internal transport · All accommodation · Flights to/from start/end · Free-time add-ons · Accommodation · Trekking lodge · Breakfast · Lunch · Dinner · Expert Trip Manager`

> Use Material Symbols equivalents where exact custom icons aren't available. Always render in `primary-1` orange for travel/info contexts.

---

## 6. Spacing & Radii

| Token | Value | Use |
|-------|-------|-----|
| radius-sm | 6px | chips, small buttons |
| radius-md | 12px | cards, inputs |
| radius-lg | 16px | trip cards, modals |
| radius-pill | 100px | pill buttons, nav search |
| Section padding (desktop) | 60px | `.home-section` |
| Section padding (mobile) | 16–24px | |
| Card gap | 16px | grid gaps |

---

## 7. Motion

| Token | Value |
|-------|-------|
| transition-fast | 0.15s ease |
| transition-base | 0.2s ease |
| transition-modal | 0.3s cubic-bezier(0.4,0,0.2,1) |
| card-hover | translateY(-3px) + shadow-xl |

---

## Acceptance criteria for ANY component
- [ ] Uses only tokens defined here — no ad-hoc hex values
- [ ] Orange is `#FF5900`, green is `#1C4A3D` (verify against guide)
- [ ] Mencken for hero display, Halyard for all else (Playfair/Inter fallback in dev)
- [ ] Image overlays use the opacity gradient tokens
- [ ] Shadows from the defined scale only
- [ ] Material Symbols (Rounded, wght 300) for UI icons
- [ ] Responsive: 1024 / 768 / 480 breakpoints
