# Refactor Checklist (Vertical Strategy)

A file-by-file plan for cleaning up the codebase. Based on the codebase analysis report.

**Core principle:** Work **vertically** (one file at a time, fix everything in it) rather than **horizontally** (one issue across all files). Each file is "done" when you close it — you don't open it again for follow-up cleanup.

**Reference file:** `src/pages/norgescupen.ts` is your template. It's the only properly-written TypeScript file in the codebase. Read it before each migration. Match its patterns.

**Rules:**
- One file = one commit (or a few small commits per file).
- Don't move to the next file until the current one passes the Definition of Done.
- Run the app and test after each file.
- Ask Claude Code for a **plan first**, code second.
- **Before creating any utility — check if it already exists.** `utils/kaster.ts` already has `formatKasterNavn()`. Don't duplicate.

---

## Phase 0: Safety Net

- [x] Create branch: `git checkout -b refactor/cleanup`
- [x] Snapshot commit: `git commit -am "Snapshot before refactor"`
- [x] Verify clean install works: `npm install && npm run dev`
- [x] Write down 3 critical flows to test after each file:
  - [ ] Flow 1: __________________________
  - [ ] Flow 2: __________________________
  - [ ] Flow 3: __________________________

---

## Phase 1: Build the Toolbox (do this FIRST, once)

These are shared utilities you'll use when migrating every file. Build them now so they exist when you need them.

### 1a. Error logging utility
- [x ] Create `src/utils/logError.ts`:
  ```ts
  export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);
  }
  ```
- [x ] Commit: `"Add logError utility"`

### 1b. HTML escape utility
- [x ] Create `src/utils/escHtml.ts` with proper escaping (`&`, `<`, `>`, `"`, `'`)
- [ x] **Delete** the existing `escAttr()` in `rekorder.js` (line ~29) and `_esc()` in `stevneadmin.js`
- [ x] Update those two files' imports to use the new utility
- [ x] Commit: `"Consolidate HTML escaping into escHtml utility"`

### 1c. Date parsing utility
- [x] Create `src/utils/parseLocalDate.ts` for the `+ 'T12:00:00'` pattern
- [ x] Commit: `"Add parseLocalDate utility"`

### 1d. Dropdown options utility
- [ x] Create `src/utils/buildDropdownOptions.ts` consolidating `_opt()` and `dropdownOptions()`
- [x ] Commit: `"Add buildDropdownOptions utility"`

### 1e. Type guards for auth (security-critical, do isolated)
- [x ] In `src/utils/auth.ts`, add `isProfil(obj): obj is Profil` and `isRolle(value): value is Rolle`
- [x ] Replace `as Profil` and `as Rolle` casts with validated narrowing
- [x ] Test login + admin access carefully
- [x ] Commit: `"Add runtime validation to auth type assertions"`

### 1f. Fix existing `.ts` files that are already broken
These are `.ts` already so they won't be touched by Phase 2 migration. Fix them here.

- [ x] **`src/utils/norgescup.ts`**: replace `select('*')` (line ~61) with explicit columns; add validation for the `as string[]` (line ~171) and `as number` (line ~142) casts
- [ x] **`src/utils/stevne.ts`**: wrap the `Promise.all()` at line ~27 in try/catch with `logError()`
- [ x] **`src/utils/kaster.ts`**: read it. Verify `formatKasterNavn()` (or equivalent) is exported. Note the function name for use during migration.
- [x ] Commit each as separate logical units

> **Stop and verify:** all utilities exist, app still runs, login still works, `npm run typecheck` passes.

---

## Phase 2: Per-File Migration

Work through these files in order. For **each** file, complete the full Definition of Done before moving on.

### Service architecture (read this before starting Phase 2)

Services live in `src/services/<feature>Service.ts`. They wrap all Supabase calls for a given table or domain.

