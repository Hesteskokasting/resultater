# Scoreboard Migration Checklist

## Goal
- Move `scoreboard.js` out of `organizer/` → `src/components/Scoreboard.ts` (shared, configurable)
- Rename `kamp-scoreboard.js` → `src/pages/kamp.ts` (route handler only)
- Extract kamp Supabase queries → `src/services/kampService.ts`
- Do Phase 3 CSS fix alongside (scoreboard dark/light mode)

## Architecture decisions
- `Scoreboard.ts`: shared two-panel UI component, takes `pointValues: number[]` as prop
- Supabase calls for `kamp_omgang` stay inside `Scoreboard.ts` for now (Option A — refactor when X-kast is built)
- Route stays `#/kamp/{id}`

---

## Steps

- [ ] **Step 1** — Create `src/services/kampService.ts`
  - Extract kamp + HCP queries from `kamp-scoreboard.js` (the initial data fetch)
  - Extract "hent neste kamp" queries (organizer + participant variants)
  - Types from generated supabase types

- [ ] **Step 2** — Migrate `src/organizer/scoreboard.js` → `src/components/Scoreboard.ts`
  - Add `pointValues: number[]` prop (replaces hardcoded `POENG_VERDIAR`)
  - Full TypeScript migration (no `any`, typed kamp/spelar shapes)
  - Keep internal `kamp_omgang` Supabase calls (Option A)
  - Move matching CSS vars/fixes (Phase 3 CSS)

- [ ] **Step 3** — Migrate `src/pages/kamp-scoreboard.js` → `src/pages/kamp.ts`
  - Import from `kampService.ts` (no direct supabase calls)
  - Import `Scoreboard` from `components/Scoreboard.ts`
  - Pass `pointValues={[1,2,3,4,6]}` to Scoreboard

- [ ] **Step 4** — Update `src/app.js`
  - Change import: `kamp-scoreboard.js` → `kamp.js`
  - Change route handler name: `renderKampScoreboard` → `renderKamp`

- [ ] **Step 5** — Delete old files
  - `src/pages/kamp-scoreboard.js`
  - `src/organizer/scoreboard.js`

- [ ] **Step 6** — Phase 3 CSS: scoreboard dark/light mode
  - Add scoreboard CSS variables to `global.css` for both themes
  - Replace hardcoded hex values in `.sb-*` classes with `var(--...)`
  - Rename `.sb-rod` → `.sb-negativ`, `.sb-groen` → `.sb-positiv`
  - Test both light and dark mode

- [ ] **Step 7** — `npm run typecheck` → 0 errors

- [ ] **Step 8** — Manual test
  - Navigate to a kamp as organizer (can score, confirm)
  - Navigate to a kamp as participant (can score)
  - Navigate to a kamp as public (read-only, no buttons)
  - Confirm navigates to next kamp
  - Light mode + dark mode
