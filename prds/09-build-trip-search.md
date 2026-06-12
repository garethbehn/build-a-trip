# 09 — Trip Builder Entry (Origin & Start)

> The opening of the guided journey (see 10 for the full flow). Two sequential questions that seed everything downstream.

## Purpose
Capture the two anchors of the journey before any trips are shown:
1. **Origin** — where the traveller is coming from (drives outbound + return flights)
2. **Start location** — where they want to begin their first tour (drives first-trip filtering + outbound flight destination)

## Anatomy
```
        Trip Builder                    ← eyebrow
        Build your adventure            ← Mencken hero, orange (on wander green)
   ┌──────────────────────────────┐
   │ Where are you coming from?    │    ← Step 1 prompt
   │ 🔍 e.g. London…        [Next] │
   └──────────────────────────────┘
   (then)
   ┌──────────────────────────────┐
   │ Where do you want to start?   │    ← Step 2 prompt
   │ 🔍 e.g. Bangkok…       [Next] │
   └──────────────────────────────┘
```

## Design spec (ref: design-system.md)
- Hero band: `wander` (#1C4A3D) green, centred
- Eyebrow: "Trip Builder", white@40%, uppercase, tracked
- Title: "Build your adventure", **Mencken** Bold italic, `primary-1` orange
- Prompt cards: white, radius 14px, shadow-2xl. Single free-text input + orange "Next" Primary button. Orange focus border.
- Input placeholder examples guide the user ("e.g. London", "e.g. Bangkok")
- Steps appear sequentially — Step 2 reveals after Step 1 is answered.

## Behaviour
- Step 1 input → `journey.origin` (resolve city + IATA via lookup)
- Step 2 input → `journey.startLocation` (resolve city + IATA)
- On completing Step 2 → transition into the guided builder (10): suggest outbound flight (if origin ≠ start), then first trips from start location.
- (Optional enhancement: autocomplete on city inputs.)

## Data
```js
journey.origin = { city, iata }
journey.startLocation = { city, iata }
```

## Acceptance criteria
- [ ] Two sequential prompts: origin, then start location
- [ ] Mencken orange hero on green
- [ ] City inputs resolve to IATA for downstream flight calls
- [ ] Transitions to guided builder on completion
- [ ] Distinct origin vs start (they can differ → outbound flight)
