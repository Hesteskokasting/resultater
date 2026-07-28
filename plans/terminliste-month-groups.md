# Plan: Terminliste — group by month, upcoming-first

Replace the flat sorted list in `src/pages/terminliste.ts` with two sections —
**Kommande** (upcoming) and **Ferdige** (past) — each grouped by month. Same
grouping/bucketing logic drives both the mobile card list and the desktop table;
only row rendering differs.

## Decisions locked in

- **Sort scope (user-confirmed):** keep the existing single shared `sort` state
  (default `{ column: 'dato', direction: 'asc' }`). It's applied uniformly to the
  rows *within every month group, in both sections*. We drop the literal spec
  nuance of "Ferdige rows default to descending" — before any header click,
  Ferdige's rows within a month are ascending too, same as Kommande. Only the
  **month order** is fixed regardless of the column sort: Kommande months
  ascending, Ferdige months descending. This trades a small literal-spec deviation
  for avoiding a second sort state / "has the user touched sort yet" flag.
- **"Started" for the today-edge case:** a stevne dated today is Kommande unless
  `stevne_fase` is anything other than `null`/`'ikke_startet'` (i.e. it's live or
  already finished) — mirrors the existing `notStarted` check in `cardNode`.
  Bucketing predicate: `dato >= todayIso && notStarted(row)` → Kommande, else
  Ferdige. `todayIso` computed the same way `stevneService.ts` already does
  (`new Date().toISOString().slice(0, 10)`), for consistency with the rest of
  the codebase rather than introducing a new local-date helper.
- **`dato` is non-nullable** on `ScheduleTournamentRow` (DB column is `string`,
  not `string | null`) — the grouping function takes plain `string` dates, no
  null-handling needed.
- **One continuous table/list, not two.** Column headers (desktop) render once,
  at the top, as today. Section headers, month headers, and the Ferdige toggle
  are extra rows/elements interspersed in the same table/list — not separate
  tables per section.
- **Ferdige starts collapsed**, showing only a toggle button with a count
  (`Ferdige (30)`). Expanding re-renders the month-grouped rows in place.
  Expand state persists across search/filter changes (module-level state, like
  `sort`), but resets to collapsed when the year changes (fresh data load).
- **Empty section = hidden entirely**, header included — checked after grouping,
  which itself happens after search/filters.

## Step-by-step checklist (one step per commit, checking in after each)

1. **Pure grouping logic + tests.** New `src/utils/terminlisteLogikk.ts`:
   move the existing `sortValue`/`sortData`/`ScheduleSort` type out of
   `terminliste.ts` (pure already, just relocating for testability + to shrink
   the page file), and add `groupSchedule<T>(rows: T[], todayIso: string)`
   constrained to `{ dato: string; stevne_fase: string | null }`, returning
   `{ upcoming: MonthGroup<T>[]; past: MonthGroup<T>[] }` where `MonthGroup<T> =
   { key: string; label: string; rows: T[] }` (key `'YYYY-MM'`, label e.g.
   `'JULI 2026'` via `Intl.DateTimeFormat('nb-NO', { month: 'long', year:
   'numeric' })`, upper-cased). Add `tests/terminlisteLogikk.test.ts`: bucketing
   (future date, past date, today-not-started → Kommande, today-live/today-done
   → Ferdige), month ordering (Kommande asc, Ferdige desc), multiple rows per
   month, empty input → empty arrays.
2. **Desktop table render.** Rewrite `tableHtml`: single `thead` (existing
   columns + one trailing header cell), `tbody` built from `groupSchedule`
   output — section header row (`Kommande N` / collapsed `Ferdige N` toggle
   button), month header rows (`colspan` across all columns), and data rows via
   `tableRowHtml` (existing) extended with a trailing cell (Meld på slot /
   chevron, same predicate `cardNode` already uses). Sort applied via
   `sortData(group.rows, sort)` per month group before rendering. Hide a
   section (header included) when its row count is 0.
3. **Mobile card list.** Rewrite `buildList` to interleave section-header and
   month-header elements with `cardNode()` output, same grouping/hide rules.
   `createStevneCard` markup itself is unchanged.
4. **Wire into `render`/`updateList`.** Compute `todayIso` once per render pass,
   call `groupSchedule(filterData(allData), todayIso)`, pass groups to
   `tableHtml`/`buildList`. Add `ferdigeExpanded` boolean next to `sort` at
   module level; reset it in `reloadYear`. Delegate the toggle button's click
   through the existing `.tl-list-container` listener (alongside the
   `[data-column]` handler) so it survives re-renders.
5. **CSS.** Add rules for `.tl-section-header`, `.tl-ferdige-toggle` (+
   expand/collapse chevron), `.tl-month-header` (table `colspan` row + mobile
   block variant), new trailing table column. Verify no horizontal scroll at
   390px/1040px with the extra column.
6. **Verify.** `npm run typecheck && npm run typecheck:test && npm run
   test:run`, then `npm run build`. Manual pass through the acceptance list
   (top-of-Kommande landing, month order both directions, today-dated edge
   case, search/filter/expand survive each other, registration still works
   in place, no h-scroll).
