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
  only Uniqkey and ATJ 1 case frames have been inspected in detail so far.
- Design tokens / variables (`get_variable_defs` not yet run).
- Components/library usage (`get_libraries`, `search_design_system` not
  yet run).

## How to refresh this doc

Re-run `get_metadata` (and `get_design_context`/`get_screenshot` where
needed) on the node IDs above, or on new sections, then update this file
with what's actually confirmed present — not assumptions carried over
from a previous session.
