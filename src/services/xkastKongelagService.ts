import type { QueryData, RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";
import { getKongelagSeedingRows } from "@/services/resultatService";
import { getEnrolledPlayers } from "@/services/pameldingService";
import { orderKongelagSeeding, buildKongelagCourts } from "@/utils/kongelagSeeding";
import { calcCarryOverByKasterid, xkastCarryOverPercent } from "@/utils/kongelagStilling";
import { isXkastMethodName } from "@/utils/kastemetode";

// ── Court reads ───────────────────────────────────────────────────────────────

const _courtsQuery = supabase.from("xkast_kongelag").select(`
  id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
  deltakarar:xkast_kongelag_deltaker(
    id, kasterid, poeng, antall_ringer, totalsum_manuelt,
    kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
    omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
  )
`);

export type CourtRow = QueryData<typeof _courtsQuery>[number];
export type CourtParticipantRow = CourtRow["deltakarar"][number];
export type CourtOmgangRow = CourtParticipantRow["omgangar"][number];

export type CourtFase = "innledende" | "avsluttende";

export async function getCourts(
  stevneid: number,
  fase: CourtFase,
): Promise<{ data: CourtRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("xkast_kongelag")
    .select(`
      id, stevneid, fase, pulje, bane_nummer, er_bekreftet,
      deltakarar:xkast_kongelag_deltaker(
        id, kasterid, poeng, antall_ringer, totalsum_manuelt,
        kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
        omgangar:xkast_kongelag_omgang(id, omgang, poeng, antall_ringer)
      )
    `)
    .eq("stevneid", stevneid)
    .eq("fase", fase)
    .order("pulje")
    .order("bane_nummer");
  if (error) logError("getCourts", error);
  return { data: data ?? [], error };
}

const _myCourtsQuery = supabase.from("xkast_kongelag_deltaker").select(`
  id, kasterid,
  bane:xkast_kongelag_id(
    id, stevneid, fase, bane_nummer, er_bekreftet,
    stevne:stevneid(id, navn, dato, erfullfort),
    deltakarar:xkast_kongelag_deltaker(
      id, kasterid, poeng, antall_ringer,
      kaster:kasterid(id, fornavn, etternavn)
    )
  )
`);

export type MyCourtSeatRow = QueryData<typeof _myCourtsQuery>[number];
export type MyCourtRow = NonNullable<MyCourtSeatRow["bane"]>;

/** Courts the given thrower is seated on, across all stevner — the Min side listing. */
export async function getMyCourts(
  kasterid: number,
): Promise<{ data: MyCourtRow[]; error: unknown }> {
  const { data, error } = await supabase
    .from("xkast_kongelag_deltaker")
    .select(`
      id, kasterid,
      bane:xkast_kongelag_id(
        id, stevneid, fase, bane_nummer, er_bekreftet,
        stevne:stevneid(id, navn, dato, erfullfort),
        deltakarar:xkast_kongelag_deltaker(
          id, kasterid, poeng, antall_ringer,
          kaster:kasterid(id, fornavn, etternavn)
        )
      )
    `)
    .eq("kasterid", kasterid);
  if (error) logError("getMyCourts", error);
  return { data: (data ?? []).map((seat) => seat.bane).filter((b) => b != null), error };
}

// ── Stevne config ─────────────────────────────────────────────────────────────

/** Shared config for the X-kast/Kongelag court views (see @/pages/stevne/xkastKongelagView). */
export interface CourtPhaseConfig {
  /** Kastemetode name for this fase — shown as the banner meta line. */
  metodeNavn: string | null;
  antallOmganger: number | null;
  tilgjengeligeBaner: number | null;
  stevneFase: string | null;
  erfullfort: boolean;
  hasInitialPhase: boolean;
  hasFinalPhase: boolean;
}

/** Loads the court-phase config, reading the omgang count from the fase's kastemetode. */
async function loadCourtPhaseConfig(
  stevneid: number,
  fase: CourtFase,
): Promise<{ data: CourtPhaseConfig | null; error: unknown }> {
  const { data, error } = await supabase
    .from("stevne")
    .select(`
      tilgjengelige_baner, stevne_fase, erfullfort, innledendekastemetodeid, avsluttendekastemetodeid,
      kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn, antall_omganger),
      kastemetodeAvsl:kastemetode!stevne_avsluttendekastemetodeid_fkey(navn, antall_omganger)
    `)
    .eq("id", stevneid)
    .maybeSingle();
  if (error) logError("loadCourtPhaseConfig", error);
  if (!data) return { data: null, error };
  const kastemetode = fase === "innledende" ? data.kastemetodeInnl : data.kastemetodeAvsl;
  return {
    data: {
      metodeNavn: kastemetode?.navn ?? null,
      antallOmganger: kastemetode?.antall_omganger ?? null,
      tilgjengeligeBaner: data.tilgjengelige_baner,
      stevneFase: data.stevne_fase,
      erfullfort: data.erfullfort ?? false,
      hasInitialPhase: data.innledendekastemetodeid != null,
      hasFinalPhase: data.avsluttendekastemetodeid != null,
    },
    error,
  };
}

export function getXkastConfig(
  stevneid: number,
): Promise<{ data: CourtPhaseConfig | null; error: unknown }> {
  return loadCourtPhaseConfig(stevneid, "innledende");
}

export function getKongelagConfig(
  stevneid: number,
): Promise<{ data: CourtPhaseConfig | null; error: unknown }> {
  return loadCourtPhaseConfig(stevneid, "avsluttende");
}

// ── Innledende completion (gate for starting Kongelag) ────────────────────────

/**
 * True when the innledende phase has content and everything is confirmed —
 * covers both kamp-based innledende (Gloppen/NHM) and X-kast courts.
 */
export async function isInnledendeComplete(
  stevneid: number,
): Promise<{ data: boolean; error: unknown }> {
  try {
    const [kampTotal, kampOpen, courtTotal, courtOpen] = await Promise.all([
      supabase
        .from("kamp")
        .select("id", { count: "exact", head: true })
        .eq("stevneid", stevneid)
        .eq("fase", "innledende"),
      supabase
        .from("kamp")
        .select("id", { count: "exact", head: true })
        .eq("stevneid", stevneid)
        .eq("fase", "innledende")
        .eq("er_bekreftet", false)
        .eq("er_walkover", false),
      supabase
        .from("xkast_kongelag")
        .select("id", { count: "exact", head: true })
        .eq("stevneid", stevneid)
        .eq("fase", "innledende"),
      supabase
        .from("xkast_kongelag")
        .select("id", { count: "exact", head: true })
        .eq("stevneid", stevneid)
        .eq("fase", "innledende")
        .eq("er_bekreftet", false),
    ]);
    const error = kampTotal.error ?? kampOpen.error ?? courtTotal.error ?? courtOpen.error;
    if (error) {
      logError("isInnledendeComplete", error);
      return { data: false, error };
    }
    const total = (kampTotal.count ?? 0) + (courtTotal.count ?? 0);
    const open = (kampOpen.count ?? 0) + (courtOpen.count ?? 0);
    return { data: total > 0 && open === 0, error: null };
  } catch (e) {
    logError("isInnledendeComplete", e);
    return { data: false, error: e };
  }
}

// ── Kongelag carry-over (Phases 3/4) ──────────────────────────────────────────

export interface KongelagCarryOverInfo {
  /** Carry-over added to each player's kongelag total. */
  byKasterid: Record<number, number>;
  /** X-kast carry-over percentage (33.33/20/10); null for kamp-based innledende. */
  xkastPercent: number | null;
}

/**
 * Innledende carry-over per kasterid for the Kongelag standing. Null (not an
 * error) when the stevne has no innledende metode — standalone Kongelag has
 * nothing to carry.
 */
export async function getKongelagCarryOver(
  stevneid: number,
): Promise<{ data: KongelagCarryOverInfo | null; error: unknown }> {
  const { data: stevne, error } = await supabase
    .from("stevne")
    .select(
      "kastemetodeInnl:kastemetode!stevne_innledendekastemetodeid_fkey(navn, antall_omganger)",
    )
    .eq("id", stevneid)
    .maybeSingle();
  if (error) {
    logError("getKongelagCarryOver", error);
    return { data: null, error };
  }
  if (!stevne?.kastemetodeInnl) return { data: null, error: null };

  const { data: seedingRows, error: seedingError } = await getKongelagSeedingRows(stevneid);
  if (seedingError) return { data: null, error: seedingError };

  const { navn, antall_omganger } = stevne.kastemetodeInnl;
  const isXkast = isXkastMethodName(navn ?? "");
  return {
    data: {
      byKasterid: calcCarryOverByKasterid(seedingRows, {
        isXkast,
        antallOmganger: antall_omganger,
      }),
      xkastPercent: isXkast && antall_omganger ? xkastCarryOverPercent(antall_omganger) : null,
    },
    error: null,
  };
}

// ── Kongelag court generation ─────────────────────────────────────────────────

/**
 * Standalone Kongelag (no innledende metode): draws a random start order from
 * enrollment and creates the resultat rows the confirm RPC writes to.
 * Returns kasterids in drawn order.
 */
async function _seedStandaloneKongelag(
  stevneid: number,
): Promise<{ data: number[]; error: unknown }> {
  const { data: players, error } = await getEnrolledPlayers(stevneid);
  if (error) return { data: [], error };
  if (!players.length) {
    const noPlayersError = new Error("generateKongelagCourts: no enrolled players");
    logError("generateKongelagCourts", noPlayersError);
    return { data: [], error: noPlayersError };
  }

  // Retry after a partial failure must not duplicate start-order rows
  const { error: clearError } = await supabase.from("resultat").delete().eq("stevneid", stevneid);
  if (clearError) {
    logError("generateKongelagCourts:clearResultat", clearError);
    return { data: [], error: clearError };
  }

  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [players[i], players[j]] = [players[j]!, players[i]!];
  }

  const { error: insertError } = await supabase.from("resultat").insert(
    players.map((p, i) => ({
      stevneid,
      kasterid: p.kasterid,
      klubbid: p.klubbid,
      startnummer: i + 1,
      posisjon: null,
    })),
  );
  if (insertError) {
    logError("generateKongelagCourts:resultat", insertError);
    return { data: [], error: insertError };
  }
  return { data: players.map((p) => p.kasterid), error: null };
}

