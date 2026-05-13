# Codebase Report — Top 10 Problems by Severity

---

## #1 — Almost the Entire Codebase Is JavaScript, Not TypeScript

**Where:** Every file in `src/pages/` (12 of 13 files), all of `src/admin/`, all of `src/organizer/`, and `src/app.js`. Only `src/pages/norgescupen.ts` and the `src/utils/` files are TypeScript.

**Why it's a problem:** `tsconfig.json` has `strict: true`, but that only applies to `.ts` files. The other 30+ files have zero type coverage — no type annotations, no inference, no compile-time checks. Bugs that TypeScript would catch at build time (wrong field names, missing null checks, shape mismatches from Supabase) survive to production. The `norgescupen.ts` file proves the team knows how to write typed code; the rest simply wasn't migrated.

**Suggested fix:** Migrate files one at a time to `.ts`, using `norgescupen.ts` as the template. Start with the most-called utils and pages — `app.js`, `resultat.js`, `terminliste.js`.

---

## #2 — No Component Abstraction: `src/components/` Is Empty

**Where:** Every page file — `resultat.js`, `terminliste.js`, `kastere.js`, `pamelding.js`, etc.

**Why it's a problem:** All UI is built by assigning multi-hundred-line template literal strings to `.innerHTML`. This violates the core architectural rule in CLAUDE.md and makes the codebase untestable, bug-prone, and impossible to reuse. The same card layout, the same table row, the same error banner is copy-pasted across a dozen files with slight variations. When the design changes, every copy must be updated by hand.

**Suggested fix:** Create component factory functions (e.g., `createErrorBanner`, `createTableRow`, `createKortKort`) in `src/components/`. Each page should call these factories and append the returned elements — no more innerHTML string assembly in page files.

---

## #3 — Massive Code Duplication Across Files

**Where:** Spread across almost every file.

**Why it's a problem:** The same logic is reimplemented 3–5 times with slight variations, meaning bugs must be fixed in multiple places and any behavioral difference between copies is a latent bug.

Key duplicated patterns found:

| Pattern | Locations |
|---|---|
| `kasterNavn()` person name formatting | `resultat.js:66`, `kastere.js`, `norgesranking.js` + `utils/kaster.ts` (authoritative) |
| Date parsing `+ 'T12:00:00'` | `resultat.js:143`, `minside.js:89`, `terminliste.js:127` |
| HTML escape function | `rekorder.js:29` (`escAttr`, handles `&`), `stevneadmin.js` (`_esc`, skips `&`) — two different implementations |
| Dropdown option builder | `kasteradmin.js:87` (`_opt`), `terminliste.js:99` (`dropdownOptions`) — same logic, different signatures |
| Filter/search event handler boilerplate | Repeated in `kastere.js`, `terminliste.js`, `norgesranking.js`, `minside.js` |
| Loading/error skeleton HTML | `style="text-align:center;margin-top:40px;"` copy-pasted verbatim into at least 8 files |

**Suggested fix:** Consolidate into `src/utils/`: `formatKasterNavn()` (already exists — import it), `parseLocalDate()`, `escapeHtml()`, `buildDropdownOptions()`. Delete the copies.

---

## #4 — Inline Styles Epidemic in `.ts`/`.js` Files

**Where:** Every page and admin file. `rekorder.js`, `klubber.js`, `terminliste.js`, `logginn.js`, `pamelding.js`, `stevneadmin.js`, `kamp-scoreboard.js`, `kasteradmin.js`.

**Why it's a problem:** CLAUDE.md explicitly forbids CSS inside `.ts` files. Beyond the rule, inline styles break dark/light mode (hardcoded colors bypass CSS variables), cannot be overridden cleanly, make responsive design harder, and scatter visual intent across JS logic. The same `style="text-align:center;margin-top:40px;"` string appears verbatim in at least 8 files.

