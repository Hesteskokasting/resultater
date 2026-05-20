# X-kast & Kongelag — Schema Verification

> Verified against live database (project `urtvpewjlevhlevtnvkf`) on 2026-05-19.
> All decisions finalized. Migration script is ready to apply.

---

## Section 1: Verification

### 1.1 `kamp_omgang.score` — make NOT NULL

No value-range CHECK constraint exists. `score` is currently nullable.

**Change:** Make `score` NOT NULL. Zero NULL rows in production (312 rows, 0 NULL). Rows are only inserted when a score is known — the nullable column offered false flexibility.

### 1.2 `kamp.fase` — clear, no change

Constraint `fase = ANY (ARRAY['innledende', 'avsluttende'])` is correct. X-kast → `'innledende'`. Kongelag → `'avsluttende'`. No new value needed.

### 1.3 `kamp.gruppe_navn` — drop constraint, enforce Cup validation in service

The existing constraint (`gruppe_navn IN ('A','B')` for avsluttende) cannot be rewritten to cover Kongelag-avsluttende separately from Cup-avsluttende using only columns on the `kamp` row. A cross-column `fase`-based rewrite would incorrectly reject Kongelag's `'Pulje A'` values.

**Decision:** Drop constraint entirely. Cup's `'A'`/`'B'` validation moves to `kampGenereringCupService.ts` — the only code path that creates Cup avsluttende kamp rows.

### 1.4 `kamp.runde_nummer` — make nullable

Currently NOT NULL. For X-kast and Kongelag, the round concept does not apply to the kamp level. `NULL` is the honest semantic; `0` would be a magic value with no enforcement.

**Change:** Drop NOT NULL. Store `NULL` for X-kast and Kongelag kamp rows.

### 1.5 `resultat` columns — all confirmed

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

### 1.6 `kastemetode` rows — all present, data fix needed

| id | navn | er_innledende | er_avsluttende | Action |
|----|------|--------------|----------------|--------|
| 23 | Minimatch | true | ~~true~~ | **Fix to false** |
| 4 | Halvmatch | true | ~~true~~ | **Fix to false** |
| 10 | Heilmatch | true | false | ✅ |
| 6 | Kongelag | false | true | ✅ |

Minimatch and Halvmatch incorrectly expose themselves in the avsluttende kastemetode dropdown.

### 1.7 `kamp` full column list

```
id, match_id (text, unique per stevne), stevneid, fase,
runde_nummer (→ nullable after migration), gruppe_navn (→ constraint dropped),
runde_navn, bane_nummer, er_bekreftet, er_walkover, er_tre_spelarar
```

**`match_id` format for X-kast:** `{stevneid}-xkast-{slugified_gruppe_navn}-bane-{n}`. Slugify gruppe_navn (remove spaces, lowercase) to avoid uniqueness edge cases.

**`er_tre_spelarar`:** Cup-only concept. For X-kast, always `false`. Player count is `COUNT(kamp_spelar)`.

**`kamp_spelar.kamp_poeng`:** Real, NOT NULL, default 0. No win/loss for X-kast or Kongelag — always 0. Unused but harmless.

### 1.8 `kamp_omgang` — confirmed

```
id, kamp_spelar_id, omgang, score (→ NOT NULL after migration),
antall_ringer (nullable), registrert_av, registrert_at
```

UNIQUE on `(kamp_spelar_id, omgang)` — correct for X-kast (1–15/25/50) and Kongelag (1–10).

`antall_ringer` stays nullable: NULL = not yet recorded, 0 = recorded zero rings.

### 1.9 `stevne` — all needed columns present

`antall_runder_innl` and `antall_runder_avsl` already exist. `antall_runder_innl` stores X-kast round count (3 = Minimatch, 5 = Halvmatch, 10 = Heilmatch). No new column needed.

### 1.10 Trigger `kamp_spelar_sync_innl_poeng` — must be updated

**Current behavior:** fires on `kamp_spelar` changes when `kamp.fase = 'innledende'`; syncs `resultat.kamp_poeng_innl` (SUM of win/draw/loss points) and `resultat.score_poeng_innl`.

**Problem:** For X-kast (also innledende), `kamp_poeng` is always 0, so `kamp_poeng_innl` gets written as 0. For a stevne where some kasters later switch from Gloppen/NHM to X-kast, the trigger would corrupt `kamp_poeng_innl` that the Gloppen/NHM carry-over formula depends on. More practically: `kamp_poeng_innl = 0` becomes ambiguous (no draws vs. wrong format).

**Fix:** Add an early-return guard for X-kast formats. The trigger must check `stevne.innledendekastemetodeid` and skip when the stevne uses Minimatch, Halvmatch, or Heilmatch.

The `kamp_sync_innl_poeng` trigger (fires on `kamp.er_bekreftet` changes) needs the same guard.

**Note:** `resultat.poeng_xkast`, `poeng_kongelag`, `antall_ring_xkast`, `antall_ring_kongelag` have no triggers. These must be written explicitly by the confirmation RPC (see Section 4.1).

