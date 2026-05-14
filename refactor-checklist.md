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
- [ ] Create `src/utils/logError.ts`:
  ```ts
  export function logError(context: string, error: unknown): void {
    console.error(`[${context}]`, error);
  }
  ```
- [ ] Commit: `"Add logError utility"`

### 1b. HTML escape utility
- [ ] Create `src/utils/escHtml.ts` with proper escaping (`&`, `<`, `>`, `"`, `'`)
- [ ] **Delete** the existing `escAttr()` in `rekorder.js` (line ~29) and `_esc()` in `stevneadmin.js`
- [ ] Update those two files' imports to use the new utility
- [ ] Commit: `"Consolidate HTML escaping into escHtml utility"`

### 1c. Date parsing utility
- [ ] Create `src/utils/parseLocalDate.ts` for the `+ 'T12:00:00'` pattern
- [ ] Commit: `"Add parseLocalDate utility"`

### 1d. Dropdown options utility
- [ ] Create `src/utils/buildDropdownOptions.ts` consolidating `_opt()` and `dropdownOptions()`
- [ ] Commit: `"Add buildDropdownOptions utility"`

### 1e. Type guards for auth (security-critical, do isolated)
- [ ] In `src/utils/auth.ts`, add `isProfil(obj): obj is Profil` and `isRolle(value): value is Rolle`
- [ ] Replace `as Profil` and `as Rolle` casts with validated narrowing
- [ ] Test login + admin access carefully
- [ ] Commit: `"Add runtime validation to auth type assertions"`

### 1f. Fix existing `.ts` files that are already broken
These are `.ts` already so they won't be touched by Phase 2 migration. Fix them here.

- [ ] **`src/utils/norgescup.ts`**: replace `select('*')` (line ~61) with explicit columns; add validation for the `as string[]` (line ~171) and `as number` (line ~142) casts
- [ ] **`src/utils/stevne.ts`**: wrap the `Promise.all()` at line ~27 in try/catch with `logError()`
- [ ] **`src/utils/kaster.ts`**: read it. Verify `formatKasterNavn()` (or equivalent) is exported. Note the function name for use during migration.
- [ ] Commit each as separate logical units

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
- [ ] `src/pages/terminliste.js` → `.ts`
- [ ] `src/pages/norgesranking.js` → `.ts`
- [ ] `src/pages/rekorder.js` → `.ts` _(known bug: `klubb_namn`/`klubb_navn` typo to fix. uses database view "kaster_rekorder")_
- [ ] `src/pages/nmvinnere.js` → `.ts`
- [ ] `src/pages/pamelding.js` → `.ts`
- [ ] `src/pages/resultat.js` → `.ts` _(unescaped `kasternavn()` injection — fix during migration. consider changing this from resultat to stevne, since this is actually the stevne with resultat in it. Get recommendation for claude)_
- [ ] `src/pages/kamp-scoreboard.js` → `.ts` _(do alongside Phase 3 scoreboard CSS fix)_

**Admin:**
- [ ] `src/admin/stevneadmin.js` → `.ts`
- [ ] `src/admin/klubbadmin-side.js` → `.ts`
- [ ] `src/admin/kasteradmin.js` → `.ts`

**Organizer:**
- [ ] All files in `src/organizer/` → `.ts` _(list them when you reach this section)_

**Entry point (do last):**
- [ ] `src/app.js` → `.ts`

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

### Per-file prompt template for Claude Code

> "I want to migrate `src/pages/<filename>.js` to TypeScript. Before writing code:
> 1. Read `src/pages/norgescupen.ts` first — it's the template for how files should look.
> 2. Read the file I want to migrate and list every issue you see based on the Definition of Done in `REFACTOR_CHECKLIST.md`.
> 3. Check if a relevant service file exists in `src/services/`. If yes, plan to extend it. If no, plan to create one.
> 4. Check `src/utils/` for existing utilities to reuse — don't propose new ones if something equivalent exists.
> 5. Propose a step-by-step migration plan.
> 6. Highlight anything risky or unclear — ask me before making those decisions.
>
> Wait for my approval before changing code."

