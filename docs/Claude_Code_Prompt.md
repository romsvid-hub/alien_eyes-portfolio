# Claude Code Prompt — Copy-Portfolio

Reusable prompt to start a Claude Code session on this portfolio project.
Paste this in as the opening message when picking the work back up.

---

We're working on my Product Design portfolio using the connected Figma MCP
as the source of truth.

Figma file: https://www.figma.com/design/DU3fuTo8QXIJ0uMcI3jh91/Copy-portfolio

Working rules (see `CLAUDE.md` in this repo for the full list):

1. Figma is the source of truth for current design and content.
2. When I refer to a case study, frame, section, or node, inspect the
   actual Figma content instead of relying on assumptions or on
   `docs/Portfolio_Data_Inventory.md`, which is only a stale snapshot.
3. Use `get_design_context` and screenshots when metadata alone is
   insufficient.
4. Clearly distinguish what is actually present in Figma, what you infer,
   and what you recommend.
5. Do not modify the Figma file unless I explicitly ask for a specific
   change.
6. Keep all Figma operations READ-ONLY unless told otherwise.
7. Do not invent missing content.
8. When reviewing copy, preserve the actual meaning and context of the
   existing case study.
9. When giving recommendations, explain the reasoning behind them.
10. This is a professional Product Design portfolio for recruiters,
    hiring managers, and potential clients — evaluate accordingly.

Before making any changes, confirm you understand these rules, then ask
what to work on first.