**Pragmatic rule for this refactor:**
- **New Supabase calls** extracted from `.js` files during migration → go in `src/services/`.
- **Existing Supabase calls in `utils/norgescup.ts` and `utils/stevne.ts`** → leave alone for now. They work. They will be migrated to `services/` in Phase 8 at the very end.
- **`utils/kaster.ts`** is a pure utility (no Supabase calls) → stays in `utils/` forever.
- **`utils/auth.ts`** was fixed in Phase 1e. It can stay in `utils/` for now and be moved to `services/authService.ts` in Phase 8.

Why this split: keeps each file migration small. Don't retrofit working code during migration; clean it up at the end when patterns are clear.

**Pattern for new services:**
- First time you touch a table during migration → create the service file with the queries you need.
- Next file that touches the same table → add functions to the existing service file.
- Services use the generated Supabase types from `src/types/supabase.ts`.
- Services handle their own error logging via `logError()`.
- Services return typed data; never `any`.

**Example service skeleton:**
```ts
// src/services/klubbService.ts
import { supabase } from "@/supabaseClient";
import { logError } from "@/utils/logError";
import type { Database } from "@/types/supabase";

type Klubb = Database["public"]["Tables"]["klubb"]["Row"];

export async function getAllKlubber(): Promise<Klubb[]> {
  const { data, error } = await supabase
    .from("klubb")
    .select("id, namn, logo_url, krets");
  if (error) {
    logError("getAllKlubber", error);
    return [];
  }
  return data;
}
```

**Expected services to grow during migration:**
- [ ] `klubbService.ts`
- [ ] `kasterService.ts`
- [ ] `stevneService.ts`
- [ ] `rekorderService.ts`
- [ ] `resultatService.ts`
- [ ] `authService.ts` (may absorb parts of `utils/auth.ts`)
- [ ] _(others as discovered)_

### File order (easiest → hardest)

Start with smaller, more isolated files. Bigger pages last, when you've found your rhythm.

**Pages:**
- [x] `src/pages/home.js` → `.ts`
- [x] `src/pages/logginn.js` → `.ts`
- [x] `src/pages/klubber.js` → `.ts`
- [x] `src/pages/kastere.js` → `.ts`
- [x] `src/pages/minside.js` → `.ts`
- [x] `src/pages/terminliste.js` → `.ts`
- [x] `src/pages/norgesranking.js` → `.ts`
- [x] `src/pages/pamelding.js` → `.ts`
- [x] `src/pages/nmvinnere.js` → `.ts`
- [x] `src/pages/rekorder.js` → `.ts` _(known bug: `klubb_namn`/`klubb_navn` typo to fix. uses database view "kaster_rekorder")_


- [x] `src/pages/resultat.js` → deleted; content moved to `src/pages/stevne/stevne-resultat.ts` (tab in stevne view)
- [x] `src/pages/kamp-scoreboard.js` → `.ts` _(do alongside Phase 3 scoreboard CSS fix.)_

**Admin:** - 
- [ x] `src/admin/admin.js` → `.ts`
- [ x] `src/admin/stevneadmin.js` → `.ts`
- [ x] `src/admin/klubbadmin-side.js` → `.ts` _(klubbadmin.ts)_
- [ x] `src/admin/kasteradmin.js` → `.ts`

**Organizer:** _(stevne*.js already migrated)
- [x] `src/organizer/org-nav.js` → `.ts`
- [x] `src/organizer/org-shared.js` → `.ts`
- [x] `src/organizer/score-numberpad.js` → `src/components/ScoreNumberpad.ts`
- [x] `src/organizer/startkort-print.js` → `.ts`

**to be clarified** - needs refactoring
- [x ] `src/organizer/kampgenerering.js` → `.ts`
- [x ] `src/organizer/stevne-avsluttende.js` → `.ts` 
- [x ] `src/organizer/stevne-innledende.js` → `.ts`
- [x ] `src/utils/gruppefordeling-ui.js` → `.ts` _(move to /organizer)
- [x ] `src/utils/organizer-test-utils.js` → `.ts` -(move to organizer/utils)

