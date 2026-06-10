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

**Modified service:** `src/services/kampGenereringCupService.ts` — same principle: use `lag_id` groups as bracket units. `genererFinaleOgBronsefinale` identifies winning pairs (by summing both players' omgang scores) instead of individual players.

---

## Phase 3 — Scoreboard for Par/Mix (4 players, same design)

**Goal:** Score entry for a Par match using the existing scoreboard design.

**Scoreboard query change in `src/services/kampService.ts`:** Extend `_kampScoreboardQuery` to include `resultat(startnummer, posisjon)` joined via `kamp_spelar.kasterid + kamp.stevneid`. Backward-compatible — both columns are NULL for Singel.

**Modified component:** `src/components/Scoreboard.ts`

The scoreboard design is **unchanged**. For Par:
- The two "sides" each represent a PAIR, not a single player
- Name label shows `"Firstname L. / Firstname L."` (side A player / side B player), last names shortened to first initial
- Score buttons enter the pair's **combined** score for the omgang (same buttons, same constraints)
- `kamp_omgang` rows are created for the `posisjon=1` player's `kamp_spelar_id` only (the representative for the pair)

**Modified page:** `src/pages/kamp.ts`

Detect Par: `spelarar.some(s => s.startnummer != null && spelarar.filter(x => x.startnummer === s.startnummer).length > 1)`. (Two players share the same startnummer → Par match.) Group by `startnummer`, sort within group by `posisjon`. Call `renderScoreboard` with the two groups mapped to the existing `p1ks`/`p2ks` params — `p1ks` is the posisjon=1 player's `kamp_spelar` row (the representative).

---

## Phase 4 — Match Confirmation (innledende) for Par/Mix

**Goal:** Pair-level `kamp_poeng` on match confirmation — extend the existing function.

**Modified service:** `src/services/kampService.ts`

Extend `bekreftInnledendeKamp` with optional Par parameters:

```typescript
export async function bekreftInnledendeKamp(params: {
  kampId: number
  p1: KampSpelarBekreftData | null
  p2: KampSpelarBekreftData | null
  hcp1: number
  hcp2: number
  erWalkover?: boolean
  // Par additions (optional):
  p1Partner?: KampSpelarBekreftData | null  // posisjon=2 player in team 1
  p2Partner?: KampSpelarBekreftData | null  // posisjon=2 player in team 2
  hcp1Partner?: number
  hcp2Partner?: number
}): Promise<{ error: unknown }>
```

When `p1Partner` is provided (Par match):
- Sum omgang scores for `p1` + `p1Partner` to get team 1 combined score
- Sum for `p2` + `p2Partner` for team 2
- Call `beregnKampPoeng(team1Total, team2Total)` — unchanged
- Write same `kamp_poeng` to all 4 `kamp_spelar` rows
- Each player's `score_poeng` = the pair's combined total (both players in the pair get the same value)
- Write to `resultat.kamp_poeng_innl` and `resultat.score_poeng_innl` for all 4 players

When `p1Partner` is absent — existing Singel path, unchanged.

---

## Phase 5 — Cup Finals for Par/Mix

**Goal:** Pair-level elimination in the avsluttende phase.

**New migration:** `supabase/migrations/20260610110000_rpc_bekreft_avsluttende_kamp_par.sql`

Extends the existing RPC with a new optional parameter:

```sql
CREATE OR REPLACE FUNCTION public.bekreft_avsluttende_kamp_deltakar(
  p_kamp_id              INT,
  p_eliminert_kasterid   INT DEFAULT NULL,
  p_eliminert_startnummer INT DEFAULT NULL   -- new: identifies eliminated PAIR
)
```

When `p_eliminert_startnummer` is provided:
- Identify all `kasterid` values in `resultat` with this `startnummer` and this `stevneid`
- Write `kamp_plassering = 2` to their `kamp_spelar` rows, `kamp_plassering = 1` to the other pair
- Write `runde_eliminert` to both eliminated players' `resultat` rows
- On Finale/Bronsefinale: write `plassering` to all 4 players

Existing `p_eliminert_kasterid` path is untouched (Singel).

**3-pair cup note:** For 3-pair avsluttende matches (6 players), `p_eliminert_startnummer` identifies which pair is eliminated. The remaining two pairs advance. This works with the same parameter — the function writes elimination data for the one identified pair.

---

## Phase 6 — Standings and Results Display

No special code needed. Both players in a pair have identical `kamp_poeng_innl` and `score_poeng_innl`, so the existing `sorterStilling` and `renderStillingTabell` functions work without modification. Pair members always appear adjacent in standings because they share the same score values. The existing results display shows individual rows — the identical scores make pair membership visible without custom rendering.

---

## Phase Dependency Graph

```
Phase 1 (Schema + Pair UI)
    └── Phase 2 (Match Generation)
            └── Phase 3 (Scoreboard)
                    └── Phase 4 (Innledende Confirmation)
                            └── Phase 5 (Cup/Finals)
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
| `src/pages/stevne/stevne-innledende.ts` | 2 |
| `src/services/kampService.ts` | 3 (query), 4 |
| `src/components/Scoreboard.ts` | 3 |
| `src/pages/kamp.ts` | 3 |
| `supabase/migrations/20260610110000_rpc_bekreft_avsluttende_kamp_par.sql` | 5 |

---

## Verification

**Phase 1:** Register 4 players in a Par stevne. Assign them to pairs via drag-and-drop in the Parar tab. Confirm `pamelding.lag_id` and `pamelding.posisjon` are set. Test Mix gender block via DB trigger.

**Phase 2:** Generate preliminary rounds. Inspect `kamp_spelar` — 4 rows per match. Both players in a pair share the same `resultat.startnummer` and have `resultat.posisjon` set.

**Phase 3–4:** Play a match — scoreboard shows pair names as "A / B". Enter scores and confirm. Verify both players in the pair have identical `score_poeng` and `kamp_poeng` in `kamp_spelar`.

**Phase 5:** Run a Par tournament through finals. Both winning pair members get `plassering = 1` in `resultat`. Both losing pair members get `runde_eliminert` set.

---

## Out of Scope

**Lag (teams of 4):** `pamelding.lag_id` and `posisjon` (1–4) already support Lag schema-wise. Match generation, scoreboard, and confirmation logic for 4-player teams are a separate plan.
