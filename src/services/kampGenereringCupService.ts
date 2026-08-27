import { supabase } from "@/supabase";
import { calcCupRoundPairings } from "@/utils/kamp/cupStructure";
import type { RoundSetup, TablesInsert, Json } from "@/types";

function genMatchId(): string {
  return crypto.randomUUID();
}

type CupPairing = ReturnType<typeof calcCupRoundPairings>[number];
type KampInsert = TablesInsert<"kamp">;

interface MatchWithLane {
  id: number;
  bane_nummer: number | null;
}

/** A match row plus the throwers that belong in it, before the match has a DB id. */
interface BuiltCupMatch {
  match: KampInsert;
  playerKasterids: number[];
}

interface GroupForCup {
  groupName: string | null;
  spelarar: { kasterid: number; plassering: number }[];
  runde1Oppsett?: RoundSetup | null;
}

interface Round1Format {
  [groupName: string]: RoundSetup | undefined;
}

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Side membership from resultat.startnummer: each kasterid maps to all
 * kasterids sharing its startnummer (posisjon order). Singel: the player
 * alone. The cup algorithms operate on one representative kasterid per side;
 * this expands them back to full kamp_spelar rows at insert time.
 */
interface SideInfo {
  kasteridToSnr: Record<number, number>;
  snrToMembers: Record<number, number[]>;
}

async function _fetchSideInfo(stevneid: number): Promise<SideInfo> {
  const { data, error } = await supabase
    .from("resultat")
    .select("kasterid, startnummer, posisjon")
    .eq("stevneid", stevneid);
  if (error) throw new Error("Feil ved henting av resultat: " + error.message);

  const kasteridToSnr: Record<number, number> = {};
  const rawMembers: Record<number, { kasterid: number; posisjon: number | null }[]> = {};
  for (const row of data ?? []) {
    if (row.kasterid == null || row.startnummer == null) continue;
    kasteridToSnr[row.kasterid] = row.startnummer;
    const sideRows = (rawMembers[row.startnummer] ??= []);
    sideRows.push({ kasterid: row.kasterid, posisjon: row.posisjon });
  }

  const snrToMembers: Record<number, number[]> = {};
  for (const [snr, members] of Object.entries(rawMembers)) {
    members.sort(
      (a, b) => (a.posisjon ?? Infinity) - (b.posisjon ?? Infinity) || a.kasterid - b.kasterid,
    );
    snrToMembers[Number(snr)] = members.map((m) => m.kasterid);
  }
  return { kasteridToSnr, snrToMembers };
}

function _sideMembers(sideInfo: SideInfo, kasterid: number): number[] {
  const snr = sideInfo.kasteridToSnr[kasterid];
  return (snr != null ? sideInfo.snrToMembers[snr] : undefined) ?? [kasterid];
}

/**
 * Pure: turns pairings into insert-ready match rows (with lanes assigned from
 * laneStart) plus the expanded thrower list for each. No DB access, so the
 * lane/side logic can be unit-tested. `idGen` is injectable for deterministic
 * tests (mirrors calcCupRoundPairings' `shuffleFn`).
 */
export function buildCupMatchRows(
  stevneid: number,
  pairings: CupPairing[],
  roundNumber: number,
  groupName: string | null,
  sideInfo: SideInfo,
  laneStart = 0,
  roundName: string | null = null,
  idGen: () => string = genMatchId,
): BuiltCupMatch[] {
  let laneNr = laneStart;
  return pairings.map((p) => ({
    match: {
      match_id: idGen(),
      stevneid,
      fase: "avsluttende",
      runde_nummer: roundNumber,
      gruppe_navn: groupName ?? null,
      bane_nummer: p.isWalkover ? null : ++laneNr,
      er_bekreftet: p.isWalkover,
      er_walkover: p.isWalkover,
      er_tre_spelarar: p.isThreePlayers,
      runde_navn: roundName,
    },
    // Player.kasterid is typed number | string upstream; ids are numeric.
    playerKasterids: p.players.flatMap((kid) => _sideMembers(sideInfo, Number(kid))),
  }));
}

/**
 * Inserts pre-built matches and their players in two batched writes,
 * regardless of how many matches/groups are involved. Correlates players to
 * their new kamp id via the client-generated match_id.
 */
