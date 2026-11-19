# Design system: One Local partner website

The look set on 18 Nov 2026. It replaces the pop-art comic look of 14–15 Nov (too playful for a partner site).
Every page follows this. Product truth is in `PRODUCT.md`. Styles live in `src/app/landing.css`.

## The idea in one line

A survey map of the city with the product laid over it on glass: calm, exact, trustworthy.

## Colour

Tokens live on `.ol-landing` in `src/app/landing.css`. **Deep green leads.** Lime is a signal, never a field.
There is no yellow.

| Token | Value | Use |
|---|---|---|
| `--forest` | `oklch(0.25 0.055 155)` | The lead colour: hero, big statements, the header bar, buttons on cream |
| `--forest-deep` | `oklch(0.19 0.045 156)` | Footer, button hover |
| `--forest-2` | `oklch(0.31 0.06 154)` | Raised blocks on deep green |
| `--cream` | `oklch(0.975 0.012 95)` | The calm reading ground |
| `--cream-2` | `oklch(0.948 0.018 96)` | A second cream, to separate two reading sections |
| `--lime` | `oklch(0.89 0.22 131)` | Signal only: the main button on deep green, the active stage, ticks, progress |
| `--leaf` | `oklch(0.47 0.13 148)` | The emphasis green on cream (one phrase in a heading, icons) |
| `--ink` / `--ink-soft` | `oklch(0.21 0.04 155)` / `oklch(0.43 0.035 155)` | Text on cream |
| `--on-forest` / `--on-forest-soft` | `oklch(0.965 0.015 100)` / `oklch(0.83 0.045 140)` | Text on deep green |
| `--danger` | `oklch(0.55 0.2 27)` | Errors only |

A block sets `data-tone="forest"` or `data-tone="cream"` (cream is the default). The tone hands every part its
colours through `--fg`, `--soft`, `--em`, `--line`, `--chip`, `--field`, `--action`, `--glass`, `--focus`. Parts
read those, never the raw colours, so the same button or field works on both grounds.

## Type

All three faces are by Ek Type and were drawn to sit together in Latin and Devanagari.

| Role | Face | Notes |
|---|---|---|
| Headings | **Anek Latin**, with **Anek Devanagari** for Hindi (`--font-display`) | Classes `.ol-title` and `.ol-display`: weight 600, width 106%, tight tracking. One phrase in `<em>` takes the tone's green |
| Text | **Mukta** (`--font-text`) | Latin and Devanagari. `.ol-lead` for supporting lines, `.ol-label` for field labels |

No comic, script or outlined lettering. No label line above a heading.

## The background

`ContourField` (`src/components/landing/contour-field.tsx`): a slowly drifting landscape shaded from deep to light,
with hair-thin contour lines. Drawn per pixel with WebGL, about 30 frames a second, stops off screen, one still frame under reduced motion.

- It takes a `mood`. The home page's hero is a **light map**: whitish cream with a faint wash of pale green, drawn
  in dark green (`day`, `sage`, `sand`, one per stop of the journey). `forest` is the deep green map (the closing
  section). `cream` is the quietest, for behind forms. Colours ease from one mood to the next.
- `travel` (the scroll position) moves the land on a little as the page is scrolled.
- `mood="cream" still` behind the join form and the dashboard: one quiet still frame.
- Lines are all one weight, creep outward very slowly, and fade out where the land is steep instead of crowding.
- The light maps carry a **slight dark green shading** that belongs to the land: valleys sit a little deeper and
  slopes facing away from the light are a touch darker, like relief on a printed map. It moves with the contours.
  Keep it slight (the `shade` value of a mood).
- **The hero's journey is drawn into the map** (the `route` prop, used by `journey.tsx`). The three kinds of business
  (stores, restaurants, services) stand on the map as peaks, so the contour lines ring around them, stronger near
  the place. A line of small squares runs between them and darkens where the visitor has been (the mood's `trail`
  colour). The visitor's marker is a small square that stays put, to the right of the phone, while scrolling slides
  the map past it. Each place carries its icon and name (`.ol-place`), which ride with the map and can be clicked.
- On screens narrower than 1280px there is no room beside the phone, so the journey shows as a compact tracker
  above the words instead (`tracker.tsx`, `.ol-track`): three equal segments, each a fine bar that fills as its part
  is scrolled through (like story progress bars), with the kind's icon and name under it.
- Lower sections may carry `.ol-dots`: a patch of the same square dots fading out of one corner.

## Components