/**
 * Seeds Kongelag courts with the best players in the last pulje (they throw
 * last), puljer capped by stevne.tilgjengelige_baner and by the two-wave
 * minimum, one player per court. Order comes from innledende results; a
 * standalone Kongelag draws randomly from enrollment (and creates the resultat
 * rows) instead.
 */
export async function generateKongelagCourts(stevneid: number): Promise<{ error: unknown }> {
  const { data: config, error: configError } = await getKongelagConfig(stevneid);
  if (configError || !config) return { error: configError ?? new Error("Stevne ikkje funne") };

  // Two entry points (Info tab and the avsluttende panel) — never generate twice
  const { count, error: countError } = await supabase
    .from("xkast_kongelag")
    .select("id", { count: "exact", head: true })
    .eq("stevneid", stevneid)
    .eq("fase", "avsluttende");
  if (countError) {
    logError("generateKongelagCourts:count", countError);
    return { error: countError };
  }
  if ((count ?? 0) > 0) {
    const existsError = new Error("generateKongelagCourts: courts already generated");
    logError("generateKongelagCourts", existsError);
    return { error: existsError };
  }

  let kasterids: number[];
  if (config.hasInitialPhase) {
    const { data: seedingRows, error: seedingError } = await getKongelagSeedingRows(stevneid);
    if (seedingError) return { error: seedingError };
    if (!seedingRows.length) {
      const error = new Error("generateKongelagCourts: no resultat rows to seed from");
      logError("generateKongelagCourts", error);
      return { error };
    }
    kasterids = orderKongelagSeeding(seedingRows);
  } else {
    const { data, error } = await _seedStandaloneKongelag(stevneid);
    if (error) return { error };
    kasterids = data;
  }

  const courts = buildKongelagCourts(kasterids, config.tilgjengeligeBaner);
  return createCourts(stevneid, "avsluttende", courts);
}

