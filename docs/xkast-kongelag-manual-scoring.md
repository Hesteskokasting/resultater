# X-kast / Kongelag — manual totals & score editing

Admin capabilities to add:
1. Enter a **total** poeng/ringere directly on `xkast_kongelag_deltaker`, skipping omgang entry.
2. **Edit an existing omgang's** poeng/ringere.
3. **Edit the total** poeng/ringere — deletes the player's omgang rows (with a warning).

Interactions:
- **X-kast** edit omgang: click a **round** cell (R1/R2/R3) → inline expandable row shows that round's 5 omganger (poeng + ringere) → tap an omgang → numberpad, prefilled → save.
- **Kongelag** edit omgang: click the **omgang** cell directly → numberpad, prefilled → save.
- **Both** edit total: click the **TOT** cell → total numberpad (max = `antallOmganger × 20` poeng / `× 4` ringere) → if omganger exist, warn they'll be deleted → save.

Requirements 1 and 3 are the **same UI** (click TOT): no omganger → "add total"; omganger exist → "edit total, delete omganger (warn)".

## Decisions (confirmed)

- **Manual-total marker:** new boolean `xkast_kongelag_deltaker.totalsum_manuelt`.
- **Editing after confirm:** allowed; edit RPCs re-write `resultat` so standing/carry-over stay correct. (Fullført stevner remain blocked by the existing block-if-completed trigger — correct, no edits there.)
- **X-kast drill-down:** inline expandable detail row.
- (Decided here) Total-level poeng/ringere validity uses the shoe model at aggregate scale: for `R` total ringere over `4·antallOmganger` shoes, `5R ≤ poeng ≤ 5R + 3·(4·antallOmganger − R)`.

## The core tension

Today omgang rows are the source of truth; `deltaker.poeng` is derived at confirm (`SUM(omganger)`), and the standing sums omgang rows. A manual total (no omganger) is a competing source that breaks three places — all fixed via the flag:

| Place | Problem | Fix |
|---|---|---|
| `confirm_xkast_kongelag` | `deltaker.poeng = COALESCE(SUM,0)` zeroes a manual total | `CASE WHEN totalsum_manuelt THEN poeng ELSE COALESCE(SUM,0) END` |
| `buildXkastStanding` | sums omganger → manual shows 0 | fall back to deltaker totals when `totalsum_manuelt` |
| `isCourtComplete` | needs all omgang rows → manual never completes | `totalsum_manuelt OR omgangar.length >= antallOmganger` |

## Phase A — data layer (migration + RPCs + services)

**Migration** (`ALTER` + 2 new RPCs + modify confirm; user applies + regenerates types):
- `ALTER TABLE xkast_kongelag_deltaker ADD COLUMN totalsum_manuelt boolean NOT NULL DEFAULT false;`
- `edit_xkast_kongelag_omgang(p_deltaker_id, p_omgang, p_poeng, p_antall_ringer)` — admin-only, SECURITY DEFINER. Guards: reject if `totalsum_manuelt` (no omganger to edit). Upserts the omgang (table CHECKs enforce 0–20/0–4/consistency). If the court is confirmed, re-aggregate that deltaker's `poeng`/`antall_ringer` and rewrite `resultat` (fase decides columns, same as confirm).
- `set_xkast_kongelag_total(p_deltaker_id, p_poeng, p_antall_ringer)` — admin-only, SECURITY DEFINER. Validates against max (looked up via stevne→kastemetode `antall_omganger`) and the aggregate shoe-model range. Deletes the deltaker's omgang rows, sets `poeng`/`antall_ringer`/`totalsum_manuelt = true`. If confirmed, rewrite `resultat`.
- Modify `confirm_xkast_kongelag`: the aggregate `UPDATE` uses the `CASE` above so manual totals survive.
- All RPCs: `REVOKE … FROM PUBLIC; GRANT … TO authenticated;` (existing pattern).

**Services** (`xkastKongelagService.ts`):
- `getCourts` select: add `totalsum_manuelt` to the deltaker fields (flows into `CourtParticipantRow`).
- `editCourtOmgang(deltakerId, omgang, poeng, antallRinger)` and `setCourtTotal(deltakerId, poeng, antallRinger)` → the two RPCs.

## Phase B — standing & completeness honor manual totals (pure utils + view)

- `omgangValidation.ts`: generalize `validRingerRange`/`ringOptions` to accept a shoe count (default `SHOES_PER_OMGANG`) so the total pad can validate at `4·antallOmganger` shoes. Add `totalRingerRange(antallOmganger)` / max helpers. Tests.
- `buildXkastStanding` (and `buildKongelagStanding`): input gains optional `manualTotal { poeng, antallRinger }`. When present, use it for poeng/ringere; omgang tiebreaker array is empty (manual totals sort by poeng → ringere only — noted limitation). Update tests.
- `xkastKongelagView.ts`: `isCourtComplete` and `courtStatus` honor `totalsum_manuelt`; the standing builder is fed the flag + deltaker totals.

## Phase C — edit UIs

- **Omgang numberpad prefill:** `OmgangEntryStep` gains optional `initialPoeng`/`initialRinger`; the pad starts prefilled. Single-step invocation for editing one omgang.
- **X-kast round drill-down:** round cells (R1/R2/R3) become admin-clickable → inline expandable `<tr>` listing that round's omganger as tappable chips (poeng + ringere) → tap → prefilled numberpad → `editCourtOmgang`.
- **Kongelag omgang edit:** omgang cells become admin-clickable → prefilled numberpad → `editCourtOmgang`.
- **TOT total editor (both):** TOT cell admin-clickable → **new** two-stage *digit* pad (poeng digits up to `antallOmganger×20`, then ringere digits up to `×4` — ring *buttons* don't scale past 4, so totals need digit entry) with aggregate-range validation → if omganger exist, `confirmDialog` warning they'll be deleted → `setCourtTotal`. Reuses the `onp-*` card CSS + `createPad`/`bindPadButtons` digit mechanics.

## Known limitations (accept or flag)

- **No path back** from a manual total to per-omgang entry (the player has no omgang cells to click). Could add a "switch to omgang-entry" reset later; out of scope now.
- **Manual totals lose best-omgang tiebreakers** — they rank on poeng → ringere only. Admin override, acceptable.
- **Editing X-kast after Kongelag has been seeded** won't retro-update the Kongelag draw (seeding is a one-time snapshot). Edit before starting Kongelag.

## Commit boundary

One commit per phase (A/B/C), with commit text provided between each per the standing request. Phase A needs the user to apply the migration + regenerate types before B/C typecheck clean.
