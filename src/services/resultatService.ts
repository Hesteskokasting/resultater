import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { verifyRowsAffected } from "@/utils/verifiedWrite";
import type { KongelagSeedingRow } from "@/utils/kongelagSeeding";

// ── Typar ─────────────────────────────────────────────────────────────────────

const _stevneDetaljerQuery = supabase.from("stevne").select(`
    id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid, snc_hovudstevne_id,
    stevnetype:stevnetypeid(navn),
    kategori:kategoriid(navn, erlagbasert),
    kontakt:kontaktkasterid(fornavn, etternavn),
    innledende:kastemetode!innledendekastemetodeid(navn),
    avsluttende:kastemetode!avsluttendekastemetodeid(navn)
  `);

export type TournamentDetailsRow = QueryData<typeof _stevneDetaljerQuery>[number];

const _resultatRadQuery = supabase.from("resultat").select(`
    plassering, nc_poeng, snc_plassering, startnummer, kamp_poeng_innl, score_poeng_innl,
    kaster:kasterid(id, fornavn, etternavn),
    klubb:klubbid(navn),
    klasse:klasseid(navn),
    gruppe:gruppeid(navn)
  `);

export type ResultRow = QueryData<typeof _resultatRadQuery>[number];

// ── Funksjonar ────────────────────────────────────────────────────────────────

