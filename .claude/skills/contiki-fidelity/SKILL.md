---
name: contiki-fidelity
description: Audit any UI output against the Contiki brand design guide — exact colours, typography, component anatomy, icons, opacity, and shadows. Use during /build and /self-test whenever producing or reviewing Contiki UI, to guarantee pixel and brand fidelity to the official style guide.
---

# Contiki Fidelity Check

Use this skill whenever building or reviewing Contiki UI. It enforces the brand guide.

## Colour audit
Verify ONLY these brand values appear (no approximations):
- Contiki GO orange: `#FF5900` (alt `#FF7300`)
- Contiki WANDER green: `#1C4A3D` (alt `#1C6348`)
- Contiki BURST yellow: `#FFE100` (sale/retail, once per layout)
- Contiki DUSK: `#0A0C0A` (brand black)
- Contiki DAWN: `#FFFAF2` (cream)
FLAG any `#FF5500`, `#1B3A2D`, or other near-misses — these are wrong.

## Typography audit
- Hero display ("GO WANDER", card titles line 1): **Mencken Std Head Compressed** Bold. Hero lockup = UPPERCASE, 20 tracking (0.05em), 75% leading (line-height 0.75).
- Everything else: **Halyard** (Display Book/Bold/Black, Text Regular/Italic/Bold).
- Dev fallback: Playfair Display (hero) + Inter (body) — acceptable in dev, but note production needs the Adobe Typekit.
FLAG any other fonts.

## Component anatomy audit (trip card)
- Charcoal `#1C1C1C` wrap, radius 16px, no border
- Photo inset ~7px, radius 12px, `<img>` with onerror fallback
- "originals" badge: orange, italic, lowercase, centred top
- Title: Mencken lowercase line 1 + Halyard spaced-caps line 2
- Sale tag uses BURST yellow; stats icons orange + underlined values; strikethrough "Was" price

## Icons
- UI chrome: Google Material Symbols, **Rounded**, weight 300, FILL 0, opsz 24
- Trip info points: orange line icons

## Opacity & shadow
- Image overlays use the opacity gradient tokens (e.g. `opacity-dark-gradient-ascending`)
- Shadows from the Tailwind scale (sm/md/lg/xl/2xl/inner)

## Output
Produce a PASS/FLAG list. For each FLAG, name the exact fix (token + value). Block completion until all PASS.
