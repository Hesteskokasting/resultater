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
  - Bug: When confirming a match (kamp) the score is set to 0 - 0
  - Bug: Cannot confirm Walkover kamp
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

### D2. `createExpandableRow` (or similar — name it for what it does)
- [ ] Inventory:
  - `src/pages/norgesranking.ts:308-315` (`.nc-poeng-celle`)
  - `src/pages/rekorder.ts:177-179` (`.rek-poeng-celle`)
  - `src/pages/norgescupen.ts` (similar pattern — check)
- [ ] Build with: `tabindex="0"`, `keydown` handler (Enter/Space), `aria-expanded`
- [ ] Replace, test, commit

### D3. `createNcTabell` (limited scope)
> Don't build a generic `createTable`. Build only the one that's used in 9 places.

- [ ] Inventory the 9 `<table class="nc-tabell">` usages
- [ ] If they're really 9 instances of the same shape → build it
- [ ] If they're 9 surface-similar but structurally different → skip and document why
- [ ] Apply ARIA properly (`role="table"` only if needed, otherwise lean on semantic `<table>`)

### D4. What NOT to build
- ❌ `createTable` (generic) — too many variants
- ❌ `createKortKort` / `createKasterKort` — no clear pattern emerged
- ❌ Anything you haven't seen yourself need

---

## Phase E: Fix remaining `as unknown as` casts

> 5 occurrences. Each needs individual judgment — some may be legitimate.

- [ ] `src/services/stevneService.ts:287` — `format as unknown as Json`
  - **Likely legitimate** (Supabase's Json type is broad). Add a comment explaining why, or use a type guard.
- [ ] `src/pages/stevne/stevne-avsluttende.ts:23` — `data.avsluttendemetode as unknown as { navn: string } | null`
  - **Should be fixed.** Use proper Supabase relation typing or a type guard.
- [ ] `src/pages/stevne/stevne-innledende.ts:23` — same pattern as above
  - **Should be fixed.** Same approach.
- [ ] `src/pages/stevne/avsluttende/cup.ts:73` — `json as unknown as Runde1FormatTyped`
  - **Should be fixed** with a runtime validator (it's parsing JSON — validate the shape).
- [ ] `src/pages/stevne/avsluttende/cup.ts:251` — `avslKampar as unknown as Parameters<typeof ...>[1]`
  - **Investigate.** This pattern suggests two types that should actually be one. Look for the real type mismatch.

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

- [ ] `src/pages/stevne/avsluttende/cup.ts` (814 lines)
- [ ] `src/pages/kastere.ts` (652 lines)
- [ ] `src/services/kampGenereringService.ts` (631 lines)
- [ ] `src/services/kampService.ts` (621 lines)
- [ ] `src/components/Scoreboard.ts` (504 lines)

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

> Resterende delar av gamle Phase 3.

- [ ] `src/styles.css` — find the 3 remaining hardcoded hex colors and replace with variables
- [ ] Audit unused CSS rules (use coverage tool in Chrome devtools, or `npx purgecss`)
- [ ] Identify duplicated patterns across `terminliste`, `norgesranking`, `norgescupen` (per old checklist note) — extract to shared classes
- [ ] Verify `startcard.css` styles are scoped — not leaking into the app
- [ ] Commit: `"CSS cleanup — variables, unused rules, shared patterns"`

---

## Phase I: Final Verification & Merge

- [ ] Full manual walkthrough — every page, every flow, both themes
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
- _Note 1: Share table in innledende and avsluttende
- _Note 1: Bug: On stevnestart, klubb for player is not added to table resultat (klubbid)
- _Note 1: Hide / disable "avsluttende" tab in stevne if avsluttendekastemetodeid is not set
- _Note 1: Bug: Using the back button in scoreboard is not functioning properly. Consider opening the scoreboard in a new tab and remove the back button
