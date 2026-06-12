---
description: Commit, push, deploy, document env (lifecycle stage 6)
---
You are in the **/ship** stage.

1. Stage and commit with a Conventional Commit message referencing the component.
2. Push to the connected GitHub remote (Vercel auto-deploys).
3. List any new Vercel environment variables required (e.g. ANTHROPIC_API_KEY, DUFFEL_API_KEY, GOOGLE_PLACES_API_KEY, TTC_API_TOKEN) and remind the user to add + redeploy if needed.
4. Confirm the deploy URL and what to test.

Never put secrets in committed files.