Representative examples:
- `rekorder.js:120`: `style="text-align:center;font-size:1.4rem;font-weight:bold;margin-bottom:4px;color:#555"` — hardcoded color, zero CSS variable usage
- `klubber.js:90`: `style="width:80px;height:80px;object-fit:contain;background:#ddd;border-radius:4px"` — hardcoded background
- `kamp-scoreboard.js:41`: `style="text-align:center;margin-top:40px;color:red"` — literal `red`

**Suggested fix:** Move every repeated inline style to a named class in `src/styles.css`. Replace hardcoded colors with the CSS variables already defined in `src/global.css` (e.g., `var(--tekst-3)`, `var(--kant)`).

---

## #5 — Scoreboard Section Has Zero Dark/Light Mode Support

**Where:** `src/styles.css` lines ~1140–1522, all `.sb-*` classes.

**Why it's a problem:** The entire scoreboard section is hardcoded with raw hex values: `#000`, `#111`, `#1e4976`, `#4cff4c` (bright green), `#c0392b` (red), etc. None use `var(--...)`. The rest of the app has a working dark/light mode system in `global.css`, but the scoreboard section completely ignores it. Switching to light mode while the scoreboard is on-screen will look broken.

Notable offenders:
- `.sb-overlay`: `background:#000`
- `.sb-spelar-namn`: `color:#4cff4c` (neon green — invisible in light mode on white)
- `.sb-neste-btn--bekreft`: `background:#1a8f2d` (not in any CSS variable)
- `.sb-rod` / `.sb-groen`: class names encode color, not meaning

**Suggested fix:** Define scoreboard-specific CSS variables in `global.css` under both `[data-theme="dark"]` and `[data-theme="light"]`. Rename `.sb-rod`/`.sb-groen` to `.sb-negativ`/`.sb-positiv`.

---

## #6 — `select("*")` in Production Supabase Queries

**Where:**
- `src/pages/rekorder.js:39` — `from('kaster_rekorder').select('*')`
- `src/admin/stevneadmin.js:22` — `from('stevne').select('*')`
- `src/admin/klubbadmin-side.js:12` — `from('klubb').select('*')`
- `src/admin/kasteradmin.js:20` — `from('kaster').select('*')`
- `src/utils/norgescup.ts:61` — `from('antallTellendeNc').select('*')`

**Why it's a problem:** CLAUDE.md explicitly prohibits `select("*")` in production. It overfetches columns (bandwidth waste), disables TypeScript's column-level type inference, and makes the code brittle when columns are added or removed. In `rekorder.js` this already caused a real bug: both `item.klubb_namn` and `item.klubb_navn` are accessed — one is almost certainly a typo from an inconsistent view column name that would have been caught with an explicit select.

**Suggested fix:** Replace each `select('*')` with an explicit column list. Use `norgescupen.ts` as the model — its queries list exactly what they need.

---

## #7 — Unsafe Type Casts Without Validation

**Where:**
- `src/utils/auth.ts:28` — `profil as Profil | null` and `auth?.profil?.rolle as Rolle`
- `src/utils/norgescup.ts:171` — `filter(Boolean)` then `as string[]`
- `src/utils/norgescup.ts:142` — `liste[i][poengFelt] as number`

**Why it's a problem:** CLAUDE.md forbids `as unknown as SomeType` casts that silence errors. These casts assert a type on database-returned data without runtime validation. If Supabase returns an unexpected shape (schema drift, null field, new migration), the cast silently "succeeds" and passes malformed data downstream. The `as Rolle` cast in `auth.ts` is particularly dangerous because it gatekeeps admin access — a wrong role value could give or deny access incorrectly.

**Suggested fix:** Add type guard functions (e.g., `isProfil(obj): obj is Profil`) that validate the object shape at runtime before casting. This is especially important for `auth.ts`.

---

## #8 — Error Handling Gaps: Errors Are Never Logged

