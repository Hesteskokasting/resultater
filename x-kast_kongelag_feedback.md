# Plan review — decisions and open questions

Reviewed the X-kast & Kongelag schema plan. Decisions below, plus a few things still to settle.

## Decided

**Carry-over rounding (`ROUND(poeng_xkast * 0.3333)`):** Leave as-is for now. The `0.3333` truncation could nudge tiebreakers in edge cases (`30/3 = 10.0` exact vs. `ROUND(30 * 0.3333) = 10` — fine here, but at higher scores `0.3333` diverges from true 1/3). Unlikely to bite in practice. If the formula ever changes, revisit then.

**`runde_nummer = 0` as sentinel:** Make it nullable instead. NULL = "not applicable" is the honest semantic; `0` is a magic value with no enforcement. Add to migration.

**`kamp_gruppe_check`:** Don't drop entirely — that leaves Cup avsluttende unguarded against typos. Rewrite to keep Cup validation while opening up X-kast/Kongelag pulje names:

```sql
ALTER TABLE kamp DROP CONSTRAINT kamp_gruppe_check;
ALTER TABLE kamp ADD CONSTRAINT kamp_gruppe_check CHECK (
  gruppe_navn IS NULL
  OR fase = 'innledende'
  OR (fase = 'avsluttende' AND gruppe_navn IN ('A','B'))
);
```

Matches CLAUDE.md: constraints belong in the database.

**`match_id`:** It's unique per kamp. Skip the UUID change — no reason to migrate the type. For X-kast, prefix with stevneid to guarantee global uniqueness: `{stevneid}-xkast-{gruppe_navn}-bane-{n}`. Avoid spaces in `gruppe_navn` portion (slugify if needed).

**`kamp_spelar_sync_innl_poeng` trigger:** Make it skip X-kast and Kongelag explicitly. Check `stevne.innledendekastemetodeid` against the Minimatch/Halvmatch/Heilmatch/Kongelag IDs and early-return. Otherwise `kamp_poeng_innl = 0` becomes ambiguous (zero draws vs. meaningless column), and the Gloppen/NHM carry-over query in 3.3 silently breaks for anyone who forgets the context.

## Open questions

**1. Write path for `poeng_xkast`, `poeng_kongelag`, `antall_ring_xkast`, `antall_ring_kongelag`:** Section 1.9 says "application code (or RPC)." CLAUDE.md says multi-step atomic writes must be an RPC. Confirming a pulje result writes N `resultat` rows aggregated from M `kamp_omgang` rows — that's multi-step. Should this be an RPC (`confirm_xkast_pulje(kamp_id)`)? I think yes — please confirm before Phase 1 starts.

**2. NM-Kongelag schema (Phase 6):** Deferred decision around `forelderstevneid` FK on `stevne`. Even if implementation waits, the Phase 3 Kongelag scoreboard could make single-stevne assumptions that have to be unwound. Worth sketching the data model now, even on paper. What's your read?

**3. Query 3.5 LEFT JOIN:** Uses inner JOIN on kvalifisering. A finalist with no kvalifisering row disappears. Is kvalifisering a hard requirement for entering the finale? If not, switch to LEFT JOIN + COALESCE.

**4. `kamp_spelar.score_poeng` for X-kast:** Plan lists this as "Phase 1 decision." It's literally `SUM(kamp_omgang.score)` for that player. Populate it on confirmation, or leave 0 and always re-compute from kamp_omgang? Two sources for one number is a drift risk — I'd populate.

**5. `er_tre_spelarar`:** Plan calls it an "optional signal" for X-kast 3-player groups, while `COUNT(kamp_spelar)` is the actual truth. Either make it authoritative (trigger keeps it in sync) or drop the recommendation to set it. Which?

## Migration additions

Add to the migration script:

```sql
-- 4. runde_nummer nullable (NULL = not applicable for X-kast/Kongelag)
ALTER TABLE kamp ALTER COLUMN runde_nummer DROP NOT NULL;

-- 5. Replace kamp_gruppe_check (don't just drop it)
ALTER TABLE kamp DROP CONSTRAINT kamp_gruppe_check;
ALTER TABLE kamp ADD CONSTRAINT kamp_gruppe_check CHECK (
  gruppe_navn IS NULL
  OR fase = 'innledende'
  OR (fase = 'avsluttende' AND gruppe_navn IN ('A','B'))
);
```

Rollback updated accordingly.