---

## Phase 3: CSS Cleanup (parallel track — do between files when you need a break)

These are CSS-only and self-contained. Good to interleave with the heavy migration work.

- [ ] **Scoreboard dark/light mode**: refactor `.sb-*` classes in `styles.css` (lines ~1140–1522)
  - [ ] Define scoreboard CSS variables in `global.css` for both themes
  - [ ] Replace all hardcoded hex values with `var(--...)`
  - [ ] Rename `.sb-rod` → `.sb-negativ`, `.sb-groen` → `.sb-positiv`
  - [ ] Test in both light and dark mode
- [ ] Audit `styles.css` for other hardcoded colors → replace with variables
- [ ] Consolidate the repeated `text-align:center;margin-top:40px;` pattern into a utility class (e.g., `.loading-state`)

---

## Phase 4: Extract Components (do LAST, after migration is done)

> Now that every file is `.ts` and patterns are clear, you can see which abstractions are worth building. Don't do this earlier — you'd be abstracting the wrong things.

Look for patterns that appeared repeatedly during migration:

- [ ] `createErrorBanner({ message })` — replace the `<p class="feil">...</p>` pattern
- [ ] `createLoadingState({ message })` — replace the centered "Lastar..." pattern
- [ ] `createKortKort()` / `createKasterKort()` — for repeated card layouts
- [ ] `createTable({ columns, rows })` — typed columns, generic rows
- [ ] `createDropdown()` — wraps `buildDropdownOptions`
- [ ] `createTabs({ tabs })` — with built-in ARIA support (tablist/tab/aria-selected)
- [ ] `createExpandableRow()` — with built-in keyboard support (Enter/Space/tabindex)
- [ ] `createFilterableList()` — wraps the filter/search event handler boilerplate from `kastere.js`, `terminliste.js`, `norgesranking.js`, `minside.js`

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
- [ ] Rename file
- [ ] Update all imports (`grep -r "from.*utils/norgescup"` to find them)
- [ ] Replace any remaining `select('*')` with explicit columns
- [ ] Move pure helpers (non-Supabase functions) to a new `utils/norgescupHelpers.ts` if needed
- [ ] Test all pages that use norgescup data
- [ ] Commit: `"Move norgescup data layer to services/"`

### 6b. Move `utils/stevne.ts` → `services/stevneService.ts`
- [ ] Rename file
- [ ] Update all imports
- [ ] Verify `Promise.all()` calls are properly wrapped in try/catch with `logError()`
- [ ] Test all pages that use stevne data
- [ ] Commit: `"Move stevne data layer to services/"`

### 6c. Move `utils/auth.ts` → `services/authService.ts`
- [ ] Rename file
- [ ] Update all imports
- [ ] Type guards from Phase 1e move with the file
- [ ] Pure auth helpers (no side effects, no Supabase) can stay in `utils/authHelpers.ts` if useful to split
- [ ] Test login flow + admin access carefully
- [ ] Commit: `"Move auth to services/"`

### 6d. Audit what's left in `utils/`
- [ ] After moves, every file in `utils/` should be a pure function (no side effects, no Supabase, no DOM)
- [ ] If not, move it to the appropriate `services/` or `components/` location
- [ ] Commit: `"Final utils/ cleanup — pure functions only"`

> **Verification:** `grep -r "from.*supabase" src/utils/` should return zero results.

---

## Phase 7: Tighten `tsconfig.json`

Once all files are `.ts`:

- [ ] Remove `"allowJs": true` and `"checkJs": false`
- [ ] Verify `npm run typecheck` still passes
- [ ] Commit: `"Disable JS in tsconfig — fully TypeScript now"`

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

- _Decision 1: ..._
- _Decision 2: ..._