**UTILS**
- [x ] `src/utils/adminforms.js` → `.ts` _(can this be deleted?)_


**Entry point (do last):**
- [x] `src/app.js` → `.ts`

> Adjust order as you learn. Promote dependencies of the file you're touching if needed.

---

### Definition of Done (per file)

For **every** file you migrate, all of these must be checked off:

```
□ Renamed .js → .ts
□ Zero TypeScript errors (npm run typecheck passes)
□ No `any` (explicit or implicit)
□ No `as unknown as ...` casts
□ All Supabase queries moved to src/services/<feature>Service.ts
□ The file imports from services/, NOT directly from supabaseClient
□ All Supabase queries use explicit column lists (no select("*"))
□ All Supabase errors go through logError() (in the service)
□ All Promise.all() calls wrapped in try/catch with logError()
□ All user-sourced strings interpolated into innerHTML use escHtml()
□ Existing utilities are reused (formatKasterNavn from utils/kaster.ts, etc.) — no re-implementation
□ No inline styles in the .ts file
□ All colors use CSS variables (var(--...))
□ Duplicated helpers removed → import from src/utils/
□ Manually tested in browser (both light and dark mode)
□ Tested all 3 critical flows from Phase 0
□ Committed as a logical unit
```

** Do Definition of done per file separately

**pages:**
- [x] `src/pages/home.ts`
- [x] `src/pages/kamp.ts`
- [x] `src/pages/kastere.ts`
- [x] `src/pages/klubber.ts`
- [x] `src/pages/logginn.ts`
- [x] `src/pages/minside.ts`
- [x] `src/pages/nmvinnere.ts`
- [x] `src/pages/norgescupen.ts`
- [x] `src/pages/norgesranking.ts`
- [x] `src/pages/pamelding.ts`
- [x] `src/pages/rekorder.ts`
- [x] `src/pages/terminliste.ts`

**Skip until refactor**
- [ ] `src/pages/stevne.ts`
- [x] `src/pages/stevne/stevne-avsluttende.ts` — refactored to thin router; logic extracted to `avsluttende/cup.ts` (+ kongelag/nordhordland stubs)
- [ ] `src/pages/stevne/stevne-deltakere.ts`
- [ ] `src/pages/stevne/stevne-info.ts`
- [x] `src/pages/stevne/stevne-innledende.ts` — refactored to thin router; logic extracted to `innledende/gloppen.ts` + `innledende/nordhordland.ts` (+ xkast stub)
- [ ] `src/pages/stevne/stevne-innstillinger.ts`
- [ ] `src/pages/stevne/stevne-resultat.ts`

**admin:**
- [x] `src/admin/admin.ts`
- [x] `src/admin/kasteradmin.ts`
- [x] `src/admin/klubbadmin.ts`
- [x] `src/admin/stevneadmin.ts`

**components: Deferred — tightly coupled to stevne pages, will change with kastemetode formats**
- [ ] `src/components/Scoreboard.ts`
- [ ] `src/components/ScoreNumberpad.ts`

**organizer:**
- [x] `src/organizer/gruppefordelingUi.ts`
- [ ] `src/organizer/kampgenereringDb.ts` — deferred (direct supabase, coupled to stevne pages)
- [ ] `src/organizer/organizerTestUtils.ts` — deferred (direct supabase, coupled to stevne pages)
- [x] `src/organizer/org-shared.ts`
- [x] `src/organizer/startkort-print.ts`

**services:**
- [x] `src/services/adminService.ts`
- [x] `src/services/authService.ts`
- [x] `src/services/brukerProfilService.ts`
- [x] `src/services/kampService.ts`
- [x] `src/services/kasterService.ts`
- [x] `src/services/klubbService.ts`
- [x] `src/services/nmvinnereService.ts`
- [x] `src/services/norgesrankingService.ts`
- [x] `src/services/pameldingService.ts`
- [x] `src/services/rekorderService.ts`
- [x] `src/services/resultatService.ts`
- [x] `src/services/stevneService.ts`

