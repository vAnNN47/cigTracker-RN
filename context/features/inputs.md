# Text inputs (controlled `TextInput` caret behaviour)

**What / where:** every free-text field in the app. The only real `TextInput`s are the
comment + diary fields in `src/app/edit-log.tsx` and the feeling + notes fields in
`src/components/sheets/AddSmokeSheet.tsx` (via `packages/keyboard-sheet/SheetTextInput`).
Settings price/baseline + add-purchase use the in-app **NumberPad**, not a `TextInput`.

## Done

- [x] All free-text fields are **uncontrolled** (`defaultValue` + ref capture), so the OS owns the caret — 2026-06-27

## Fix log

- 2026-06-27 — Fixed the iOS "cursor jumps backwards on fast typing" bug. Root cause: every
  field was controlled (`value` from `useState`), so each keystroke re-rendered the parent and
  fed a one-keystroke-stale `value` back — on iOS the native caret races ahead and snaps back.
  All four values are read only at save, never displayed elsewhere, so switched them to
  **uncontrolled**: `defaultValue` for the initial text + an `onChangeText` that writes to a
  `useRef` (no per-keystroke re-render). `AddSmokeSheet` stays mounted across opens, so it holds
  `TextInput` refs and calls `.clear()` in `present()` to reset the fields. (`defaultValue` reads
  a plain initial value, never `ref.current`, to satisfy `react-hooks/refs`.)