async function _insertBuiltMatches(built: BuiltCupMatch[]): Promise<number> {
  if (built.length === 0) return 0;

  const payload: Json = built.map((b): Json => ({
    match_id: b.match.match_id,
    stevneid: b.match.stevneid,
    fase: b.match.fase,
    runde_nummer: b.match.runde_nummer,
    gruppe_navn: b.match.gruppe_navn ?? null,
    bane_nummer: b.match.bane_nummer ?? null,
    er_bekreftet: b.match.er_bekreftet ?? false,
    er_walkover: b.match.er_walkover ?? false,
    er_tre_spelarar: b.match.er_tre_spelarar ?? false,
    runde_navn: b.match.runde_navn ?? null,
    players: b.playerKasterids.map((kasterid): Json => ({ kasterid })),
  }));

  const { data, error } = await supabase.rpc("insert_avsluttende_matches", { p_matches: payload });
  if (error) throw new Error("Feil ved innsetting av cup-kampar: " + error.message);

  return data ?? 0;
}

async function _insertCupPairings(
  stevneid: number,
  pairings: CupPairing[],
  roundNumber: number,
  groupName: string | null,
  sideInfo: SideInfo,
  laneStart = 0,
  roundName: string | null = null,
): Promise<number> {
  return _insertBuiltMatches(
    buildCupMatchRows(stevneid, pairings, roundNumber, groupName, sideInfo, laneStart, roundName),
  );
}

// ── Public exports ────────────────────────────────────────────────────────────

/** Lane offset from the fixed A/B/C round-1 format: sum of earlier groups' lanes. */
export function computeFormatLaneOffset(
  round1Format: Round1Format | null,
  groupName: string | null,
  groupOrder: string[],
): number {
  if (!round1Format || !groupName) return 0;
  const myIdx = groupOrder.indexOf(groupName);
  let offset = 0;
  for (const group of groupOrder.slice(0, myIdx)) {
    const prev = round1Format[group];
    if (prev) offset += (prev.c3 ?? 0) + (prev.c2 ?? 0);
  }
  return offset;
}

export async function generateCupRound1(
  stevneid: number,
  groups: GroupForCup[],
  withSeeding: boolean,
  round1Format: Round1Format | null = null,
): Promise<number> {
  const groupOrder = ["A", "B", "C"];
  const sideInfo = await _fetchSideInfo(stevneid);

  // The lane cursor was previously re-queried from the DB inside the loop so
  // each group continued after the lanes the prior groups had just inserted.
  // Read the existing max once and accumulate in memory instead — this drops
  // the loop's per-group SELECT + inserts down to two batched writes total.
  let runningMaxLane = await _fetchLaneStart(stevneid, 1);
  const built: BuiltCupMatch[] = [];

  for (const gr of groups) {
    const pairings = calcCupRoundPairings(gr.spelarar, {
      medSeeding: withSeeding,
      isRunde1: true,
      runde1Oppsett: gr.runde1Oppsett ?? null,
    });
    const laneStart = Math.max(
      runningMaxLane,
      computeFormatLaneOffset(round1Format, gr.groupName, groupOrder),
    );
    const isSemifinal = gr.spelarar.length === 4;
    const groupMatches = buildCupMatchRows(
      stevneid,
      pairings,
      1,
      gr.groupName,
      sideInfo,
      laneStart,
      isSemifinal ? "Semifinale" : null,
    );
    built.push(...groupMatches);
    for (const { match } of groupMatches) {
      if (match.bane_nummer != null && match.bane_nummer > runningMaxLane) {
        runningMaxLane = match.bane_nummer;
      }
    }
  }

  return _insertBuiltMatches(built);
}

/** Highest assigned lane number for the round, so new matches continue after it. */
async function _fetchLaneStart(stevneid: number, roundNumber: number): Promise<number> {
  const { data: maxLane } = await supabase
    .from("kamp")
    .select("bane_nummer")
    .eq("stevneid", stevneid)
    .eq("fase", "avsluttende")
    .eq("runde_nummer", roundNumber)
    .not("bane_nummer", "is", null)
    .order("bane_nummer", { ascending: false })
    .limit(1);
  return (maxLane as MatchWithLane[] | null)?.[0]?.bane_nummer ?? 0;
}

