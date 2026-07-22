# X-kast & Kongelag — New `xkast_kongelag` Tables (schema direction)

> Table-structure decision for X-kast/Kongelag: dedicated tables instead of reusing
> `kamp`/`kamp_spelar`/`kamp_omgang`. The companion doc
> [x-kast_kongelag-schema.md](x-kast_kongelag-schema.md) has been rewritten to match — its
> Sections 3–5 hold the queries, RPC design, and phase plan against these tables; its
> Sections 1–2 keep the superseded reuse-based migration as a historical record.

## Why

`kamp` and `kamp_spelar` model a **head-to-head match**: two named players (or pairs), a
winner/loser, `kamp_poeng` (win/draw/loss points). That's exactly right for regular match
formats (Gloppen, NHM, Cup), but semantically wrong for X-kast (a small group throwing
independently, no opponent, no winner) and Kongelag (a single individual entry — not a
"match" at all). Reusing those tables would mean carrying columns that are always
empty/zero for the new formats, and reading `kamp_spelar` rows that don't represent a match.

X-kast and Kongelag, on the other hand, are **shape-identical** to each other: both are "a
court — a bane, some participants, each throwing some rounds, no opponent." They differ only
in how many participants sit on one court (1–3 for X-kast, 1 for Kongelag) and which
`resultat` columns their confirmation RPC writes to.

**Decision:** keep `kamp` / `kamp_spelar` / `kamp_omgang` exactly as they are today, used
only for regular match formats. Add one new set of tables — `xkast_kongelag` /
`xkast_kongelag_deltaker` / `xkast_kongelag_omgang` — shared by both X-kast and Kongelag.
Named explicitly after the two formats rather than an abstract term: concrete names are
easier to understand than abstract ones, and generalizing the name later — if a third format
needing the same shape ever shows up — is a cheap refactor to do then, not a cost worth
paying upfront.

---

## Current tables (unchanged, regular matches only — Gloppen, NHM, Cup)

### `kamp`
One row = one head-to-head match.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `match_id` | text, unique per stevne | e.g. bracket-position identifier |
| `stevneid` | int, FK → `stevne.id` | |
| `fase` | text, `'innledende'` \| `'avsluttende'` | |
| `runde_nummer` | int, not null | For Gloppen/NHM or Cup bracket |
| `runde_navn` | text, nullable | display label for the round |
| `gruppe_navn` | text, nullable, `CHECK IN ('A','B')` for avsluttende | Cup group |
| `bane_nummer` | int, nullable | |
| `er_bekreftet` | boolean | result confirmed |
| `er_walkover` | boolean | one side didn't show |
| `er_tre_spelarar` | boolean | Cup's odd-bracket 3-player match case |

### `kamp_spelar`
One row = one player's (or pair's) participation in one `kamp`.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `kampid` | int, FK → `kamp.id` | |
| `kasterid` | int, FK → `kaster.id` | |
| `kamp_poeng` | real, default 0 | win=2, draw=1, loss=0 — the adversarial outcome |
| `kamp_plassering` | int, nullable | placement within the match (relevant for 3-player case) |
| `antall_ringer` | int, default 0 | ring count, aggregated across this match's rounds |
| `score_poeng` | int, default 0 | score total, aggregated across this match's rounds |

### `kamp_omgang`
One row = one round's score for one player-in-match.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `kamp_spelar_id` | int, FK → `kamp_spelar.id` | |
| `omgang` | int | round number (or inning) |
| `score` | int | this round's score (0,1,2,3,4,6) |
| `antall_ringer` | int | this round's ring count (0,1,2) |
| `registrert_av` | text, nullable | who recorded it |
| `registrert_at` | timestamp | |

`UNIQUE(kamp_spelar_id, omgang)`.

---

## New tables (X-kast + Kongelag, shared)

### `xkast_kongelag`
One row = one scored court: a bane, a set of participants, some rounds. Takes over `kamp`'s
container role, minus everything that only makes sense for a head-to-head match.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `stevneid` | int, FK → `stevne.id` | |
| `fase` | text, `'innledende'` \| `'avsluttende'` | innledende = X-kast, avsluttende = Kongelag |
| `pulje` | int, nullable | e.g. `1`, `2`, `3` — numeric pulje number, no `CHECK` needed |
| `bane_nummer` | int, nullable | |
| `er_bekreftet` | boolean | result confirmed |

