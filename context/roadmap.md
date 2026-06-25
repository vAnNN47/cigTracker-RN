# Roadmap — all open bugs & problems

Global list of everything open across the app. Each item is tagged by feature and,
where one exists, links to its doc in [features/](features/). When something is
fixed it moves to that feature's **Fix log** (with a date) and leaves this list.

> This is the single open queue. Add items by sorting a brain-dump with `/inbox`; build + clear
> an area's items with `/fire <area>` (it moves each done item to that area's Fix log). Drain the
> **🧹 Reorg / tech debt** section with `/polish`.


## 🐞 Bugs

_(none open)_

## 🧩 Improvements

_(none open)_

## 🧹 Reorg / tech debt

- [ ] Standardize component files on PascalCase (mostly already true — verify no stragglers)
- [ ] Add one-line JSDoc hover-docs to exported components/functions
- [ ] Triage 38 lint errors from the new React-19/RN-0.85 react-hooks rules (`react-hooks/refs`, `react-hooks/set-state-in-effect`)
- [ ] Purge all existing `any`: remove the `eslint-disable @typescript-eslint/no-explicit-any` directives (repo row-mapping, auth `catch` clauses), retype to real types or `unknown`+narrowing, then flip the rule to **error** so `any` is build-blocked
