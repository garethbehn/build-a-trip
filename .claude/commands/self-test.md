---
description: Check every acceptance criterion and fix failures (lifecycle stage 4)
---
You are in the **/self-test** stage.

Open the component's PRD. Go through EVERY acceptance-criteria checkbox:
1. For each, state PASS or FAIL with a one-line reason.
2. Fix every FAIL, then re-check.
3. Run the `contiki-fidelity` skill for a brand audit and `demo-credibility` to ensure it holds up self-serve.
4. Verify responsive behaviour at 1024 / 768 / 480.

GATE: all boxes must be PASS before moving to `/refine`. Report the final checklist.
