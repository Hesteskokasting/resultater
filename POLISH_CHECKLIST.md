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
- [ ] Ask Claude Code:
  > "Compare `src/pages/stevne/innledende/gloppen.ts` and `src/pages/stevne/innledende/nordhordland.ts` line by line. List:
  > 1. Identical sections
  > 2. Sections that differ — and the meaningful pattern of difference (extra feature, naming, behavior)
  > 3. Sections that look 'almost identical but slightly different' (the dangerous kind)
  >
  > Propose an architecture: one shared base + minimal config per variant. Show me the proposed API before writing any code."

### Step 2: Verify the proposal handles edge cases
- [ ] Does it cleanly handle `genererNesteSwissRunde` (nordhordland only)?
- [ ] Does it cleanly handle `printStartkort` (gloppen only)?
- [ ] Does it cleanly handle the `visAlleRundar` toggle (nordhordland only)?
- [ ] Does it cleanly handle the `logError(...)` context strings (differ per file)?
- [ ] If any of these forces ugly conditionals in the shared module — push back.

### Step 3: Build the shared module
- [ ] Create `src/pages/stevne/innledende/_swissRundeBase.ts` (or similar)
- [ ] Both `gloppen.ts` and `nordhordland.ts` import + configure it
- [ ] Each file should be ~30-50 lines (config + variant-specific behavior)
- [ ] Test BOTH stevner thoroughly in browser
- [ ] Commit: `"Deduplicate Swiss-runde implementations into shared base"`

### Step 4: Document the variant pattern
- [ ] Add a comment header in `_swissRundeBase.ts` explaining the config API
- [ ] If `xkast.ts` (the placeholder) gets implemented later, it should also use this base
- [ ] Update `DECISIONS.md` with why the split exists

---

## Phase C: Dialog components (replace native alert/confirm/prompt)

> 29 native calls across 10 files. Build the components, then replace.

### C1. Build `ConfirmDialog` component
- [ ] Create `src/components/ConfirmDialog.ts`
- [ ] API: `confirmDialog({ title, message, confirmText?, cancelText?, danger? }): Promise<boolean>`
- [ ] Uses Bootstrap modal (already in project)
- [ ] Focus trap, ESC to cancel, Enter to confirm — proper a11y
- [ ] Add ARIA: `role="alertdialog"`, `aria-labelledby`, `aria-describedby`
- [ ] Commit: `"Add ConfirmDialog component"`

### C2. Build `PromptDialog` component
- [ ] Create `src/components/PromptDialog.ts`
- [ ] API: `promptDialog({ title, message, defaultValue?, inputType? }): Promise<string | null>`
- [ ] Same a11y standards as ConfirmDialog
- [ ] Commit: `"Add PromptDialog component"`

### C3. Replace all `alert()` calls with `showToast`
- [ ] `src/pages/stevne/stevne-innstillinger.ts:92`
- [ ] `src/pages/stevne/stevne-info.ts:44`
- [ ] _(plus any others found via `grep -rn "\\balert(" src/ --include="*.ts"`)_
- [ ] Commit: `"Replace native alert() with showToast"`

### C4. Replace all `confirm()` calls
- [ ] `src/components/Scoreboard.ts:267, :495` (2 instances)
- [ ] `src/admin/stevneadmin.ts:131`
- [ ] `src/admin/kasteradmin.ts:110`
- [ ] `src/pages/stevne/innledende/gloppen.ts:137, :144, :156, :341` _(handled if Phase B done first)_
- [ ] `src/pages/stevne/innledende/nordhordland.ts` _(same — handled if Phase B done first)_
- [ ] `src/pages/stevne/avsluttende/cup.ts:572, :592, :691`
- [ ] `src/pages/stevne/stevne-innstillinger.ts:102`
- [ ] Commit as logical groups (e.g. one commit per file or per admin/stevne split)

### C5. Replace all `prompt()` calls
- [ ] `src/pages/stevne/innledende/gloppen.ts:119` _(handled by Phase B)_
- [ ] `src/pages/stevne/innledende/nordhordland.ts:127` _(handled by Phase B)_
- [ ] Commit: `"Replace native prompt() with PromptDialog"`

### C6. Verification
- [ ] `grep -rn "\\b\\(alert\\|confirm\\|prompt\\)(" src/ --include="*.ts" | grep -v "//"` → empty
- [ ] Manual test: every dialog still works, ESC closes them, focus returns properly

---

## Phase D: Components for a11y wins (createTabs, createExpandableRow)

> These are the components from Phase 4 of the old checklist. They earn their place because they fix a11y issues automatically.

### D1. `createTabs` component
- [ ] Inventory all manual tab implementations first:
  - `src/admin/admin.ts:43`
  - `src/pages/logginn.ts:71`
  - `src/pages/minside.ts:172`
  - `src/pages/klubber.ts` (find exact location)
  - `src/pages/kastere.ts` (find exact location)
  - `src/pages/stevne.ts`
  - `src/pages/stevne/stevne-info.ts`
  - `src/organizer/org-shared.ts`
- [ ] Design the API:
  ```ts
  interface TabConfig {
    id: string;
    label: string;
    onActivate: () => void;
    visible?: boolean;
  }
  createTabs({ tabs, initialId, onTabChange? }): HTMLElement
  ```
- [ ] Implementation includes: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, arrow-key navigation
- [ ] Replace tab usages one file at a time, test after each
- [ ] Commit each replacement separately

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

- _Note 1: ..._