**utils:**
- [x] `src/utils/adminForms.ts`
- [x] `src/utils/auth.ts`
- [x] `src/utils/buildDropdownOptions.ts`
- [x] `src/utils/escHtml.ts`
- [x] `src/utils/formNum.ts`
- [x] `src/utils/kamp.ts` — rename to `kampBeregning.ts` when stevne pages are un-deferred (update imports in org-shared.ts, kampService.ts, Scoreboard.ts, stevne pages)
- [x] `src/utils/kastemetoder-logikk.ts`
- [x] `src/utils/kaster.ts`
- [x] `src/utils/logError.ts`
- [x] `src/utils/norgescup.ts`
- [x] `src/utils/pageStates.ts`
- [x] `src/utils/parseLocalDate.ts`
- [x] `src/utils/shared.ts`
- [x] `src/utils/stevne.ts` (deleted — migrated to stevneService.ts)
- [x] `src/utils/startcard/startcard-template.ts`

**other:**
- [x] `src/app.ts`
---

## Phase 3: CSS Cleanup (parallel track — do between files when you need a break)

These are CSS-only and self-contained. Good to interleave with the heavy migration work.

- [ x] **Scoreboard dark/light mode**: refactor `.sb-*` classes in `styles.css` (lines ~1140–1522)
  - [ x] Define scoreboard CSS variables in `global.css` for both themes
  - [ x] Replace all hardcoded hex values with `var(--...)`
  - [ x] Rename `.sb-rod` → `.sb-negativ`, `.sb-groen` → `.sb-positiv`
  - [ x] Test in both light and dark mode
- [ ] Audit `styles.css` for other hardcoded colors → replace with variables
- [ ] Consolidate the repeated `text-align:center;margin-top:40px;` pattern into a utility class (e.g., `.loading-state`)
- [ ] Remove unused css in global.css and styles.css
- [ ] Find specific styles that can be shared across files. e.g. terminliste, norgesranking, norgescupen.


---

## Phase 4: Extract Components (do LAST, after migration is done)

> Now that every file is `.ts` and patterns are clear, you can see which abstractions are worth building. Don't do this earlier — you'd be abstracting the wrong things.

Look for patterns that appeared repeatedly during migration:

- [x] `createErrorBanner({ message })` — replace the `<p class="feil">...</p>` pattern
- [x] `createLoadingState({ message })` — replace the centered "Lastar..." pattern
- [ ] `createKortKort()` / `createKasterKort()` — for repeated card layouts
- [ ] `createTable({ columns, rows })` — typed columns, generic rows
- [~] `createDropdown()` — skipped: callers use innerHTML templates; no value without refactoring forms to DOM APIs
- [ ] `createTabs({ tabs })` — with built-in ARIA support (tablist/tab/aria-selected)
- [ ] `createExpandableRow()` — with built-in keyboard support (Enter/Space/tabindex)
- [~] `createFilterableList()` — skipped: patterns too different across files (debounce, pagination, filter count); not a real abstraction

**Per-component process:**
1. List every place this pattern appears
2. Design the component API (`Props` interface)
3. Build the component in `src/components/`
4. Replace usages one file at a time
5. Test after each replacement
6. Commit

---

## Phase 5: Accessibility Pass

Best done **after** components exist, because then you fix ARIA in one place.

- [ ] Audit `.nc-poeng-celle`, `.rek-poeng-celle`, and similar — add `tabindex="0"` + keydown handler
  - [ ] If you built `createExpandableRow()`, this is automatic
- [ ] Audit tab implementations — use `role="tablist"`, `role="tab"`, `aria-selected`
  - [ ] If you built `createTabs()`, this is automatic
- [ ] Verify all form inputs have associated `<label>`
- [ ] Verify all interactive elements are reachable by Tab key

---

## Phase 6: Retrofit `utils/*` → `services/*`

> The Phase 1f and Phase 2 work intentionally left old `utils/*.ts` files alone. Now is when we clean them up.

