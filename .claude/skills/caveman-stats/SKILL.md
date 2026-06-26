---
name: caveman-stats
description: >
  Show real token usage + estimated savings for the current session (reads the live
  Claude Code session log — no AI estimation). Triggers on /caveman-stats. Runs the
  caveman-stats reader script and prints its output verbatim.
---

# caveman-stats

The caveman marketplace plugin ships `/caveman-stats` as a `.toml` command + a hook block,
**neither of which Claude Code discovers** (upstream issues #571 `.toml`-vs-`.md`, #569 plugin.json
missing `"skills": "./skills/"`). This project skill is the working delivery: run the plugin's
reader script and print its stdout. **Do not compute the numbers yourself** — the script reads the
session JSONL.

## Do this when invoked
1. Run the reader via PowerShell (node is on fnm):
   ```
   fnm env --use-on-cd | Out-String | Invoke-Expression
   node "$env:USERPROFILE\.claude\plugins\marketplaces\caveman\src\hooks\caveman-stats.js" <args>
   ```
   Forward whatever the user passed after `/caveman-stats`:
   - (none) → current-session stats
   - `--all` → lifetime totals
   - `--since 7d` / `--since 24h` → windowed lifetime
   - `--share` → one-line shareable summary
2. Print the script's stdout **verbatim in a code block**. If it exits non-zero, show the error line.
3. No commentary unless the user asks — the numbers are the answer.
