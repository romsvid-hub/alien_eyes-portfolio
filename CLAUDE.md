# Copy-Portfolio

Working notes and reference docs for Roman's Product Design portfolio. The
actual design and content live in Figma — this repo holds supporting
documentation, not the design itself.

## Source of truth

**Figma is the source of truth**, not this repo. File:

- Name: "Copy portfolio"
- URL: https://www.figma.com/design/DU3fuTo8QXIJ0uMcI3jh91/Copy-portfolio
- File key: `DU3fuTo8QXIJ0uMcI3jh91`

Any summary of content or structure in `docs/` is a point-in-time snapshot.
Before relying on it, re-check against the live Figma file via the Figma MCP
tools (`get_metadata`, `get_design_context`, `get_screenshot`).

## Audience

Professional Product Design portfolio for recruiters, hiring managers, and
potential clients. Evaluate content and structure decisions against that
audience.

## Working rules

1. Figma is the source of truth for current design and content.
2. When a case study, frame, section, or node is referenced, inspect it in
   Figma directly rather than assuming from a prior summary.
3. Use `get_design_context` and screenshots when metadata alone is
   insufficient (e.g. generic layer names like "Text", "H1").
4. Clearly distinguish: what is actually present in Figma, what is inferred,
   and what is a recommendation.
5. Do not modify the Figma file unless explicitly asked for a specific
   change.
6. Figma operations are READ-ONLY by default.
7. Do not invent missing content — say so if something isn't retrievable.
8. When reviewing copy, preserve the actual meaning and context of the
   existing case study text.
9. Explain the reasoning behind recommendations, not just the suggestion.

## Figma file hygiene (from Roman, 2026-11-22)

Roman is the live author of the content and design. References: the
"Updates" page (layout) and the live site https://alieneyes.ink/ (code).

1. Do not create pages, frames, or copies of case studies in the portfolio
   Figma file without Roman's direct request.
2. If a technical draft is needed (experiment, measurement, snapshot), warn
   Roman first in one line: what, why, where.
3. If he agrees, name the draft with the prefix "TEMP · CC ·", keep it on a
   separate page "TEMP · Claude Code", and delete it as soon as it is no
   longer needed.
4. After every change in Figma, report briefly which pages or frames were
   created, changed, or deleted (with node ids).
5. Do not change the "Updates" page without Roman's request. It is his
   working layout.

## Docs in this repo

- `docs/Portfolio_Data_Inventory.md` — snapshot of case studies, node IDs,
  and extracted text pulled from Figma so far.
- `docs/Claude_Code_Prompt.md` — reusable prompt for starting a Claude Code
  session on this portfolio.
