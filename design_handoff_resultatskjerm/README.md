# Handoff: Resultatskjerm — Hestesko-poengtavle (View Mode)

## Overview
A view-only scoreboard for horseshoe pitching matches between two players. Two layouts are provided:
- **Portrait** — for tablets held upright (drawn at 480 × 760)
- **Wide / landscape** — for tablets held sideways or larger displays (drawn at 1120 × 630)

Both layouts share the same visual language ("Split blocks"): each player occupies half the screen, the current leader's half is inverted (light bg → dark, dark bg → light), and the entire surface is optimized for outdoor (bright sunlight) readability.

Two match states are supported:
- **In-progress** — shows current round number ("OMGANG 5"), a turn-indicator arrow pointing at the next player, and a "+N" annotation next to the score of any player who scored in the most recent round.
- **Completed** — shows a green "FULLFØRT" badge; no arrow, no per-round annotation.

A dark mode variant exists in the prototype but is **out of scope** for this handoff. Ship the light version only.

## About the Design Files
The files in `prototype/` are **design references** built in HTML/JSX, not production code. They show the intended look and behavior. Recreate these designs in the target app's existing environment (React Native, SwiftUI, Kotlin, web, whatever the codebase uses) using its established patterns, component primitives, and theming layer. If there is no existing environment, pick the framework appropriate for the rest of the product and implement it there.

Do not copy the JSX wholesale — it is illustrative, uses inline styles for canvas presentation, and skips production concerns (i18n, accessibility, error states, data fetching).

## Fidelity
**High-fidelity.** All measurements, colors, and typography below are intentional and should be matched. Spacing in particular has been tuned for legibility from a distance in sunlight; don't reduce font sizes or padding without testing in target conditions.

---

## Design Tokens

### Colors (light mode)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#f4f4f0` | Default surface (warm off-white, lower glare than pure #fff) |
| `fg` | `#0d0d0f` | Default text + the leader's card background (inverted) |
| `accent` | `#1a4d2e` | Dark forest green — used for: "+N" last-round annotation, "FULLFØRT" badge background, turn arrow fill |
| `accentFg` | `#f4f4f0` | Text/foreground on top of `accent` (matches `bg`) |
| Divider lines | `fg @ 12–28% alpha` | Hairline borders inside cards, header underline |

Notes:
- The leader's half-card uses `background: fg`, `color: bg` — i.e. it's a full inversion of the loser's half-card. Hierarchy comes from this inversion, not from a color label.
- `accent` is the only color used beyond black/white. Reserve it strictly for the three jobs above; do not use it for decoration, links, etc.
- Avoid drop shadows. The split-block design relies on hard edges + inversion for hierarchy.

### Typography
Single family: **Inter** (weights 400, 700, 800, 900). All numeric displays use `font-variant-numeric: tabular-nums`.

| Role | Size (portrait) | Size (wide) | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Player name | 36px | 56px | 900 | -0.02em / -0.025em | 1.0 |
| Score (the big number) | 196px | 320px | 900 | -0.08em | 0.85 |
| Last-round "+N" annotation | 60px | 96px | 900 | -0.05em | 0.85 |
| "OMGANG" label | 11px | 13px | 900 | 0.24em / 0.26em | 1.0 |
| Round number ("5") | 24px | 32px | 900 | -0.03em | 1.0 |
| "FULLFØRT" badge | 12px | 13px | 900 | 0.24em | — |
| Header title ("ØSTLANDSMESTERSKAP") | 11px | 13px | 800 | 0.14em | — |
| Stats label ("RING", "PROSENT") | 10px | 12px | 800 | 0.16em / 0.18em | — |
| Stats value ("7 / 16", "44%") | 18px | 28px | 900 | — | — |
| Round/Bane indicator ("R1 · B3") | 12px | 14px | 900 | — | — |

Tracking on small all-caps labels is critical for legibility at distance — do not reduce.

### Spacing & layout

- **Outer frame** has no border-radius, no inset margin. It's full-screen.
- **Top bar** padding: `12px 14px` (portrait) / `12px 20px` (wide). Underlined by `1px solid fg @ 20%`.
- **Round banner** padding: `10px 16px` (portrait) / `12px 20px` (wide). Underlined by `1px solid fg @ 15%`.
- **Player card** padding: `14px 24px 18px` (portrait) / `24px 40px 28px` (wide).
- **Stats row** sits at the bottom of each card, separated by `1px solid currentColor @ 16%` (encoded as `cardFg + '28'`) above with `10px` (portrait) / `14px` (wide) of padding-top.
- Internal stat columns are separated by the same hairline.

### The turn arrow

A solid filled triangle (SVG polygon) in `accent` color, stroked in `bg` color (5px) to give it a clean edge against either side of the split.

- **Portrait**: 76 × 76px, positioned `right: 24px` of the next player's card, near the divider line (16px from the inner edge). Points UP into the top card or DOWN into the bottom card.
- **Wide**: 110 × 110px, vertically centered inside the next player's card, hugging the inner edge (18px from the centerline divider). Points LEFT into the left card or RIGHT into the right card.
- Hidden entirely when `state === 'completed'`.

The arrow goes **inside** the next player's half — it should not straddle the divider line.

### The "+N" last-round annotation

