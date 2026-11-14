# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Business owners in Latur, Maharashtra: restaurants (including bakeries and cafés), stores (kiranas, pharmacies, shops) and service providers (salons, repairs, cleaning, tutors). Mostly on budget Android phones, often reading in a hurry at the counter. They are deciding whether to join One Local, then applying and getting set up.

## Product Purpose
The partner website is the web front door of One Local for businesses: it explains the One Local ecosystem, lets a business apply, upload documents and track approval, and after approval opens the full partner dashboard (the Flutter Partner POS running on the web, same login). It exists so partner onboarding can start before the Partner app is in the stores. Success means more verified partners applying and going live.

## Positioning
One Local gives a local business one system: its POS, its online listing, its customers, its delivery and its ads. It is local-first (starts in Latur, opens area by area), counter billing and online orders share one item list and one stock count, and a partner can deliver with its own riders or One Local's.

## Operating Context
- Source of truth for everything about One Local: the brain repo (`onelocal/brain`, start at `00-START.md`; rules in `brain/bible/`). Quote rules by ID.
- Applications are written to `ol_partner_applications` and reviewed in Proviyaa Master; approval creates the organisation.
- After approval the partner uses the Partner POS (Store, Restaurant or Service lane).

## Capabilities and Constraints
- Next.js 15 + React 19 + Tailwind 4 + motion. Join flow at `/join`.
- A partner chooses POS only, One Local listing only, or both (PAR-1). Sign-up needs a phone and an email (PAR-3).
- Partners are paid every Wednesday for the week Monday to Sunday (MON-1).
- A new shop shows "New", not a default rating (PAR-11).
- Undecided, never shown as fact: plan prices (PAR-7), commission rates (COM-1), document list (PAR-4), delivery area and hours (DEL-1, DEL-2), support number (OD-34).
- No "10-minute delivery" claims (DEL-3).

## Brand Commitments
- Name: One Local (written "OneLocal" in the logo). Made in Latur.
- Existing brand seed: lime green and deep green, a 3D shop with a striped awning (`landing page/design frame.pdf`).
- Languages: English, Hindi and Hinglish.

## Evidence on Hand
- No partner names, logos, counts or testimonials may be shown yet. Leave a slot; fill only with real partners who agreed.
- Category reference PDFs per business type in `landing page/OneLocal/`.

## Product Principles
1. Only decided rules go on the page; the Bible decides what is true.
2. Built for a shop owner on a budget phone: fast, legible, one idea per screen.
3. Local and human: a Latur team verifies and supports every partner.
4. One system, not five apps.

## Accessibility & Inclusion
Must perform on low-end Android phones on mobile data. Respect reduced motion. Readable in English, Hindi and Hinglish.
