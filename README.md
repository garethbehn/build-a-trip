# Contiki Demo — Build Package for Claude Code

Everything needed to rebuild the Contiki AI demo from scratch in Claude Code, with an opinionated, reusable development lifecycle.

## What's in here

```
CLAUDE.md                    ← Claude Code auto-loads this. Rules + lifecycle.
tailwind.config.js           ← Contiki design tokens as Tailwind theme.
prds/
  design-system.md           ← SOURCE OF TRUTH: colours, type, opacity, shadows, icons.
  00-architecture.md         ← Read first. Stack, structure, conventions.
  01-nav-header.md
  02-hero.md
  03-trip-card.md            ← Most important component.
  03b-buttons.md             ← Button system (3 tiers × sizes × states).
  04-search-modal.md
  05-search-results.md
  06-region-explorer.md
  07-footer.md
  08-password-gate.md
  09-build-trip-search.md
  10-build-trip-timeline.md
  11-gap-card.md             ← Signature feature (flights + hotels).
  12-package-modal.md
  13-api-proxies.md          ← Exact Duffel/Places/Anthropic/TTC logic.
.claude/
  commands/                  ← Slash commands: /spec /design-review /build /self-test /refine /ship
  skills/                    ← Custom skills: contiki-fidelity, demo-credibility, api-proxy-safety
lifecycle/
  LIFECYCLE.md               ← How the dev lifecycle works.
```

## Getting started in Claude Code

1. Drop these files into your repo root (keep the `.claude/`, `prds/`, `lifecycle/` structure).
2. Open the repo in Claude Code — it auto-loads `CLAUDE.md`.
3. Build a component:
   ```
   /spec build the trip card
   /design-review
   /build
   /self-test
   /refine
   /ship
   ```
   Or just say "build the homepage following the PRDs" and Claude will work through them.

## The design system
`prds/design-system.md` is law. Key values:
- Orange `#FF5900` · Green `#1C4A3D` · Sale yellow `#FFE100` · Black `#0A0C0A` · Cream `#FFFAF2`
- Hero font: Mencken Std Head Compressed · Body: Halyard (Playfair/Inter fallback in dev — production needs Adobe Typekit)

## Environment variables (Vercel)
- `ANTHROPIC_API_KEY` · `DUFFEL_API_KEY` · `GOOGLE_PLACES_API_KEY` · `TTC_API_TOKEN`
- All optional — each proxy falls back to realistic mock data if its key is absent.

## Reusing the lifecycle for other demos
Swap `prds/design-system.md` + the `*-fidelity` skill for the new brand; keep everything else. See `lifecycle/LIFECYCLE.md`.

---
**Password:** `Go-Wander-2026`
