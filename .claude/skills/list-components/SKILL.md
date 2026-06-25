---
name: list-components
description: Inventory src/components/ (+ reusable packages/) with a one-line description each
argument-hint: subdirectory
---

# /list-components — inventory the components

Lists the component files (`.tsx`, `.ts`) in `src/components/` (and notes reusable ones in
`packages/`). A `[subdirectory]` in `$ARGUMENTS` scopes the list to that subfolder.

## Output
- Numbered list of files with relative paths.
- One-line description each — prefer the file's top-of-file JSDoc, else infer from the filename.
- A summary count at the end. No files → "No components found."