| Thing | Class / component | Look |
|---|---|---|
| Glass | `.ol-glass` | Frosted (blur 22px, lighter on phones), lit top edge, hairline rim, soft shadow. Only for the header and the page's question |
| Header | `.ol-glass.ol-bar` inside `data-tone="forest"` | One slim dark green glass bar on every page; `.ol-bar-link`, `.ol-bar-btn`, `.ol-bar-cta`. On the home page it carries the three apps as chapters (`.ol-bar-tab`) with a lime marker |
| Main button | `.ol-pill` | Deep green on cream, lime on deep green. `.is-quiet` for the second choice, `.is-small` inside the ask |
| Text field | `.ol-field` | White, hairline border, green focus ring |
| A choice | `.ol-choice` | White card; green rim and a pale green wash when chosen |
| A small choice | `.ol-chip` | Pill; deep green with cream text when chosen |
| Card | `.ol-card` (`.is-error`) | White, hairline border |
| Icon chip | `.ol-ico` | Rounded square, tinted, icon in the tone's green |
| Phone | `.ol-iphone` in `journey.tsx` | Titanium frame, Dynamic Island, real app screens inside |
| Small app screen | `.ol-mini` | A real app screen in a plain dark frame, upright |

Corners: pills for buttons and chips, about 1rem for cards and fields, 0.8rem squares for icon chips and numerals.
Shadows are soft and offset downward. No thick outlines, no hard block shadows.

## The home page's sections

They follow the team's content document (18 Nov 2026) page by page. **The words are the document's own, and nothing
outside it is on the page.** Three sections carry a picture; the two between them set their words out as a designed
object instead, so the page is never a wall of text and never a row of placeholders.

| Section | Ground | How it is shown | Button |
|---|---|---|---|
| Journey (hero) | light map | the pinned phone, one stop each for stores, restaurants, services | Become a partner (stays put) |
| Local businesses, stronger together | deep green | words beside a framed shop photo (`.ol-photo`), then the partner carousel | Join OneLocal |
| A place for every local business | cream | one wide photograph (`.ol-slot.is-wide`), the three kinds of business in three columns under it (`.ol-trio`) | Find my business category |
| Clear charges. Confident decisions. | second cream | **no picture**: a quiet sheet (`.ol-sheet`) with a corner of the map showing through; each thing you will see stands on its own line in large type with a fine rule under it | View my charges |
| You know your business… | deep green | **no picture**: two stops joined by one fine line (`.ol-way`); the line fills, eased, as the section is scrolled, and the second stop lights up when it arrives | Get onboarding help |
| Your business, with better control | cream | the three apps on a piece of the map (`.ol-slot.is-apps`), the Partner app in front | Explore the partner app |
| Your next chapter starts here | deep green map | three cream cards (the three stages) | Start my onboarding, and a "Request a demo" link |

- **Key points are painted, not boxed.** In a paragraph, the phrases that matter are marked with *stars* in the copy
  and painted in the ground's green (or set bolder, `.ol-points`). A sentence that lists things is set out as a list
  (`Listed` in `landing-copy.ts`). The words stay the document's.
- **The partner carousel** (`.ol-partners`): each logo on a white tile, passing slowly across a band of the map.
  Contour lines rise softly behind the tiles and fade out above and below; the row fades at both edges, loops
  without a seam, and rests while a visitor points at it. No dots, no names under the tiles.
- Photographs sit straight. Nothing on the page is tilted.
- **App screens** in `public/shots` are captured from each app's `main`, running on the live server (18 Nov 2026):
  `customer-stores`, `customer-food`, `customer-services` (the hero's three stops: the app's Categories, Food and
  Book It tabs), and `customer-app`, `partner-app`, `rider-app` (the three apps). Recapture all of them together
  when the apps change, at 390 × 844 in the browser pane. Never use older files from other folders.
- Sections settle into place as they come into view, with movement only. Nothing below the hero is ever hidden
  waiting for an animation.

## Motion

- Exponential ease-out: `cubic-bezier(0.16, 1, 0.3, 1)`.
- One authored moment per page. On the home page it is the pinned phone journey: scrolling moves through stores,
  restaurants and services, and the map changes mood at each stop. Words stand directly
  on the map, with no box behind them.
- Swaps use opacity and movement only.
- Everything holds still under `prefers-reduced-motion`.

## Rules

1. The hero is cream with dark green lines and ink; lower down, deep green and cream alternate. Lime only marks an
   action or the live state.
2. Glass is only for the header. No glass panels around content.
3. Real app screens only; figures in them are marked as sample data.
4. Only decided rules are stated as fact (see `PRODUCT.md`).
5. The mascot Ol stays as he is.
6. Test at phone size (390 × 844) and desktop before calling a page done.
