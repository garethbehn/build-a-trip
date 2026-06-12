# The Contiki AI Development Lifecycle

An opinionated, reusable workflow for building AI-powered demos in Claude Code. Designed for Gareth's demo-building practice — works for Contiki and any future vertical (insurance, travel, etc.).

## Philosophy
Demos are sales tools explored self-serve by prospects. They must be brand-perfect, credible, and showcase visible AI value. This lifecycle enforces that through gates — you can't skip from idea to code without a spec and a design review, and you can't call something done without passing self-test.

## The six stages

```
┌────────┐   ┌───────────────┐   ┌────────┐   ┌────────────┐   ┌─────────┐   ┌───────┐
│ /spec  │ → │ /design-review│ → │ /build │ → │ /self-test │ → │ /refine │ → │ /ship │
└────────┘   └───────────────┘   └────────┘   └────────────┘   └─────────┘   └───────┘
   PRD          tokens OK?         to spec      criteria met?     polish       deploy
```

| Stage | Purpose | Gate to pass |
|-------|---------|--------------|
| **/spec** | Request → PRD with acceptance criteria | PRD exists & approved |
| **/design-review** | Plan checked vs design system | No ad-hoc values |
| **/build** | Implement to PRD | — |
| **/self-test** | Tick every acceptance box, fix fails | All boxes PASS |
| **/refine** | States, motion, responsive, a11y | — |
| **/ship** | Commit, push, deploy, document env | No secrets committed |

## The three skills
Invoked automatically by the stages, or manually any time:

- **contiki-fidelity** — brand-guide audit (exact colours, Mencken/Halyard, component anatomy, icons). Catches `#FF5500` when it should be `#FF5900`.
- **demo-credibility** — ensures self-serve polish: no broken states, realistic data, visible AI value, graceful degradation.
- **api-proxy-safety** — no client-side keys, correct Duffel/Places/Anthropic/TTC shapes, mock fallback.

## How to use it in Claude Code

Starting a new component:
```
/spec add a testimonials carousel to the homepage
# → Claude writes prds/14-testimonials.md, you approve
/design-review
# → Claude checks tokens
/build
# → Claude implements
/self-test
# → Claude ticks the criteria, fixes fails
/refine
/ship
```

Adapting to a new vertical: swap `prds/design-system.md` for the new brand's tokens, update `CLAUDE.md`'s "What this project is", and rewrite `contiki-fidelity` as `<brand>-fidelity`. The lifecycle and other two skills are reusable as-is.

## Why gates matter
The most common failure in AI-assisted building is drift — coding before the spec is clear, approximating brand values, declaring done without testing. The gates make each of those impossible to do silently.
