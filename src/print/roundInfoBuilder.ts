import { getMatchSides } from "@/utils/kamp/kamp";

/** One round on a start card, as both the receipt and the A4 sheet print it. */
export interface RoundInfo {
  court?: number | string | null;
  matchPoints?: string;
  playerScore?: string;
  opponentId?: number | string | null;
  opponentName?: string;
  opponentScore?: string;
}

export interface PrintKlubb {
  kortnavn?: string | null;
  navn?: string | null;
}

export interface PrintKaster {
  fornavn: string;
  etternavn: string;
  klubb?: PrintKlubb | null;
}

export interface PrintMatchPlayer {
  kasterid: number;
  kaster?: PrintKaster | null;
}

export interface PrintMatch {
  spelarar?: PrintMatchPlayer[] | null;
  er_walkover?: boolean | null;
  bane_nummer?: number | null;
}

export function hentKlubbNamn(kasterid: number, alleKamper: PrintMatch[]): string {
  for (const kamp of alleKamper) {
    const sp = kamp.spelarar?.find((s) => s.kasterid === kasterid);
    if (sp?.kaster?.klubb) return sp.kaster.klubb.kortnavn || sp.kaster.klubb.navn || "";
  }
  return "";
}

export function buildRoundInfos(
  kasterid: number,
  sortertRundar: number[],
  rundeMap: Map<number, PrintMatch[]>,
  startnrMap: Record<number, number>,
): RoundInfo[] {
  return sortertRundar.map((nr) => {
    const kamp = (rundeMap.get(nr) ?? []).find((k) =>
      k.spelarar?.some((sp) => sp.kasterid === kasterid),
    );
    if (!kamp) return { court: "", opponentId: "", opponentName: "" };
    const [sideA, sideB] = getMatchSides(kamp.spelarar, startnrMap);
    const isMySideA = sideA?.members.some((m) => m.kasterid === kasterid) ?? false;
    const oppSide = isMySideA ? sideB : sideA;
    const erWalkoverSeier = kamp.er_walkover && !oppSide?.members.some((m) => m.kaster);
    if (erWalkoverSeier) {
      return {
        court: kamp.bane_nummer ?? "",
        matchPoints: "2",
        playerScore: "21",
        opponentId: "-",
        opponentName: "Walkover",
        opponentScore: "-",
      };
    }
    const oppId = oppSide?.rep?.kasterid ? (startnrMap[oppSide.rep.kasterid] ?? "") : "";
    const oppName = (oppSide?.members ?? [])
      .map((m) => (m.kaster ? `${m.kaster.fornavn} ${m.kaster.etternavn}` : ""))
      .filter(Boolean)
      .join(" / ");
    return {
      court: kamp.bane_nummer ?? "",
      opponentId: oppId,
      opponentName: oppName,
    };
  });
}