---

## Section 2: Migration script

Five changes. All reversible.

```sql
-- Migration: x-kast-kongelag-schema (2026-05-19)

-- 1. score NOT NULL (verified: 0 NULL rows exist)
ALTER TABLE kamp_omgang ALTER COLUMN score SET NOT NULL;

-- 2. runde_nummer nullable (NULL = not applicable for X-kast/Kongelag)
ALTER TABLE kamp ALTER COLUMN runde_nummer DROP NOT NULL;

-- 3. Drop gruppe_naam constraint (Cup A/B validation moves to service layer)
ALTER TABLE kamp DROP CONSTRAINT kamp_gruppe_check;

-- 4. Fix kastemetode flags
UPDATE kastemetode SET er_avsluttende = false WHERE navn IN ('Minimatch', 'Halvmatch');

-- 5. Update trigger to skip X-kast formats
CREATE OR REPLACE FUNCTION trg_kamp_spelar_sync_innl()
RETURNS TRIGGER AS $$
DECLARE
  v_stevneid integer;
  v_fase text;
BEGIN
  SELECT k.stevneid, k.fase INTO v_stevneid, v_fase
  FROM kamp k WHERE k.id = COALESCE(NEW.kampid, OLD.kampid);

  IF v_fase != 'innledende' THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Skip X-kast formats: sync only applies to Gloppen/NHM innledende
  IF EXISTS (
    SELECT 1 FROM stevne s
    JOIN kastemetode km ON km.id = s.innledendekastemetodeid
    WHERE s.id = v_stevneid
      AND km.navn IN ('Minimatch', 'Halvmatch', 'Heilmatch')
  ) THEN RETURN COALESCE(NEW, OLD); END IF;

  IF NEW IS NOT NULL THEN
    PERFORM _sync_innl_poeng(NEW.kasterid, v_stevneid);
  END IF;
  IF OLD IS NOT NULL AND (NEW IS NULL OR OLD.kasterid != NEW.kasterid) THEN
    PERFORM _sync_innl_poeng(OLD.kasterid, v_stevneid);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_kamp_sync_innl()
RETURNS TRIGGER AS $$
DECLARE r record;
BEGIN
  IF NEW.fase != 'innledende' THEN RETURN NEW; END IF;
  IF OLD.er_bekreftet IS NOT DISTINCT FROM NEW.er_bekreftet THEN RETURN NEW; END IF;

  -- Skip X-kast formats
  IF EXISTS (
    SELECT 1 FROM stevne s
    JOIN kastemetode km ON km.id = s.innledendekastemetodeid
    WHERE s.id = NEW.stevneid
      AND km.navn IN ('Minimatch', 'Halvmatch', 'Heilmatch')
  ) THEN RETURN NEW; END IF;

  FOR r IN SELECT kasterid FROM kamp_spelar WHERE kampid = NEW.id LOOP
    PERFORM _sync_innl_poeng(r.kasterid, NEW.stevneid);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Rollback:**
```sql
ALTER TABLE kamp_omgang ALTER COLUMN score DROP NOT NULL;
ALTER TABLE kamp ALTER COLUMN runde_nummer SET NOT NULL;
ALTER TABLE kamp ADD CONSTRAINT kamp_gruppe_check
  CHECK ((gruppe_navn IS NULL) OR (gruppe_navn = ANY (ARRAY['A'::text, 'B'::text])));
UPDATE kastemetode SET er_avsluttende = true WHERE navn IN ('Minimatch', 'Halvmatch');
-- Restore original trigger functions from 20260511120000_trigger_sync_resultat_innl_poeng.sql
```

**Nothing else to migrate.** No new tables. No new columns. No new foreign keys.

---

## Section 3: Query examples

### 3.1 X-kast scoreboard with tiebreaker data

```sql
SELECT
  r.kasterid,
  r.poeng_xkast,
  r.antall_ring_xkast,
  (
    SELECT array_agg(ko.score ORDER BY ko.score DESC)
    FROM kamp_spelar ks
    JOIN kamp k         ON k.id  = ks.kampid
    JOIN kamp_omgang ko ON ko.kamp_spelar_id = ks.id
    WHERE ks.kasterid = r.kasterid
      AND k.stevneid  = r.stevneid
      AND k.fase      = 'innledende'
  ) AS omgang_scores_desc
FROM resultat r
WHERE r.stevneid = $1
  AND r.poeng_xkast IS NOT NULL
ORDER BY
  r.poeng_xkast       DESC,
  r.antall_ring_xkast DESC;
-- Level 3+ tiebreaker: compare omgang_scores_desc[0], [1], [2], ... in TypeScript.
-- Same pattern as kasterDetaljLogikk.ts.
```

### 3.2 Kongelag scoreboard — X-kast carry-over at read time

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
```

### 3.3 Kongelag scoreboard — Gloppen/NHM carry-over at read time

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
  k.id          AS kamp_id,
  k.gruppe_navn,
  k.bane_nummer,
  ks.id         AS kamp_spelar_id,
  ks.kasterid
