# Design QA — compact toggles and recent rewrites navigation

- Source visual truth path: `C:\Users\raikwar\AppData\Local\Temp\codex-clipboard-a09025df-7faf-407a-8875-f43f606fced6.png`
- Implementation screenshot path: blocked — `http://localhost:8083/workspace` redirects the available QA browser session to Google sign-in
- Intended viewport: `432 × 900` CSS px
- Source pixels: `1080 × 2400`
- Density normalization: source reviewed as a mobile layout reference; no same-state implementation capture was available
- State: signed-in mobile workspace with the style sheet open, plus the Recent rewrites summary card and dedicated history page

## Full-view comparison evidence

The source establishes compact right-aligned switches inside a bottom sheet. The implementation now uses a smaller native-switch scale, purple track, and white thumb. Recent rewrites has also moved from an accordion to a navigation card and protected full-history page. Browser compilation was confirmed, but the authenticated screens could not be captured.

## Focused region comparison evidence

The sheet contains Better, Professional, Casual, and Polite with compact right-aligned switches matching the reference proportions. The workspace Recent rewrites card now ends in a right chevron and opens the previous expanded three-card layout on `/history`. Same-state visual comparison is blocked by authentication.

## Findings

- [P2] Signed-in mobile workspace lacks browser-rendered visual evidence.
  - Location: rewrite-style switches, Recent rewrites card, and `/history` page.
  - Evidence: the local route redirects the QA browser to Google sign-in.
  - Impact: exact toggle proportions and the new navigation transition cannot be visually confirmed.
  - Fix: capture the workspace from a signed-in local session and compare at the intended mobile viewport.
- Fonts and typography: existing Inter typography and Rewrite AI hierarchy are retained.
- Spacing and layout rhythm: the sheet uses a rounded top edge, drag handle, compact header, and four 65 px option rows.
- Colors and visual tokens: all controls use the existing light/dark theme tokens.
- Image quality and asset fidelity: no raster assets are required; Expo vector icons provide the plus, right chevron, and back arrow.
- Copy and content: the four requested rewrite styles have short explanatory labels.
- Accessibility and interaction: the plus button names all selected styles, every option is a controlled native switch, Android back closes the modal, and the selected styles array is sent to the Edge Function.

## Comparison history

- Initial state: switches used a larger platform-default appearance, and Recent rewrites expanded inline as an accordion.
- Fix: scaled the switches to compact connector-style proportions with a white thumb; replaced the accordion with a right-chevron navigation card and added a protected `/history` page reusing the expanded cards.
- Post-fix evidence: lint, type-check, and Metro compilation pass; signed-in visual evidence remains blocked.

## Open questions

- A signed-in workspace capture is required to validate both the sheet and history navigation.

## Implementation checklist

- [x] Circular plus button
- [x] Bottom-up modal sheet
- [x] Better enabled by default
- [x] Professional, Casual, and Polite options
- [x] Multiple styles sent in one rewrite request
- [x] One result card rendered per returned style
- [x] Compact white-thumb toggles
- [x] Recent rewrites right-chevron card
- [x] Protected dedicated history page
- [x] Existing expanded three-card history design reused
- [x] Lint and type-check pass
- [ ] Signed-in mobile visual comparison

## Follow-up polish

- Recheck the open sheet height and bottom safe-area spacing on the installed Android build.

final result: blocked

---

# Latest Design QA — expanding recent-rewrite grid

- Source visual truth path: `C:\Users\raikwar\AppData\Local\Temp\codex-clipboard-932c6683-0eac-4445-964a-d3510d936aee.png`
- Implementation screenshot path: blocked — the available local browser session redirects protected `/history` and `/workspace` routes to Google sign-in
- Intended viewport: mobile portrait, approximately `432 × 900` CSS px
- Source pixels: `248 × 184`
- Implementation pixels: unavailable
- Density normalization: unavailable until a signed-in capture can be made
- State: history page with more than three saved rewrites

## Full-view comparison evidence

The reference shows compact rounded rewrite cards arranged as two cards per row. The implemented history page retains the newest rewrite as the existing full-width featured card, then renders every remaining rewrite in a wrapping two-column grid with the same avatar, title, preview, date, radius, and theme tokens.

## Focused region comparison evidence

Code inspection confirms every item after index zero uses a `47.5%` card width with 14 px row and column gaps, preventing the last odd card from stretching full width. A 14-day automatic-deletion message follows the grid. The header now uses the violet Rewrite `r` mark, and the screen top padding increases by 4–5 px across mobile and wide layouts.

## Findings

- [P2] Signed-in history screen lacks browser-rendered visual evidence.
  - Location: `/history` card grid and shared header.
  - Evidence: the QA browser redirects to `/login` before protected content renders.
  - Impact: exact two-column width, text truncation, header-logo scale, and top spacing cannot be compared visually.
  - Fix: capture `/history` from a signed-in local session containing at least five rewrites.
