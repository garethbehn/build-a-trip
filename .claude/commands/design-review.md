---
description: Verify the plan against the design system before building (lifecycle stage 2)
---
You are in the **/design-review** stage.

Before writing code, verify the planned implementation against `prds/design-system.md`:
1. Colours — only Contiki tokens? Orange `#FF5900`, green `#1C4A3D`, burst `#FFE100`, dusk `#0A0C0A`, dawn `#FFFAF2`? No ad-hoc hex?
2. Type — Mencken for hero display, Halyard for body? Correct fallbacks (Playfair/Inter) noted for dev?
3. Spacing/radii/shadows — from the defined scale?
4. Icons — Material Symbols (Rounded, wght 300) for UI; orange travel icons for trip info?
5. Opacity — image overlays use the gradient tokens?

Output a short checklist of pass/flag items. Flag anything off-system and correct the plan before `/build`.

GATE: no ad-hoc values may pass into build.
