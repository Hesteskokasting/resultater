# Schema Plan: X-kast & Kongelag

> **Status:** Spec for Claude Code to verify and refine into a concrete migration plan.
>
> **Scope:** Database schema and migration plan only — no application code yet. After approval, implementation proceeds in phases.

---

## Background

The application supports three competition formats today: Gloppen (innledende), Nordhordlandsmetoden / NHM (innledende OR helhetlig), and Cup (avsluttende). We're adding two new formats — X-kast and Kongelag — using existing tables wherever possible.

**Key insight:** A previous developer planned for these formats and added the relevant columns. The migration is minimal.

---

## Existing schema — what already supports the new formats

### `kastemetode` — rows already inserted
The four needed rows (Minimatch, Halvmatch, Heilmatch, Kongelag) already exist in the database. No action needed.

### `resultat` — columns already exist
These per-stevne, per-kaster totals are already in place:

| Column | Purpose |
|--------|---------|
| `poeng_xkast` | X-kast final total |
| `poeng_kongelag` | Kongelag final total (kongelag-only, excludes any carry-over) |
| `antall_ring_xkast` | Ring count for X-kast |
| `antall_ring_kongelag` | Ring count for Kongelag |
| `kamp_poeng_innl` | Existing — used by Gloppen/NHM; reused for carry-over |
| `score_poeng_innl` | Existing — reused |
| `startnummer` | NM-Kongelag random or seeded startnr |

No changes to `resultat`.

### `kamp` — fits with one minor question
Existing columns: `id, stevneid, fase, runde_nummer, bane_nummer, er_tre_spelarar, er_walkover, er_bekreftet, gruppe_navn, runde_navn, match_id`.

**Decided:** Format (X-kast / Kongelag / Cup) is **derived from `stevne.innledendekastemetodeid` / `stevne.avsluttendekastemetodeid` via join**. No new flag column on `kamp`. The semantics of scoring are determined by the parent stevne's chosen kastemetode.

This means application code must:
- Join `kamp → stevne → kastemetode` to know how to interpret `kamp_omgang.score`
- The cup scoreboard's first-to-21 logic, X-kast's total-points logic, and Kongelag's total-points logic are all selected based on metode name

### `kamp_spelar` — fits unchanged
Tracks players in each kamp. Already has the columns needed.

### `kamp_omgang` — fits unchanged semantically
Existing columns: `kamp_spelar_id, omgang, score, antall_ringer`.

Semantics for each format:
- **Cup:** `score` = points scored in that omgang (1/2/3/4/6); `omgang` = match round
- **X-kast / Kongelag:** `score` = sum of 4 shoes in that omgang (0-20); `antall_ringer` = ring-shoes count in that omgang (0-4)

**One constraint to verify:** check whether `kamp_omgang.score` has a CHECK constraint that limits values (e.g. `IN (1,2,3,4,6)`). If so, relax to allow `0-20`. Claude Code must inspect this and propose change if needed.

### `kamp.bane_nummer` — physical court
Already exists. Used as-is for X-kast (multiple players per bane) and Kongelag (1 player per bane).

---

## Naming decisions (locked)

These have been decided and are NOT open for re-evaluation:

- **Table names `kamp`, `kamp_spelar`, `kamp_omgang` stay.** Despite "kamp" being match-oriented, the rename cost is too high. Keep semantics.
- **Norwegian word "pulje" is NOT introduced.** A group of players competing together = `kamp` (with multiple `kamp_spelar`). For Kongelag-grouping use existing `kamp.gruppe_navn` (e.g. "Pulje A", "Pulje B"). Bane is `kamp.bane_nummer`.
- **No new flag column** like `er_xkast` or `er_xkast_kongelag`. Format is derived from `stevne.kastemetode`.

---

## Format-specific modeling decisions

### X-kast modeling

