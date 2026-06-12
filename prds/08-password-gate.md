# 08 — Password Gate

## Purpose
Demo access control. Full-screen lock requiring `Go-Wander-2026` before any page renders.

## Anatomy
Centred card on dusk background: contiki logo, "Preview access only", password input, Enter button, error message slot.

## Design spec (ref: design-system.md)
- Overlay: fixed inset 0, z-9999, `dusk` (#0A0C0A) bg
- Card: #1a1a1a, radius 16px, padding 48px 40px, width 360px
- Logo: "contiki" orange italic, 2rem, weight 800
- Sub: "Preview access only", white @ 40%, 0.8rem
- Input: dark field (#111), 1px #333 border, white text, focus → orange border
- Button: full-width `primary-1` orange, white, weight 700
- Error: red (#ff6b6b), 0.8rem, "Incorrect password. Try again."

## Behaviour
- Correct password (`Go-Wander-2026`) → hide gate (`display:none`)
- Wrong → show error, clear input
- Enter key submits
- (Demo-grade only — client-side check. Note to user: not real security.)

## Acceptance criteria
- [ ] Blocks page until correct password
- [ ] Enter key works
- [ ] Error on wrong password
- [ ] Orange button, dusk bg
- [ ] Password exactly `Go-Wander-2026`