- Rendered in `accent` color, baseline-aligned with the big score number, immediately to its right.
- Visible only when (a) match is in-progress AND (b) that player's `lastRound > 0`.
- The "+" prefix is part of the displayed text — always show it.

---

## Screens

### Top bar (shared between portrait + wide)

Left: back-button (square, 36/38px, 2px border, 10px radius, just "←").
Center: "ØSTLANDSMESTERSKAP" (tournament name, all-caps tracked label).
Right: "R1 · B3" (portrait) or "Runde 1 · Bane 3" (wide). `tabular-nums` so the digits stay aligned.

Below the top bar, a single full-width "round banner" row that contains either:
- **In-progress**: centered `OMGANG  5` (label + big tabular number, baseline-aligned)
- **Completed**: centered green `FULLFØRT` pill (`accent` background, `accentFg` text, 6px radius, padding `6px 14px` / `8px 18px`)

### Portrait layout (stacked)

```
┌──────────────────────────────┐
│  ←   ØSTLANDSMESTERSKAP   R1·B3 │  (top bar)
├──────────────────────────────┤
│         OMGANG  5            │  (round banner)
├──────────────────────────────┤
│ Petter Lyngroth              │  ◀── leader: inverted (dark bg, light fg)
│                              │
│                  23  +3      │  ◀── score + last-round (baseline aligned)
│   RING   │  PROSENT          │
│   7/16   │   44%             │
├──────────────────────────────┤
│ Sondre Torgersen        ▼    │  ◀── arrow (right side) if Sondre is next
│                              │
│                   12         │
│   RING   │  PROSENT          │
│   4/16   │   25%             │
└──────────────────────────────┘
```

The player with lowest startnumber is always shown in the top half. The two halves are equal `flex: 1`.

### Wide layout (side-by-side)

```
┌────────────────────────────────────────────────────────┐
│ ←  ØSTLANDSMESTERSKAP                    Runde 1 · Bane 3 │
├────────────────────────────────────────────────────────┤
│                    OMGANG  5                            │
├────────────────────────┬─────────────────────────────────┤
│ Sondre Torgersen       │ Petter Lyngroth                 │
│                        │                                 │
│              ◀         │                                 │
│      12                │      23  +3                     │
│ RING│PROSENT           │ RING│PROSENT                    │
│ 4/16│ 25%              │ 7/16│ 44%                       │
└────────────────────────┴─────────────────────────────────┘
```

Equal `flex: 1` halves.

---

## Component props / data model

A single component (parameterized by viewport) takes:

```ts
type State = 'in-progress' | 'completed';

type Player = {
  name: string;
  score: number;
  hits: number;            // ringers landed
  total: number;           // ringers attempted
  lastRound: number;       // points scored in the most-recent completed round; 0 if none
};

type ScoreboardProps = {
  state: State;
  round: number;           // current round when in-progress
  tournament: string;      // e.g. "Østlandsmesterskap"
  round_id: string;        // e.g. "Runde 1"
  lane_id: string;         // e.g. "Bane 3"
  players: [Player, Player];
  // Derived (not stored): which player has the higher score → leader;
  // which player throws next → arrow target.
  nextPlayerId: PlayerId;  // determines the turn-arrow position
};
```

In the portrait layout, the leader is rendered first (top); in the wide layout, the leader is rendered second (right). Sort accordingly when laying out.

`hits / total` is shown both as a ratio ("7 / 16") and as a percentage ("44%"). Round percentages to the nearest integer.

The "+N" annotation reads `+{player.lastRound}` and is rendered only when `state === 'in-progress' && player.lastRound > 0`.

The turn-arrow renders only when `state === 'in-progress'` and points at `nextPlayerId`.

---

## Interactions & behavior

This is a **view-mode** screen — there is no scoring input here. Tap targets present:

- **Back button** (top-left) — navigate back to the match list / previous screen.
- The rest of the screen is non-interactive.

No animations are specified beyond what the framework provides for default state transitions. If you choose to animate:
- Arrow position change (when turn changes): 200–300ms ease-out.
- Score change: avoid number-tween animations — they hurt at-a-glance reading.
- Mode swap (in-progress → completed): cross-fade the round banner 200ms.

---

## Accessibility / localization

- All copy in this design is **Norwegian**. Keep strings in your i18n layer; do not hard-code.
- Tournament names, player names, round/bane labels are server-supplied.
- All numeric values must use `tabular-nums`.
- Color contrast: black on `#f4f4f0` and `#f4f4f0` on `#0d0d0f` both clear AAA. The `accent` green (`#1a4d2e`) on `#f4f4f0` clears AAA for large text. Don't use it for small body text.
- Screen-reader labels: announce leader/trailing status verbally even though the visual hierarchy is color-only. Example label: "Petter Lyngroth, leading, 23 points, 7 of 16 ringers, 44 percent, scored 3 last round."

---

## Files in this handoff

- `prototype/Resultatskjerm.html` — the design-canvas page that hosts both layouts
- `prototype/design-canvas.jsx` — canvas runtime (not part of the design)
- `prototype/screens/Variant2.jsx` — portrait component
- `prototype/screens/Variant2Wide.jsx` — wide component

Open `Resultatskjerm.html` in a browser and scroll to the **"02 Split blocks — Portrait / tablet stående"** and **"02 Split blocks — Wide / landscape"** sections. Other variants on the canvas (01, 03, 04, 05) are alternative explorations that were not selected — ignore them.