- One `kamp` row per group of players throwing together on one bane (2-4 players, usually 2-3; 4 is rare)
- `kamp.bane_nummer` identifies which physical court
- `kamp_spelar` rows: one per player in that kamp
- `kamp_omgang.omgang` numbers 1 to 15/25/50 (Minimatch / Halvmatch / Heilmatch = 3/5/10 runder × 5 omganger)
- Runde grouping derived: `runde = ceil(omgang / 5)`. No new column.
- `kamp_omgang.score` = sum of 4 shoes (0-20)
- `kamp_omgang.antall_ringer` = ring count for that omgang (0-4)

### Kongelag modeling

- **One `kamp` row per player per bane** (1 `kamp_spelar` per kamp)
- A Kongelag pulje with 12 players → 12 `kamp` rows in the database
- `kamp.gruppe_navn` identifies which pulje (e.g. "Pulje A")
- `kamp.bane_nummer` identifies which physical court
- `kamp_omgang` rows: 10 per player (omgang 1-10)
- Score and rings: same convention as X-kast

**Identifying all players in a pulje:**
```sql
SELECT k.*, ks.* FROM kamp k
JOIN kamp_spelar ks ON ks.kampid = k.id
WHERE k.stevneid = ? AND k.gruppe_navn = 'Pulje A'
```

### NM-Kongelag — two separate stevner

User decision: NM-Kongelag is modeled as **two separate stevner**:
- "NM-Kongelag YYYY Kvalifisering"
- "NM-Kongelag YYYY Finale"

Reason: `resultat.poeng_kongelag` is one value per kaster per stevne. Storing kvalifisering + finale results separately requires separate stevner.

NM-winner reporting then queries across these two stevner — same pattern as future SNC aggregation. Application-level concern, no schema change.

### Pulje-assignment for X-kast

Default: previous year's Norgescup ranking. The ranking is **computed on the fly** by `byggSingelListe` in `src/utils/norgescup.ts` — no stored ranking table.

Plan: a service `xkastService.foreslaaPulje(stevneid, kasterids[], år)` computes previous year's rankings on demand, returns proposed pulje-assignment. Admin can override manually before locking.

Same-klubb-rule: handled manually by admin (no automation). User can move players between puljer in the UI.

No schema change for pulje-assignment.

---

## Carry-over logic (application, not schema)

Carry-over to Kongelag when Kongelag is avsluttende:

| Innledande metode | Carry-over |
|---|---|
| Minimatch → Kongelag | `round(poeng_xkast × 0.3333)` |
| Halvmatch → Kongelag | `round(poeng_xkast × 0.20)` |
| Heilmatch → Kongelag | `round(poeng_xkast × 0.10)` |
| Gloppen → Kongelag | `kamp_poeng_innl` (full carry, no percentage) |
| NHM → Kongelag | `kamp_poeng_innl` (full carry, no percentage) |

**Storage rule:** `resultat.poeng_kongelag` stores **kongelag-only points**. Carry-over is added at display time:

```
display_total = resultat.poeng_kongelag + carry_over_function(stevne, kaster)
```

This keeps `poeng_kongelag` semantically clean regardless of which innledande was used.

**Open question for Claude Code:** Should carry-over be cached anywhere (e.g. computed once per stevne and stored), or always derived live? Recommend live unless performance becomes a problem.

---

## Tiebreaker logic (application, not schema)

### X-kast tiebreaker (hierarchical)
1. Total `poeng_xkast`
2. Total `antall_ring_xkast`
3. Best single **omgang** result (read from `kamp_omgang.score` rows for this kaster, take max)
4. Next best omgang result, etc.

### Kongelag tiebreaker
1. Total kongelag points (including carry-over for display, but tiebreaker rules say "best resultat i Kongelagskastinga" first — see open question below)
2. Best kongelag-only result (excluding carry-over)
3. Most rings in kongelag (`antall_ring_kongelag`)
4. Best single omgang result
5. Next best, etc.

