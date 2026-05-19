# Project Instructions for Claude

> These rules are **mandatory**, not suggestions. Follow them strictly unless I explicitly tell you otherwise in a specific request.

---

## TypeScript

- **ALWAYS use TypeScript.** Never write `.js` files.
- **NEVER use `any`** (explicit or implicit). Use `unknown` + narrowing, or define a proper type.
- **NEVER cast with `as unknown as SomeType`** to silence errors. Fix the underlying type mismatch.
- Use Supabase's generated types (`Database` from `supabase gen types`) as the source of truth. Don't hand-write types that duplicate the schema.
- Prefer `type` for unions and simple shapes, `interface` for objects that may be extended.
- `strict: true` in `tsconfig.json` — always on.
- Run `npm run typecheck` before considering work done. Vite does not type-check.

---

## Path Aliases

Always use `@/` for imports: `import { foo } from '@/services/fooService'`. Never use relative `../../` paths.

---

## Component-First Architecture

- **Create reusable components** for any UI element that appears more than once.
- Components live in `src/components/` and export a `create<Name>()` factory returning an `HTMLElement`.
- Components take a typed `Props` interface as their only argument.
- **NEVER inline HTML creation** inside page/route files when the same pattern appears elsewhere.
- Remove event listeners when components are destroyed.

### Existing components — always reuse, never recreate

| Use case | Import |
|---|---|
| Loading state | `createLoadingState()` — `@/components/LoadingState` |
| Error banner | `createErrorBanner()` — `@/components/ErrorBanner` |
| Empty state | `createEmptyState()` — `@/components/EmptyState` |
| Toast notification | `showToast()` — `@/components/Toast` |
| Confirm dialog | `confirmDialog()` — `@/components/ConfirmDialog` |
| Prompt dialog | `promptDialog()` — `@/components/PromptDialog` |
| Table | `createTable()` — `@/components/Table` |
| Tab panels | `createTabs()` — `@/components/Tabs` |
| Expandable rows | `bindExpandableRows()` — `@/utils/expandableRows` |

**Never use `alert()`, `confirm()`, or `prompt()`.** Use the dialog/toast components above.

---

## DRY — No Duplicated Code

- **NEVER copy-paste code.** Extract first.
- Before writing new code, search for existing helpers. Key utilities: `formatKasterNavn()` (`@/utils/kaster`), `escHtml()` (`@/utils/escHtml`) for any user-sourced string in `innerHTML`.
- Shared logic: `src/utils/` for pure functions, `src/services/` for Supabase/side-effects.
- If you see duplicated code outside the scope of your task, mention it — don't silently leave it.

---

## Structure & Organization

```
src/
  components/   → reusable UI factories (create<Name>)
  pages/        → thin route handlers; wire components + services
  services/     → all Supabase queries and external API calls
  utils/        → pure functions only (no Supabase, no DOM side-effects)
  types/        → shared types, including generated supabase.ts
  organizer/    → kastemetode-specific logic (innledende/, avsluttende/)
```

- One responsibility per file and per function.
- `utils/` must remain pure: `grep -r "supabase" src/utils/` → zero results.
- Pages must be thin (≤300 lines). If a page grows past that, extract a component or service.
- File names: `camelCase.ts` for utilities/services, `PascalCase.ts` for component factories.
- No feature subfolders in `services/` — keep it flat.

---

## Database (Supabase / Postgres)

### Queries

- All Supabase queries live in `src/services/<name>Service.ts`. Never import `supabase` directly in pages or components.
  - Exception: /utils/realtime.ts - Thin supabase-wrapper with no domain.
- Use **explicit column lists**. `select("*")` is forbidden.
- Handle all Supabase errors via `logError()` and surface them to the user with `showToast()`.
- Use `.single()` or `.maybeSingle()` when expecting one row.
- Wrap all `Promise.all()` calls in `try/catch` with `logError()`.

### Data integrity

- Constraints belong in the database: `not null`, `unique`, `check`. Don't enforce schema rules in TypeScript alone.
- Multi-step atomic writes go in a Postgres function (`rpc`), not sequential client queries.
- Foreign key `on delete` behavior must be chosen explicitly (`restrict`, `cascade`, `set null`).
- Write a migration for every schema change. Never use the dashboard for production data.

### Performance

- **N+1 is a bug.** Use joins or `.in()` — never loop-fetch.
- Never fetch unbounded lists. Use `.range()` or set a hard limit.
- Aggregations belong in a view or materialized view, not assembled in TypeScript.

---

## Error Handling

- Never swallow errors silently with empty `catch {}`.
- User-facing errors → `showToast()`. Never `alert()`.
- All caught errors → `logError()`.

---

## CSS & Theming

- All CSS lives in `.css` files. **No inline styles** in `.ts` files.
- The app has three themes: `dark` (default), `light`, and `utendors` (outdoor high-contrast), all defined via `[data-theme]` selectors in `global.css`.
- Use CSS variables (`var(--bg)`, `var(--tekst)`, etc.) — never hardcoded colors.
- Scoreboard styles use `--sb-*` variables. New scoreboard styles must use these.
- Use semantic class names (`.stevne-kort__title`), not utility names (`.text-red-bold`).

---

## Accessibility

- Buttons must be `<button>` elements, not `<div>`s.
- Interactive elements must be keyboard-accessible (`tabindex`, keydown handlers).
- Form inputs need associated `<label>` elements.
- Use ARIA roles where needed: `role="tablist"`, `role="tab"`, `aria-expanded`, etc.

---

## Naming Conventions

- **ALL identifiers must be in English.** Variables, functions, types, interfaces, parameters, CSS class names, object keys. Norwegian is only acceptable in user-facing strings (UI text, HTML, error messages).
- Variables and functions: `camelCase`
- Types and interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files exporting a component factory: `PascalCase.ts`
- Files exporting utilities/services: `camelCase.ts`
- Booleans: prefix with `is`, `has`, `should`

---

## Comments

- Explain **why**, not **what**.
- Delete commented-out code. Use git history.
- Brief JSDoc on exported functions only if name + signature aren't self-explanatory.

---

## Large Structural Changes

- Don't make large changes in one go. Create a step-by-step checklist, get approval, execute each step separately.
- Save approved plans to `/plans/<plan-name>.md`.

---

## Git

- **NEVER** run `git add`, `git commit`, `git push`, or any branch operation unless explicitly asked.
- Suggest commits and commit messages — don't execute them.
- For complex changes, create small committable steps and wait for approval before proceeding.

---

## Critical Thinking

Don't blindly accept proposals. Challenge ideas when there's a flaw, simpler alternative, or rule violation — *before* writing code. Suggest alternatives as: "You proposed X. Y trades off A for B. I'd recommend Y because…" Flag technical debt you notice. Disagree directly and without apology.

---

## Ask First When Unclear

Ask before coding when: requirements are ambiguous, there are multiple valid interpretations, the request conflicts with these rules, or the decision is hard to reverse (schema change, new dependency, architectural pattern).

Don't ask for trivial choices or when you're stalling. One focused question beats a list.

Ask before: large structural changes, adding dependencies, deleting files.
