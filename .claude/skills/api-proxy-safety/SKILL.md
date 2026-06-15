---
name: api-proxy-safety
description: Verify that every third-party API call is routed through a server-side Vercel proxy with no client-exposed keys, correct request shapes (Duffel, LiteAPI, Anthropic, TTC), and graceful mock fallback when a key is absent. Use during /build and /self-test on any file under api/ or any client code that calls an external service.
---

# API Proxy Safety Check

Use on any `api/*.js` proxy or client code touching external services.

## Hard rules
1. **No client-side keys.** Grep client HTML/JS for `sk-ant`, `Bearer`, `x-api-key`, `DUFFEL`, `LITEAPI`, raw tokens. Any hit = FAIL. Keys live only in `process.env` inside `api/*`.
2. **Graceful mock fallback.** Each proxy must return realistic mock data (flagged `_mock: true`) when its env var is missing. Verify the fallback path exists and returns the same shape as live.
3. **Correct request shapes:**
   - **Duffel:** POST `air/offer_requests?return_offers=true`, `Duffel-Version: v2`, single call. Direct-only filter (`segments.length===1`). Feasibility filter (arrive before tripB_start − buffer − transfer).
   - **LiteAPI:** Step 1 `GET /v3.0/data/hotels` (city or lat/lng), Step 2 `POST /v3.0/hotels/rates`. Auth: `X-API-key` header.
   - **Anthropic:** `x-api-key` + `anthropic-version`, model `claude-sonnet-4-20250514`, JSON-only system prompt.
   - **TTC:** Basic `token:{TTC_API_TOKEN}`, Accept `application/vnd.ttc.v4+json`.
4. **CORS + OPTIONS + POST-only** on every proxy. try/catch around external calls.
5. **Never log secrets.**

## Output
PASS/FAIL per rule. Any key exposure is a critical FAIL — fix before anything else.
