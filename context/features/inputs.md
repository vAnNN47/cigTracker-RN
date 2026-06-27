# Text inputs (controlled `TextInput` caret behaviour)

**What / where:** every free-text field in the app. The only real `TextInput`s are the comment + diary fields in [src/app/edit-log.tsx](../../src/app/edit-log.tsx) and the feeling + notes fields in [AddSmokeSheet](../../src/components/sheets/AddSmokeSheet.tsx) (via `packages/keyboard-sheet/SheetTextInput`). Settings price/baseline + add-purchase use the in-app **NumberPad**, not a `TextInput`.

## Gotchas / lessons

- Keep free-text fields **uncontrolled** (`defaultValue` + ref capture) so the OS owns the caret. Making them **controlled** (`value` from `useState`) re-renders the parent every keystroke and feeds a one-keystroke-stale `value` back → on iOS the caret **jumps backwards on fast typing**. Safe here because these values are read only at save, never displayed elsewhere.
- `AddSmokeSheet` stays mounted across opens → it holds the `TextInput` refs and calls `.clear()` in `present()` to reset. `defaultValue` must read a plain initial value, never `ref.current` (satisfies `react-hooks/refs`).
