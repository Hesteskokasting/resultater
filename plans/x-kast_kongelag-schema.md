# X-kast & Kongelag — Schema Verification & Implementation Reference

> Verified against live database (project `urtvpewjlevhlevtnvkf`) on 2026-05-19.
>
> **Table-structure decision superseded** by
> [x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md): X-kast and Kongelag get
> their own new tables (`xkast_kongelag` / `xkast_kongelag_deltaker` /
> `xkast_kongelag_omgang`), not a reuse of `kamp`/`kamp_spelar`/`kamp_omgang`. Section 1's
> items about altering `kamp`/`kamp_omgang` and Section 2's migration are therefore no longer
> needed — kept below only as a historical record of what was originally considered, each
> marked superseded. Sections 3–5 are rewritten against the new tables.

---

## Section 1: Verification

### 1.1–1.4, 1.7, 1.8, 1.10 — superseded, no longer applicable

The original plan altered `kamp`/`kamp_omgang` (making columns nullable/NOT NULL, dropping a
constraint, adding trigger guards) so those tables could double as X-kast/Kongelag storage.
Since the schema decision moved to dedicated `xkast_kongelag*` tables instead, **none of that
applies** — `kamp`, `kamp_spelar`, and `kamp_omgang` stay exactly as they are today, used only
by Gloppen/NHM/Cup:

- ~~1.1 `kamp_omgang.score` NOT NULL~~ — not needed, `kamp_omgang` is untouched.
- ~~1.2 `kamp.fase`~~ — moot, X-kast/Kongelag no longer use `kamp.fase` at all.
- ~~1.3 `kamp.gruppe_navn` constraint drop~~ — not needed. Cup's `'A'`/`'B'` constraint stays
  in place, untouched; no service-layer validation has to replace it.
- ~~1.4 `kamp.runde_nummer` nullable~~ — not needed, Cup rows keep requiring it.
- ~~1.7 `kamp` full column list (as it would look post-migration)~~ — moot; see
  [x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md) for `kamp`'s actual
  (unchanged) column list and the new `xkast_kongelag` column list.
- ~~1.8 `kamp_omgang` confirmed shape~~ — moot for X-kast/Kongelag; see
  [x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md) for
  `xkast_kongelag_omgang`'s actual shape (`poeng`, not `score`).
- ~~1.10 Trigger guard for X-kast formats~~ — not needed. `kamp_spelar_sync_innl_poeng` /
  `kamp_sync_innl_poeng` only ever fire on `kamp`/`kamp_spelar` writes, and X-kast/Kongelag
  never write to those tables, so there's no corruption risk to guard against.

### 1.5 `resultat` columns — all confirmed, still accurate

| Column | Type | Nullable | Status |
|--------|------|----------|--------|
| `poeng_xkast` | integer | YES | ✅ |
| `antall_ring_xkast` | integer | YES | ✅ |
| `poeng_kongelag` | integer | YES | ✅ |
| `antall_ring_kongelag` | integer | YES | ✅ |
| `kamp_poeng_innl` | **real** | YES | ✅ (note: `real`, not `integer`) |
| `score_poeng_innl` | integer | YES | ✅ |
| `startnummer` | integer | YES | ✅ |

`kamp_poeng_innl` is `real` (0, 1, 1.5, 2 from win/draw/loss). For Gloppen/NHM → Kongelag carry-over: fractional value passes through directly without rounding. Not shown on the main scoreboard.

Unaffected by the table-structure decision — these remain the target of the X-kast/Kongelag confirm RPCs regardless of which tables feed them.

### 1.6 `kastemetode` rows — data fix already applied

| id | navn | er_innledende | er_avsluttende | Action |
|----|------|--------------|----------------|--------|
| 23 | Minimatch | true | false | ✅ fixed |
| 4 | Halvmatch | true | false | ✅ fixed |
| 10 | Heilmatch | true | false | ✅ |
| 6 | Kongelag | false | true | ✅ |

Minimatch and Halvmatch no longer expose themselves in the avsluttende kastemetode dropdown —
this fix has already been applied. Independent of the table-structure decision.

### 1.9 `stevne` — correction, not used for X-kast/Kongelag round counts

**Correction (superseded from the original verification):** `antall_runder_innl` /
`antall_runder_avsl` are **not** used to drive X-kast or Kongelag omgang counts — wrong table
entirely. Round/omgang count is a property of the **kastemetode**, not the stevne (every
stevne using Minimatch always gets the same 15 omganger).

**Resolved:** new column `kastemetode.antall_omganger` (int, nullable) stores the total omgang
count directly — Minimatch=15, Halvmatch=25, Heilmatch=50, Kongelag=10, NULL for
Gloppen/NHM/Cup. Chosen over hardcoding a TypeScript lookup table: the value travels with the
row, survives a `navn` rename, and is directly queryable by the confirm RPC / score-input UI.
X-kast's "5 omganger per runde" grouping (for the r1/r2/r3 display breakdown) stays a fixed
code constant — display-only, nothing suggests it will vary. See
[x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md).

