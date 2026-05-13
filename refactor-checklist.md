# Refactor Checklist (Vertical Strategy)

A file-by-file plan for cleaning up the codebase. Based on the codebase analysis report.

**Core principle:** Work **vertically** (one file at a time, fix everything in it) rather than **horizontally** (one issue across all files). This way each file is "done" when you close it, and you avoid opening the same file five times.

**Rules:**
- One file = one commit (or a few small commits per file).
- Don't move to the next file until the current one passes the Definition of Done.
- Run the app and test after each file.
- Ask Claude Code for a **plan first**, code second.

---

## Phase 0: Safety Net

- [ X] Create branch: `git checkout -b refactor/cleanup`
- [ X] Snapshot commit: `git commit -am "Snapshot before refactor"`
- [ X] Verify clean install works: `npm install && npm run dev`
- [ X] Write down 3 critical flows to test after each file:
  - [ X] Flow 1: log in
  - [ X] Flow 2: add results to match (kamp)
  - [ X] Flow 3: verify all files and routing in /pages work

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

> **Stop and verify:** all 5 utilities exist, app still runs, login still works.

---

## Phase 2: Per-File Migration

Work through these files in order. For **each** file, complete the full Definition of Done before moving on.

### File order (easiest → hardest)

Start with smaller, more isolated files. Bigger pages last, when you've found your rhythm.

- [ ] `src/pages/logginn.js` → `.ts`
- [ ] `src/pages/klubber.js` → `.ts`
- [ ] `src/pages/rekorder.js` → `.ts` _(has known `klubb_namn`/`klubb_navn` bug to fix)_
- [ ] `src/pages/nmvinnere.js` → `.ts`
- [ ] `src/pages/minside.js` → `.ts`
- [ ] `src/pages/pamelding.js` → `.ts`
- [ ] `src/pages/terminliste.js` → `.ts`
- [ ] `src/pages/resultat.js` → `.ts` _(has unescaped `kasternavn()` injection — fix during migration)_
- [ ] `src/pages/kastere.js` → `.ts`
- [ ] `src/pages/norgesranking.js` → `.ts`
- [ ] `src/pages/kamp-scoreboard.js` → `.ts`
- [ ] `src/admin/stevneadmin.js` → `.ts`
- [ ] `src/admin/klubbadmin-side.js` → `.ts`
- [ ] `src/admin/kasteradmin.js` → `.ts`
- [ ] `src/app.js` → `.ts` _(do last — it's the entry point)_

> Adjust order as you learn. Promote dependencies of the file you're touching if needed.

---

### Definition of Done (per file)

For **every** file you migrate, all of these must be checked off:

```
□ Renamed .js → .ts
□ Zero TypeScript errors (npm run typecheck passes)
□ No `any` (explicit or implicit)
□ No `as unknown as ...` casts
□ All Supabase queries use explicit column lists (no select("*"))
□ All Supabase errors go through logError()
□ All user-sourced strings interpolated into innerHTML use escHtml()
□ No inline styles in the .ts file
□ All colors use CSS variables (var(--...))
□ Duplicated helpers removed → import from src/utils/
□ Manually tested in browser
□ Tested all 3 critical flows from Phase 0
□ Committed as a logical unit
```

### Per-file prompt template for Claude Code

> "I want to migrate `src/pages/<filename>.js` to TypeScript. Before writing code:
> 1. Read the file and list every issue you see based on the Definition of Done in `REFACTOR_CHECKLIST.md`.
> 2. Propose a step-by-step migration plan.
> 3. Highlight anything risky or unclear — ask me before making those decisions.
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

## Phase 6: Tighten `tsconfig.json`

Once all files are `.ts`:

- [ ] Remove `"allowJs": true` and `"checkJs": false`
- [ ] Verify `npm run typecheck` still passes
- [ ] Commit: `"Disable JS in tsconfig — fully TypeScript now"`

---

## Phase 7: Final Review

- [ ] Manual walkthrough of every page in both light AND dark mode
- [ ] `npm run typecheck` returns 0 errors
- [ ] `npm run build` succeeds
- [ ] All 3 critical flows from Phase 0 work
- [ ] Search codebase for forbidden patterns to verify zero remain:
  - [ ] `grep -r "select('\\*')" src/` → empty
  - [ ] `grep -r ": any" src/` → empty (or only intentional)
  - [ ] `grep -r "as unknown as" src/` → empty
  - [ ] `grep -r "style=" src/pages src/admin` → only in CSS-related utilities
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

**Files migrated:** ___ / 15

**Utilities built:** ___ / 5

**Components extracted:** ___ / 7

---

## Notes & Decisions Log

_Record decisions made during refactoring so future-you remembers why:_

- _Decision 1: ..._
- _Decision 2: ..._