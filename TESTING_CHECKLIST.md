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

- [x] **2.2 Test cup round pairing (`beregnCupRundeParingar`)**
  - File: `src/utils/kastemetoder-logikk.ts`
  - Note: the function calls `shuffle()` internally via `Math.random()` — output order is non-deterministic. Tests must assert structural properties only, not fixed ordering.
  - Cover: every player appears exactly once across all matches; no match has fewer than 2 or more than 3 players; seeded mode places top seeds in separate matches (players in the same seeding group cannot meet eachother); round 1 produces walkovers when configured; later rounds produce no walkovers.
  - **commit:** `test: cover beregnCupRundeParingar structural properties`
  - _Note: 14 tests in tests/beregnCupRundeParingar.test.ts. Each invariant is asserted 20–50 times via a `repeat()` helper to survive Math.random(). Covers: player coverage (seeded, unseeded, with walkovers), match sizes 2–3, erTreSpelarar flag, seeding pools isolated per match (4-player and 9-player cases), walkover suppressed by default, top seeds walk over in round 1, runde1Oppsett.walkovers controls count._

---

## Phase 3 — DOM output

- [x] **3.1 Test DOM output from `renderStillingTabell`**
  - File: `src/organizer/org-shared.ts` (not shared.ts — the plan had the wrong path)
  - Render against happy-dom and verify the table gets the correct rows/columns and content.
  - **commit:** `test: cover DOM output from renderStillingTabell`
  - _Note: 18 tests in tests/renderStillingTabell.test.ts. Returns HTML string, parsed via innerHTML into a container for querying. Covers: h6 heading ('Stilling' default, 'N spelarar' with harAntallKamper), table id (default and custom), one .stilling-spelar-rad per player, data-kasterid attribute, player name and null fallback, sequential # column, always-present headers (#/NAMN/KP/SP), K and HCP headers toggled by their options, avsl-elim-plass on eliminated cells, group header rows and per-group position reset._

---

## Phase 4 — Write logic (without a real database)

- [x] **4.1 Extract `buildKampSpelarUpdates` from `bekreftInnledendeKamp`**
  - File: `src/services/kampService.ts`
  - Goal: a pure function that takes omgang rows, p1/p2 identity + fallback score, HCP values, and walkover flag, and returns the values to write to `kamp_spelar` for each player. The refactor is small: the DB fallback (re-fetching fresh `score_poeng` when no omgang rows exist) stays in `bekreftInnledendeKamp` as the caller; `buildKampSpelarUpdates` receives the already-resolved scores.
  - Signature:
    ```typescript
    buildKampSpelarUpdates(params: {
      omgData: Array<{ kamp_spelar_id: number | null; score: number | null; antall_ringer: number | null }>
      p1: { spelarId: number; scorePoeng: number } | null
      p2: { spelarId: number; scorePoeng: number } | null
      hcp1: number
      hcp2: number
      erWalkover: boolean
    }): {
      p1: { score_poeng: number; kamp_poeng: number; antall_ringer: number } | null
      p2: { score_poeng: number; kamp_poeng: number; antall_ringer: number } | null
    }
    ```
  - **commit:** `refactor: extract buildKampSpelarUpdates from bekreftInnledendeKamp`
  - _Note: Added exported `OmgRow` type and `buildKampSpelarUpdates` pure function in kampService.ts. `bekreftInnledendeKamp` now resolves DB fallback scores upfront then delegates all computation to `buildKampSpelarUpdates`. The `.update()` call uses the returned object directly. All 122 existing tests still pass._

- [x] **4.2 Test `buildKampSpelarUpdates`**
  - File: `src/services/kampService.ts`
  - Cover:
    - Multi-round match: `score_poeng` and `antall_ringer` are the correct sums across all omgang rows
    - HCP adds to `score_poeng` if scorebaord is used. If match is confirmed directly to kamp_spelar, do not add hcp (and therefore to the `kamp_poeng` calculation) but does **not** affect `antall_ringer`
    - Walkover: p1 gets `{score_poeng:21, kamp_poeng:2, antall_ringer:0}`, p2 gets `{score_poeng:0, kamp_poeng:0, antall_ringer:0}`
    - No omgang rows → uses `scorePoeng` from params as fallback score
    - `null` values in omgang rows treated as 0 (not NaN)
    - Win/loss/tie → correct `kamp_poeng` values
  - **commit:** `test: cover buildKampSpelarUpdates`
  - _Note: 12 tests in tests/buildKampSpelarUpdates.test.ts. Covers: multi-round row summation, null-as-0 safety, baseScore fallback, HCP effect on score_poeng/kamp_poeng but not antall_ringer, walkover exact values (omgData ignored), win/loss/tie kamp_poeng, null player → null result. 134 tests total, all passing._

- [x] **4.3 Extract and test `buildEliminertKasterid` from `bekreftAvsluttendeKamp`**
  - File: `src/services/kampService.ts`
  - Goal: a pure function that takes omgang rows and p1/p2 identity and returns the `kasterid` of the eliminated player. The 3-player case (orderedKasterids) bypasses this function entirely — document that in the test.
  - Cover:
    - Player with lower total score is eliminated
    - ~~Tie → p2 eliminated~~ — removed: ties are impossible by game rules (win-by-2 required)
    - `null` omgang values treated as 0
  - **commit:** `refactor+test: extract and cover buildEliminertKasterid`
  - _Note: 7 tests in tests/buildEliminertKasterid.test.ts. Noted in comments that 3-player case uses orderedKasterids[2] and bypasses this function, and that ties are unreachable. Covers: p1/p2 wins, multi-round summation, null-as-0, scorePoeng fallback (empty omgData and per-player missing rows), both-null returns null. 142 tests total, all passing._

---

## Phase 5 — Integration against local Supabase (SEPARATE ROUND — do not start without instruction)

> This is the layer that has historically been risky (RLS, `SECURITY DEFINER` triggers). It requires its own setup and runs against `supabase start` locally, not as normal Vitest unit tests. **Do not begin Phase 5 until I explicitly ask** — we will plan it separately.

- [ ] **5.1 Plan integration test setup** (only when I say so)
  - _Note:_

---

When all items in a phase are `[x]`: give a short summary and wait for instruction before the next phase.
