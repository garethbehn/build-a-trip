# 06 — Region Explorer

## Purpose
"Where will you wander next?" — the homepage section letting users jump to regions. Editorial, brand-forward.

## Anatomy
```
        Where will you wander next?     ← Mencken/Halyard italic, orange
   [supporting copy line]               ← muted
   Europe / Asia / New Zealand /
   Australia / Latin America /
   North America / Africa & Middle East ← large green links, / separators
```

## Design spec (ref: design-system.md)
- Background: `dawn` or `cream-dark` section
- Eyebrow heading: "Where will you wander next?" — Halyard Display italic (or Mencken), `primary-1` orange, centred, clamp(1.3rem, 3vw, 2rem)
- Sub copy: muted `ui-grey80`, 0.85rem, centred
- Region links: large (1.4rem), weight 700, `wander` green, " / " separators in `ui-border`. Hover → `primary-1` orange.

## Interactions
- Each region → filtered search / region landing (demo: triggers search with that region).

## Acceptance criteria
- [ ] Italic orange eyebrow heading
- [ ] Green region links, orange on hover
- [ ] " / " separators
- [ ] Centred, responsive wrap
