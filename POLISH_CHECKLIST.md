# Polish Checklist

Final cleanup pass based on detailed codebase analysis. The vertical migration is done — this is about getting from "works" to "polished".

**Mode:** Polishing all of it. Take time. Do it properly.

**Rules:**
- Phases are ordered by **dependency and risk**, not difficulty.
- Phase A first — it cleans up before any new work goes on top.
- One commit per logical unit. Always test in browser after.
- Ask Claude Code for **plan first, code second** on anything touching multiple files.

---

## Phase A: Quick wins & cleanup (do FIRST — should take ~1 session)

These are small, isolated fixes that should happen before any larger work. They remove noise and prevent confusion later.

### A1. Delete zombie `.d.ts` files
- [ x] Delete `src/organizer/stevne-avsluttende.d.ts` (no imports)
- [ x] Delete `src/utils/organizer-test-utils.d.ts` (no imports)
- [ x] Run `npm run typecheck` — should still pass
- [ x] Commit: `"Remove zombie .d.ts files left over from JS migration"`

### A2. Fix `.js` import extensions
- [ x] Fix `src/pages/stevne/stevne-innstillinger.ts:11` — change `'../../organizer/organizerTestUtils.js'` → `'../../organizer/organizerTestUtils'`
- [ x] Fix `src/organizer/organizerTestUtils.ts:1` — change `'../supabase.js'` → `'../supabase'`
- [ x] Fix `src/organizer/organizerTestUtils.ts:2` — change `'../utils/kamp.js'` → `'../utils/kamp'`
- [ x] Commit: `"Remove .js extensions from TypeScript imports"`

### A3. Use `createLoadingState` where it should be used
> You built the component but 4 places still use the raw HTML. Fix them.

- [ x] `src/admin/admin.ts:45` — replace `innhald.innerHTML = '<p class="laster">Laster…</p>'`
- [ x] `src/pages/terminliste.ts:339` — replace
- [ x] `src/pages/terminliste.ts:403` — replace
- [ x] `src/pages/norgesranking.ts:331` — replace
- [ x] Run app, verify the loading state still looks identical
- [ x] Commit: `"Use createLoadingState everywhere (no more raw HTML)"`

### A4. Fix inline styles in `kamp.ts`
- [x] `src/pages/kamp.ts:47` and `:51` — `hovudHeader.style.display = 'none'/''`
- [x] Either: add a CSS class `.skjul-header` and toggle it, OR move to data attribute + CSS
- [x] Commit: `"Move kamp.ts inline styles to CSS class"`

### A5. Move `organizerTestUtils.ts` Supabase code to a service
> 9 direct `supabase.from()` calls in a non-service file. Architectural violation that survived Phase 6.