// ── Court generation (admin) ──────────────────────────────────────────────────

export interface NewCourt {
  pulje: number;
  baneNummer: number;
  kasterids: number[];
}

/**
 * Creates courts and their participants for one fase. Two batched inserts;
 * returned court ids are matched to input via (pulje, bane_nummer), which is
 * unique within one generation run.
 */
export async function createCourts(
  stevneid: number,
  fase: CourtFase,
  courts: NewCourt[],
): Promise<{ error: unknown }> {
  if (!courts.length) return { error: null };

  const { data: inserted, error: courtError } = await supabase
    .from("xkast_kongelag")
    .insert(courts.map((c) => ({ stevneid, fase, pulje: c.pulje, bane_nummer: c.baneNummer })))
    .select("id, pulje, bane_nummer");
  if (courtError || !inserted) {
    logError("createCourts", courtError);
    return { error: courtError };
  }

  const idByKey = new Map(inserted.map((row) => [`${row.pulje}-${row.bane_nummer}`, row.id]));
  const participants = courts.flatMap((c) => {
    const courtId = idByKey.get(`${c.pulje}-${c.baneNummer}`);
    if (courtId === undefined) return [];
    return c.kasterids.map((kasterid) => ({ xkast_kongelag_id: courtId, kasterid }));
  });

  if (participants.length !== courts.reduce((n, c) => n + c.kasterids.length, 0)) {
    const error = new Error("createCourts: inserted courts could not be matched back to input");
    logError("createCourts", error);
    return { error };
  }

  const { error: participantError } = await supabase
    .from("xkast_kongelag_deltaker")
    .insert(participants);
  if (participantError) logError("createCourts", participantError);
  return { error: participantError };
}

