# CLAUDE.md — Contiki Demo Build

> Claude Code auto-loads this file. It defines how this project is built. Follow the lifecycle. Use the skills. Respect the design system.

## What this project is
An AI-powered Contiki demo: semantic trip search + a multi-trip package builder (Duffel flights, LiteAPI hotels). Static HTML + Tailwind + vanilla JS, deployed on Vercel with Edge Function proxies. Password-gated (`Go-Wander-2026`).

## Golden rules
1. **Design system is law.** Read `prds/design-system.md` before writing any UI. Orange = `#FF5900`, green = `#1C4A3D`. Mencken for hero, Halyard for body (Playfair/Inter fallback in dev). Never invent hex values.
2. **PRD-driven.** Every component has a PRD in `prds/`. Build to its acceptance criteria. If a request isn't in a PRD, write/extend the PRD first (`/spec`).
3. **No client-side keys.** All third-party calls go through `/api/*` proxies. Keys live in Vercel env vars only.
4. **Graceful degradation.** Every proxy must return realistic mock data when its key is absent. The demo must always work.
5. **Mock data, real architecture.** Use TTC API v4 field names so live swap is one change.
6. **Visible AI.** Always surface reasoning (match scores, "AI understood", why-this-fits).
7. **Self-test before done.** Run `/self-test` against the component's acceptance criteria before declaring complete.

## The lifecycle (opinionated — follow in order)
```
/spec  →  /design-review  →  /build  →  /self-test  →  /refine  →  /ship
```
1. **/spec** — turn the request into (or update) a PRD with acceptance criteria. Gate: PRD exists & is approved.
2. **/design-review** — verify the plan against `design-system.md` (tokens, fonts, spacing). Gate: no ad-hoc values.
3. **/build** — implement to the PRD. Use the `contiki-fidelity` and `frontend-design` skills.
4. **/self-test** — check every acceptance-criteria box; fix failures. Gate: all boxes ticked.
5. **/refine** — polish: responsive, states, motion, edge cases.
6. **/ship** — commit + push (Conventional Commits), confirm Vercel deploy, note any env vars needed.

Don't skip gates. If you find yourself coding before a PRD exists, stop and run `/spec`.

## Skills (in `.claude/skills/`)
- **contiki-fidelity** — checks output against the brand guide (colour, type, components). Run during `/build` and `/self-test`.
- **demo-credibility** — ensures the demo holds up self-serve for prospects (no broken states, realistic data, visible value).
- **api-proxy-safety** — verifies no client-side keys and graceful mock fallback on every proxy.

## File map
```
prds/                    PRDs (design-system.md + 00–13)
index.html               Homepage + search
build-trip.html          Multi-trip builder
api/{search,flights,hotels}.js
tailwind.config.js       Contiki token theme
vercel.json  package.json  README.md
```

## Commit style
Conventional Commits: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`. Reference the component, e.g. `feat(trip-card): add AI-reasoned variant`.

## When unsure
Ask one focused strategic question rather than guessing. Prefer extending a PRD over ad-hoc building.
