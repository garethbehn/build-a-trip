---
description: Turn a request into a PRD with acceptance criteria (lifecycle stage 1)
---
You are in the **/spec** stage of the Contiki AI Development Lifecycle.

Turn the user's request into a Product Requirements Document, or extend an existing one in `prds/`.

Steps:
1. Identify which component(s) this touches. Check `prds/` for an existing PRD.
2. If new, create `prds/NN-name.md` following the structure of existing PRDs: Purpose, Anatomy (ASCII), Design spec (referencing `prds/design-system.md` tokens), States, Interactions, Data shape, Acceptance criteria (checkboxes).
3. If extending, add to the existing PRD and update its acceptance criteria.
4. Reference design tokens by name — never invent hex values. Orange `#FF5900`, green `#1C4A3D`.
5. End by listing the acceptance criteria and asking the user to approve before `/build`.

GATE: do not proceed to build until the PRD exists and the user approves.
