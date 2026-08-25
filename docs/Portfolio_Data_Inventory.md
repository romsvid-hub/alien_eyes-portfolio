# Portfolio Data Inventory

Snapshot date: 2026-08-25
Source: Figma file "Copy portfolio" (`DU3fuTo8QXIJ0uMcI3jh91`), inspected
read-only via the Figma MCP server.

This is a **point-in-time snapshot**, not live state. Re-verify against
Figma before relying on it for accuracy, since the file may have changed
since this was written.

## File

- Name: Copy portfolio
- Key: `DU3fuTo8QXIJ0uMcI3jh91`
- Page: "Page 1" (`0:1`)

## Figma Source of Truth

Figma file: Copy portfolio
URL: https://www.figma.com/design/DU3fuTo8QXIJ0uMcI3jh91/Copy-portfolio
File key: `DU3fuTo8QXIJ0uMcI3jh91`

Verified nodes (Phase 0):
- Home — `2:13410`
- Uniqkey — `2:14428`
- ATJ 1 — `2:13802`
- System part — `2:15045`

**Figma is the source of truth for current design and content.** Where
anything in this document conflicts with the live Figma file, the Figma
file wins — this doc is a snapshot and may lag behind it.

## Design System — verified from Figma

Verified 2026-08-25 (Phase 0), read-only, via `get_variable_defs`,
`get_metadata`, and `get_screenshot` against the nodes listed above.
Every item below is tagged:

- **VERIFIED** — read directly from a Figma variable, metadata field, or
  a screenshot of a live (non-reference-sheet) instance.
- **INFERENCE** — a reasonable guess (e.g. from a token's name) that has
  not been directly confirmed by inspecting where it's actually used.
- **NOT AVAILABLE / NOT VERIFIED** — checked and not found, or could not
  be checked due to a tool limitation. Not invented.

### Color tokens — VERIFIED (`get_variable_defs` on `2:15045`)

| Token | Hex |
|---|---|
| Black | `#000000` |
| White | `#FFFEFE` |
| Dark Alien | `#110E15` |
| Dark Pink | `#74095F` |
| Pink Alien | `#D60DAE` |
| Purple Light | `#9A73FF` |
| Dark Gray | `#4D4A50` |
| Subtle Text | `#595959` |
| Lines/Dividers | `#D9D9D9` |
| Divider Lines | `#E9E9E9` |
| Aqua Eyes | `#6BBEC8` |
| Deep Text | `#181413` |
| Background/Background 1 | `#161616` |
| Background/Background 4 | `#141517` |
| Light Gray | `#858585` |
| Main Canvas | `#F7F7F7` |
| UniBrand | `#3072F5` |
| ATJ – Primary Accent | `#C44323` |

Note: only 8 of these (Dark Alien, Dark Pink, Pink Alien, Purple Light,
Dark Gray, Subtle Text, Lines/Dividers, Aqua Eyes) are shown as visual
swatches on the "System part" reference board. The rest exist as
variables but are not shown there. Pixel-sampling the swatch screenshot
independently matched these variable values exactly.

### Typography — VERIFIED (`get_variable_defs`, cross-checked against
the "Text Styles" labels on `2:15045`)

| Style | Font | Weight | Size | Notes |
|---|---|---|---|---|
| H1 Display | Sora | ExtraBold (800) | 64px | matches board label |
| H2 Section | Sora | Bold (700) | 40px | matches board label |
| H3 Case Study | Sora | Bold (700) | 24px | matches board label |
| Body Large | Inter | Regular (400) | 18px | matches board label |
| UI/Caption | Inter | SemiBold (600) | **14px** | board label says "13px" — **outdated**, variable value (14px) is the verified one |

Additional typography variables exist in the file but are **not** shown
on the "Text Styles" reference board (VERIFIED as defined; where they're
actually used is NOT VERIFIED):

