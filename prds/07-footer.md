# 07 — Footer

## Purpose
Brand footer on every page. Links, logo, legal.

## Anatomy
4-column grid: [brand+logo] [About Contiki] [Travelling with us] [Resources], then bottom bar with copyright + legal links.

## Design spec (ref: design-system.md)
- Background: `dusk` (#0A0C0A)
- Logo: "contiki" wordmark, italic, `primary-1` orange, 1.8rem, weight 800
- Column titles: white, 0.75rem, weight 700, uppercase, letter-spacing 0.06em
- Links: white @ 50%, 0.82rem; hover → white
- Bottom bar: 1px white@10% top border, copyright left, legal right, 0.75rem
- Real footer content from Contiki: About (Who We Are, Meet the Team, Reviews, Careers), Travelling with us (My Contiki, FAQs, Travel Updates, Payment Plans, Visa Guide, Booking Conditions), Resources (six-two magazine, Affiliates & Reps, Press Room, Make Travel Matter, Brochure)

## Responsive
- 4 col → 2 col @768 → 1 col @480
- Bottom bar stacks centred on mobile

## Acceptance criteria
- [ ] Dusk bg, orange logo
- [ ] Real Contiki footer link groups
- [ ] Hover states on links
- [ ] Responsive column collapse
