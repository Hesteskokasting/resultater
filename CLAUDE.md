# Project Instructions for Claude

> These rules are **mandatory**, not suggestions. Follow them strictly unless I explicitly tell you otherwise in a specific request.

---

## Critical Thinking

Don't blindly accept proposals. Challenge ideas when there's a flaw, simpler alternative, or rule violation — *before* writing code. Suggest alternatives as: "You proposed X. Y trades off A for B. I'd recommend Y because…" Flag technical debt you notice. Disagree directly and without apology.

---

## TypeScript

- **New application code is ALWAYS TypeScript.** Never create new `.ts` code as `.js`, and never add `.js` files under `src/`. Existing `.js` files are converted per the migration plan, not left to grow. Tooling/config that a tool genuinely requires in JS may use `.mjs`/`.cjs` (e.g. ESLint flat config, PostCSS) — prefer `.ts` wherever the tool supports it (Vite config, etc.).
- **NEVER use `any`** (explicit or implicit). Use `unknown` + narrowing, or define a proper type. This has no exceptions — including in tests. A partially-typed mock is `Partial<T>` or a defined shape, never `any`.
- **Avoid `as unknown as SomeType`.** In application code, fix the underlying type mismatch instead of double-casting to silence it. Permitted ONLY in test doubles and untyped-library interop, where it must be isolated to a single cast at the boundary and carry a comment explaining why the real type can't be satisfied.
- Once database types are generated, use Supabase's `Database` type as the source of truth. Don't hand-write types that duplicate the schema — they drift the moment a migration runs.
- Use Supabase's generated types (`Database` from `supabase gen types`) as the source of truth. Don't hand-write types that duplicate the schema.
- Prefer `type` for unions and simple shapes, `interface` for objects that may be extended.
- `strict: true` in `tsconfig.json` — always on.
- Run `npm run typecheck` before considering work done. Vite does not type-check. When tests are involved, run all three checks — see **Unit Testing** below.

---

## English identifiers

- **NEVER use Norwegian identifiers** — variables, functions, types, interfaces, parameters, CSS class names, object keys. Norwegian is permitted only in user-facing strings (UI text, HTML, error messages).
- **Exception: schema-derived names.** An identifier may keep its Norwegian schema name (`kasterid`, `stevneid`, `omgang`, etc.) only when it directly references that column or table in the same statement/type. This exception never extends to new variables, functions, or concepts that merely relate to the domain.
- **Known near-miss:** `bruker`/`brukerId` is NOT a schema exception (unlike `kasterid`/`stevneid`) — always use `user`/`userId`.
- **Existing Norwegian identifiers:** rename to English when you're already editing that code. Don't do drive-by renames in files you're not otherwise touching.

---

## Naming Conventions

- Variables and functions: `camelCase`
- Types and interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files exporting a component factory: `PascalCase.ts`
- Files exporting utilities/services: `camelCase.ts`
- Booleans: prefix with `is`, `has`, `should`

---

## Component-First Architecture

- **Create reusable components** for any UI element that appears more than once.
- Components live in `src/components/` and export a `create<Name>()` factory returning an `HTMLElement`.
- Components take a typed `Props` interface as their only argument.
- **NEVER inline HTML creation** inside page/route files when the same pattern appears elsewhere.
- Remove event listeners when components are destroyed.

---

## State / DOM Boundary

- **State lives in an explicit JS object. The DOM is only ever a rendering of it, never a source of truth.**
- Forbidden: reading `classList`, `dataset`, `scrollTop`, or any other DOM property to *decide* application logic. DOM inspection is allowed only for styling/measurement, never for control flow.
- Each view/module owns one typed state object and exposes mutator functions (`setActiveTab()`, `updateScore()`, etc.) — never a raw exported mutable object, never mutation from outside its own module.
- `render(state)` is a pure function of state and is the only thing allowed to write to that view's DOM. Every mutator updates state, then calls `render()`. Nothing re-renders any other way (no ad-hoc `innerHTML` writes, no re-reading old DOM to preserve UI state across a redraw — if it needs to survive a re-render, it belongs in state, not in the DOM).
- Every subscription (realtime channel, listener, interval, etc.) has a matching `dispose()`, called from the owning view's `unmount()`. No exceptions for "only one instance."

---

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

### Migrations

- **Every schema change needs a local migration file** in `supabase/migrations/<timestamp>_<name>.sql`. Always generate migrations file, NEVER apply it. Never apply a change without the corresponding local file.
- Timestamp format: `YYYYMMDDHHMMSS` (e.g. `20260521130000_rpc_bekreft_avsluttende_kamp.sql`).
- Never use the Supabase dashboard to make schema changes — it bypasses migration history.

### Generated types

- **NEVER edit `src/types/database.types.ts` manually.** It is auto-generated and any manual change will be overwritten.
- After every migration, regenerate with:
  ```
  npx supabase gen types typescript --project-id urtvpewjlevhlevtnvkf > src/types/database.types.ts
  ```