This phase moves data-fetching files from `utils/` to `services/` so the architecture is consistent. Pure utility files (no Supabase calls) stay in `utils/`.

### 6a. Move `utils/norgescup.ts` → `services/norgescupService.ts`
- [x] Rename file
- [x] Update all imports (`grep -r "from.*utils/norgescup"` to find them)
- [x] Replace any remaining `select('*')` with explicit columns
- [x] Move pure helpers (non-Supabase functions) to a new `utils/norgescupHelpers.ts` if needed
- [x] Test all pages that use norgescup data
- [x] Commit: `"Move norgescup data layer to services/"`

### 6b. Move `utils/stevne.ts` → `services/stevneService.ts`
- [x] Rename file
- [x] Update all imports
- [x] Verify `Promise.all()` calls are properly wrapped in try/catch with `logError()`
- [x] Test all pages that use stevne data
- [x] Commit: `"Move stevne data layer to services/"`

### 6c. Move `utils/auth.ts` → `services/authService.ts`
- [x] Rename file
- [x] Update all imports (14 files)
- [x] Type guards from Phase 1e move with the file
- [x] signIn/signUp restored to authService (were in a pre-existing authService.ts)
- [ ] Test login flow + admin access carefully
- [x ] Commit: `"Move auth to services/"`

### 6d. Audit what's left in `utils/`
- [x] After moves, every file in `utils/` should be a pure function (no side effects, no Supabase, no DOM)
- [x] `grep -r "supabase" src/utils/` → zero results ✓
- [x ] Commit: `"Final utils/ cleanup — pure functions only"`

> **Verification:** `grep -r "from.*supabase" src/utils/` should return zero results.

---

## Phase 7: Tighten `tsconfig.json`

Once all files are `.ts`:

- [x ] Remove `"allowJs": true` and `"checkJs": false`
- [x ] Verify `npm run typecheck` still passes
- [x ] Commit: `"Disable JS in tsconfig — fully TypeScript now"`

---

## Phase 8: Final Review

- [ ] Manual walkthrough of every page in both light AND dark mode
- [ ] `npm run typecheck` returns 0 errors
- [ ] `npm run build` succeeds
- [ ] All 3 critical flows from Phase 0 work
- [ ] Search codebase for forbidden patterns to verify zero remain:
  - [ ] `grep -r "select('\\*')" src/` → empty
  - [ ] `grep -r ": any" src/` → empty (or only intentional)
  - [ ] `grep -r "as unknown as" src/` → empty
  - [ ] `grep -r "style=" src/pages src/admin src/organizer` → empty
  - [ ] `grep -rE "from\\(.*\\)\\.select" src/pages src/admin src/organizer` → empty (all queries should be in services/)
  - [ ] `grep -r "supabase" src/utils/` → empty (utils/ is pure functions only)
- [ ] Merge into main:
  ```bash
  git checkout main
  git merge refactor/cleanup
  ```

---

## After the Refactor

- [ ] Update `CLAUDE.md` with any new conventions discovered
- [ ] Add a `README.md` documenting the folder structure
- [ ] Document any non-obvious decisions in a `DECISIONS.md`
- [ ] Celebrate 🎉

---

## Progress Tracker

**Files migrated:** ___ / ___ (count `.js` files in `src/` to fill in denominator)

**Services created:** ___

**Components extracted:** ___ / 8

---

## Notes & Decisions Log

_Record decisions made during refactoring so future-you remembers why:_

- _Decision 1: "DB schema: audit nullable columns for NOT NULL candidates (separate initiative, not part of this refactor)"
- _Decision 2: "DB schema: set unique values, e.g. kaster.fornavn + kaster.etternavn
- _Decision 3: "DB schema: consider changing table.id from integer to uuid, e.g. kamp.id (tiny UUID ?)
- _Decision 4: "Convert code and db from norwegian to english"
- _Decision 5: "Refactor admin-pages"