# Test setup for `resultater` — task list for Claude Code

## Working rules (read first, always follow)

1. **Do only one item at a time.** Never start the next item until I explicitly say "continue", "ok next", or similar.
2. **Stop and wait after each item.** When an item is done: summarise briefly what you did, show the suggested commit message, and wait. Do not continue on your own initiative.
3. **Update this file as you go.** When an item is done: change `[ ]` to `[x]`, and write a short note under the item about what was actually done / files changed / deviations. Use `[~]` if an item was partially done or had to be changed.
4. **One commit per item.** Use the given commit message (adjust if content differs). **Commit, but do not push** — I push myself so we don't trigger GitHub Actions / Pages deploys mid-work.
5. **Keep the build green.** Before each commit: run `npm run typecheck`, `npm run typecheck:test`, and `npm run test:run`. Do not commit if anything fails — fix it or ask first. Note: Vitest transpiles tests with esbuild (no type checking), so `test:run` alone won't catch type errors in test files — `typecheck:test` exists specifically for that.
6. **No scope creep.** Only touch what the item covers. If you see something else that needs fixing, *mention* it to me — don't fix it silently.
7. **Ask if anything is unclear.** If you can't find the relevant function, or there are multiple candidates, ask before guessing. Don't write tests against a made-up API.

Legend: `[ ]` not done · `[x]` done · `[~]` partial / changed

---

## Phase 0 — Setup

- [x] **0.1 Set up Vitest with happy-dom**
  - Install dev dependencies: `vitest` and `happy-dom`.
  - Add a `test` block to `vite.config.js` (`environment: 'happy-dom'`, `globals: true`, `include: ['tests/**/*.test.ts']`).
  - Handle TypeScript globals: add `"vitest/globals"` to the `types` array in `tsconfig.json`. If that causes issues with the main build, create a `tsconfig.test.json` that extends the root and overrides `include` to cover `tests/`.
  - Add scripts to `package.json`: `"test": "vitest"`, `"test:run": "vitest run"`, and `"typecheck:test": "tsc --noEmit -p tsconfig.test.json"`.
  - Create `tests/smoke.test.ts` with one trivial assertion (`expect(1 + 1).toBe(2)`) and verify `npm run test:run` passes green.
  - **commit:** `chore: set up vitest with happy-dom and smoke test`
  - _Note: include path is `../tests/**/*.test.ts` (not `tests/`) because vite.config.js sets `root: 'src'`, making Vitest resolve patterns relative to `src/`. Created `tsconfig.test.json` (not modifying root tsconfig) to avoid leaking vitest globals into src. Files changed: `vite.config.js`, `tsconfig.test.json`, `package.json`, `tests/smoke.test.ts`._

---

## Phase 1 — Pure computation (no DOM, no Supabase)

- [x] **1.1 Test match point calculation (`beregnKampPoeng`)**
  - File: `src/utils/kamp.ts`
  - Cover: winner gets [2, x], loser gets [x, 2], tie returns [1.5, 1.5], edge cases (zero scores, equal non-zero scores).
  - **commit:** `test: cover beregnKampPoeng in kamp.ts`
  - _Note: 11 tests in tests/kamp.test.ts. Boundary cases at score=11 (1 pt) and score=10 (0 pt) explicitly covered. Rule confirmed: loser gets 1 pt if score ≥ 11, else 0._

- [x] **1.2 Test score and ring extraction (`scoreForSp`, `ringerForSp`, `calcAntallRinger`)**
  - File: `src/utils/kamp.ts`
  - Cover: extraction from omgangar data vs cached score_poeng / antall_ringer fields; ring derivation (6→2 rings, 3-4→1 ring, else→0).
  - **commit:** `test: cover scoreForSp, ringerForSp, calcAntallRinger in kamp.ts`
  - _Note: 22 tests appended to tests/kamp.test.ts (34 total). Also added tests/tsconfig.json extending tsconfig.test.json so the IDE resolves vitest globals correctly._

- [x] **1.3 Test standings sort (`sorterStilling`)**
  - File: `src/organizer/org-shared.ts` (not shared.ts — the exploration agent had the wrong path)
  - Cover the full tie-break cascade: final placement → active vs eliminated → elimination round → kamp_poeng → score_poeng → head-to-head → individual match max scores → start number. Each tie-break level should have at least one test that confirms it is decisive.
  - **commit:** `test: cover sorterStilling in org-shared.ts`
  - _Note: 11 tests in tests/sorterStilling.test.ts. Each test isolates exactly one tiebreak level. Also covers: unconfirmed matches are ignored in h2h/max-score, input array is not mutated._

