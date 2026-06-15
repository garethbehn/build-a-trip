# 00 — Architecture & Conventions

> Master document. Read this first, then `design-system.md`, then individual component PRDs.

## Product summary
An AI-powered Contiki demo with two surfaces:
1. **Homepage + Semantic Search** — free-text AI search that surfaces ranked Contiki trips with reasoning, inside the header search dropdown.
2. **Multi-Trip Builder** — combine 2+ Contiki tours into one bookable package, with AI flight suggestions (Duffel) and geo-fenced hotel suggestions (LiteAPI) filling the gaps.

Both are password-gated (`Go-Wander-2026`) and styled to the Contiki brand guide.

## Tech stack
- **Frontend:** Static HTML + Tailwind CSS (CDN or build). Vanilla JS — no framework required.
- **Backend:** Vercel Edge Functions (`/api/*`) as secure proxies. No API keys in client code.
- **Hosting:** Vercel. Static files at repo root, functions in `/api`.
- **AI:** Anthropic Messages API (`claude-sonnet-4-20250514`) via `/api/search`.
- **Flights:** Duffel API via `/api/flights`.
- **Hotels:** LiteAPI via `/api/hotels`.

## File structure
```
/
├── index.html              # Homepage + search modal
├── build-trip.html         # Multi-trip builder
├── api/
│   ├── search.js           # Anthropic proxy (semantic search)
│   ├── flights.js          # Duffel proxy
│   └── hotels.js           # LiteAPI proxy
├── assets/
│   └── (logos, fonts if self-hosted)
├── tailwind.config.js      # Token theme extension
├── vercel.json             # Routing
├── package.json            # Node 24.x
└── README.md
```

## Environment variables (Vercel)
| Var | Used by | Required |
|-----|---------|----------|
| `ANTHROPIC_API_KEY` | search.js | For live AI (falls back to keyword search) |
| `DUFFEL_API_KEY` | flights.js | For live flights (falls back to mock) |
| `LITEAPI_KEY` | hotels.js | For live hotels (falls back to mock) |
| `TTC_API_TOKEN` | search.js | For live Contiki tours (falls back to mock) |

**Graceful degradation is mandatory:** every proxy returns realistic mock data when its key is absent, so the demo always works.

## Shared conventions
- **Password gate** wraps every page — full-screen lock, `Go-Wander-2026`.
- **Data shape** matches TTC API v4 field names (`departure_date`, `end_date`, `destinations[]`, `from_price`, `duration_days`, `geography`) so live swap is trivial.
- **Mock data, real architecture** — curated trips back the demo; the integration structure is production-identical.
- **AI is visible** — surface reasoning (match confidence, "AI understood" summaries, why-this-fits blocks). Never let AI work silently.
- **No client-side keys** — all third-party calls go through `/api` proxies.

## Component inventory (PRDs)
| # | Component | File |
|---|-----------|------|
| 01 | Nav / Header | `01-nav-header.md` |
| 02 | Hero | `02-hero.md` |
| 03 | Trip Card | `03-trip-card.md` |
| 04 | Search Modal | `04-search-modal.md` |
| 05 | Search Results | `05-search-results.md` |
| 06 | Region Explorer | `06-region-explorer.md` |
| 07 | Footer | `07-footer.md` |
| 08 | Password Gate | `08-password-gate.md` |
| 09 | Build-Trip Search | `09-build-trip-search.md` |
| 10 | Build-Trip Timeline | `10-build-trip-timeline.md` |
| 11 | Gap Card | `11-gap-card.md` |
| 12 | Package Modal | `12-package-modal.md` |
| 13 | API Proxies | `13-api-proxies.md` |

## Global acceptance criteria
- [ ] All pages password-gated
- [ ] Tailwind config extends with Contiki tokens from `design-system.md`
- [ ] No API keys in any client file
- [ ] Every proxy degrades gracefully to mock data
- [ ] Responsive at 1024 / 768 / 480
- [ ] Mencken (hero) + Halyard (body) with documented fallbacks
