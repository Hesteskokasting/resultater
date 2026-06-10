# Par/Mix Competition Support

## Context

The app currently only supports Singel (singles) competitions. Par (doubles) and Mix (mixed doubles) use the same match structure but players compete as a two-person team — scores are combined per pair, and each player stays on an assigned court side for the whole match. The existing `kategori` table has Par and Mix rows with `erlagbasert = true` (already set). No pair-grouping concept exists in the schema yet.

---

## Schema Changes (Phase 1 migration)

**Migration file:** `supabase/migrations/20260610100000_add_par_support.sql`

### Columns added to `pamelding`

```sql
ALTER TABLE public.pamelding
  ADD COLUMN lag_id   integer,      -- groups two players into a team per stevne
  ADD COLUMN posisjon smallint;     -- 1 = side A, 2 = side B (reusable for Lag: 1–4)
```

`pamelding.lag_id` is the pre-tournament pair assignment. The value is a simple integer unique within the stevne — the service computes `max(lag_id) + 1` for the stevne when creating a new pair. `pamelding` can be deleted after a stevne is complete; pair identity is preserved in `resultat.startnummer` and `resultat.posisjon` (see below).

### Column added to `resultat`

```sql
ALTER TABLE public.resultat ADD COLUMN posisjon smallint;
```

When match generation runs, `pamelding.posisjon` is copied to `resultat.posisjon`. This persists the side assignment after `pamelding` is deleted. The scoreboard then uses `resultat(stevneid, kasterid).{startnummer, posisjon}` — `startnummer` identifies the team, `posisjon` identifies the court side.

### Mix gender trigger (DB enforcement)

```sql
CREATE FUNCTION public.validate_mix_pamelding() RETURNS trigger
-- fires AFTER INSERT OR UPDATE OF lag_id ON public.pamelding
-- if stevne.kategori.navn ILIKE '%mix%' AND lag_id IS NOT NULL,
-- raises P0001 if both players in this lag_id group share the same kjonnid
```

This is the only name-sniff in the plan — acceptable because it is isolated to a single trigger and enforces a rule with no schema equivalent.

### No new table. No new `kamp_spelar` column.

`kategori.erlagbasert` (already true for Par and Mix) is the dispatcher signal. After match generation, pair identity flows from `resultat.startnummer` (same value for both players in a pair). `kamp_spelar` is unchanged.

---

## Phase 1 — Schema + Pair Management UI

**Goal:** Admin can assign registered players into pairs. No match logic yet.

### Modified service: `src/services/pameldingService.ts`

Add:
- `hentParForStevne(stevneid)` — selects `pamelding WHERE lag_id IS NOT NULL`, grouped by `lag_id`, with both kasters joined. Returns `PameldingPar[]`.
- `opprettPar(stevneid, kasterAId, kasterBId)` — writes `lag_id` and `posisjon` to both players' `pamelding` rows.
- `slettPar(stevneid, lagId)` — sets `lag_id = NULL, posisjon = NULL` on both rows.

### Modified page: `src/pages/stevne/stevne-deltakere.ts`

The page fetches `kategori(id, navn, erlagbasert)` on the stevne. When `erlagbasert` is true, a **"Parar"** tab is added via `createTabs()`.

**Drag-and-drop pair assignment (native HTML5 DnD — no new library):**

The Parar tab shows:
- Left column: unpaired registered players as draggable cards (`draggable="true"`)
- Right column: pair slots — each pair slot has two drop zones ("Side A" / "Side B")
- Admin drags a player card and drops it onto a slot; the slot fills in and the player is removed from the unpaired list
- Once both slots in a pair are filled, an "Opprett par" button appears for that pair; click confirms the write to DB
- Mix shows a warning badge if same gender is detected client-side (DB trigger provides the hard stop)
- Each confirmed pair row shows both names and a delete button (calls `slettPar`)

The existing player-registration columns become the first tab ("Spelarar"); pair assignment is the second tab ("Parar"). The "Parar" tab only appears when `erlagbasert` is true.

---

## Phase 2 — Match Generation for Par/Mix

**Goal:** Match generator treats pairs (by `lag_id`) as the unit of competition.

**Modified service:** `src/services/kampGenereringInnledendeService.ts`

New function `genererInnledendeKamperPar(stevneid, kastemetodeNavn, antallRunder)`:
1. Reads `pamelding WHERE lag_id IS NOT NULL`, grouped by `lag_id`.
2. Passes `lag_id` values (not kasterids) to the existing `buildCascadePairs` / `buildSwissRunde1Pairs` algorithms — they work on integer IDs, no change needed.
3. For each match, inserts **4** `kamp_spelar` rows (both players from each `lag_id`).
4. Creates one `resultat` row per kaster. Both members of a pair get the **same `startnummer`**. `posisjon` is copied from `pamelding.posisjon` into `resultat.posisjon`.