- Fonts and typography: existing Inter hierarchy is retained for rewrite cards and the retention note.
- Spacing and layout rhythm: featured card remains full width; older cards repeat in two-column rows with consistent 14 px gaps.
- Colors and visual tokens: cards and note reuse existing light/dark theme tokens; navbar logo uses brand violet.
- Image quality and asset fidelity: the header uses the existing scalable Rewrite `r` SVG.
- Copy and content: the page clearly states, “Rewrites are automatically deleted after 14 days.”

## Comparison history

- Initial state: only two compact cards were shown; rewrites after the third item were hidden behind a list-style “View all” control.
- Fix: removed the list-style expansion and mapped every older rewrite directly into the repeating two-column card grid.
- Post-fix evidence: lint, type-check, and diff checks pass; signed-in visual comparison remains blocked.

## Implementation checklist

- [x] Keep newest rewrite full width
- [x] Render all older rewrites two per row
- [x] Preserve card styling and truncation
- [x] Add 14-day deletion message
- [x] Add slight navbar top spacing
- [x] Replace old header symbol with violet Rewrite `r`
- [x] Lint and type-check pass
- [ ] Capture a signed-in history state with more than three cards

final result: blocked

---

# Latest Design QA — Claude-style rewrite workspace

- Source visual truth path: `C:\Users\raikwar\Downloads\Screenshot_20261104-105613.png`
- Supporting brand reference: `C:\Users\raikwar\AppData\Local\Temp\codex-clipboard-6321d04f-3584-4598-bce0-48bf27dcbb40.png`
- Implementation screenshot path: blocked — `http://localhost:8082/workspace` redirects the available QA browser session to `/login`
- Intended viewport: mobile portrait, approximately `432 × 900` CSS px
- Source pixels: `1080 × 2400`
- Implementation pixels: unavailable because the protected workspace could not be captured
- Density normalization: not applicable until a signed-in implementation capture is available
- State: signed-in workspace, empty state before the first rewrite, then selected-variant response cards

## Full-view comparison evidence

The source establishes a sparse message area with one centered brand mark and greeting, a fixed header, and a fixed bottom composer. The implementation keeps the product's Recent rewrites navigation card above that area, while the section kicker, “Make it sound better” heading, desktop inline composer, and empty response placeholder have been removed. The composer is fixed at the bottom on mobile, tablet, and desktop.

## Focused region comparison evidence

Code inspection confirms the center state contains the Rewrite violet `r` SVG, “Start with a message,” and one short hint. When a rewrite begins, that state is replaced by cards titled only with the selected variants, such as Better and Professional. A same-state rendered comparison remains blocked by authentication.

## Findings

- [P2] Signed-in workspace lacks browser-rendered evidence.
  - Location: `/workspace` empty state and response state.
  - Evidence: the local QA browser is redirected to Google sign-in before the protected workspace renders.
  - Impact: exact optical centering, responsive vertical balance, SVG scale, and bottom-composer spacing cannot be visually confirmed.
  - Fix: open the local workspace from a signed-in browser session and capture the empty and populated states at the target mobile viewport.
- Fonts and typography: existing Inter typography is retained; the empty-state title uses the existing semibold hierarchy.
- Spacing and layout rhythm: the main area is centered and constrained to 760 px; the compact composer remains fixed below it.
- Colors and visual tokens: the new SVG uses the existing violet `#9a69c9`; all cards use existing light/dark theme tokens.
- Image quality and asset fidelity: the center mark is a scalable React Native SVG based on the supplied Rewrite logo, so it stays sharp at all device densities.
- Copy and content: retained the Recent rewrites navigation card; removed “New message,” “Make it sound better,” and the empty result-card copy. Response cards now use short titles such as Better and Professional.
- Accessibility and interaction: the existing composer labels, style selector, loading states, copy controls, haptics, and multi-variant request flow remain intact.

## Comparison history

- Initial state: below the Recent rewrites card, the workspace showed a large section heading and an empty result card before the user had written anything.
- Fix: retained the Recent rewrites card, replaced only the content below it with a centered Rewrite logo empty state, and made result cards conditional on loading or returned output.
- Post-fix evidence: lint and type-check pass; signed-in visual comparison remains blocked.

## Implementation checklist

- [x] Retain the Recent rewrites navigation card at the top of the workspace
- [x] Remove “New message” and “Make it sound better”
- [x] Remove the empty placeholder result card
- [x] Add centered Rewrite `r` SVG empty state
- [x] Keep the composer fixed at the bottom
- [x] Render only selected response cards after submission
- [x] Use short card titles: Better, Professional, Casual, and Polite
- [x] Preserve multi-select variants, loading feedback, copy controls, and rewrite API flow
- [x] Lint and type-check pass
- [ ] Capture signed-in empty and response states for visual comparison

## Follow-up polish

- Recheck the empty-state vertical position and composer safe-area spacing on the installed Android build.

final result: blocked