Dropped vs. `kamp`: `runde_nummer`, `runde_navn` (no bracket round concept), `er_walkover`
(no opponent to no-show against), `match_id` (unused elsewhere, see below), and
`er_tre_spelarar`.

**`er_tre_spelarar` is dropped, not repurposed:** the board confirmed courts hold **1–3**
participants (not a fixed 2 with an occasional 3, like Cup). A single boolean can't express a
1/2/3 range anyway — participant count is simply `COUNT(xkast_kongelag_deltaker)` for that
`xkast_kongelag.id`, derived from however many rows actually got assigned. No flag needed.

**Score-input/scoreboard implication:** any UI or query that assumes a fixed pair (2 players)
per court is wrong for X-kast — courts can have 1, 2, or 3 participants and the score entry
screen, tiebreak display, and roster/pulje-assignment view all need to handle that range, not
just the 2–4 figure sketched in the older doc's Phase 1 (see the correction there).

**Reuse existing scoreboard logic/UI — don't build new components.** Score entry is
aggregate per omgang via a `ScoreNumberpad`-style input
(`src/components/ScoreNumberpad.ts`): one total (0–20 poeng) plus ring count (0–4) per omgang.

**Omgang scoring (resolved):** one omgang = **4 shoes**. Each shoe scores 5 (ringer) or
3/2/1/0 by distance from the stake — so an omgang row maxes at **20 poeng / 4 ringere**.
A per-shoe detailed-scoring mode (per-shoe values {0,1,2,3,5}) was considered and **dropped
for now** — aggregate per-omgang entry only, no detailed scoreboard. Can be revisited later
without schema changes (per-shoe detail would need a new finer-grained table or column if it
ever comes back; the omgang row stays the aggregate either way).

`showNumberpad()`'s current signature is hardcoded to exactly two players (`p1Namn`/`p2Namn`,
`s1`/`s2`, `onLagre(s1, s2)`), but generalizing it to 1–3 participants should be
straightforward: on mobile it already shows one player at a time via a `steg` counter (0 = P1,
1 = P2, advanced by a "→" button, Save only on the last step) — that's already the right
shape for N participants, just extend `steg` to loop `0..N-1` instead of a fixed `0|1`, and
turn the hardcoded `p1Namn`/`s1`/`p2Namn`/`s2` pairs into an array. Desktop's side-by-side
`pad1`/`pad2` rendering generalizes the same way (map over the array instead of two literal
calls).

**Resolved — skip:** no equivalent text identifier on `xkast_kongelag`. Checked `kamp.match_id`
usage: it's only ever written at kamp-generation time and read back transiently within the
same insert (`kampGenereringCupService.ts`, `kampGenereringInnledendeService.ts`) to map a
generated string back to the new row's numeric `id` — never consumed elsewhere (no deep
links, no other reads). The numeric `id` is enough for `xkast_kongelag`.

### `xkast_kongelag_deltaker`
One row = one player's participation in one `xkast_kongelag`. Takes over `kamp_spelar`'s role,
minus every column that encodes a win/loss outcome.

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `xkast_kongelag_id` | int, FK → `xkast_kongelag.id` | |
| `kasterid` | int, FK → `kaster.id` | |
| `poeng` | int, default 0 | sum of this participant's `xkast_kongelag_omgang.poeng` — written by the confirm RPC alongside the `resultat` write, same role as `kamp_spelar.score_poeng` today, renamed since "score" (skår) is `kamp`-specific terminology |
| `antall_ringer` | int, default 0 | sum of this participant's `xkast_kongelag_omgang.antall_ringer` — same rationale |

Dropped vs. `kamp_spelar`: `kamp_poeng` and `kamp_plassering` — there is no win/loss/placement
outcome in either X-kast or Kongelag, so there's nothing to store here at all (not even as an
always-zero column).

