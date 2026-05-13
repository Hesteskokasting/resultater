# Project Instructions for Claude

> These rules are **mandatory**, not suggestions. Follow them strictly unless I explicitly tell you otherwise in a specific request. 
> Be critical to my suggestions and/or prioritations. Don't blindly accept without considering the consequenses first

---

## TypeScript

- **ALWAYS use TypeScript.** Never write `.js` files. Never write JavaScript inside `.ts` files without proper types.
- **NEVER use `any`.** If a type is unknown, use `unknown` and narrow it, or define a proper type/interface.
- **NEVER cast with `as unknown as SomeType`** to silence errors. Fix the underlying type mismatch instead.
- Use Supabase's generated types (`Database` type from `supabase gen types`) as the source of truth for database shapes. Do not hand-write types that duplicate the schema.
- Prefer `type` for unions and simple shapes, `interface` for objects that may be extended.
- Enable and respect `strict: true` in `tsconfig.json`.

---

## Component-First Architecture

- **ALWAYS create reusable components** for UI elements. This includes (but is not limited to): buttons, modals, tables, forms, inputs, toasts, cards, dropdowns.
- Components live in `src/components/` and export a `create<Name>()` factory function returning an `HTMLElement` (or a more specific subtype like `HTMLButtonElement`).
- A component file exposes **one** component. If a component grows beyond ~150 lines, consider splitting it.
- Components take a typed `Props` interface as their only argument:
  ```ts
  interface ButtonProps {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  }

  export function createButton(props: ButtonProps): HTMLButtonElement { ... }
  ```
- **NEVER inline HTML creation** (`document.createElement` chains) inside page/route files when the same element appears elsewhere. Extract to a component.

---

## DRY — No Duplicated Code

- **NEVER copy-paste code.** If you find yourself writing the same logic twice, stop and extract it.
- Before writing new code, search the codebase for existing helpers that do the same thing. Reuse first, write second.
- Shared logic goes in `src/utils/` (pure functions) or `src/services/` (side-effects like Supabase calls).
- If you see duplicated code that I haven't asked you to touch, mention it — don't silently leave it.

---

## Structure & Organization

Default project layout:

```
src/
  components/      → reusable UI factories (createButton, createModal, ...)
  pages/           → per-route composition; wires components + services together
  services/        → Supabase queries, external API calls
  utils/           → pure helper functions (formatDate, validateEmail, ...)
  types/           → shared types, including generated supabase.ts
  styles/          → .css files (global.css, component-specific)
  main.ts          → entry point
```

- One responsibility per file. One responsibility per function.
- Use **composition** over inheritance.
- Group by **feature** when a feature grows large enough (e.g. `src/features/stevne/` containing its own components, services, types).
- File names: `camelCase.ts` for utilities/services, `PascalCase.ts` for component factories (e.g. `Button.ts`, `StevneKort.ts`).

---

## Optimization & Performance

- **Avoid unnecessary DOM operations.** Build a subtree in memory, then append once — don't append element-by-element in a loop to a mounted parent.
- **Cache Supabase queries** where it makes sense. Don't refetch the same data on every interaction.
- Use `select()` to fetch only the columns you need from Supabase. Never `select("*")` in production code.
- Debounce expensive event handlers (search inputs, resize, scroll).
- Remove event listeners when components are destroyed to prevent memory leaks.
- Lazy-load heavy modules with dynamic `import()` where applicable.

---

## Error Handling

- Always handle Supabase errors explicitly:
  ```ts
  const { data, error } = await supabase.from("stevne").select(...);
  if (error) { /* handle, log, surface to user */ }
  ```
- Never swallow errors silently with empty `catch {}`.
- User-facing errors should be shown via a `Toast` (or equivalent) component — never `alert()`.

---

## CSS

- All CSS lives in `.css` files. **NEVER write CSS inside `.ts` files** unless absolutely required (e.g. computed positioning).
- The app supports **dark/light mode** via `global.css`. Use CSS variables (`var(--bg-color)`, etc.) instead of hardcoded colors.
- Component-specific styles go in a matching `.css` file next to the component, or in a clearly scoped section of `global.css`.
- Use semantic class names (`.stevne-kort__title`), not utility-style names (`.text-red-bold`).

---

## Naming Conventions

- Variables and functions: `camelCase`
- Types and interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files exporting a component factory: `PascalCase.ts`
- Files exporting utilities/services: `camelCase.ts`
- Boolean variables: prefix with `is`, `has`, `should` (e.g. `isLoading`, `hasError`)

---

## Comments

- Write comments to explain **why**, not **what**. The code shows what it does.
- Delete commented-out code. Use git history instead.
- Add a brief JSDoc to exported functions if their purpose isn't obvious from the name and signature.

---

## Accessibility

- Buttons must be `<button>` elements, not styled `<div>`s.
- Interactive elements must be keyboard-accessible.
- Form inputs need associated `<label>` elements.
- Use semantic HTML (`<nav>`, `<main>`, `<article>`) over generic `<div>` wrappers.

---

## Git

- **NEVER** run `git add`, `git commit`, `git push`, `git pull`, or any branch/remote operation unless I explicitly ask.
- If you think a commit is appropriate, suggest it — don't execute it.

---

## When in Doubt

- Ask before making large structural changes.
- Ask before adding new dependencies.
- Ask before deleting files.
- If a rule above seems to conflict with what I'm asking for in a specific message, ask which should win.