- The CLI may append an update notice or plugin hint to stdout — strip any non-TypeScript lines from the end of the file before saving.

### Data integrity

- Constraints belong in the database: `not null`, `unique`, `check`. Don't enforce schema rules in TypeScript alone.
- Multi-step atomic writes go in a Postgres function (`rpc`), not sequential client queries.
- Foreign key `on delete` behavior must be chosen explicitly (`restrict`, `cascade`, `set null`).

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

## Realtime Re-renders

- When re-rendering after a realtime update (`container.innerHTML = ...`), preserve the current tab/view state.
- Capture the active tab with `getActiveTab(container)` before replacing innerHTML, then restore with `setActiveTab(container, activeTab)` after `bindTabToggle(container)`.

---

## Front-end Performance

- **Render structure before data** — A render function must paint the skeleton/headings and reserve height (shimmer blocks with matching `min-height`) synchronously, before any `await` on data. Then fill content into the existing containers — never swap the whole container. Gives an early LCP candidate and prevents CLS.
- **Layout classes before `await`** — Any class that changes page layout (e.g. `sb-fullskjerm-modus`) must be set synchronously before the first `await`. Deferring causes CLS.
- **New routes use `lazy()`** — In `app.ts`, wrap new page imports with `lazy(() => import('./pages/...'))`. `renderHome` is the only eager page (it's the LCP route). A new landing/LCP route must stay eager too — otherwise lazy.
- **Heavy libraries use dynamic import** — Optional libraries > ~100 kB use `await import(...)` inside the function that needs them (`xlsx`, `chart.js` done). Never add a static top-level import for one.
- **Never benchmark on `npm run dev`** — Unminified, unoptimized. Use `npm run build && npm run preview` and run Lighthouse against the preview URL.

---

## Conventions

- **Router-mounted pages use `Params`** — `render` functions registered in `app.ts` (`ruter`) type their second argument as `Params` (from `@/types`), never an inline `Record<...>`. Extract values in the body: `Number(params.id)`, `String(params.tab ?? 'default')`. Sub-pages called directly (e.g. stevne tabs) take typed props instead.

---

## CSS & Theming

- All CSS lives in `.css` files. **No inline styles** in `.ts` files.
- The app has two themes: `light` (default, outdoor high-contrast) and `dark`, both defined via `[data-theme]` selectors in `global.css`.
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

## Comments

- Explain **why**, not **what**.
- Delete commented-out code. Use git history.
- Brief JSDoc on exported functions only if name + signature aren't self-explanatory.

---

## Unit Testing

- Tests live in `tests/*.test.ts`. Framework: Vitest with happy-dom. Config: `vite.config.js` (test block) + `tsconfig.test.json`.
- **Three-command check before considering any work done:**
  ```
  npm run typecheck && npm run typecheck:test && npm run test:run
  ```
  Vitest transpiles with esbuild and does NOT type-check. `typecheck:test` is the only thing that catches type errors in test files.
- **Only test pure functions.** Never write a test that calls `supabase` directly.
- **Extract-then-test pattern:** When logic is embedded inside a Supabase function, extract the pure computation into an exported function first, then test that. The async Supabase wrapper calls the pure function and is not tested here.
- **Use realistic game values in test data.** Per-omgang scores must come from `KAMP_POINT_VALUES` (`{1, 2, 3, 4, 6}` — defined in `src/pages/kamp.ts`). Match-level totals (`baseScore`, `score_poeng` fallbacks) are accumulated sums and not restricted to this set.
- Ring counts must be consistent with `calcAntallRinger`: score 6 → 2 rings, score 3 or 4 → 1 ring, anything else → 0 rings.

---

## Large Structural Changes

- Don't make large changes in one go. Create a step-by-step checklist, get approval, execute each step separately.
- Save approved plans to `/plans/<plan-name>.md`.

---

## Git

- **NEVER** run `git add`, `git commit`, `git push`, or any branch operation unless explicitly asked.
- Suggest commits and commit messages — don't execute them.
- For complex changes, create small committable steps and wait for approval before proceeding.
- **Always end responses that change code or apply migrations with a short suggested commit message** — one subject line plus a brief body explaining the why, not the what. Keep it tight: two or three sentences max. Don't narrate every file touched or restate what the diff already shows.

---

## Ask First When Unclear

Ask before coding when: requirements are ambiguous, there are multiple valid interpretations, the request conflicts with these rules, or the decision is hard to reverse (schema change, new dependency, architectural pattern).

Don't ask for trivial choices or when you're stalling. One focused question beats a list.

Ask before: large structural changes, adding dependencies, deleting files.

---

## Path Aliases

Always use `@/` for imports: `import { foo } from '@/services/fooService'`. Never use relative `../../` paths.

---