FROM kamp k
JOIN kamp_spelar ks ON ks.kampid = k.id
WHERE k.stevneid  = $1
  AND k.gruppe_navn = $2   -- e.g. 'Pulje A'
ORDER BY k.bane_nummer;
```

### 3.5 NM-Kongelag: combined result across kvalifisering + finale

Both stevner use Kongelag format. Winner = sum of `poeng_kongelag` from both. Qualification is a hard requirement — INNER JOIN is correct.

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
-- merged and sorted across both kamp sets.
```

---

## Section 4: Application architecture decisions

### 4.1 Write path — RPC required

`resultat.poeng_xkast`, `antall_ring_xkast`, `poeng_kongelag`, `antall_ring_kongelag` have no triggers. Confirming a pulje result involves:
1. Reading all `kamp_omgang` rows for N players
2. Writing aggregated totals to `resultat` (N rows)
3. Writing `kamp_spelar.score_poeng` for each player (N rows)
4. Marking `kamp.er_bekreftet = true`

This is a multi-step atomic write. Per CLAUDE.md, it must be an RPC (Postgres function), not sequential client queries.

**Proposed RPC signatures:**
```sql
-- X-kast: confirm one pulje (one kamp = one group of 2–4 players)
confirm_xkast_pulje(p_kampid integer) RETURNS void

-- Kongelag: confirm one player's result (one kamp = one player)
confirm_kongelag_kamp(p_kampid integer) RETURNS void
```

Each RPC: sums `kamp_omgang.score` and `antall_ringer` per `kamp_spelar`, writes to `kamp_spelar.score_poeng` and `kamp_spelar.antall_ringer`, then upserts `resultat.poeng_xkast`/`poeng_kongelag` and corresponding ring counts. Sets `kamp.er_bekreftet = true` atomically.

### 4.2 `kamp_spelar.score_poeng` — populate on confirmation

For X-kast and Kongelag, `score_poeng` = `SUM(kamp_omgang.score)` for that player. Populate it inside the confirmation RPC alongside the `resultat` write. Having two sources for the same number is a drift risk; the RPC transaction eliminates it.

### 4.3 NM-Kongelag Phase 6 — `forelderstevneid` sketch

Worth defining the data model now even though implementation is Phase 6.

Proposed:
```sql
-- Add to stevne:
ALTER TABLE stevne ADD COLUMN forelderstevneid integer REFERENCES stevne(id);
```

- NM-Kongelag Finale: `forelderstevneid = <kvalifisering_stevneid>`
- NM-Kongelag Kvalifisering: `forelderstevneid = NULL`

The combined scoreboard query (3.5) is then parameterized by looking up `forelderstevneid` from the finale stevne. No application-level hardcoding of paired IDs.

This is a one-column nullable FK, trivially reversible. Can be added at Phase 6 start without touching any earlier code.

---

## Section 5: Implementation phases

### Phase 1 — X-kast Minimatch standalone

**Apply migration from Section 2 first.**

**Services:**
- New `xkastService.ts` — creates kamp (runde_nummer=NULL, gruppe_navn='Pulje X'), kamp_spelar per player; reads/writes kamp_omgang
- New Postgres RPC `confirm_xkast_pulje(p_kampid)` — atomic aggregate + resultat write
- Add `'A'/'B'` guard to `kampGenereringCupService.ts` (replaces dropped DB constraint)

**Components:**
- Score-input UI: 5 omganger × 3 runder (15 omganger total), 2–4 players on one bane
- X-kast scoreboard (query 3.1, tiebreaker in TypeScript)
- Pulje-assignment view: proposal from prior-year Norgescup ranking via `xkastService.foreslaaPulje()`

**Carry-over:** Not in Phase 1.

**Size:** L

---

### Phase 2 — Halvmatch + Heilmatch

Same `xkastService.ts`; `stevne.antall_runder_innl` drives omgang count (25 or 50). **Size:** S

---

### Phase 3 — Kongelag standalone

**Services:** New `kongelagService.ts` + RPC `confirm_kongelag_kamp(p_kampid)`.

**Components:**
- Score-input UI: 1 player × 10 omganger per kamp, grouped by pulje
- Kongelag scoreboard: `poeng_kongelag` → `antall_ring_kongelag` → best omgang (kongelag-only, no carry-over)

**Size:** M

---

### Phase 4 — X-kast → Kongelag combo

Carry-over formula (query 3.2) in display layer. Pure computation, no DB writes. Tiebreaker level 2 = `poeng_kongelag` (kongelag-only). **Size:** S

---

### Phase 5 — Gloppen/NHM → Kongelag combo

Same display pattern; reads `kamp_poeng_innl` (fractional, no rounding). **Size:** XS

---

### Phase 6 — NM-Kongelag finale logic

Add `stevne.forelderstevneid` FK (see 4.3). UI to designate paired stevner. Combined scoreboard using query 3.5. **Size:** M

---

### Phase 7 — SNC

Separate spec. Deferred.
