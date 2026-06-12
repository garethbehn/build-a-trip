---
name: demo-credibility
description: Ensure an AI sales demo holds up under self-serve exploration by a prospect — no broken or empty states, realistic data, visible AI value, and graceful handling when live keys are absent. Use during /self-test before declaring any user-facing flow complete.
---

# Demo Credibility Check

These demos are sales tools explored by prospects without a presenter. They must feel polished and complete.

## Checklist
1. **Self-serve integrity** — every flow completes without a presenter narrating. No dead ends.
2. **No broken states** — loading, empty, and error states are all designed and reachable. Test each.
3. **Realistic data** — mock data is curated and believable (real destinations, plausible prices/dates). No "Lorem ipsum", no "test123".
4. **Visible AI value** — the AI's contribution is surfaced (match scores, "AI understood" summaries, why-this-fits, flight reasoning). The wow moment is explicit, not invisible.
5. **Graceful degradation** — with no API keys, the demo still works end-to-end on mock data. Verify each proxy's fallback.
6. **Brand polish** — passes `contiki-fidelity`.
7. **Credible architecture** — data shapes match the real API (TTC v4) so the "this is production-ready" pitch holds.

## Demo-specific guidance
- Keep technical caveats OUT of the UI (reserve for the verbal pitch). The artifact should feel finished.
- Password gate present and working (`Go-Wander-2026`).
- First impression matters: hero, search, and one full happy-path must be flawless.

## Output
PASS/FLAG per item. Any FLAG blocks "done".