**Dispatcher change:** `src/pages/stevne/stevne-innledende.ts` — route to `genererInnledendeKamperPar` when `kategori.erlagbasert` is true. Remove any `navn.includes(...)` checks in this dispatcher.

> Cup generation (`kampGenereringCupService.ts`) is **not** part of this phase — moved to Phase 5 step 1. (Originally sketched here as lag_id-based; superseded by the startnummer/representative design.)

---

## Phase 2.5 — Match List & Standings Grouping (innledende + avsluttende UI)

**Goal:** The match lists and standings tables render a pair as **one unit** — one name label per match side, one standings row per pair. (The dispatchers `stevne-innledende.ts`/`stevne-avsluttende.ts` need no changes — the rendering lives in the shared base renderers.)

### New pure helpers in `src/utils/kamp.ts`

- `getMatchSides(spelarar, startnrMap, posisjonMap)` — generalizes `hentP1P2`: groups a match's `kamp_spelar` rows by `resultat.startnummer` into two sides. Each side is `{ rep, members }` — `members` ordered by `posisjon` (1 for Singel, 2 for Par/Mix), `rep` is the posisjon-1 player whose row carries the side's score and omgangar. For Singel this is behavior-identical to `hentP1P2`.
- `groupStandingsByPair(rows, posisjonMap)` — collapses standings rows that share a `startnummer` into one row (rep's values, names joined with " / ").

### Modified service: `src/services/resultatService.ts`

`hentResultatForInnledende` and `hentResultatForAvsluttende` select `posisjon` (needed to order pair members and pick the representative).

### Modified: `src/organizer/org-shared.ts`

- `renderSpelarkamparDetalj` — resolve the opponent **by side** (different startnummer), not "the other kasterid" (which would pick the player's own partner in Par). Opponent label = joined member names.
- `renderStillingTabell` — new opts `posisjonMap` (threaded to the detail rows) and `unitLabel` (title shows "4 par" instead of "8 spelarar").
- `byggInnledendeSpelMap` — walkover exclusion becomes side-based (the old `hentP1P2`-based check would wrongly exclude the bye pair's own partner).

### Modified: `src/pages/stevne/innledende/innledendeBase.ts`

- Detect Par from data: any `startnummer` shared by 2+ kasterids in `resultat` (no kategori fetch needed).
- Replace `hentP1P2` with `getMatchSides`; all score/confirm logic uses `side.rep` where it used `p1`/`p2`.
- Name labels: pair sides show `"Fornavn E. / Fornavn E."` (new `kasterNavnKort()` in `@/utils/kaster`, also reused by the existing mobile rows).
- Stilling: collapse with `groupStandingsByPair` before `sorterStilling` when Par.
- Match confirmation still sends only the rep rows — partner write-back is Phase 4.

### Avsluttende (spec now, implement with Phase 5)

Same grouping via `getMatchSides`/`groupStandingsByPair` in `buildAvsluttendeStilling` and the variant renderers (`cup.ts`, `kongelag.ts`, `nordhordland.ts`). Deferred until Par cup generation exists — there is nothing to render before then.

---

## Phase 3 — Scoreboard for Par/Mix (4 players, same design)

**Goal:** Score entry for a Par match using the existing scoreboard design.

**Modified service: `src/services/kampService.ts`** — `hentHcp` + `hentStartnrMap` (both only used by the kamp page, both querying the same `resultat` rows) merged into one `hentKampResultatInfo(stevneid, kasterids)` returning `{ startnrMap, posisjonMap, hcpMap }` in a single query. No scoreboard-query change needed — the side grouping happens client-side via the maps.

**Modified component:** `src/components/Scoreboard.ts`

The scoreboard design is **unchanged**. New optional `p1Navn`/`p2Navn`/`p3Navn` label overrides and `p1Ids`/`p2Ids` (side member kamp_spelar ids, posisjon order) in `ScoreboardOptions`; when absent, names/ids come from the rep as before. For Par:
- The sides each represent a PAIR, not a single player
- Name label shows `"Fornavn E. / Fornavn E."` (posisjon 1 / posisjon 2)
- Score buttons enter the thrower's score for the omgang (same buttons, same constraints)
- **Members alternate omgangar**: posisjon 1 throws omgang 1, 3, 5…, posisjon 2 throws 2, 4, 6… Each `kamp_omgang` row is written to the actual thrower's `kamp_spelar_id` (`getOmgangThrowerId` in `@/utils/kamp` — round-robin, so it generalizes to Lag). Reads group rows by side membership.

**Modified page:** `src/pages/kamp.ts`

Uses `getAllMatchSides` (returns N sides, not hardcoded to two — covers the 3-pair avsluttende case) to group `kamp.spelarar` by startnummer. `p1ks`/`p2ks`/`p3ks` are the side reps; pair labels passed via the new Scoreboard options.

---

## Phase 4 — Match Confirmation (innledende) for Par/Mix

**Goal:** Pair-level `kamp_poeng` on match confirmation — extend the existing function.

**Modified service:** `src/services/kampService.ts`

Extend `bekreftInnledendeKamp` with optional Par parameters (`p1PartnerId`/`p2PartnerId` — the partner's `kamp_spelar.id`; no partner score data or HCP needed):

```typescript
export async function bekreftInnledendeKamp(params: {
  kampId: number
  p1: KampSpelarBekreftData | null
  p2: KampSpelarBekreftData | null
  hcp1: number
  hcp2: number
  erWalkover?: boolean
  // Par additions (optional):
  p1PartnerId?: number | null  // kamp_spelar.id of posisjon=2 player in team 1
  p2PartnerId?: number | null  // kamp_spelar.id of posisjon=2 player in team 2
}): Promise<{ error: unknown }>
```

`buildKampSpelarUpdates` (pure, fully tested) is side-based: each player's `score_poeng` and `antall_ringer` come from their **own** `kamp_omgang` rows (members alternate omgangar), while `kamp_poeng` comes from the **side totals** and is written identically to every member of the side. Side HCP, walkover 21, and quick-score fallback land on the rep so the side sum stays correct. Singel path = a side with one member, behavior unchanged. (No `resultat` writes — standings are computed from `kamp_spelar`.)

**Standings consequence:** a pair's SP is the SUM of both members' `score_poeng` — implemented in `groupStandingsByPair` (stilling), the unified Swiss ranking, the match-list score display (`sideScore` in `innledendeBase`), and the stilling detail rows.

Callers wired: `src/pages/kamp.ts` (`onBekreft`) and `innledendeBase.ts` (`bekreftKamp`) both pass `side.members[1]?.id` as the partner ids. `testDataService.autoFullforInnledendeKamper` is also side-aware.

---

## Phase 5 — Cup Generation, Avsluttende UI & Finals for Par/Mix

**Goal:** The avsluttende phase treats pairs as bracket units, end to end.

**Identity model — NOT `lag_id`:** `lag_id` is the pre-tournament pairing in `pamelding`; the persistent pair identity after match generation is `resultat.startnummer`, which the whole innledende pipeline already keys on. The cup reuses the same representative pattern as Swiss: the pairing algorithms (`beregnCupRundeParingar`, `gyldigeRunde1Oppsett`, `beregnCupStruktur`, group splits in `gruppefordelingUi.ts`) receive **one `{kasterid, plassering}` entry per pair** (the posisjon-1 rep) and need **zero changes** — n is the number of pairs, walkover counts and 3-per-bane formats work unchanged. Only the edges change.

### Step 1 — Cup generation (`kampGenereringCupService.ts`) — do this first

- `_insertCupParingar` takes a `memberMap: Record<number, number[]>` (rep kasterid → all side member kasterids, ordered by posisjon; singleton for Singel — same trick as `posToKasterids` in the innledende generator). Each unit in a paring expands to one `kamp_spelar` row per member. A 3-pair bane = 6 rows with `er_tre_spelarar = true`.
- `memberMap` is built from `resultat (kasterid, startnummer, posisjon)`.
- `genererFinaleOgBronsefinale`: rank each semifinal's **sides** (group `kamp_spelar` rows by startnummer, sum members' omgang scores — members alternate omgangar) instead of individual rows; advance the winning side's rep, expand via `memberMap` on insert.
- `setGruppeInndeling` callers in `cup.ts`: expand rep → both members so both resultat rows get `gruppeid`.

### Step 2 — Avsluttende UI grouping (deferred from Phase 2.5)

- `buildAvsluttendeStilling` output pair-grouped via `groupStandingsByPair` (one stilling row per pair; SP summed) before gruppefordeling and round generation consume it. `posisjonMap` and `erLag` live on `AvsluttendeContext`.
- `cup.ts` renders one row per SIDE in match blocks (`kampSider` + shared `sideNavnHtml`), with side sums for scores and side-rep `kamp_plassering` for eliminated/advanced styling. Quick-score writes the side total to the rep and zeroes partner rows. The 3-side confirm dialog picks SIDES (rep-keyed buttons). Gruppe assignment expands each stilling row to all pair members (`buildGruppeUpdates`).
- `bekreftCupKamp`/`oppdaterVinnarTapar` take member arrays (`eliminertIds`, `vidareSider`/`nyVinnarIds`/`nyTaparIds`) so every member of a side gets the same writes.
- `renderScoreboard3` takes `p1Ids`/`p2Ids`/`p3Ids` — totals, win-order, and omgang inserts are side-membership based with thrower alternation via `getOmgangThrowerId`.
- **Out of scope:** `kongelag.ts` and avsluttende `nordhordland.ts` variants — Par/Mix stevner use cup for the avsluttende phase.

### Step 3 — Elimination RPC

**New migration:** `supabase/migrations/<timestamp>_rpc_bekreft_avsluttende_kamp_v6.sql`

**No new parameter.** The function keeps its signature — `(p_kamp_id, p_eliminert_kasterid)` — and resolves the eliminated UNIT internally: look up `p_eliminert_kasterid`'s `startnummer` in `resultat` for this stevne; everyone sharing it is the eliminated side. For Singel every group has one member, so behavior is byte-identical and the existing pgTAP test passes unchanged.

Body changes:
- Eliminated side's `kamp_plassering`: `kasterid IN (<group>)` instead of `= p_eliminert_kasterid`; winners stay `NOT IN`.
- Eliminated place = number of SIDES, not rows: `COUNT(DISTINCT startnummer)` over the kamp's players (a Par match has 4 rows but 2 sides; identical count for Singel).
- Finale/Bronsefinale `plassering` and `runde_eliminert`: written to all members of each side's group.
- 3-pair matches (6 players): the group resolution identifies the one eliminated pair; the other two advance — no special handling.

**Client change:** `buildEliminertKasterid` must compare SIDE totals (sum both members' omgang rows — members alternate omgangar, so a rep's rows alone are half the side). Any member's kasterid then works as `p_eliminert_kasterid`.

---

## Phase 6 — Standings and Results Display

No special code needed. Standings grouping is handled by Phase 2.5 (`groupStandingsByPair` collapses pair members into one row), and both players in a pair carry identical `kamp_poeng_innl`/`score_poeng_innl`, so `sorterStilling` ranks the collapsed rows correctly without modification.

---

## Phase Dependency Graph

```
Phase 1 (Schema + Pair UI)
    └── Phase 2 (Match Generation)
            └── Phase 2.5 (Match List & Standings Grouping)
                    └── Phase 3 (Scoreboard)
                            └── Phase 4 (Innledende Confirmation)
                                    └── Phase 5 (Cup/Finals + avsluttende UI grouping)
                                            └── Phase 6 — no code needed
```

---

## Key Files

| File | Phase |
|------|-------|
| `supabase/migrations/20260610100000_add_par_support.sql` | 1 |
| `src/services/pameldingService.ts` | 1 |
| `src/pages/stevne/stevne-deltakere.ts` | 1 |
| `src/services/kampGenereringInnledendeService.ts` | 2 |
| `src/services/kampGenereringCupService.ts` | 2, 5 |
| `src/utils/kamp.ts` | 2.5 |
| `src/utils/kaster.ts` | 2.5 |
| `src/services/resultatService.ts` | 2.5 |
| `src/organizer/org-shared.ts` | 2.5 |
| `src/pages/stevne/innledende/innledendeBase.ts` | 2.5 |
| `src/pages/stevne/avsluttende/avsluttendeBase.ts` + variants | 2.5 (spec), 5 (impl) |
| `src/services/kampService.ts` | 3 (query), 4 |
| `src/components/Scoreboard.ts` | 3 |
| `src/pages/kamp.ts` | 3 |
| `supabase/migrations/<timestamp>_rpc_bekreft_avsluttende_kamp_v6.sql` | 5 |

---

## Verification

**Phase 1:** Register 4 players in a Par stevne. Assign them to pairs via drag-and-drop in the Parar tab. Confirm `pamelding.lag_id` and `pamelding.posisjon` are set. Test Mix gender block via DB trigger.

**Phase 2:** Generate preliminary rounds. Inspect `kamp_spelar` — 4 rows per match. Both players in a pair share the same `resultat.startnummer` and have `resultat.posisjon` set.

**Phase 2.5:** Open the innledende page for a Par stevne. Each match row shows one label per side ("Fornavn E. / Fornavn E."), the stilling tab shows one row per pair with joined names and the title counts pairs. Expanding a stilling row shows the opposing *pair* (not the partner) as motstandar. A Singel stevne renders exactly as before.

**Phase 3–4:** Play a match — scoreboard shows pair names as "A / B". Enter scores and confirm. Verify both players in the pair have identical `kamp_poeng` in `kamp_spelar`. Verify `score_poeng` and `antall_ringer` is correct for each player in `kamp_omgang`.

**Phase 5:** Run a Par tournament through finals. Both winning pair members get `plassering = 1` in `resultat`. Both losing pair members get `runde_eliminert` set.

**Run a singel stevne** Verify that a normal singel stevne runs as before.

---

## Out of Scope

**Lag (teams of 4):** `pamelding.lag_id` and `posisjon` (1–4) already support Lag schema-wise. Match generation, scoreboard, and confirmation logic for 4-player teams are a separate plan.