**Where:** Everywhere — `resultat.js:130–141`, `terminliste.js:211`, `kastere.js:488`, `norgesranking.js:290`, `pamelding.js:168`, and more.

**Why it's a problem:** The error handling pattern across the codebase is:
```js
if (error) {
  container.innerHTML = `<p class="feil">Kunne ikkje laste X.</p>`
  return
}
```
The actual `error` object is silently discarded. There is no `console.error(error)`, no logging service, nothing. When something breaks in production there is zero diagnostic information. Additionally, several `Promise.all()` calls (e.g., `stevne.ts:27`) are not wrapped in try/catch, so a rejected promise will surface as an unhandled rejection.

**Suggested fix:** Create a `logError(context: string, error: unknown)` utility in `src/utils/` that at minimum does `console.error`. Replace all silent error discards with a call to it. Wrap multi-fetch `Promise.all` calls in try/catch.

---

## #9 — Accessibility: Click-Only Interactions with No Keyboard Support

**Where:**
- `norgesranking.js` — `.nc-poeng-celle` click to expand row details
- `rekorder.js:180` — `.rek-poeng-celle` click to expand
- `norgescupen.ts:87` — expand/collapse on poengsum click
- Tab switching in `logginn.js`, `minside.js`, `kastere.js` — manual tab logic without `role="tablist"` / `role="tab"` / `aria-selected`

**Why it's a problem:** These are interactive controls with no keyboard equivalent. A user navigating by keyboard or using a screen reader cannot trigger them. The custom tab implementations also lack the required ARIA attributes. This is a WCAG 2.1 Level A failure (keyboard accessibility) and WCAG 2.1 Level AA failure (name, role, value).

**Suggested fix:** Add `tabindex="0"` and a `keydown` handler (`Enter`/`Space`) to every click-to-expand cell. Refactor tab implementations to use `role="tablist"`, `role="tab"`, `aria-selected`, and proper focus management.

---

## #10 — HTML Escaping Is Inconsistent, Creating Latent XSS Risk

**Where:**
- `rekorder.js:29–30` — defines `escAttr()` (escapes `&`, `"`)
- `stevneadmin.js` — defines `_esc()` (escapes `"` only, **misses `&`**)
- `resultat.js:78` — `${kasternavn(r.kaster)}` injected directly into innerHTML with **no escaping at all**
- `kastere.js`, `nmvinnere.js`, `norgesranking.js` — athlete names, club names, event titles interpolated directly into HTML template strings

**Why it's a problem:** Most names and titles come from the database, so in practice the data is trusted. But the escaping is inconsistent enough that a single rogue record (or a future user-submitted field) could inject HTML. The two different escape implementations disagree on whether `&` is dangerous (it is). The code cannot be audited for XSS safety when some paths have no escaping at all.

**Suggested fix:** Create a single `escHtml(value: string): string` in `src/utils/` that handles `&`, `<`, `>`, `"`. Replace `escAttr` and `_esc` with it. Systematically apply it to all user-sourced strings interpolated into innerHTML.

---

## Prioritized Fix Order

| Priority | Problem | Reason |
|---|---|---|
| 1 | **#8 Error logging** | Near-zero cost, immediate production debuggability |
| 2 | **#6 select("*")** | Quick wins per file, fixes real bug in rekorder.js |
| 3 | **#10 HTML escaping** | Security; consolidate two functions into one |
| 4 | **#7 Unsafe casts** | Auth correctness; auth.ts especially |
| 5 | **#3 Code duplication** | Foundation for further cleanup |
| 6 | **#4 Inline styles** | Can be done file-by-file alongside #1 migration |
| 7 | **#5 Scoreboard dark mode** | Self-contained CSS-only fix |
| 8 | **#1 JS → TS migration** | High leverage but high effort; do after #3–#6 reduce noise |
| 9 | **#2 Component abstraction** | Biggest architectural lift; do last when patterns are settled |
| 10 | **#9 Accessibility** | Important but requires careful UX decisions per widget |
