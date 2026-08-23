import type { QueryData } from "@supabase/supabase-js";
import { supabase } from "@/supabase";
import {
  calcMatchPoints,
  getAllMatchSides,
  getMatchSides,
  type MatchSide,
} from "@/utils/kamp/kamp";
import { confirmMatch, toConfirmSide } from "@/services/kampService";
import { logError } from "@/utils/logError";
import type { CourtFase } from "@/services/xkastKongelagService";
import { SHOES_PER_OMGANG } from "@/utils/xkastKongelag/omgangValidation";

// ── Types ─────────────────────────────────────────────────────────────────────

const _testKampQuery = supabase
  .from("kamp")
  .select("id, er_walkover, spelarar:kamp_spelar(id, kasterid)");

type TestMatchRow = QueryData<typeof _testKampQuery>[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomScore(): [number, number] {
  const s1 = Math.floor(Math.random() * 27);
  const s2 = Math.floor(Math.random() * 27);
  if (s1 < 21 && s2 < 21) {
    if (Math.random() < 0.5) return [Math.floor(Math.random() * 6) + 21, s2];
    return [s1, Math.floor(Math.random() * 6) + 21];
  }
  // A cup match can't end level, so a drawn draw gets nudged apart.
  return s1 === s2 ? [s1 + 2, s2] : [s1, s2];
}

/** startnummer/posisjon lookups, so kamp_spelar rows can be grouped into sides. */
async function fetchSideMaps(
  stevneid: number,
): Promise<{ startnrMap: Record<number, number>; posisjonMap: Record<number, number> } | null> {
  const { data, error } = await supabase
    .from("resultat")
    .select("kasterid, startnummer, posisjon")
    .eq("stevneid", stevneid);
  if (error) {
    logError("testData:sideMaps", error);
    return null;
  }
  const startnrMap: Record<number, number> = {};
  const posisjonMap: Record<number, number> = {};
  for (const r of data ?? []) {
    if (r.kasterid == null) continue;
    if (r.startnummer != null) startnrMap[r.kasterid] = r.startnummer;
    if (r.posisjon != null) posisjonMap[r.kasterid] = r.posisjon;
  }
  return { startnrMap, posisjonMap };
}

/** The generated totals replace the scoreboard, so a partial breakdown must go. */
async function deleteRoundsFor(spelarIds: number[], logKey: string): Promise<void> {
  if (!spelarIds.length) return;
  const { error } = await supabase.from("kamp_omgang").delete().in("kamp_spelar_id", spelarIds);
  if (error) logError(logKey, error);
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function autoCompleteInitialRoundMatches(stevneid: number): Promise<void> {
  const { data: kamper, error } = await supabase
    .from("kamp")
    .select("id, er_walkover, spelarar:kamp_spelar(id, kasterid)")
    .eq("stevneid", stevneid)
    .eq("fase", "innledende")
    .eq("er_bekreftet", false);

  if (error) {
    logError("autoCompleteInitialRoundMatches", error);
    return;
  }
  if (!kamper?.length) return;

  // Side grouping via startnummer so Par matches (4 kamp_spelar rows) get the
  // side total on the rep and 0 on the partner — not random per-row scores.
  const maps = await fetchSideMaps(stevneid);
  if (!maps) return;
  const { startnrMap } = maps;

  for (const kamp of kamper as TestMatchRow[]) {
    const spelarar = (kamp.spelarar ?? []).filter(
      (s): s is typeof s & { kasterid: number } => s.kasterid != null,
    );
    const [side1, side2] = getMatchSides(spelarar, startnrMap);
    const [s1, s2] = kamp.er_walkover ? [21, 0] : randomScore();
    const [kp1, kp2] = calcMatchPoints(s1, s2);

    try {
      await deleteRoundsFor(
        spelarar.map((s) => s.id),
        "autoCompleteInitialRoundMatches:omgang",
      );

      const updates: PromiseLike<unknown>[] = [
        supabase.from("kamp").update({ er_bekreftet: true }).eq("id", kamp.id),
      ];
      for (const side of [side1, side2]) {
        if (!side) continue;
        const [score, kampPoeng] = side === side1 ? [s1, kp1] : [s2, kp2];
        for (const m of side.members) {
          const isRep = m === side.rep;
          updates.push(
            supabase
              .from("kamp_spelar")
              .update({ score_poeng: isRep ? score : 0, kamp_poeng: kampPoeng })
              .eq("id", m.id),
          );
        }
      }
      await Promise.all(updates);
    } catch (e) {
      logError("autoCompleteInitialRoundMatches:update", e);
    }
  }
}

type CupPlayerRow = { id: number; kasterid: number };

/**
 * Dev helper: settles every unconfirmed avsluttende cup match. A 2-side match
 * gets a random score; a 3-side match carries no score of its own, so it is
 * settled by placement only — two random sides advance, the third is out.
 * Rounds are processed in order, so eliminations land before the next round.
 */
export async function autoCompleteFinalMatches(stevneid: number): Promise<void> {
  const { data: kamper, error } = await supabase
    .from("kamp")
    .select("id, runde_nummer, runde_navn, er_tre_spelarar, spelarar:kamp_spelar(id, kasterid)")
    .eq("stevneid", stevneid)
    .eq("fase", "avsluttende")
    .eq("er_bekreftet", false)
    .order("runde_nummer");

  if (error) {
    logError("autoCompleteFinalMatches", error);
    return;
  }
  if (!kamper?.length) return;

  const maps = await fetchSideMaps(stevneid);
  if (!maps) return;

  for (const kamp of kamper) {
    const spelarar = (kamp.spelarar ?? []).filter(
      (s): s is CupPlayerRow => s.kasterid != null,
    ) as CupPlayerRow[];
    const sides = getAllMatchSides(spelarar, maps.startnrMap, maps.posisjonMap);
    if (sides.length < 2) continue;

    await deleteRoundsFor(
      spelarar.map((s) => s.id),
      "autoCompleteFinalMatches:omgang",
    );

    // Best side first: random draw for 3 sides, random score decides for 2.
    let ranked: MatchSide<CupPlayerRow>[];
    if (kamp.er_tre_spelarar) {
      ranked = [...sides].sort(() => Math.random() - 0.5);
    } else {
      const [s1, s2] = randomScore();
      ranked = s1 >= s2 ? [sides[0]!, sides[1]!] : [sides[1]!, sides[0]!];
      const scoreUpdates = ranked.flatMap((side, i) =>
        side.members.map((m) =>
          supabase
            .from("kamp_spelar")
            .update({ score_poeng: m === side.rep ? (i === 0 ? s1 : s2) : 0 })
            .eq("id", m.id),
        ),
      );
      const scoreErr = (await Promise.all(scoreUpdates)).find((r) => r.error)?.error;
      if (scoreErr) {
        logError("autoCompleteFinalMatches:score", scoreErr);
        continue;
      }
    }

    const eliminated = ranked[ranked.length - 1]!;
    const { error: confirmErr } = await confirmMatch({
      kampId: kamp.id,
      sides: sides.map((s) => toConfirmSide(s)),
      outcome: {
        type: "cup-ranked",
        stevneId: stevneid,
        roundNumber: kamp.runde_nummer,
        roundName: kamp.runde_navn,
        allThrowerIds: spelarar.map((s) => s.kasterid),
        eliminatedIds: eliminated.members.map((m) => m.kasterid),
        advancingSides: ranked.slice(0, -1).map((side) => side.members.map((m) => m.kasterid)),
      },
    });
    if (confirmErr) logError("autoCompleteFinalMatches:confirm", confirmErr);
  }
}

/** Simulates one omgang shoe by shoe so the poeng/ringer pair always satisfies the DB CHECK. */
function randomOmgangEntry(): { poeng: number; antall_ringer: number } {
  let poeng = 0;
  let ringer = 0;
  for (let shoe = 0; shoe < SHOES_PER_OMGANG; shoe++) {
    if (Math.random() < 0.3) {
      poeng += 5;
      ringer++;
    } else poeng += Math.floor(Math.random() * 4);
  }
  return { poeng, antall_ringer: ringer };
}

/**
 * Dev helper: fills every missing omgang on unconfirmed X-kast/Kongelag courts
 * with random valid scores. Innledende courts are also confirmed via the RPC
 * (which writes the resultat columns — so carry-over can be tested end to end);
 * avsluttende (Kongelag) courts are left open so the Bekreft pulje flow can be
 * tested on filled-in scores.
 */
export async function autoCompleteCourts(
  stevneid: number,
  fase: CourtFase,
  antallOmganger: number,
): Promise<void> {
  const { data: courts, error } = await supabase
    .from("xkast_kongelag")
    .select("id, deltakarar:xkast_kongelag_deltaker(id, omgangar:xkast_kongelag_omgang(omgang))")
    .eq("stevneid", stevneid)
    .eq("fase", fase)
    .eq("er_bekreftet", false);

  if (error) {
    logError("autoCompleteCourts", error);
    return;
  }
  if (!courts?.length) return;

  const missingRows = courts.flatMap((court) =>
    court.deltakarar.flatMap((participant) => {
      const recorded = new Set(participant.omgangar.map((o) => o.omgang));
      const rows: {
        xkast_kongelag_deltaker_id: number;
        omgang: number;
        poeng: number;
        antall_ringer: number;
      }[] = [];
      for (let omgang = 1; omgang <= antallOmganger; omgang++) {
        if (recorded.has(omgang)) continue;
        rows.push({ xkast_kongelag_deltaker_id: participant.id, omgang, ...randomOmgangEntry() });
      }
      return rows;
    }),
  );

  if (missingRows.length) {
    const { error: insertError } = await supabase.from("xkast_kongelag_omgang").insert(missingRows);
    if (insertError) {
      logError("autoCompleteCourts:omgang", insertError);
      return;
    }
  }

  if (fase !== "innledende") return;

  for (const court of courts) {
    const { error: confirmError } = await supabase.rpc("confirm_xkast_kongelag", {
      p_xkast_kongelag_id: court.id,
    });
    if (confirmError) {
      logError("autoCompleteCourts:confirm", confirmError);
      return;
    }
  }
}

async function deleteMatchesForPhase(stevneid: number, fase: string): Promise<void> {
  const { data: kamper, error: kampErr } = await supabase
    .from("kamp")
    .select("id")
    .eq("stevneid", stevneid)
    .eq("fase", fase);

  if (kampErr) {
    logError("deleteMatchesForPhase:kamp", kampErr);
    return;
  }

  const kampids = (kamper ?? []).map((k) => k.id);
  if (!kampids.length) return;

  const { data: spelarar, error: spelarErr } = await supabase
    .from("kamp_spelar")
    .select("id")
    .in("kampid", kampids);

  if (spelarErr) {
    logError("deleteMatchesForPhase:spelar", spelarErr);
    return;
  }

  const spelarids = (spelarar ?? []).map((s) => s.id);

  if (spelarids.length) {
    const { error: omgErr } = await supabase
      .from("kamp_omgang")
      .delete()
      .in("kamp_spelar_id", spelarids);
    if (omgErr) {
      logError("deleteMatchesForPhase:omgang", omgErr);
      return;
    }
    const { error: spDelErr } = await supabase.from("kamp_spelar").delete().in("kampid", kampids);
    if (spDelErr) {
      logError("deleteMatchesForPhase:spelarDel", spDelErr);
      return;
    }
  }

  const { error: kampDelErr } = await supabase.from("kamp").delete().in("id", kampids);
  if (kampDelErr) logError("deleteMatchesForPhase:kampDel", kampDelErr);
}

export async function resetTournament(stevneid: number): Promise<{ error: unknown }> {
  const { error: reopenErr } = await supabase
    .from("stevne")
    .update({ stevne_fase: "ikke_startet", runde1_format: null, erfullfort: false })
    .eq("id", stevneid);
  if (reopenErr) {
    logError("resetTournament:stevne", reopenErr);
    return { error: reopenErr };
  }

  await deleteMatchesForPhase(stevneid, "avsluttende");
  await deleteMatchesForPhase(stevneid, "innledende");

  // X-kast/Kongelag courts: deltaker and omgang rows cascade with the court
  // (ON DELETE CASCADE), so one delete covers all three tables.
  const { error: xkErr } = await supabase.from("xkast_kongelag").delete().eq("stevneid", stevneid);
  if (xkErr) {
    logError("resetTournament:xkast_kongelag", xkErr);
    return { error: xkErr };
  }

  const { error: resErr } = await supabase.from("resultat").delete().eq("stevneid", stevneid);
  if (resErr) logError("resetTournament:resultat", resErr);
  return { error: resErr };
}
