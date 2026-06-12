# 02 — Hero

## Purpose
Full-bleed brand statement at the top of the homepage. The "GO WANDER" lockup is the single most important brand expression — it must be pixel-faithful to the guide.

## Anatomy
```
┌────────────────────────────────────┐
│  [full-bleed travel photo, darkened]│
│                                     │
│                                     │
│   GO WANDER          ← Mencken hero │
│   [ Watch the film ▸ ]  ← CTA pill  │
└────────────────────────────────────┘
```

## Design spec (ref: design-system.md)
- **Min-height:** 90vh desktop, 70vh tablet, 60vh mobile
- **Background:** `dusk` (#0A0C0A) base + full-bleed travel photo
- **Photo overlay:** `opacity-dark-50` to `opacity-dark-70` so the orange title pops. Use `opacity-dark-gradient-ascending` if anchoring title to bottom.
- **Title "GO WANDER":**
  - Font: **Mencken Std Head Compressed**, Bold
  - Colour: `primary-1` (#FF5900)
  - **UPPERCASE, 20 tracking, 75% leading** (per guide — `letter-spacing: 0.05em; line-height: 0.75;`)
  - Size: `clamp(4rem, 12vw, 10rem)`
  - Positioned bottom-left, padding 60px (24px mobile)
- **CTA:** Primary or Secondary pill button (see `button` spec). "Watch the film" or "Make a trip finder" with arrow icon.

## States
- Static hero. Optional: subtle photo Ken Burns zoom (slow scale 1.0→1.05 over 20s).

## Interactions
- CTA → opens search modal or scrolls to content.

## Content
- Title: "GO WANDER" (could also be the combined brandmark: GO WANDER above `contiki` wordmark — see guide Brandmark section).
- Photo: rotating hero imagery (use a high-quality travel shot; production pulls from CMS).

## Acceptance criteria
- [ ] Title in Mencken (Playfair fallback), uppercase, tracked, tight leading per guide
- [ ] Orange `#FF5900`
- [ ] Photo darkened with opacity token so title is legible (contrast AA)
- [ ] Bottom-left anchored, responsive clamp sizing
- [ ] CTA matches button spec