---

## Section 2: Migration script — superseded

The original five-change migration (altering `kamp`/`kamp_omgang`, dropping a constraint,
rewriting two triggers) is **no longer needed** — none of those tables are touched by
X-kast/Kongelag under the current decision. The `kastemetode` flag fix (former item 4) is
already applied and was never dependent on the table-structure choice.

The actual migration needed now is almost entirely additive — three new `CREATE TABLE`
statements (`xkast_kongelag`, `xkast_kongelag_deltaker`, `xkast_kongelag_omgang`) plus their
FKs, and two new nullable columns: `kastemetode.antall_omganger` (see 1.9) with a data `UPDATE`
to populate it, and `stevne.tilgjengelige_baner` (see "Pulje sizing" in
x-kast_kongelag-pulje-tables.md). Nothing altered or dropped on existing tables/rows' meaning. See
[x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md) for the table definitions
and the constraints/RLS/realtime requirements the migration must include ("Constraints, RLS,
realtime" section there); the `CREATE TABLE` statements themselves are still to be written
(see that doc's "Still to do").

---

## Section 3: Query examples

Rewritten against `xkast_kongelag` / `xkast_kongelag_deltaker` / `xkast_kongelag_omgang`.
Queries that only ever read `resultat`/`stevne`/`kastemetode` are unaffected by the
table-structure decision and unchanged from the original verification.

### 3.1 X-kast scoreboard with tiebreaker data

```sql
SELECT
  r.kasterid,
  r.poeng_xkast,
  r.antall_ring_xkast,
  (
    SELECT array_agg(xko.poeng ORDER BY xko.poeng DESC)
    FROM xkast_kongelag_deltaker xkd
    JOIN xkast_kongelag xk         ON xk.id  = xkd.xkast_kongelag_id
    JOIN xkast_kongelag_omgang xko ON xko.xkast_kongelag_deltaker_id = xkd.id
    WHERE xkd.kasterid = r.kasterid
      AND xk.stevneid  = r.stevneid
      AND xk.fase      = 'innledende'
  ) AS omgang_poeng_desc
FROM resultat r
WHERE r.stevneid = $1
  AND r.poeng_xkast IS NOT NULL
ORDER BY
  r.poeng_xkast       DESC,
  r.antall_ring_xkast DESC;
-- Level 3+ tiebreaker: compare omgang_poeng_desc[0], [1], [2], ... in TypeScript.
-- Same pattern as kasterDetaljLogikk.ts.
--
-- Round breakdown (r1/r2/r3 + total) for display is a separate concern from the tiebreaker
-- array above (which is deliberately sorted by poeng, not by omgang). Fetch
-- (xko.omgang, xko.poeng) ordered by omgang instead, then group by Math.ceil(omgang / 5) in
-- code — no schema support needed, see the "Round display" resolution in
-- x-kast_kongelag-pulje-tables.md.
```

### 3.2 Kongelag scoreboard — X-kast carry-over at read time

Unaffected by the table-structure decision — only reads `resultat`/`stevne`/`kastemetode`.

```sql
SELECT
  r.kasterid,
  r.poeng_kongelag,
  r.antall_ring_kongelag,
  r.poeng_xkast,
  km.navn AS innledende_metode,
  CASE km.navn
    WHEN 'Minimatch' THEN ROUND(r.poeng_xkast * 0.3333)
    WHEN 'Halvmatch' THEN ROUND(r.poeng_xkast * 0.20)
    WHEN 'Heilmatch' THEN ROUND(r.poeng_xkast * 0.10)
    ELSE 0
  END AS carry_over,
  r.poeng_kongelag + CASE km.navn
    WHEN 'Minimatch' THEN ROUND(r.poeng_xkast * 0.3333)
    WHEN 'Halvmatch' THEN ROUND(r.poeng_xkast * 0.20)
    WHEN 'Heilmatch' THEN ROUND(r.poeng_xkast * 0.10)
    ELSE 0
  END AS display_total
FROM resultat r
JOIN stevne s       ON s.id  = r.stevneid
JOIN kastemetode km ON km.id = s.innledendekastemetodeid
WHERE r.stevneid = $1
  AND r.poeng_kongelag IS NOT NULL
ORDER BY display_total DESC, r.antall_ring_kongelag DESC;
-- Tiebreaker level 2: r.poeng_kongelag (kongelag-only, no carry-over).
-- Sanity invariant: with one omgang maxing at 20 poeng (4 shoes × 5), all three factors
-- normalize the max possible carry-over to 100:
--   Minimatch 15×20=300 × 0.3333 ≈ 100 · Halvmatch 25×20=500 × 0.20 = 100 · Heilmatch 50×20=1000 × 0.10 = 100
```

### 3.3 Kongelag scoreboard — Gloppen/NHM carry-over at read time

Unaffected by the table-structure decision — only reads `resultat`.

```sql
SELECT
  r.kasterid,
  r.poeng_kongelag,
  r.antall_ring_kongelag,
  r.kamp_poeng_innl                    AS carry_over,
  r.poeng_kongelag + r.kamp_poeng_innl AS display_total
FROM resultat r
WHERE r.stevneid = $1
  AND r.poeng_kongelag IS NOT NULL
ORDER BY display_total DESC, r.antall_ring_kongelag DESC;
-- kamp_poeng_innl is real (can be 1.5 from a draw). Not rounded — full fractional carry.
-- Not shown on the main scoreboard; used in result reports only.
```

### 3.4 All players in a pulje (X-kast or Kongelag)

```sql
SELECT
  xk.id  AS xkast_kongelag_id,
  xk.pulje,
  xk.bane_nummer,
  xkd.id AS deltaker_id,
  xkd.kasterid
FROM xkast_kongelag xk
JOIN xkast_kongelag_deltaker xkd ON xkd.xkast_kongelag_id = xk.id
WHERE xk.stevneid = $1
  AND xk.pulje     = $2   -- e.g. 2 (pulje is numeric now, not a text label)
ORDER BY xk.bane_nummer;
```

### 3.5 NM-Kongelag: combined result across kvalifisering + finale

Unaffected by the table-structure decision — only reads `resultat`. Both stevner use Kongelag
format. Winner = sum of `poeng_kongelag` from both. Qualification is a hard requirement —
INNER JOIN is correct.

```sql
-- $1 = kvalifisering stevneid, $2 = finale stevneid
SELECT
  fin.kasterid,
  kval.poeng_kongelag                                  AS kval_score,
  fin.poeng_kongelag                                   AS finale_score,
  fin.antall_ring_kongelag,
  kval.antall_ring_kongelag                            AS kval_ringer,
  kval.poeng_kongelag + fin.poeng_kongelag             AS display_total,
  kval.antall_ring_kongelag + fin.antall_ring_kongelag AS total_ringer
FROM resultat fin
JOIN resultat kval
  ON kval.kasterid = fin.kasterid AND kval.stevneid = $1
WHERE fin.stevneid = $2
ORDER BY display_total DESC, total_ringer DESC;
-- Further tiebreaker: best single omgang across both stevner — same array pattern as 3.1,
-- merged and sorted across both xkast_kongelag sets.
```

---

## Section 4: Application architecture decisions

### 4.1 Write path — RPC required

`resultat.poeng_xkast`, `antall_ring_xkast`, `poeng_kongelag`, `antall_ring_kongelag` have no triggers. Confirming a court's result (one `xkast_kongelag` row, N = 1–3 players) involves:
1. Reading all `xkast_kongelag_omgang` rows for N players
2. Writing aggregated totals to `resultat` (N rows)
3. Writing `xkast_kongelag_deltaker.poeng` for each player (N rows)
4. Marking `xkast_kongelag.er_bekreftet = true`

This is a multi-step atomic write. Per CLAUDE.md, it must be an RPC (Postgres function), not sequential client queries.

**Proposed RPC signature — one function, both formats:**
```sql
-- Confirm one court (one xkast_kongelag row: 1–3 players for X-kast, 1 for Kongelag).
-- Branches on the row's fase: 'innledende' → writes resultat.poeng_xkast/antall_ring_xkast,
-- 'avsluttende' → writes resultat.poeng_kongelag/antall_ring_kongelag. Otherwise identical.
confirm_xkast_kongelag(p_xkast_kongelag_id integer) RETURNS void
```

(Replaces the earlier `confirm_xkast_pulje`/`confirm_kongelag_kamp` pair — they differed only
in which `resultat` columns they write, and both names misused vocabulary: the unit being
confirmed is a court, not a pulje, and "kamp" is the term this design abandoned.)

Each RPC: sums `xkast_kongelag_omgang.poeng` and `antall_ringer` per `xkast_kongelag_deltaker`, writes to `xkast_kongelag_deltaker.poeng` and `antall_ringer`, then upserts `resultat.poeng_xkast`/`poeng_kongelag` and corresponding ring counts. Sets `xkast_kongelag.er_bekreftet = true` atomically.

### 4.2 `xkast_kongelag_deltaker.poeng` — populate on confirmation

For X-kast and Kongelag, `poeng` = `SUM(xkast_kongelag_omgang.poeng)` for that player. Populate it inside the confirmation RPC alongside the `resultat` write. Having two sources for the same number is a drift risk; the RPC transaction eliminates it. Same pattern as `kamp_spelar.score_poeng` in the Cup RPC today.

### 4.3 NM-Kongelag (deferred) — `forelderstevneid` sketch

Worth defining the data model now even though NM-Kongelag finale logic is deferred to its own separate plan (see Section 5). Unaffected by the table-structure decision.

Proposed:
```sql
-- Add to stevne:
ALTER TABLE stevne ADD COLUMN forelderstevneid integer REFERENCES stevne(id);
```

- NM-Kongelag Finale: `forelderstevneid = <kvalifisering_stevneid>`
- NM-Kongelag Kvalifisering: `forelderstevneid = NULL`

The combined scoreboard query (3.5) is then parameterized by looking up `forelderstevneid` from the finale stevne. No application-level hardcoding of paired IDs.

This is a one-column nullable FK, trivially reversible. Can be added when the NM-Kongelag work starts without touching any earlier code.

---

## Section 5: Implementation phases

### Phase 1 — X-kast standalone (Minimatch, Halvmatch, Heilmatch)

All three X-kast methods ship together — the logic is identical across them; the only variable
is the omgang count, which comes from `kastemetode.antall_omganger` (15/25/50, see 1.9) at
runtime. Nothing method-specific needs separate code, so splitting them into phases would
just be artificial staging.

**Apply the `xkast_kongelag`/`xkast_kongelag_deltaker`/`xkast_kongelag_omgang` migration first** (see [x-kast_kongelag-pulje-tables.md](x-kast_kongelag-pulje-tables.md) — additive only, no changes to Cup's tables).

**Services:**
- New `xkastService.ts` — creates `xkast_kongelag` row (`fase='innledende'`, `pulje=N`), `xkast_kongelag_deltaker` per player; reads/writes `xkast_kongelag_omgang`. Omgang count read from `kastemetode.antall_omganger` — no per-method branches.
- New Postgres RPC `confirm_xkast_kongelag(p_xkast_kongelag_id)` — atomic aggregate + resultat write (shared with Phase 2 Kongelag, branches on `fase`)
- RLS policies for the three new tables — public read for scoreboards, role-based writes mirroring the kamp tables' policies. Real work: the kamp tables took four dedicated RLS migrations; budget it into this phase.
- Realtime: add the new tables to the realtime publication (in the migration, not the dashboard) and subscribe via `postgres_changes` — same pattern as `kampService.ts` uses for `kamp`/`kamp_omgang`.
- No changes needed to `kampGenereringCupService.ts` — Cup's `'A'`/`'B'` constraint on `kamp.gruppe_navn` is untouched, since `kamp` itself is untouched

**Components:**
- Score-input UI: `antall_omganger` omganger in runder of 5 (3/5/10 runder), 1–3 players on one bane (confirmed by the board — not a fixed pair). Aggregate entry per omgang: 0–20 poeng / 0–4 ringere (one omgang = 4 shoes). Reuse `ScoreNumberpad.ts`'s existing one-player-at-a-time mobile flow, generalized from a hardcoded pair to a 1–3 array.
- X-kast scoreboard (query 3.1, tiebreaker in TypeScript, round breakdown r1/r2/… computed via `Math.ceil(omgang / 5)` — no schema support needed)
- Pulje-assignment view: admin enters `stevne.tilgjengelige_baner` (available court capacity, not a raw pulje count); `xkastService.foreslaaPulje()` runs `fordelPuljer()` (see "Pulje sizing" in x-kast_kongelag-pulje-tables.md) to compute fair pulje sizes from the prior-year Norgescup ranking

**Carry-over:** Not in Phase 1.

**Size:** L

---

### Phase 2 — Kongelag standalone

**Services:** New `kongelagService.ts`; reuses the `confirm_xkast_kongelag` RPC from Phase 1 (branches on `fase='avsluttende'`).

**Components:**
- Score-input UI: 1 player × 10 omganger per `xkast_kongelag` entry, grouped by pulje
- Kongelag scoreboard: `poeng_kongelag` → `antall_ring_kongelag` → best omgang (kongelag-only, no carry-over)

**Size:** M

---

### Phase 3 — X-kast → Kongelag combo

Carry-over formula (query 3.2) in display layer. Pure computation, no DB writes. Tiebreaker level 2 = `poeng_kongelag` (kongelag-only). **Size:** S

---

### Phase 4 — Gloppen/NHM → Kongelag combo

Same display pattern; reads `kamp_poeng_innl` (fractional, no rounding). **Size:** XS

---

### Deferred — NM-Kongelag finale logic

Complicated enough to need its own plan; deliberately not scheduled as a phase here. The data-model sketch (`stevne.forelderstevneid` FK, 4.3) and the combined-scoreboard query (3.5) stay in this doc as design reference for when that planning happens. Nothing in Phases 1–4 depends on it, and 4.3's column can be added at that later point without touching earlier code.

---

### Deferred — SNC

Separate spec.