- [x] Decide: does this belong in `adminService.ts`, or its own `testDataService.ts`? (My vote: own file — it's clearly admin-test-only, not regular admin)
- [x] Move all 9 Supabase calls to the chosen service
- [x] Update the 3 import sites:
  - `src/pages/stevne/innledende/gloppen.ts`
  - `src/pages/stevne/innledende/nordhordland.ts`
  - `src/pages/stevne/stevne-innstillinger.ts`
- [x] If `organizerTestUtils.ts` is left empty after the move, delete it
- [x] Commit: `"Move organizer test-data Supabase calls to service layer"`

> **Verify after Phase A:**
> - [x] `grep -r "from '.*\\.js'" src/ --include="*.ts"` → empty (or only `chart.js`/external)
> - [x] `grep -rn "supabase\\.\\(from\\|rpc\\)" src/ --exclude-dir=services --exclude=supabase.ts` → empty
> - [x] `grep -rn '<p class="laster">' src/` → empty (only `createLoadingState`)
> - [x] `npm run typecheck` passes, app works.
>
> **Note (Phase A bonus):** Added `createEmptyState` component (`src/components/EmptyState.ts`). Replaced `.nc-ingen`, `.laster`, and `.text-muted` empty-state misuses across 12 files. 7 DOM-context cases use `replaceChildren(createEmptyState(...))` properly; 13 string-building functions use `<p class="empty-state">` inline and are candidates for full component migration in Phase D.

---

## Phase B: Deduplicate `gloppen.ts` ↔ `nordhordland.ts`

> 710 lines total, ~91% identical. This is the biggest single quality issue left.

### Step 1: Plan before coding
- [x] Ask Claude Code — compared line by line, identified 9 differences across 5 concerns

### Step 2: Verify the proposal handles edge cases
- [x] Cleanly handles `genererNesteSwissRunde` (nordhordland only) — in `bindBannerExtra`, no conditional in base
- [x] Cleanly handles `printStartkort` (gloppen only) — in `bindBannerExtra`, no conditional in base
- [x] Cleanly handles the `visAlleRundar` toggle (nordhordland only) — module-level `let` in variant + `filterRundar` + `onReset`
- [x] Cleanly handles the `logError(...)` context strings — `variant.logPrefix` string, one usage in base
- [x] No ugly conditionals in the shared module

### Step 3: Build the shared module
- [x] Create `src/pages/stevne/innledende/_innledendeBase.ts` (named for all innledende, not just Swiss)
- [x] Both `gloppen.ts` and `nordhordland.ts` import + configure it
- [x] Each file is ~30-50 lines (gloppen: 17 lines, nordhordland: 44 lines)
- [ ] Test BOTH stevner thoroughly in browser
  - [x] Bug fixed: Cannot confirm Walkover kamp — `Scoreboard.ts` now treats `er_walkover` as `kampFerdig`; `kamp.ts` passes `erWalkover: kamp.er_walkover`
  - [x] Bug fixed: Score set to 0-0 on confirm — `bekreftInnledendeKamp` now re-fetches `kamp_spelar.score_poeng` fresh from DB when no `kamp_omgang` rows exist (instead of trusting stale caller value)
- [x] Commit: `"Deduplicate innledende implementations into shared base (_innledendeBase.ts)"`

### Step 4: Document the variant pattern
- [x] Add a comment header in `_innledendeBase.ts` explaining the config API
- [x] If `xkast.ts` (the placeholder) gets implemented later, it should also use this base (documented)
- [x] Created `DECISIONS.md` with why the split exists + future kastemetode pattern

---

## Phase C: Dialog components (replace native alert/confirm/prompt)

> 29 native calls across 10 files. Build the components, then replace.

### C1. Build `ConfirmDialog` component
- [x] Create `src/components/ConfirmDialog.ts`
- [x] API: `confirmDialog({ title, message, confirmText?, cancelText?, danger? }): Promise<boolean>`
- [x] Uses Bootstrap CSS classes (no Bootstrap JS import needed — no types shipped)
- [x] ESC cancels, confirm button auto-focused so Enter confirms naturally
- [x] Add ARIA: `role="alertdialog"`, `aria-labelledby`, `aria-describedby`
- [x] Commit: `"Add ConfirmDialog component"`

### C2. Build `PromptDialog` component
- [x] Create `src/components/PromptDialog.ts`
- [x] API: `promptDialog({ title, message, defaultValue?, inputType? }): Promise<string | null>`
- [x] ESC/cancel → null, Enter/OK → string value, input auto-focused
- [x] Commit: `"Add PromptDialog component"`

### C3. Replace all `alert()` calls with `showToast`
- [x] `src/pages/stevne/stevne-innstillinger.ts:92`
- [x] `src/pages/stevne/stevne-info.ts:44`
- [x] _(plus any others found via `grep -rn "\\balert(" src/ --include="*.ts"`)_
- [x] Commit: `"Replace native alert() with showToast"`

### C4. Replace all `confirm()` calls
- [x] `src/components/Scoreboard.ts` (2 instances)
- [x] `src/admin/stevneadmin.ts`
- [x] `src/admin/kasteradmin.ts`
- [x] `src/pages/stevne/innledende/_innledendeBase.ts` (4 instances — Phase B moved gloppen/nordhordland here)
- [x] `src/pages/stevne/avsluttende/cup.ts` (3 instances)
- [x] `src/pages/stevne/stevne-innstillinger.ts`
- [x] `src/pages/stevne/stevne-info.ts` (unlisted — found during grep)
- [x] `src/pages/pamelding.ts` (unlisted — 2 instances found during grep)
- [x] Commit as logical groups (e.g. one commit per file or per admin/stevne split)

### C5. Replace all `prompt()` calls
- [x] `src/pages/stevne/innledende/_innledendeBase.ts` — HCP edit (gloppen/nordhordland calls moved here by Phase B)
- [x] Commit: `"Replace native prompt() with PromptDialog"`

### C6. Verification
- [x] `grep -rn "\b(alert|confirm|prompt)(" src/ --include="*.ts" | grep -v "//"` → empty (excluding PromptDialog's own `confirm` function)
- [x] `npm run typecheck` passes
- [ ] Manual test: every dialog still works, ESC closes them, focus returns properly
  - ConfirmDialog — danger:
    - [ ] Admin → Kaster → Slett utøvar
    - [ ] Admin → Stevne → Slett stevne
    - [ ] Admin → Stevne → Innstillingar → Nullstill stevne
    - [ ] Stevne innledende (admin) → Fullfør turnering (setStevneErfullfort)
    - [ ] Stevne innledende (admin) → Start avsluttande fase → Fullfør turnering
    - [ ] Stevne avsluttende (admin) → Tilbakestill gruppeinndeling
    - [ ] Stevne avsluttende (admin) → Fullfør turnering
  - ConfirmDialog — normal:
    - [ ] Stevne → Info → Start stevne (with unconfirmed participants. Show the names of participants)
    - [ ] Stevne innledende (admin) → Autofullfør kampar
    - [ ] Stevne innledende (admin) → Edit match that already has omgang data (needs danger button)
    - [ ] Stevne avsluttende → Bekreft kamp with 0-0 score (should not be possible)
    - [ ] Scoreboard → Slett omgang
    - [ ] Påmelding → Avmeld (own registration)
    - [ ] Påmelding → Fjern påmelding (admin)
  - PromptDialog:
    - [ ] Stevne innledende standings (admin) → click HCP cell

---

## Phase D: Components for a11y wins (createTabs, createExpandableRow)

> These are the components from Phase 4 of the old checklist. They earn their place because they fix a11y issues automatically.

### D1. `createTabs` component
- [x] Inventory all manual tab implementations:
  - **Show/hide toggle (2 — target for `createTabs`):**
    - `src/pages/logginn.ts:18-76` — 2 static tabs (logginn/registrer), panels pre-rendered
    - `src/pages/minside.ts:149-178` — 2 dynamic-content tabs (kommande/ferdige)
  - **Async-load tabs (1 — leave as is):**
    - `src/admin/admin.ts:33-58` — 3 tabs, click fires async loader into single div; different pattern
  - **Route nav (1 — leave as is):**
    - `src/pages/stevne.ts:56-66` — `renderNav()` uses `<a href=...>` links; not a panel toggle
  - **False positives (no tabs):** `klubber.ts`, `kastere.ts`, `stevne-info.ts`, `org-shared.ts`
- [x] Build `createTabs` component (show/hide pattern only):
  - Props: `tabs: { id: string; label: string; panel: HTMLElement }[]`, `activeId?: string`
  - Returns `HTMLElement` wrapping nav + panels
  - ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`/`aria-labelledby`, `role="tabpanel"`
  - Arrow-key navigation (← →)
- [x] Replace `src/pages/logginn.ts` — test
- [x] Replace `src/pages/minside.ts` — test
- [x] Commit
- [x] Test manually

### D2. Expandable rows — inventory + stilling fixes
- [x] Inventory all expandable-row patterns:
  - **Stilling table** (`org-shared.ts:227`) — row-click toggle, used by innledende + avsluttende. Already shared.
  - **`.nc-poeng-celle`** — `norgesranking.ts:308`, `norgescupen.ts:265` (singel), `norgescupen.ts:239` (lag) — 3× identical 5-line delegation blocks
  - **`rekorder.ts:177`** — false positive, clicks navigate to stevne page (not expand/collapse)
- [x] Fix stilling table: remove accordion (each row now toggles independently)
- [x] Fix stilling table: expanded rows persist across realtime re-renders (Set passed to `bindStillingDetaljar`)
- [x] Extract `bindExpandableRows` utility (`src/utils/expandableRows.ts`):
  - `tabindex="0"` + `aria-expanded` set on all trigger cells at bind time
  - Enter/Space keyboard support
  - `lookupRoot` param for when detail rows live in a parent element
- [x] Replace all 3 call sites: `norgesranking.ts`, `norgescupen.ts` (lag + singel)
- [x] Add `aria-expanded` + keyboard support to `bindStillingDetaljar` (stilling table)
- [x] Test expandable rows in norgesranking and norgescupen, commit

### D3. `createTable` component + rename `nc-tabell`
> Renamed `nc-tabell` → `app-tabell`, `nc-thead` → `app-thead`, `nc-detalj-tabell` → `detalj-tabell`.
> Built `src/components/Table.ts` with `createTable(columns, rowsHtml): HTMLTableElement`.

- [x] Inventory the 9 `<table class="nc-tabell">` usages
- [x] Rename CSS classes: `nc-tabell` → `app-tabell`, `nc-thead` → `app-thead`, `nc-detalj-tabell` → `detalj-tabell`
- [x] Create `src/components/Table.ts`
- [x] Convert 7 table-building functions to DOM (`klubber`, `nmvinnere`, `rekorder`, `norgesranking`, `norgescupen` ×2) — callers use `replaceChildren`
- [x] 2 remaining (`home.ts` embedded mid-template, `kastere.ts` mixed content) — rename only

### D4. What NOT to build
- ❌ `createKortKort` / `createKasterKort` — no clear pattern emerged
- ❌ Anything you haven't seen yourself need

### D3b — createTable API upgrade + escHtml elimination

- [x] Rebuild `src/components/Table.ts` as `createTable<T>(TableOptions<T>)` — generic, typed columns, `render` returns `string | Node` (string → `textContent`, XSS-safe by default; Node → `appendChild`)
- [x] Add `detailRow?: (item, idx) => HTMLElement | null` to `TableOptions` — appends hidden `<tr>` below each row, inherits `rowAttrs` so `bindExpandableRows` `data-idx` matching keeps working
- [x] Add `showHeader?: boolean` (default `true`) — when `false`, skip thead entirely (used for lag detail table which has no header)
- [x] Migrate all 5 callers to new API: `nmvinnere.ts`, `rekorder.ts`, `norgesranking.ts`, `norgescupen.ts`, `klubber.ts`
- [x] Replace recursive detail table `innerHTML` + `escHtml` with `createTable` calls in `norgescupen.ts` and `norgesranking.ts` — `escHtml` import removed from both files
- [x] Extract `lagPoengCelleInnhald(poeng: number): DocumentFragment` helper in `norgescupen.ts` (chevron pattern used in both singel and lag tables)

---

## Phase E: Fix remaining `as unknown as` casts

> 5 occurrences. Each needs individual judgment — some may be legitimate.

- [x] `src/services/stevneService.ts:287` — `format as unknown as Json`
  - **Likely legitimate** (Supabase's Json type is broad). Add a comment explaining why, or use a type guard.
- [x] `src/pages/stevne/stevne-avsluttende.ts:23` — `data.avsluttendemetode as unknown as { navn: string } | null`
  - Fixed: moved query to `hentAvsluttendeMetodeNamn()` in stevneService; page now gets clean `string`. Supabase import removed from page.
- [x] `src/pages/stevne/stevne-innledende.ts:23` — same pattern as above
  - Fixed: moved query to `hentInnledendeMetodeNamn()` in stevneService; same approach.
- [x] `src/pages/stevne/avsluttende/cup.ts:73` — `json as unknown as Runde1FormatTyped`
  - Kept: null + non-object + array check at line 72 IS the runtime validator. Remaining cast is a TS limitation narrowing `{ [key: string]: Json }` → named interface — unavoidable without adding `extends Record<...>` to the type defs. Comment explains it.
- [x] `src/pages/stevne/avsluttende/cup.ts:251` — `avslKampar as unknown as Parameters<typeof ...>[1]`
  - Fixed: `innlKamparFraStilling` now maps through `toOrgSp` per kamp — no cast needed. `OrgKamp` added to import.

> For each: ask Claude Code to propose a fix, review, decide. Some will be cleaner with a type guard, others by fixing types upstream.

---

## Phase F: Accessibility pass (after D)

- [ ] All `addEventListener('click', ...)` on non-button elements — verify they're either replaced by components (D2) or have `tabindex` + keydown handler
- [ ] Run a screen reader through the most-used pages (terminliste, stevne, minside)
- [ ] Verify Tab order makes sense on every page
- [ ] Verify all `<input>` have `<label>` (audit `grep -rn "<input" src/ --include="*.ts"`)
- [ ] Verify focus is restored properly after modals close
- [ ] Color contrast audit (use browser devtools) — both dark and light mode

---

## Phase G: Review of large files

> Don't refactor blindly. Ask first whether the size is justified.

For each, get an honest assessment from Claude Code:

- [x] `src/pages/stevne/avsluttende/cup.ts` (817 → ~640 lines after split)
  - Extracted two self-contained dialogs: `_avslCupGenererRundeDialog.ts` (~90 lines) and `_avslCupTreSpelarDialog.ts` (~75 lines). Each takes a `reload` callback; no module state shared. Remaining file is one cohesive fetch→render→bind-events flow.
- [x] `src/pages/kastere.ts` (658 lines)
  - Split into `_kastereListe.ts` (~130 lines) and `_kastereDetalj.ts` (~310 lines). `kastere.ts` is now an 11-line dispatcher. Slug routing unchanged — router already strips the name suffix and passes the numeric ID. `ødeleggChart` exported from detail module and called by dispatcher on every navigation to prevent Chart.js memory leaks.
- [x] `src/services/kampGenereringService.ts` (631 lines)
  - Split at the existing `// ── Cup avsluttende ──` seam into `kampGenereringInnledendeService.ts` (~240 lines) and `kampGenereringCupService.ts` (~220 lines). Old file deleted. 4 import sites updated.
  - Deduplication fix: `genererNesteCupRunde` (all-groups) now delegates to `genererNesteCupRundeForGruppe` per group — ~120 lines of parallel insert logic removed. Bane numbering for walkovers corrected as a side effect (now null, consistent with the per-group function).
- [x] `src/services/kampService.ts` (627 lines)
  - Size justified — coherent domain, already has section comments. No split.
  - Fixed 3 bugs while here: walkover confirm (Scoreboard.ts + kamp.ts) + stale-score fallback in service.
- [x] `src/components/Scoreboard.ts` (504 lines)
  - Size justified — 2-player and 3-player variants share a single entry point; no split.
  - Extracted 3 module-level helpers eliminating duplication: `spelarNamn`, `lagOmgangSlettKnappar`, `lagBekreftKnapp`.

**Prompt for each file:**
> "Read `<path>`. It is N lines long. Honest assessment:
> 1. Is this size justified by genuine complexity, or is it doing too many things?
> 2. If too many things — what natural split-points exist?
> 3. If justified — what would a reader benefit from to navigate it (section comments, table of contents)?
>
> Don't propose changes I haven't asked for. Just the assessment."

Then decide per-file whether to split, document, or leave alone. **A 600-line file with one clear purpose is fine. A 300-line file doing four unrelated things is not.**

---

## Phase H: CSS Cleanup

> Do each step separately. Update checklist and write a short committext for each step

- [x] `src/styles.css` — find the 3 remaining hardcoded hex colors and replace with variables
- [~] Audit unused CSS rules (use coverage tool in Chrome devtools, or `npx purgecss`)
  - Do manually later
- [x] Identify duplicated patterns across files, e.g. `terminliste`, `norgesranking`, `norgescupen`  — extract to shared classes
- [x] Verify `startcard.css` styles are scoped — not leaking into the app
- [x] Commit: `"CSS cleanup — variables, unused rules, shared patterns"`

---

## Phase I: Final Verification & Merge

- [ ] Full manual walkthrough — every page, every flow, both themes
  - home.ts -> 
    - list of siste resultat shows even if "stevne.erfullfort" is false
    - the space between stevne.navn and "Vis resultat" is too big. The cards needs to be aligned with Kommende konkurranser
  - stevne-innledende.ts -> 
    - headers for matches and resultlist are black with white text. They need to be white background and black text.
    - results for walkover matches can be changed after confirm. This should not be possible for walkover matches since they are always 21 - 0
    - results matches that have been completed with scorebaord can also be changed by clicking on the result. this should not be possible either
    - Start avsluttende fase button can be removed from innledende. The user can click on avsluttende tab and start it from there
    - Fullfør turnering button is disabled, even when all matches are complete. Instead enable the button at all times, but give a warning if the user click the button when there are still matches incomplete.
    - 
  - kamp.ts / scoreboard.ts -> bug when using the back button: [stevne.render] Error: cannot add `postgres_changes` callbacks for realtime:stevne-fase-2265 after `subscribe()`.
    at RealtimeChannel.on (@supabase_supabase-js.js?v=5fe89f4b:8089:10)
    at subscribeToStevneFase (stevneService.ts:258:6)
    at Object.render [as side] (stevne.ts:107:13)
  - the back button does not go back to correct routing. testet while in stevne/id/innledende, but the button went back to stevne/id/info, and gave error.
    - consider opening the scorebard in a new tab and remove the back button?
- [ ] `npm run typecheck` returns 0 errors
- [ ] `npm run build` succeeds (and the output bundle isn't horribly large)
- [ ] All 3 critical flows from Phase 0 work
- [ ] Forbidden-pattern grep checks (final):
  - [ ] `grep -r "select('\\*')" src/` → empty
  - [ ] `grep -r ": any" src/ --include="*.ts"` → empty
  - [ ] `grep -r "as unknown as" src/ --include="*.ts"` → only the documented legitimate cases
  - [ ] `grep -rn 'style="' src/ --include="*.ts"` → empty
  - [ ] `grep -rn "\\.style\\." src/ --include="*.ts"` → empty (or documented)
  - [ ] `grep -rE "from\\(.*\\)\\.select" src/pages src/admin src/organizer` → empty
  - [ ] `grep -rn "supabase\\." src/utils/` → only `removeChannel`
  - [ ] `grep -rn "\\b(alert|confirm|prompt)(" src/ --include="*.ts" | grep -v "//"` → empty
  - [ ] `grep -rn '<p class="laster">' src/` → empty
  - [ ] `grep -rn "from '.*\\.js'" src/ --include="*.ts"` → empty (or only external)
- [ ] Merge `refactor/cleanup` into main

---

## After

- [ ] Update `CLAUDE.md` with any new conventions
- [ ] Write `README.md` documenting folder structure
- [ ] Move outstanding items from Decisions Log into separate issues/tasks (norsk→engelsk, UUID migration, etc.)
- [ ] Celebrate 🎉

---

## Decision Log (from previous work)

These are explicitly **NOT** part of this polish phase — separate initiatives:
- DB schema: audit nullable columns
- DB schema: unique constraints (kaster.fornavn + etternavn)
- DB schema: integer → UUID migration
- Code+DB: norwegian → english
- Refactor admin-pages

---

## Notes during polish

_Add notes as you discover things:_

- _Note 1: Bug: Gruppeinndeling avsluttende has wrong sorting
- _Note 2: ~~Share table in stevne innledende and avsluttende~~ — already shared via `renderStillingTabell` in `org-shared.ts`. Column config by kastemetode tracked in D2b.
### StillingTabell — kastemetode-driven column config (larger scope)
> `renderStillingTabell` and `bindStillingDetaljar` are already shared in `org-shared.ts`.
> Note 2 ("share table in innledende and avsluttende") is already resolved.
> What remains: which columns to show (`harHcp`, `harGrupper`, `harEliminasjon`, `harAntallKamper`)
> is hardcoded at the call site instead of derived from the kastemetode config.

- [ ] Define a `getStillingOpts(kastemetode: string, fase: 'innledende' | 'avsluttende'): StillingOpts` function
- [ ] Drive column visibility from kastemetode rather than hardcoded opts at the call site
- [ ] Consider whether the `as unknown as` cast in `cup.ts:252` (`innlKamparFraStilling`) can be removed at the same time
- _Note 1: Bug: On stevnestart, klubb for player is not added to table resultat (klubbid)
- _Note 2: Hide / disable "avsluttende" tab in stevne if avsluttendekastemetodeid is not set
- _Note 3: Bug: Using the back button in scoreboard is not functioning properly. Consider opening the scoreboard in a new tab and remove the back button
- _Note 4: make sure Scoreboard supports both dark/light mode.
- _Note 5: High contrast light mode for outdoor sun conditions:
- _Note 6: Konfigurer @/-aliasar i tsconfig og viteconfig
- _Note 7: Use Table component for kastere.ts (list and details)
- _Note 8: replace æ,ø,å from code