- `Alien fonts/Second Button` — Nexa Heavy (900), 16px
- `Alien fonts/Second title` — Nexa Heavy (900), 32px
- `Alien fonts/Additional title` — Nexa Heavy (900), 24px
- `Alien fonts/General Content Text` — Fixel Text Medium (500), 18px
- `Alien fonts/Simple Content Text` — Fixel Text Medium (500), 16px
- `Desktop/S1` — Fixel Text Medium (500), 14px
- `Desktop/H4` — Fixel Text SemiBold (600), 18px
- `Paragraph` — Figtree Regular (400), 12px

### Navigation — VERIFIED (screenshots)

System part board (`2:15045`) documents 3 states:
1. Desktop, full: logo + "Case studys" / "Design process" / "Feedbacks" +
   "Download CV" button.
2. Desktop, simplified: logo + "Case studys" / "Feedbacks" + "Download
   CV" (magenta-bordered, active-looking state).
3. Mobile: logo + hamburger icon.

**Discrepancy:** the board spells it "Case studys". The live Nav
instance on Home (`2:13525`) actually reads **"Case Studies"** (correct
spelling). The board text is outdated relative to the live page.

### Footer — VERIFIED (screenshots)

- System part board reference (`2:15045`): logo + "© 2026 Roman
  Sviderskyi" only. No social icons, no contact info.
- Live Footer instance on Home (`2:13425`) is more complete: logo,
  Instagram / LinkedIn / Telegram icons, "© 2026 Roman Sviderskyi",
  phone `+380 97 334 9540`, email `svidddrommm25@gmail.com`.

The board reference is incomplete relative to the live component —
treat the live instance as the actual spec, not the board.

The email `svidddrommm25@gmail.com` is transcribed exactly as it
renders in the screenshot; the repeated "ddd"/"mmm" pattern looks like a
possible typo. Flagging it, not correcting it — verify with Roman
before treating it as intentional.

### Buttons — VERIFIED (screenshots)

- Primary filled button (purple, e.g. "Book a Call →").
- Outline / secondary button (white/transparent fill).
- Magenta-bordered active/focused state (seen on "Download CV").
- A separate **blue** button set ("Детальніше") bound to the `UniBrand`
  (`#3072F5`) token — visually and by token name distinct from the core
  8-color "Alien" palette. **INFERENCE:** likely scoped to the Uniqkey
  case study specifically, not a global button style — not directly
  confirmed by checking every usage site.
- LinkedIn "View" button: default (dark) and focused (purple-bordered)
  states.

### Tags / chips — VERIFIED

"SaaS" tag/chip component, seen repeatedly in Home and ATJ 1 metadata
and on the system part board (e.g. `2:13460`–`2:13467` on Home).

### Relevant components — VERIFIED (screenshots)

- Dropdown/select-style menu component.
- Toast/notification component.
- Carousel arrow controls, in two color variants (purple, magenta/pink).
- Reviews carousel component (`instance "Reviews"`), reused on Home and
  ATJ 1.
- Modal/lightbox pattern ("Other Screens") used for case-study screen
  previews (e.g. "Security Score Overview" placeholder).
- Client/job logo row: ALL TOGETHER JOBS, uniqkey™, JustPlay Engine,
  lampa, softserve, HOCHU RAYU — each in gray and white states. Matches
  the 6× "Com.logo" instances under "Job logos" in Home's metadata.
- CTA block: "Ready to architect your next product?" + "Book a Call →",
  reused at the bottom of Home and ATJ 1.

### Spacing — NOT AVAILABLE / NOT VERIFIED

`get_variable_defs` on `2:15045` returned **no spacing tokens** — only
color and typography variables. No labeled spacing scale was found
visually on the system part board either. **No spacing values are
recorded here** because none exist in Figma to record; do not invent
any.

### Border radius — NOT AVAILABLE / NOT VERIFIED

Same as spacing: no border-radius variables were returned by
`get_variable_defs`, and no labeled radius scale was found on the
board. **Not recorded, not invented.**

### Design-system limitations / missing tokens

- No spacing token system exists in the file.
- No border-radius token system exists in the file.
- Brand color is not fully centralized: two case-specific tokens
  (`UniBrand`, `ATJ – Primary Accent`) live outside the main 8-color
  "Alien" palette.
- The visual "Text Styles" reference on the system part board documents
  only 5 of the ~13 typography variables actually defined in the file.
