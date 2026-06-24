---
name: list-components
description: List project components
argument-hint: subdirectory
---

## Task

List the React Native component files (`.tsx`, `.ts`) in `src/components/` (and note reusable ones in `packages/`).

If a [subdirectory] is provided via $ARGUMENTS, only list files in that subdirectory.

## Output Format

- Numbered list of files with relative paths.
- Brief one-line description of each — prefer the file's top-of-file JSDoc summary if present, otherwise infer from the filename.
- Summary count at the end.

If no files are found, say "No components found."
