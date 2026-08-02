# Plan: Kaster profile — Resultat tab as sortable rows

Convert the Resultat tab from a horizontal-scroll `<table>` to a responsive bordered-row
layout with client-side sorting, chips, and a sort header. Target file:
`src/pages/_kastereDetalj.ts` (`resultsTableHtml` → `resultsListHtml`).

## Decisions locked in

- **Responsive layout:** columnar one-line rows on desktop (with a column-label header),
  collapsing to the stacked 3-line row on mobile. One markup, CSS-grid re-template at a
  ~700px breakpoint via `display: contents` on the meta group.
- **Sort icons:** Unicode `↕ ↑ ↓` (the existing terminliste convention), NOT `bi-arrow-*` —
  Bootstrap Icons is not loaded and won't be added for two glyphs.
- **This includes the table→rows conversion** (the "previous row spec" was never
  implemented in this repo).

## Deviations / interpretations to note

- **Stevne name is `var(--tekst)` weight 500, not link-blue** (`--lenke`), per the spec's
  "text-primary" — even though it remains an `<a>` to the stevne. Same philosophy as the new
  cards. (Current code uses the blue `.tl-link`.)
- Spec CSS token `--text-muted` doesn't exist → missing placement "–" uses `var(--tekst-3)`.
- Only the **stevne name** is the link (matches current behavior); the row is not a
  whole-row tap target. Flag if you'd prefer whole-row navigation.

## Sort semantics

- State: `resultSort: { column: 'dato' | 'plassering'; direction: 'asc' | 'desc' }`,
  default `{ 'dato', 'desc' }` (newest first). Lives on the module `filterDetail` object so
  it persists across filter changes; reset on `renderDetail` entry.
- Click a toggle → sort by that field; click again → flip direction. Switching to a new
  field picks a sensible default direction (dato→desc, plassering→asc), then flips on repeat.
- Arrow (`↑`/`↓`) shows only on the ACTIVE field; the inactive field shows neutral `↕`.
- `plassering`: numeric, ascending = best (1 first). **Missing placement always sorts to the
  bottom**, regardless of direction. `dato`: ISO-string compare.
- Sorting is client-side over the already-filtered set, and persists across year/type
  changes (and filters persist across sort changes — the existing architecture only
  re-renders `#kd-result-table`, never the filter selects).

## Row layout

```
Line 1: Stevne name (--tekst, 500, 15px)        placement (right, 17px, 500; "–" muted)
Line 2: {date} · {type}[ · {klubb}]             (--tekst-2, 12px)
Line 3 (conditional): [X-kast chip] [Kongelag chip]   — omitted if neither value exists
```

Desktop reflows these into aligned columns: `date · name · type · klubb · rundar(chips) · Pl`.
Chip order: **X-kast first, then Kongelag** (X-kast = innledande, Kongelag = avsluttande).
Chip text unchanged: `X-kast {poeng} ({ringar})`, `Kongelag {poeng} ({ringar})`; parens only
when the ring count exists; a chip renders only when its poeng value exists.

## Step-by-step checklist (one commit per step)

1. **Pure sort logic + tests.** Add to `src/utils/kasterDetaljLogikk.ts`: `ResultSort` type
   and a generic `sortResults(rows, sort)` constrained to the minimal shape
   `{ plassering: number | null; stevne: { dato: string | null } | null }` (so tests use
   plain literals — no `any`, no casts). Add `tests/kasterDetaljLogikk.sort.test.ts` covering
   dato asc/desc, plassering asc/desc with nulls-last, realistic values.
2. **Render function.** Rewrite `resultsTableHtml` → `resultsListHtml(results, year, type,
sort)`: keep the info bar; add the sort header (`Sortér:` + Dato button, STEVNE/TYPE/
   KLUBB/RUNDAR labels, Pl. button, aria-pressed/aria-sort); render `.kd-res-row`s with name
   link, meta, chips (X-kast→Kongelag), placement. Apply filters then `sortResults`.
3. **Wire `renderDetail`.** Add `resultSort` to `filterDetail` + reset on entry; pass it to
   `updateResults()`; bind ONE delegated `[data-sort]` click handler on the stable
   `#kd-result-table` container (survives innerHTML re-renders) that toggles/switches sort
   then calls `updateResults()`.
4. **CSS.** Add `.kd-res-*` rules to `styles.css`: shared grid-template (via a CSS var so the
   header and rows align), `display:contents` meta on desktop / flex-with-middots on mobile,
   hairline row borders, `.kd-round-chip`, placement, `.kd-sort-btn` + `.kd-sort-icon`,
   `@media (max-width: 699px)` re-template + hide the middle header labels. Drop the
   `.table-responsive` wrapper for this tab (`.app-table` stays — shared elsewhere).
5. **Verify.** `npm run typecheck && npm run typecheck:test && npm run test:run` + `npm run
build`. Manual: no h-scroll at 390px/1040px, sort toggles flip and show the arrow only on
   the active field, filters+sort persist across each other, chips X-kast before Kongelag,
   missing placements sink to the bottom.

```

```