**Open question for Claude Code:** Rule wording: "best resultat i Kongelagskastinga" — does this mean kongelag-only score, or kongelag + carry-over? Spec leans toward kongelag-only (the second tiebreaker level), but verify with user.

Tiebreaker queries are written in service code, not denormalized into the database.

---

## SNC — deferred but kept in spec for reference

User decision: **SNC implementation is deferred** until X-kast and Kongelag are working standalone.

Two candidate models to evaluate later:

**Model A:** Single SNC stevne with multiple lokasjon-tagged divisions
- Add `lokasjon` column to `kamp` or `resultat` (or to a future `pamelding_lokasjon` table)
- One stevne, one aggregated result list, but matches happen at multiple venues

**Model B:** Umbrella stevne + child stevner
- A "paraply" stevne with `er_snc: true`
- Child stevner reference parent via new `forelderstevneid` column
- Aggregation queries roll up child stevner under parent

Both are possible. No schema decision made now. **No SNC schema changes in this migration.**

After X-kast + Kongelag are implemented, the SNC model will be designed in a follow-up spec.

---

## Concrete migration

If recommendations stand, the migration is **one column relaxation**, if even that:

```sql
-- 1. Verify and relax kamp_omgang.score constraint
-- (Only if a CHECK constraint exists that limits score to cup values 1/2/3/4/6.
-- If no such constraint, no migration is needed at all.)

-- 2. Verify kamp.fase enum/check
-- Existing values: 'innledende', 'avsluttende'
-- Does X-kast or Kongelag need a different fase value? Likely no — they fit
-- into innledende (X-kast as innledande) or avsluttende (Kongelag, Cup as avsluttande).
-- Verify and report.
```

That's it. The implementation is almost entirely **application-level**.

---

## What Claude Code should produce

Output at `/plans/x-kast-schema.md`:

### Section 1: Verification

- Read current schema in detail. Specifically check:
  - CHECK constraints on `kamp_omgang.score` (does it limit to cup values?)
  - CHECK/enum constraints on `kamp.fase`
  - Confirm all the `resultat.*_xkast` and `resultat.*_kongelag` columns are usable
  - Confirm `kastemetode` rows for Minimatch / Halvmatch / Heilmatch / Kongelag already exist
- For each issue listed in this spec, confirm or correct

### Section 2: Migration script (if needed)

If the verification reveals any blocker (e.g. score CHECK constraint), provide the migration SQL.

If nothing needs migration, say so explicitly. **Don't invent work to justify a migration.**

### Section 3: Query examples

Provide concrete SQL or Supabase-client patterns for:
- X-kast tiebreaker (points → rings → best omgang → next best...)
- Kongelag with X-kast carry-over (computed at read)
- Kongelag with Gloppen/NHM carry-over
- "Get all players in pulje A for a Kongelag stevne"
- NM-Kongelag winner across two stevner

### Section 4: Implementation phases

After schema is verified, outline the application phases (no code yet):

1. **X-kast Minimatch standalone** — first format. New service `xkastService`, new score-input UI for 2-4 players on one bane, result aggregation. Validates the data model.
2. **Halvmatch + Heilmatch** — same service, configurable round count.
3. **Kongelag standalone** — new service `kongelagService`, score-input for 1 player per bane × 12 players × 10 omganger.
4. **X-kast → Kongelag combo** — carry-over computation at display.
5. **Gloppen/NHM → Kongelag combo** — same carry-over pattern, different formula.
6. **NM-Kongelag finale logic** — two separate stevner, winner-across-stevner query.
7. **SNC** — separate spec later, after the above is stable.

For each phase: list services affected, components needed, and rough size estimate.

### Section 5: Open questions

Anything still ambiguous. Don't paper over uncertainty.

---

## What Claude Code must NOT do

- Write application code (TypeScript, services, components, UI)
- Run any migrations
- Add tables or columns beyond what this spec authorizes
- Treat SNC as in-scope for this migration
- Make assumptions silently — flag everything