- `get_metadata` and `get_design_context` both fail with a repeatable
  `SSE parse error` on nodes `2:14428` (Uniqkey) and `2:15045` (System
  part) specifically — not a permissions issue (screenshots of the same
  nodes work fine), but their full XML/code metadata could not be
  pulled through those two tools. Verification for those nodes relied on
  `get_variable_defs` + screenshots instead.

### Case-specific colors

- `UniBrand` — `#3072F5`. **INFERENCE** (from token name): likely tied
  to the Uniqkey case study.
- `ATJ – Primary Accent` — `#C44323`. **INFERENCE** (from token name):
  likely tied to the ATJ 1 case study.

### Visual patterns — VERIFIED

- Dark theme throughout (near-black backgrounds: `#110E15`, `#161616`,
  `#141517`).
- Purple/magenta accent branding, "Alien Eyes" alien-head logo mark.
- Nav + Footer wrapper reused consistently across Home and ATJ 1.
- Impact-stats row pattern (large percentage callouts with labels),
  present on both Home and case study pages.
- Reviews carousel + CTA block repeated at the bottom of Home and ATJ 1.

## Case studies identified so far

### Uniqkey

- Case root: `2:14428` — frame "Uniqkey Case (Updated)" (1280×12805)
  - Root level contains a lot of `hidden="true"` legacy/archived content
    (old hero copy, old images) — not currently visible in the design.
  - Live visible content is in child frame `2:14459` ("Frame 2147262710",
    1280×12805.38).
- Structure of `2:14459` (top to bottom):
  1. Hero block (mockup image + hidden old headline)
  2. Impact stats: 26% Satisfaction Score / 95% Found nav improved / 85%
     Security Score understood / 27% Support tickets
  3. Product Scope intro (Admin portal / Extension and Mobile App /
     Partner Portal)
  4. Main narrative — story, challenge, context, old dashboard, 4 user
     quotes (Compliance Officer, Systems Administrator, Operations
     Manager, HR Manager), approach, redesigned security score
     (2 iterations), "the shift", redesigned dashboard 1/2 + key
     changes, redesigned dashboard 2/2 + business impact, other
     screens/awards, design system
  5. Live Design Files links block
  6. Reviews / CTA
  7. Footer
- Known gaps: 4 badge/status text nodes in the ITERATION 2 comparison
  table have generic names ("Text") — actual displayed labels not
  retrievable from metadata; needs `get_design_context` or screenshot
  read to confirm.
- Full extracted text: see chat transcript from 2026-08-25 (not yet
  copied into this file — pull from Figma again if needed rather than
  trusting a stale copy).

### ATJ 1

- Case root: `2:13802` — frame "ATJ 1 Case" (1280×13501)
- Metadata returned in full on first read (no truncation) — text mostly
  readable directly from layer names.
- Known gaps: several generic-named nodes ("H1", "Text", and numbered
  section frames like "1"/"2"/"3") where the literal displayed text
  isn't captured by the layer name alone.

## Not yet inventoried

- Any other pages/frames in the file beyond "Page 1" top-level review —
  only Home, Uniqkey, ATJ 1, and System part have been inspected in
  detail so far.
- Design tokens / variables — **partially done** as of Phase 0: see
  "Design System — verified from Figma" above for colors and
  typography (via `get_variable_defs`). Spacing and border-radius were
  checked and confirmed not to exist as tokens (see that section) —
  not an open item, a confirmed absence.
- Components/library usage — `get_libraries` has been run (see Design
  System section); it returned only generic, account-level Community
  kits (Material 3, Simple Design System, Apple OS kits) with no
  evidence they're actually instantiated in this file's checked nodes.
  `search_design_system` has not been run.
- Full text extraction for Uniqkey's ITERATION 2 comparison table
  badges and other generic-named nodes (see gaps noted under each case
  study below) — still open.

## How to refresh this doc

Re-run `get_metadata` (and `get_design_context`/`get_screenshot` where
needed) on the node IDs above, or on new sections, then update this file
with what's actually confirmed present — not assumptions carried over
from a previous session.
