# Bottom sheets

**What / where:** The app's sheet surfaces — the keyboard-aware bottom sheets built on `packages/keyboard-sheet` ([AddSmokeSheet](../../src/components/sheets/AddSmokeSheet.tsx), [AddPurchaseSheet](../../src/components/sheets/AddPurchaseSheet.tsx), [LogDetailSheet](../../src/components/sheets/LogDetailSheet.tsx)) and the full-screen **edit sheet** ([edit-log.tsx](../../src/app/edit-log.tsx), opened via the pencil on a recent smoke).

## Gotchas / lessons

- `LogDetailSheet` "Copy text" = a real clipboard copy + "Copied" toast (`expo-clipboard` `setStringAsync` + `useToast`), NOT the OS share sheet. Copied text = **comment + diary only** (no `cigNumber · time` header).
- The `@expo/ui` community `DateTimePicker` (compact) sizes only **vertically** (`matchContents={{ vertical: true }}`) — its **width comes from `style`**, not its content. In RTL the time pill is leading-aligned (right), so any frame wider than the pill leaves trailing dead-space the native control fills with an artifact. Keep the `style.width` snug to the content (24h ≈ 84px); don't pad it. `matchContents.horizontal` can't be injected through the wrapper.
- `expo-clipboard` is **lazy-loaded** (`src/lib/clipboard.ts`) so a dev build without the native module doesn't crash on a metro-only reload.
