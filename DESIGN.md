# Design system: One Local partner website

The look agreed on 14–15 Nov 2026, built first on the landing page (`src/components/landing/`, `src/app/landing.css`).
Every new page follows this. Product truth is in `PRODUCT.md`.

## The idea in one line

A friendly onboarding flow drawn like a pop-art comic on a soft field of grass: one idea per screen, loud lettering,
calm background.

## Colour

Tokens live on `.ol-landing` in `src/app/landing.css`.

| Token | Value | Use |
|---|---|---|
| `--lime` | `oklch(0.89 0.22 131)` | The brand field; partner moments |
| `--forest` | `oklch(0.23 0.06 150)` | Night field; the rider; dark sections |
| `--mint` | `oklch(0.975 0.03 135)` | Quiet light sections; the customer |
| `--ink` | `oklch(0.17 0.04 150)` | Text, outlines, hard shadows |
| `--ink-soft` | `oklch(0.36 0.07 147)` | Secondary text on light fields |
| Pop yellow | `#ffe44d` | The one loud accent: highlighted words, primary pop buttons, markers |
| `--marigold` | `oklch(0.8 0.17 68)` | Only for "ringing / waiting" states |

A section sets `data-tone="lime" | "mint" | "forest"`; pop lettering, chips and glass read their colours from it.

## Type

| Role | Face | Notes |
|---|---|---|
| Pop headline | **Bangers** (`--font-pop`), class `.ol-pop` | White fill, thick ink outline, hard ink drop. One phrase in pop yellow (`<em>`). Hindi falls back to Baloo 2 weight 800 |
| Display | **Baloo 2** (`--font-baloo`), class `.ol-display` | Section titles and UI headings below the hero; draws Latin and Devanagari |
| Body | **Mukta** (`--font-mukta`) | Latin and Devanagari |
| Script | **Yesteryear** (`--font-script`), `.ol-script` | Short sign-offs in the lower sections only; not used in the hero |

Text that sits directly on the grass uses `.ol-pop-say`: bold ink with a thick pale halo. No box behind words.

## The background

`DitherField` (`dither-field.tsx`): a calm green field whose colour drifts slowly, seen through faintly fluted glass,
with a fine still grass texture and a light dither. It takes a `mood` (`lime`, `mint`, `forest`) and eases between
them. Nothing in it bends or sways. It is drawn small and stretched to stay light on budget phones.

## Components

| Thing | Class / component | Look |
|---|---|---|
| Primary action | `.ol-pill.is-pop` | Yellow pill, 3px ink border, hard ink shadow; presses down on tap |
| Quiet action | `.ol-pill` | Ink pill |
| Text field | `.ol-pop-ask` | White pill, 3px ink border, hard ink shadow |
| A choice (one of several) | `.ol-choice` | White card, ink border, hard shadow; yellow and pressed when chosen |
| A small choice | `.ol-chip` | Same idea, smaller |
| Header | `.ol-glass` bar | Slim frosted glass, plain text, yellow marker for the current chapter |
| Phone | `.ol-iphone` | Titanium frame, Dynamic Island, real app screens inside |
| Starburst | SVG in `journey.tsx` | Yellow comic burst with a shout word |
| Icon chip | `.ol-ico` | Small round lime chip with a line icon |
| Dot patch | `.ol-dots` | Faint printed dots fading out of a section's corner |

## Motion

- Exponential ease-out: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Swaps use **opacity and movement only**. No blur filters (they made the page choppy).
- One authored moment per page. On the landing page it is the pinned phone journey.
- Everything calms down under `prefers-reduced-motion`.

## Rules

1. One question or one idea per screen.
2. Words stand on the field by themselves; no container behind running text.
3. Real app screens only inside the phone.
4. Only decided rules are stated as fact (see `PRODUCT.md`).
5. Test at phone size (390 × 844 and 375 × 667) and desktop before calling a page done.