// ── Omgang writes ─────────────────────────────────────────────────────────────

export async function saveOmgang(
  deltakerId: number,
  omgang: number,
  poeng: number,
  antallRinger: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from("xkast_kongelag_omgang")
    .upsert(
      { xkast_kongelag_deltaker_id: deltakerId, omgang, poeng, antall_ringer: antallRinger },
      { onConflict: "xkast_kongelag_deltaker_id,omgang" },
    );
  if (error) logError("saveOmgang", error);
  return { error };
}

// ── Player reassignment (admin) ───────────────────────────────────────────────

/**
 * Atomic swap of two court seats' players via RPC. The RPC refuses same-court
 * swaps, confirmed courts, and seats with recorded omganger.
 */
export async function swapCourtPlayers(
  deltakerIdA: number,
  deltakerIdB: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("swap_xkast_kongelag_deltaker", {
    p_deltaker_a: deltakerIdA,
    p_deltaker_b: deltakerIdB,
  });
  if (error) logError("swapCourtPlayers", error);
  return { error };
}

// ── Score editing (admin) ─────────────────────────────────────────────────────

/** Upserts one omgang for a participant. Re-syncs resultat if the court is confirmed. */
export async function editCourtOmgang(
  deltakerId: number,
  omgang: number,
  poeng: number,
  antallRinger: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("edit_xkast_kongelag_omgang", {
    p_deltaker_id: deltakerId,
    p_omgang: omgang,
    p_poeng: poeng,
    p_antall_ringer: antallRinger,
  });
  if (error) logError("editCourtOmgang", error);
  return { error };
}

/**
 * Sets a participant's total directly, deleting their omgang rows and marking
 * the total as manual. Re-syncs resultat if the court is confirmed.
 */
export async function setCourtTotal(
  deltakerId: number,
  poeng: number,
  antallRinger: number,
): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("set_xkast_kongelag_total", {
    p_deltaker_id: deltakerId,
    p_poeng: poeng,
    p_antall_ringer: antallRinger,
  });
  if (error) logError("setCourtTotal", error);
  return { error };
}

// ── Confirmation ──────────────────────────────────────────────────────────────

/** Atomic confirm via RPC: aggregates omganger, writes resultat, locks the court. */
export async function confirmCourt(xkastKongelagId: number): Promise<{ error: unknown }> {
  const { error } = await supabase.rpc("confirm_xkast_kongelag", {
    p_xkast_kongelag_id: xkastKongelagId,
  });
  if (error) logError("confirmCourt", error);
  return { error };
}

// ── Realtime ──────────────────────────────────────────────────────────────────

/**
 * xkast_kongelag_omgang and xkast_kongelag_deltaker carry no stevneid, so their
 * events cannot be filtered server-side. `ownsDeltaker` lets the view drop
 * events for other stevner's courts; unknown ids (DELETE only ships the primary
 * key) fall through to a reload.
 *
 * The deltaker listener matters for manual totals — set_xkast_kongelag_total
 * touches only that table, so without it the view would never repaint.
 */
export function subscribeToCourtChanges(
  stevneid: number,
  channelName: string,
  onChange: () => void,
  ownsDeltaker?: (deltakerId: number) => boolean,
): RealtimeChannel {
  return supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "xkast_kongelag_omgang" },
      (payload) => {
        const deltakerId =
          (payload.new as { xkast_kongelag_deltaker_id?: number })?.xkast_kongelag_deltaker_id ??
          (payload.old as { xkast_kongelag_deltaker_id?: number })?.xkast_kongelag_deltaker_id;
        if (deltakerId != null && ownsDeltaker && !ownsDeltaker(deltakerId)) return;
        onChange();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "xkast_kongelag_deltaker" },
      (payload) => {
        const deltakerId =
          (payload.new as { id?: number })?.id ?? (payload.old as { id?: number })?.id;
        if (deltakerId != null && ownsDeltaker && !ownsDeltaker(deltakerId)) return;
        onChange();
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "xkast_kongelag" },
      (payload) => {
        const sid =
          (payload.new as { stevneid?: number })?.stevneid ??
          (payload.old as { stevneid?: number })?.stevneid;
        if (sid === stevneid) onChange();
      },
    )
    .subscribe();
}