### `xkast_kongelag_omgang`
One row = **one omgang (4 shoes)** for one participant. Same structural shape as
`kamp_omgang` — just its own table so it FKs to `xkast_kongelag_deltaker` instead of
`kamp_spelar`, and its point column is named `poeng` rather than `score` for the same reason
as `xkast_kongelag_deltaker.poeng` — "score" (skår) is `kamp`-specific terminology. (Note the
scoring is different from `kamp_omgang`'s: 4 shoes at 5/3/2/1/0 each, not kamp's 0–6 scale.)

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `xkast_kongelag_deltaker_id` | int, FK → `xkast_kongelag_deltaker.id` | |
| `omgang` | int | sequential omgang number (1..15/25/50 for X-kast per kastemetode, 1..10 for Kongelag) — **not** the same as "runde" (round), see below |
| `poeng` | int | omgang total across its 4 shoes, `CHECK (poeng BETWEEN 0 AND 20)` (max = 4 ringere × 5) |
| `antall_ringer` | int, nullable | ring count for the omgang, `CHECK (antall_ringer BETWEEN 0 AND 4)` — `NULL` = not yet recorded, `0` = recorded zero |
| `registrert_av` | text, nullable | who recorded it |
| `registrert_at` | timestamp | |

`UNIQUE(xkast_kongelag_deltaker_id, omgang)`.

**Round display (r1/r2/r3 + total) — resolved: no schema change, compute in code.** Players
think in "runder" (rounds) of 5 omganger each — e.g. Minimatch's 15 omganger are 3 runder of
5. The UI needs a per-round breakdown: `PlayerName · r1 · r2 · r3 · total`.

Three options were on the table:
1. One `xkast_kongelag_deltaker` row per round (plus a `runde_nummer` column there).
2. Add `runde_nummer` directly to `xkast_kongelag_omgang`.
3. No schema change — derive the round from `omgang` in application code.

**Going with option 3**, for the same reason `er_tre_spelarar` got dropped earlier: the round
number is a fixed, universal derivation of the omgang sequence number —
`rundeNummer = Math.ceil(omgang / 5)` — since every kastemetode groups omganger in fixed
blocks of 5 (only the *number* of rounds varies: 3/5/10). A stored column that must always
agree with a one-line arithmetic formula is a drift risk with no informational benefit.

Ruled out:
- **Option 1** changes `xkast_kongelag_deltaker`'s grain from "one row per participant per
  pulje" to "one row per participant per round" — that breaks the exact property the confirm
  RPC and `resultat` write depend on (one row holding the participant's total `poeng`/
  `antall_ringer`). Computing the overall total would then require summing across N deltaker
  rows grouped by `kasterid` instead of reading one row, for no benefit over option 3.
- **Option 2** stores the same derivable value option 3 computes for free, with the same
  redundancy risk already rejected for `er_tre_spelarar`.

Display logic: group a participant's `xkast_kongelag_omgang` rows by
`Math.ceil(omgang / 5)`, sum `poeng` per group for `r1`/`r2`/`r3`, sum all groups for the
total — a pure function, same style as the tiebreaker-array logic already noted in
`x-kast_kongelag-schema.md` (3.1, "same pattern as `kasterDetaljLogikk.ts`").

---

## Pulje sizing — how many puljer, and how big (resolved)

Two levels of grouping, not to be confused with each other:
- **Court** (`bane_nummer`, already resolved): 1–3 participants physically throwing on the
  same lane at once.
- **Pulje** (`pulje`, this section): a larger scheduling group — e.g. 9–12 participants —
  that gets further subdivided into individual courts. A pulje of 9 becomes ~3–9 court-rows
  (`xkast_kongelag` rows sharing the same `pulje` value, each with its own `bane_nummer` and
  1–3 `xkast_kongelag_deltaker` rows).

**Decision: admin sets a capacity, the system computes pulje count and sizes to fill it
fairly** — not the admin picking a raw pulje count directly. E.g. 45 registered players, admin
enters a cap of 10 → the system runs 5 puljer of 9, not 4 full puljer of 10 plus a nearly-empty
5th.

