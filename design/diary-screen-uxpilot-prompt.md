# UX Pilot prompt — "Diary / History" screen (Cig Tracker)

> Paste everything below the line into UX Pilot. It's written to match the existing
> Today screen's design system exactly so the export drops straight into the app.

---

**Role:** You are a senior product designer. Design **one** mobile screen for an existing dark-mode iOS/Android app called **Cig Tracker** (a calm, modern cigarette-reduction tracker). Match the established design system precisely — this screen must sit next to an already-built "Today" screen, so reuse the same colors, radii, spacing, card style, and iconography. Output a single mobile frame, **375 × 812**, dark theme. Use **Material Symbols / Material Icons** for all icons. Assume the app also supports **Hebrew RTL**, so keep the layout cleanly mirrorable (no hard-coded left/right asymmetry that would break when flipped).

## Screen purpose
This is the **Diary / History** tab (Hebrew label: "יומן"). The user picks a day and sees **everything that happened that day in one place**: cigarettes logged, the diary notes attached to them, and any purchases. Past days are read-only; today is editable. It replaces a separate calendar + log + purchase-history by consolidating them.

## Design system — use these tokens exactly
- Background: `#111827`
- Card surface: `#1F2937`, hairline border `rgba(255,255,255,0.08)`, corner radius **16**
- Inset/sub fills: `rgba(255,255,255,0.05)`, radius **12**
- Primary accent (teal): `#14B8A6`; brighter ring/positive teal `#2DD4BF`; accent tint fill `rgba(20,184,166,0.12)`, accent border `rgba(20,184,166,0.25)`; text-on-accent `#111827`
- Over-limit / negative: `#FB7185`
- Text primary `#F9FAFB`; text dim / labels `#6B7280`
- Track / progress background: `rgba(255,255,255,0.10)`
- Buttons radius **14**. Generous spacing (16–24px between sections). No drop shadows except a soft teal glow on primary actions.
- Type scale: screen/section titles 18–24px bold (700–800); values 22–28px extra-bold; body 14–16px; labels/captions 12–13px dim.

## Layout (top to bottom)

**1. Header**
- Title "Diary" (24px, 800, `#F9FAFB`).
- A current-month label or sub-caption in dim text (e.g. "October 2025").
- Right side: a small 40px circular icon button (`#1F2937`, hairline border) with a calendar/`event` icon to open a full month picker.

**2. Day selector (horizontal week strip)**
- A horizontally scrollable row of day chips for the last ~14 days, newest on the right, each chip showing the weekday abbreviation (top, dim) and the date number (bottom, `#F9FAFB`).
- The **selected day** is a filled teal `#14B8A6` chip with `#111827` text. Today gets a small teal dot indicator when not selected.
- Rounded chips, radius 12, ~44px wide.

**3. Selected-day summary card** (`#1F2937`, radius 16, hairline border)
- Left: the full date ("Monday, Oct 28", 16px) and the day's outcome ("7 / 15 cigarettes" — turn the count teal `#2DD4BF` if within limit, rose `#FB7185` if over).
- Right: a small dashed/solid progress ring (≈56px) showing % of limit used, teal.
- A thin row of two stat pills below: "Spent" (currency) and "Logged" (count), dim labels with brighter values.

**4. "Cigarettes" section**
- Section header "Cigarettes" (18px, 700) with a dim count on the right.
- A vertical list of log rows. Each row is a `#1F2937` card (radius 16, hairline border, ~64px tall):
  - Left: 36px circular fill (`rgba(255,255,255,0.05)`) with a `smoking-rooms` icon, dim.
  - Middle: title "Cigarette #7" (15px, 700) and a subtitle line "02:15 PM · After lunch" (13px, dim). If the entry has a diary note, show a small teal `menu-book`/`edit-note` badge.
  - Right: a chevron or `edit` pencil (dim) to signal it's tappable.
- Empty state: centered dim text "No cigarettes logged this day."

**5. "Purchases" section**
- Section header "Purchases" (18px, 700) with dim count.
- Rows styled like the cigarette rows: receipt icon, title "1 Pack" / "1 Carton", subtitle with time, and the price on the right (`#F9FAFB`, 700). 
- Empty state: dim "No purchases this day."

**6. Detail / edit bottom sheet (show as a second artboard or an overlay state)**
- A bottom sheet (`#1F2937`, top corners radius 28, grabber handle at top) that appears when a cigarette row is tapped.
- Header: "Cigarette #7" + its timestamp.
- A read-only time row, a **Comment** text field, and a **Diary** multi-line text field (placeholder "How did you feel right now?").
- **Two states to show:**
  - *Today (editable):* fields active, a teal "Save" button and a dim "Cancel".
  - *Past day (locked):* fields read-only/greyed, with a small lock note: "Past day — diary is locked. View only." and an info link "Why can't I edit past days?".

## Interaction notes (annotate lightly on the frame)
- Tapping any cigarette row opens the detail/edit sheet. Long-press is a power-user shortcut to the same sheet.
- Switching the day chip reloads sections 3–5 for that day.
- Today is editable; any earlier day is read-only.

## Tone
Minimal, calm, lots of breathing room, soft hairline separations rather than heavy dividers, one teal accent used sparingly for the selected day, positive numbers, and primary actions. It should feel like a quiet journal, not a dashboard.

## Realistic sample content
- Selected day: Monday, Oct 28 — 7 / 15 cigarettes, ₪4.50 spent.
- Cigarettes: "#7 · 02:15 PM · After lunch" (has diary), "#6 · 11:30 AM · Work stress", "#5 · 08:45 AM · Morning coffee".
- Purchases: "1 Pack · 10:05 AM · ₪15.00".