export async function getTournamentWithDetails(
  id: number,
): Promise<{ data: TournamentDetailsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(`
      id, navn, sted, dato, erfullfort, resultaturl, juryleder, klubbid, snc_hovudstevne_id,
      stevnetype:stevnetypeid(navn),
      kategori:kategoriid(navn, erlagbasert),
      kontakt:kontaktkasterid(fornavn, etternavn),
      innledende:kastemetode!innledendekastemetodeid(navn),
      avsluttende:kastemetode!avsluttendekastemetodeid(navn)
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) logError("getTournamentWithDetails", error);
  return { data, error };
}

// ── Innleiande fase ───────────────────────────────────────────────────────────

const _innlResultatQuery = supabase.from("resultat").select("kasterid, startnummer, hcp, posisjon");
export type InitialResultRow = QueryData<typeof _innlResultatQuery>[number];

export async function getResultsForInitialRound(
  stevneid: number,
): Promise<{ data: InitialResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("resultat")
    .select("kasterid, startnummer, hcp, posisjon")
    .eq("stevneid", stevneid);
  if (error) logError("getResultsForInitialRound", error);
  return { data: data ?? [], error };
}

// ── Avsluttande fase ──────────────────────────────────────────────────────────

const _avslResultatQuery = supabase.from("resultat").select(`
  kasterid, startnummer, posisjon, plassering, runde_eliminert,
  poeng_xkast, antall_ring_xkast,
  kaster:kasterid(fornavn, etternavn),
  gruppe:gruppeid(id, navn)
`);
export type FinalResultRow = QueryData<typeof _avslResultatQuery>[number];

export async function getResultsForFinalRound(
  stevneid: number,
): Promise<{ data: FinalResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("resultat")
    .select(`
      kasterid, startnummer, posisjon, plassering, runde_eliminert,
      poeng_xkast, antall_ring_xkast,
      kaster:kasterid(fornavn, etternavn),
      gruppe:gruppeid(id, navn)
    `)
    .eq("stevneid", stevneid);
  if (error) logError("getResultsForFinalRound", error);
  return { data: data ?? [], error };
}

export async function getGroups(
  groupNames: string[],
): Promise<{ data: { id: number; navn: string }[]; error: unknown }> {
  const { data, error } = await supabase.from("gruppe").select("id, navn").in("navn", groupNames);
  if (error) logError("getGroups", error);
  return { data: data ?? [], error };
}

export async function setGroupAssignment(
  stevneid: number,
  updates: { kasterid: number; gruppeid: number | null }[],
): Promise<{ error: unknown }> {
  if (!updates.length) return { error: null };
  const results = await Promise.all(
    updates.map((u) =>
      verifyRowsAffected(
        supabase
          .from("resultat")
          .update({ gruppeid: u.gruppeid })
          .eq("stevneid", stevneid)
          .eq("kasterid", u.kasterid)
          .select("id"),
      ),
    ),
  );
  const err = results.find((r) => r.error)?.error ?? null;
  if (err) logError("setGroupAssignment", err);
  return { error: err };
}

export async function writePlacements(
  stevneid: number,
  placements: { kasterid: number }[],
): Promise<{ error: unknown }> {
  if (!placements.length) return { error: null };
  const results = await Promise.all(
    placements.map((r, i) =>
      supabase
        .from("resultat")
        .update({ plassering: i + 1 })
        .eq("stevneid", stevneid)
        .eq("kasterid", r.kasterid),
    ),
  );
  const err = results.find((r) => r.error)?.error ?? null;
  if (err) logError("writePlacements", err);
  return { error: err };
}

/**
 * Innledende results used to seed Kongelag courts (see @/utils/kongelagSeeding).
 * X-kast totals come from resultat (written by the confirm RPC); kamp totals
 * come from the innledende_kamp_poeng view — resultat.kamp_poeng_innl has
 * been unwritten since the sync triggers were dropped (20260521120000).
 */
export async function getKongelagSeedingRows(
  stevneid: number,
): Promise<{ data: KongelagSeedingRow[]; error: unknown }> {
  try {
    const [resultatRes, kampRes] = await Promise.all([
      supabase
        .from("resultat")
        .select("kasterid, poeng_xkast, antall_ring_xkast")
        .eq("stevneid", stevneid)
        .not("kasterid", "is", null),
      supabase
        .from("innledende_kamp_poeng")
        .select("kasterid, kamp_poeng_innl, score_poeng_innl")
        .eq("stevneid", stevneid),
    ]);
    const error = resultatRes.error ?? kampRes.error;
    if (error) {
      logError("getKongelagSeedingRows", error);
      return { data: [], error };
    }

    const kampByKasterid = new Map(
      (kampRes.data ?? [])
        .filter((r): r is typeof r & { kasterid: number } => r.kasterid != null)
        .map((r) => [r.kasterid, r]),
    );
    const rows = (resultatRes.data ?? [])
      .filter((r): r is typeof r & { kasterid: number } => r.kasterid != null)
      .map((r) => ({
        kasterid: r.kasterid,
        poeng_xkast: r.poeng_xkast,
        antall_ring_xkast: r.antall_ring_xkast,
        kamp_poeng_innl: kampByKasterid.get(r.kasterid)?.kamp_poeng_innl ?? null,
        score_poeng_innl: kampByKasterid.get(r.kasterid)?.score_poeng_innl ?? null,
      }));
    return { data: rows, error: null };
  } catch (e) {
    logError("getKongelagSeedingRows", e);
    return { data: [], error: e };
  }
}

export async function clearGroupAssignment(stevneid: number): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from("resultat")
    .update({ gruppeid: null })
    .eq("stevneid", stevneid);
  if (error) logError("clearGroupAssignment", error);
  return { error };
}

// ── Resultat-side ─────────────────────────────────────────────────────────────

// ── SNC: consolidated result list ─────────────────────────────────────────────

// One string, used both to derive the row type and to run the query, so the two
// cannot drift apart.
const SNC_RESULTAT_SELECT = `
  snc_plassering, plassering, nc_poeng, poeng_xkast, poeng_kongelag,
  antall_ring_xkast, antall_ring_kongelag, erpremie,
  kaster:kasterid(id, fornavn, etternavn),
  klubb:klubbid(navn),
  stevne:stevneid!inner(id, navn, sted, klubb:klubbid(navn))
` as const;

const _sncResultatQuery = supabase.from("resultat").select(SNC_RESULTAT_SELECT);

export type SncResultRow = QueryData<typeof _sncResultatQuery>[number];

/**
 * Every result row in an SNC round, across all local stevner, ordered by the
 * merged placement that complete_snc_hovudstevne computed.
 */
export async function getSncConsolidatedResults(
  hovudstevneId: number,
): Promise<{ data: SncResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("resultat")
    .select(SNC_RESULTAT_SELECT)
    .eq("stevne.snc_hovudstevne_id", hovudstevneId)
    .order("snc_plassering", { nullsFirst: false });
  if (error) logError("getSncConsolidatedResults", error);
  return { data: data ?? [], error };
}

/** How many prizes to draw: a share of the placed participants, or an exact count. */
export type PremieMengd = { prosent: number } | { antal: number };

/**
 * Flags a random selection of the round's placed participants with erpremie. The
 * three top-ranked are never drawn, a percentage is rounded down, and a round can
 * only be drawn once — a second call is refused. Returns how many were drawn.
 */
export async function drawSncPremiar(
  hovudstevneId: number,
  mengd: PremieMengd,
): Promise<{ antal: number; error: unknown }> {
  const { data, error } = await supabase.rpc("draw_snc_premiar", {
    p_stevneid: hovudstevneId,
    ...("prosent" in mengd ? { p_prosent: mengd.prosent } : { p_antal: mengd.antal }),
  });
  if (error) logError("drawSncPremiar", error);
  return { antal: data ?? 0, error };
}

/** Clears the round's draw so it can be drawn afresh. Returns how many it reset. */
export async function clearSncPremiar(
  hovudstevneId: number,
): Promise<{ antal: number; error: unknown }> {
  const { data, error } = await supabase.rpc("clear_snc_premiar", {
    p_stevneid: hovudstevneId,
  });
  if (error) logError("clearSncPremiar", error);
  return { antal: data ?? 0, error };
}

export async function getResultsForTournament(
  stevneId: number,
): Promise<{ data: ResultRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("resultat")
    .select(`
      plassering, nc_poeng, snc_plassering, startnummer, kamp_poeng_innl, score_poeng_innl,
      kaster:kasterid(id, fornavn, etternavn),
      klubb:klubbid(navn),
      klasse:klasseid(navn),
      gruppe:gruppeid(navn)
    `)
    .eq("stevneid", stevneId)
    .order("plassering");
  if (error) logError("getResultsForTournament", error);
  return { data: data ?? [], error };
}