- [x] **1.4 Test National Cup rankings (`byggSingelListe`, `byggLagListe`, `tildelPlassering`)**
  - File: `src/utils/norgescup.ts`
  - Cover: point capping per rule (max_nc, max_snc, max_dnc, maxtotal), correct sorting, tie placement, team top-4 aggregation.
  - **commit:** `test: cover norgescup ranking logic`
  - _Note: 13 tests in tests/norgescup.test.ts. `tildelPlassering` is not exported — tested indirectly through both list builders. Covers: NC/SNC/DNC event capping, maxtotal cap, class filtering, descending sort, tie placement (same plassering, next gets N+2), SNC/DNC cup types, top-4 club contributor cap._

- [x] **1.5 Test National Ranking (`byggRankingListe`, `regnUtRingInfo`)**
  - File: `src/utils/norgesrankingLogikk.ts`
  - Cover: ring-to-percentage conversion per method (Minimatch x/60, Halvmatch x/100, Heilmatch x/200, Kongelag x/40), top-5 selection, average calculation, < 5 events marked invalid, tie placement.
  - **commit:** `test: cover norgesranking logic`
  - _Note: 16 tests in tests/norgesranking.test.ts. Also covers: Kongelag is field-based (no method check required), method detection on avslMetode, xkast null with method present, stevneInfo undefined → xkast suppressed but kongelag still appears, valid players before invalid regardless of snittProsent._

---

## Phase 2 — Cup bracket logic

- [x] **2.1 Test cup structure preview (`beregnCupStruktur`)**
  - File: `src/utils/kastemetoder-logikk.ts`
  - Cover: correct number of rounds for various player counts, bye/walkover allocation, valid group sizes returned.
  - **commit:** `test: cover beregnCupStruktur`
  - _Note: 16 tests in tests/beregnCupStruktur.test.ts. Also covers: n=2 returns empty (final is implicit), vidare chains into spelarar for every round, last round always ends at vidare=2, walkovers only in round 1, runde1 override changes round count. Avoided Array.prototype.at() (not in tsconfig target)._

- [ ] **2.2 Test cup round pairing (`beregnCupRundeParingar`)**
  - File: `src/utils/kastemetoder-logikk.ts`
  - Note: the function calls `shuffle()` internally via `Math.random()` — output order is non-deterministic. Tests must assert structural properties only, not fixed ordering.
  - Cover: every player appears exactly once across all matches; no match has fewer than 2 or more than 3 players; seeded mode places top seeds in separate matches (no two top seeds share a match); round 1 produces walkovers when configured; later rounds produce no walkovers.
  - **commit:** `test: cover beregnCupRundeParingar structural properties`
  - _Note:_

---

## Phase 3 — DOM output

- [ ] **3.1 Test DOM output from `renderStillingTabell`**
  - File: `src/utils/shared.ts`
  - Render against happy-dom and verify the table gets the correct rows/columns and content.
  - **commit:** `test: cover DOM output from renderStillingTabell`
  - _Note:_

---

## Phase 4 — Write logic (without a real database)

- [ ] **4.1 Extract write logic from the Supabase call (only if not already done)**
  - File: `src/services/resultatService.ts` — `skrivPlaseringar(stevneid, stilling)`
  - Goal: a pure function that builds the rows to be written to `resultat` at tournament end (e.g. `buildResultRows(stilling) -> ResultRow[]`), separate from the thin wrapper that calls `supabase.from('resultat').insert(...)`.
  - If the logic is already separated: mark this `[~]` and jump to 4.2.
  - **commit:** `refactor: extract buildResultRows from supabase write in resultatService`
  - _Note:_

- [ ] **4.2 Test `buildResultRows`**
  - Given match data, verify the correct rows are produced. The Supabase call itself is stubbed/mocked — we test *what* is written, not that Supabase works.
  - **commit:** `test: cover buildResultRows`
  - _Note:_

---

## Phase 5 — Integration against local Supabase (SEPARATE ROUND — do not start without instruction)

> This is the layer that has historically been risky (RLS, `SECURITY DEFINER` triggers). It requires its own setup and runs against `supabase start` locally, not as normal Vitest unit tests. **Do not begin Phase 5 until I explicitly ask** — we will plan it separately.

- [ ] **5.1 Plan integration test setup** (only when I say so)
  - _Note:_

---

When all items in a phase are `[x]`: give a short summary and wait for instruction before the next phase.
