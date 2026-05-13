# Refactor Checklist

A step-by-step plan for cleaning up the codebase. Work through phases in order. Don't skip ahead — each phase builds on the previous one.

**Rules:**
- Commit after every meaningful change (small commits, not big ones).
- Run the app and test after each round.
- If a step feels too big, split it.
- Ask Claude Code for a **plan first**, code second.

---

## Phase 0: Setup & Safety Net

- [ X] Create a refactor branch: `git checkout -b refactor/cleanup`
- [ X] Commit current state as snapshot: `git commit -am "Snapshot before refactor"`
- [ X] Make sure the app still runs from a clean install (`npm install && npm run dev`)
- [ X] Note down 2-3 critical user flows to test manually after each phase (e.g. "log in", "view stevne list", "create new utøver")

---

## Phase 1: Analysis (don't change code yet)

- [ X] Run this prompt in Claude Code:

  > "Read the entire codebase and produce a report. I want:
  > 1. Top 10 problems ranked by severity (duplication, type issues, structure, CSS mess, performance)
  > 2. For each problem: where it is, why it's a problem, suggested fix
  > 3. A prioritized order to fix them
  >
  > Don't write code yet. Just analyze."

- [ X] Save the report somewhere (paste into `REFACTOR_NOTES.md` or similar)
- [ X] Review and adjust priorities based on your own judgment

---

## Phase 2: Foundation (do this once, before anything else)

- [ X] Enable `"strict": true` in `tsconfig.json`
- [ X] Note how many type errors appear: 0
- [ X] Generate Supabase types: Already done
  ```bash
  supabase gen types typescript --project-id <id> > src/types/supabase.ts
  ```
- [ X] Set up folder structure (create empty folders if they don't exist):
  - [ X] `src/components/`
  - [ X] `src/pages/`
  - [ X] `src/services/`
  - [ X] `src/utils/`
  - [ X] `src/types/`
  - [ X] `src/styles/`
- [ X] Commit: `"Enable strict mode, generate types, set up folder structure"`

---

## Phase 3: Fix Type Errors

> Goal: get to **zero** type errors before refactoring structure.

- [ X] Ask Claude Code:
  > "I have X type errors after enabling strict mode. Go through them one by one and fix them. Explain each fix — what was wrong, why the new type is correct. Don't refactor structure yet, just fix types."

- [ X] Replace all `any` with proper types or `unknown`
- [ X] Remove all `as unknown as Type` casts — fix the underlying issue
- [ X] Use generated Supabase types instead of hand-written duplicates
- [ X] Commit in small batches as you go

**Tip:** If errors are overwhelming, ask Claude Code to group them by type (e.g. "all Supabase return type issues first").

---

## Phase 4: Extract Components

> Goal: every UI element appears in exactly one place.

Work through these one at a time. Don't do all at once.

- [ ] **Buttons**
  - [ ] Find all manual `document.createElement('button')` calls
  - [ ] Create `src/components/Button.ts` with a `createButton()` factory
  - [ ] Replace all occurrences
  - [ ] Test, commit

- [ ] **Inputs / form fields**
  - [ ] Create `createInput()`, `createSelect()`, etc.
  - [ ] Replace all occurrences
  - [ ] Test, commit

- [ ] **Tables**
  - [ ] Find table-building code
  - [ ] Create `createTable()` with typed column definitions
  - [ ] Replace all occurrences
  - [ ] Test, commit

- [ ] **Modals / dialogs**
  - [ ] Create `createModal()` with open/close logic
  - [ ] Replace all ad-hoc modal code
  - [ ] Test, commit

- [ ] **Cards / list items** (e.g. `StevneKort`)
  - [ ] Identify repeating layout patterns
  - [ ] Extract to components
  - [ ] Test, commit

- [ ] **Toasts / notifications**
  - [ ] Remove all `alert()` calls
  - [ ] Create `showToast()` with variants (success, error, info)
  - [ ] Test, commit

**Per-component prompt template:**
> "Find all places where we manually build a [button/table/modal] in the codebase. Show me the list first. Then propose a `create[Name]` component. Wait for approval before replacing usages."

---

## Phase 5: Extract Services

> Goal: no Supabase calls outside `src/services/`.

- [ ] Ask Claude Code:
  > "Find all Supabase calls in the codebase. Group them by table or feature. Propose a service-file structure in `src/services/`. Don't move anything yet — just show the plan."

- [ ] For each service file (one at a time):
  - [ ] Create `src/services/<feature>Service.ts`
  - [ ] Move related Supabase queries there as named exports
  - [ ] Replace all direct Supabase calls with service imports
  - [ ] Make sure `select(...)` only fetches columns actually used
  - [ ] Test, commit

**Suggested services to create:**
- [ ] `stevneService.ts`
- [ ] `utøverService.ts`
- [ ] `authService.ts`
- [ ] (others based on your features)

---

## Phase 6: Deduplicate Logic

> Goal: no copy-pasted helper code.

- [ ] Ask Claude Code:
  > "Scan the codebase for duplicated logic that should be extracted into `src/utils/`. List candidates with: where the duplicates are, what they do, suggested function name. Don't change code yet."

- [ ] Review the list, pick the highest-value extractions
- [ ] For each one:
  - [ ] Create utility function in `src/utils/`
  - [ ] Add unit-testable signature (pure function, no side effects)
  - [ ] Replace duplicates one at a time
  - [ ] Test, commit

**Common candidates:**
- [ ] Date formatting (`formatDate`, `formatTime`)
- [ ] Validation (`isValidEmail`, `isValidPhone`)
- [ ] Sorting/filtering helpers
- [ ] Error-to-message converters

---

## Phase 7: CSS Cleanup

> Goal: no CSS in `.ts` files, dark/light mode works everywhere.

- [ ] Ask Claude Code:
  > "Find all inline CSS in .ts files (style.cssText, element.style.foo, etc.). List them. Then propose how to move each to a .css file. Show the plan first."

- [ ] Move inline styles to `.css` files
- [ ] Replace hardcoded colors with CSS variables (`var(--bg-color)`, etc.)
- [ ] Test dark mode AND light mode on every screen
- [ ] Consolidate duplicate CSS rules
- [ ] Test, commit

---

## Phase 8: Performance Pass

> Goal: catch obvious inefficiencies now that the code is organized.

- [ ] Ask Claude Code:
  > "Look for performance issues: unnecessary re-renders/DOM rebuilds, missing debounce on inputs, `select('*')` queries, memory leaks from missing event-listener cleanup, expensive operations in loops. List findings, prioritize, then we'll fix together."

- [ ] Fix top 3-5 findings
- [ ] Test, commit

---

## Phase 9: Final Review

- [ ] Manually walk through every page/feature
- [ ] Check dark mode and light mode
- [ ] Run TypeScript check with no errors: `tsc --noEmit`
- [ ] Make sure all critical flows from Phase 0 still work
- [ ] Merge `refactor/cleanup` into main:
  ```bash
  git checkout main
  git merge refactor/cleanup
  ```

---

## After the Refactor

- [ ] Update `CLAUDE.md` if you discovered new rules during refactoring
- [ ] Add any project-specific conventions you settled on
- [ ] Document the folder structure in a `README.md` if you don't have one
- [ ] Celebrate 🎉

---

## Notes & Decisions Log

Use this space to record decisions made during refactoring (so future-you remembers why):

- _Decision 1: ..._
- _Decision 2: ..._