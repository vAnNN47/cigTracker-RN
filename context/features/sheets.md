# Bottom sheets

**What / where:** The app's sheet surfaces — the keyboard-aware bottom sheets built on
`packages/keyboard-sheet` ([AddSmokeSheet](../../src/components/AddSmokeSheet.tsx),
[AddPurchaseSheet](../../src/components/AddPurchaseSheet.tsx),
[LogDetailSheet](../../src/components/LogDetailSheet.tsx)) and the full-screen **edit sheet**
([edit-log.tsx](../../src/app/edit-log.tsx), opened via the pencil on a recent smoke).

## Done

- [x] Edit sheet Cancel/Save header buttons have more space around them — 2026-06-25

## Fix log

<!-- newest at the bottom; one line each: date — what changed -->
- 2026-06-25 — Gave the edit sheet's **Cancel / Save** header buttons more breathing room: header `paddingHorizontal` `spacing.lg` → `spacing.xl` (16 → 20) and `paddingVertical` `spacing.md` → `spacing.lg` (12 → 16) in [src/app/edit-log.tsx](../../src/app/edit-log.tsx), so the buttons sit further from the screen edges with more room above/below.