export async function generateNextCupRoundForGroup(
  stevneid: number,
  groupName: string,
  withSeeding: boolean,
  sortedPlayers: { kasterid: number; plassering: number }[],
): Promise<{ roundNumber: number; matchCount: number }> {
  const { data: matches } = await supabase
    .from("kamp")
    .select("runde_nummer")
    .eq("stevneid", stevneid)
    .eq("fase", "avsluttende")
    .eq("gruppe_navn", groupName)
    .order("runde_nummer", { ascending: false })
    .limit(1);
  const roundNumber = ((matches as { runde_nummer: number }[] | null)?.[0]?.runde_nummer ?? 0) + 1;

  const isSemifinal = sortedPlayers.length === 4;
  const pairings = calcCupRoundPairings(sortedPlayers, {
    medSeeding: withSeeding,
    isRunde1: false,
  });

  const laneStart = await _fetchLaneStart(stevneid, roundNumber);

  const sideInfo = await _fetchSideInfo(stevneid);
  const matchCount = await _insertCupPairings(
    stevneid,
    pairings,
    roundNumber,
    groupName,
    sideInfo,
    laneStart,
    isSemifinal ? "Semifinale" : null,
  );
  return { roundNumber, matchCount };
}

export async function generateFinaleAndBronzeFinal(
  stevneid: number,
  groupName: string,
): Promise<void> {
  interface SemiPlayer {
    id: number;
    kasterid: number | null;
    score_poeng: number;
    omgangar: { score: number | null }[] | null;
  }
  interface SemiMatch {
    id: number;
    runde_nummer: number;
    spelarar: SemiPlayer[] | null;
  }

  const { data: semiMatches } = await supabase
    .from("kamp")
    .select(
      "id, runde_nummer, spelarar:kamp_spelar(id, kasterid, score_poeng, omgangar:kamp_omgang(score))",
    )
    .eq("stevneid", stevneid)
    .eq("fase", "avsluttende")
    .eq("gruppe_navn", groupName)
    .eq("runde_navn", "Semifinale")
    .eq("er_bekreftet", true);

  if (!semiMatches?.length) throw new Error("Semifinalane er ikkje bekrefta.");

  const sideInfo = await _fetchSideInfo(stevneid);
  const typedSemi = semiMatches as SemiMatch[];
  const roundNumber = typedSemi[0]!.runde_nummer + 1;
  // One entry per side: all member kasterids of the winning/losing unit
  const winners: number[][] = [];
  const losers: number[][] = [];

  for (const kamp of typedSemi) {
    // Group rows into sides by startnummer; side score = sum of members'
    // own omgangar (pair members alternate throws) or score_poeng fallback
    const sider = new Map<number | string, { kasterids: number[]; score: number }>();
    for (const sp of kamp.spelarar ?? []) {
      if (sp.kasterid == null) continue;
      const key = sideInfo.kasteridToSnr[sp.kasterid] ?? `kaster-${sp.kasterid}`;
      const side = sider.get(key) ?? { kasterids: [], score: 0 };
      side.kasterids.push(sp.kasterid);
      side.score += sp.omgangar?.length
        ? sp.omgangar.reduce((s, o) => s + (o.score ?? 0), 0)
        : (sp.score_poeng ?? 0);
      sider.set(key, side);
    }
    const sorted = [...sider.values()].sort((a, b) => b.score - a.score);
    if (sorted[0]) winners.push(sorted[0].kasterids);
    if (sorted[1]) losers.push(sorted[1].kasterids);
  }

  const laneStart = await _fetchLaneStart(stevneid, roundNumber);

  // Both matches + their players go in through the same atomic RPC as the
  // other cup inserts, so a failure can't leave a finale without players.
  const built: BuiltCupMatch[] = [
    {
      match: {
        match_id: genMatchId(),
        stevneid,
        fase: "avsluttende",
        runde_nummer: roundNumber,
        gruppe_navn: groupName,
        bane_nummer: laneStart + 1,
        runde_navn: "Finale",
        er_bekreftet: false,
        er_walkover: false,
        er_tre_spelarar: false,
      },
      playerKasterids: winners.flat(),
    },
    {
      match: {
        match_id: genMatchId(),
        stevneid,
        fase: "avsluttende",
        runde_nummer: roundNumber,
        gruppe_navn: groupName,
        bane_nummer: laneStart + 2,
        runde_navn: "Bronsefinale",
        er_bekreftet: false,
        er_walkover: false,
        er_tre_spelarar: false,
      },
      playerKasterids: losers.flat(),
    },
  ];
  await _insertBuiltMatches(built);
}
