# 03b — Buttons (Design System Component)

> From the brand guide "Buttons" sheet. Three tiers × sizes × states. Referenced by every component with a CTA.

## Tiers

### Primary
- **Default:** `wander` (#1C4A3D) green fill, white text, pill radius
- **Inverted:** `dawn` (#FFFAF2) light fill, dark text (use when inverting primary on dark bg)
- Use for the main action on a surface.

### Secondary
- **Default (dark):** transparent fill, 1.5px `wander`/`ui-black` border, dark text
- **Inverted (light):** transparent, 1.5px white border, white text (on dark bg)
- Outline style. Secondary actions.

### Tertiary
- **Default:** text-only link style, underline, `ui-black` text; with-icon and stacked variants
- **Inverted:** white text on dark
- Lowest emphasis. Inline links.

## Sizes
| Size | Padding | Font |
|------|---------|------|
| Large | 14px 28px | 0.95rem |
| Medium | 11px 22px | 0.88rem |
| Small | 8px 16px | 0.8rem |

## Icon options
- **No icon** — label only
- **With icon** — label + trailing arrow (Material Symbols `arrow_forward` / `arrow_right_alt`)
- **Stacked** (tertiary) — icon above label

## States (per the guide matrix)
| State | Primary | Secondary | Tertiary |
|-------|---------|-----------|----------|
| Default | green fill | outline | underlined link |
| **Hover** | `primary-1` orange fill | orange border + orange text | orange text |
| **Pressed** | darker orange | filled light orange | orange |
| **Disabled** | grey fill, muted | grey outline | grey, muted |
| **Focussed** | orange + focus ring | orange ring | orange + ring |

> KEY INSIGHT: hover state shifts Primary buttons from **green → orange**. This is the signature Contiki interaction.

## The orange CTA pill (nav search, hero)
A common pattern: pill (radius 100px), `primary-1` border or fill, used for Search and hero CTAs.

## Acceptance criteria
- [ ] Three tiers with default + inverted
- [ ] Three sizes
- [ ] Hover shifts primary green→orange `#FF5900`
- [ ] Disabled/focussed states present
- [ ] Icon variants (none/trailing/stacked)
- [ ] Pill radius for pill buttons, consistent across nav + hero