New column: **`stevne.tilgjengelige_baner`** (int, nullable) — the admin-entered court/lane
capacity, meaningful only for stevner using X-kast/Kongelag. Note this is a different grain
from `bane_nummer` (one specific physical court a single pulje's court-row is assigned to) —
`tilgjengelige_baner` is the venue-level count feeding `fordelPuljer()` below, not a specific
lane.

**Fair-division algorithm** (pure function, no DB support needed beyond the one input column):
```ts
function fordelPuljer(antallDeltakere: number, maksPerPulje: number): number[] {
  const antallPuljer = Math.ceil(antallDeltakere / maksPerPulje)
  const grunnstorleik = Math.floor(antallDeltakere / antallPuljer)
  const rest = antallDeltakere % antallPuljer
  return Array.from({ length: antallPuljer }, (_, i) => grunnstorleik + (i < rest ? 1 : 0))
}
// fordelPuljer(45, 10) -> [9, 9, 9, 9, 9]
// fordelPuljer(45, 12) -> [12, 11, 11, 11]
```
This produces the `pulje` sizes; splitting each pulje further into 1–3-person courts
(`bane_nummer`) is the already-resolved, separate subdivision step.

Parameter mapping worth stating explicitly: `maksPerPulje` is fed `stevne.tilgjengelige_baner`
directly — the domain rule is "max players per pulje = number of courts". For Kongelag
(1 player per court) that's physically literal; for X-kast (1–3 per court) it's a deliberate
policy choice, not a physical constraint.

**Open assumption:** one `stevne.tilgjengelige_baner` column is shared across innledende
(X-kast) and avsluttende (Kongelag), on the reasoning that court capacity is a physical/venue
constraint that doesn't change between phases of the same stevne on the same day. Flag if
that's wrong and it needs to be split per-fase like `antall_runder_innl`/`_avsl`.

**Note (out of scope for now):** `tilgjengelige_baner` is a general venue fact, not something
inherent to X-kast/Kongelag specifically — it could equally apply to Gloppen/NHM's regular
match generation (`kampGenereringInnledendeService.ts`), which today just assigns
`bane_nummer` sequentially with no capacity ceiling at all. Worth reconsidering whether
match generation should also respect this cap, but that's a separate change to existing,
working code — not part of this X-kast/Kongelag work.

---

## Constraints, RLS, realtime — Phase 1 scope, not optional extras

**Constraints** (per CLAUDE.md, integrity rules live in the database):

- `xkast_kongelag_deltaker`: `UNIQUE(xkast_kongelag_id, kasterid)` — same player can't sit
  twice on one court.
- Same kaster in two courts within the same stevne+fase: not expressible as a plain unique
  constraint (stevneid/fase live on the parent row) — enforce in the service that assigns
  players, and note it as a known service-level rule.
- `xkast_kongelag.fase`: `CHECK (fase IN ('innledende','avsluttende'))` — mirror `kamp`'s
  existing fase constraint.
- `xkast_kongelag_omgang`: `CHECK (poeng BETWEEN 0 AND 20)` and
  `CHECK (antall_ringer BETWEEN 0 AND 4)` (see omgang scoring above).
- **FK `ON DELETE`, chosen explicitly** (CLAUDE.md requires it):
  - `xkast_kongelag_omgang.xkast_kongelag_deltaker_id` → `CASCADE` (rounds are meaningless
    without their participant)
  - `xkast_kongelag_deltaker.xkast_kongelag_id` → `CASCADE` (participants are meaningless
    without their court)
  - `xkast_kongelag.stevneid` → `RESTRICT` (don't silently drop recorded results with a stevne)
  - `xkast_kongelag_deltaker.kasterid` → `RESTRICT` (a kaster with recorded results can't be
    deleted out from under them)

**RLS — real Phase 1 work, budget for it:** the `kamp` tables needed four dedicated RLS
migrations plus later consolidations. The three new tables need policies from day one:
public/anon read (scoreboards are public), authenticated role-based writes mirroring the
existing kamp-table write policies (who can register scores / confirm). Without RLS the
tables are either inaccessible or wide open.

**Realtime:** live scoreboards subscribe via `postgres_changes` on `kamp`/`kamp_omgang`
(`kampService.ts:768`); X-kast/Kongelag scoreboards need the same on the new tables. The
tables must also be added to the realtime publication — note there's no
`ALTER PUBLICATION supabase_realtime ADD TABLE ...` anywhere in existing migrations (the kamp
tables were presumably enabled via the dashboard), so do it properly in the migration this
time per the no-dashboard-changes rule.

---

## What stays exactly the same

- **`resultat`** — already has `poeng_xkast`, `antall_ring_xkast`, `poeng_kongelag`,
  `antall_ring_kongelag` (all confirmed present, per the original schema-verification doc).
  These remain the target of the X-kast/Kongelag confirm RPCs, unchanged by this decision.
- **`kastemetode`** — the Minimatch/Halvmatch flag fix (`er_avsluttende` wrongly `true`) has
  already been applied.

**Correction:** `stevne.antall_runder_innl` / `antall_runder_avsl` do **not** drive X-kast or
Kongelag omgang counts — those columns aren't used for these formats at all, and reusing them
would be the wrong normalization anyway: round/omgang count is a property of the
**kastemetode**, not the stevne (every stevne using Minimatch always gets the same 15
omganger — storing that per-stevne would just be repeating the same fact for every row that
references the same kastemetode).

**Resolved: add `kastemetode.antall_omganger` (int, nullable).** Rather than hardcoding the
mapping as a TypeScript constant, store the total omgang count directly on the kastemetode row
it belongs to — the single source of truth travels with the row, survives a `navn` rename
without breaking a lookup keyed by string, and is directly queryable in SQL (useful for the
confirm RPC or score-input UI to validate/generate the right number of omgang rows without an
app-side table). Nullable because it's meaningless for Gloppen/NHM/Cup.

| Kastemetode | Runder (fixed group size 5, UI-only) | `antall_omganger` |
|---|---|---|
| Minimatch | 3 | 15 |
| Halvmatch | 5 | 25 |
| Heilmatch | 10 | 50 |
| Kongelag | — (flat count, no round grouping) | 10 |

The "5 omganger per runde" grouping stays a fixed constant in code (used only for X-kast's
r1/r2/r3 display breakdown, see the round-display resolution above) — it's not stored,
since nothing suggests it will ever vary and it's a display-only concern, unlike the total
omgang count which the write path (RPC, score-input UI) actually needs to know per format.

## What this removes (vs. the old reuse-based plan)

Because `kamp`/`kamp_spelar`/`kamp_omgang` are no longer touched by X-kast/Kongelag at all,
the riskiest parts of the original migration disappear entirely:

- No `ALTER TABLE kamp DROP CONSTRAINT kamp_gruppe_check` — Cup's `'A'`/`'B'` group
  constraint stays in place, untouched, no service-layer validation needs to replace it.
- No `ALTER TABLE kamp ALTER COLUMN runde_nummer DROP NOT NULL` — Cup rows keep requiring it.
- No trigger rewrite for `kamp_spelar_sync_innl_poeng` / `kamp_sync_innl_poeng` — those
  triggers only ever fire on `kamp`/`kamp_spelar` writes, and X-kast/Kongelag never write to
  those tables, so there's no corruption risk to guard against in the first place.

The migration is almost entirely additive: three new `CREATE TABLE` statements plus their FKs
— nothing altered or dropped on existing, working Cup tables. The exceptions are
`kastemetode.antall_omganger` (see above) and `stevne.tilgjengelige_baner` (see "Pulje
sizing" above) — both new nullable columns, not changes to any existing row's meaning.

## Still to do before this becomes an implementation plan

- Write the actual `CREATE TABLE` migration (`xkast_kongelag`/`xkast_kongelag_deltaker`/
  `xkast_kongelag_omgang`) including the constraints, explicit `ON DELETE` behavior, RLS
  policies, and realtime publication from the section above; plus the
  `ALTER TABLE kastemetode ADD COLUMN antall_omganger` + populating `UPDATE`, the
  `ALTER TABLE stevne ADD COLUMN tilgjengelige_baner`, and the single `confirm_xkast_kongelag`
  RPC (see x-kast_kongelag-schema.md 4.1 — one function branching on `fase`, replacing the
  earlier two near-duplicates).
- Write `fordelPuljer()` (see "Pulje sizing" above) and its tests.
- Generalize `showNumberpad()` from a hardcoded pair to a variable 1–3 participant array
  (straightforward — mobile's one-player-at-a-time `steg` flow already fits this shape).
