import { getXkastConfig, type CourtRow } from "@/services/xkastKongelagService";
import type { OmgangPadHeader, OmgangPadSummary } from "@/components/OmgangNumberpad";
import {
  createCourtPhaseRenderer,
  sortedParticipants,
  type CourtPhaseVariant,
  type EntrySlot,
} from "../xkastKongelagView";

const OMGANGER_PER_RUNDE = 5;

function totalRunder(antallOmganger: number): number {
  return Math.ceil(antallOmganger / OMGANGER_PER_RUNDE);
}

/** Omgang numbers of one runde, clipped to the configured distance. */
function rundeOmganger(runde: number, antallOmganger: number): number[] {
  const from = (runde - 1) * OMGANGER_PER_RUNDE + 1;
  const to = Math.min(runde * OMGANGER_PER_RUNDE, antallOmganger);
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/** Every runde of the player, read back on the pad when it leaves them. */
function padSummary(
  participant: CourtRow["deltakarar"][number],
  antallOmganger: number,
): OmgangPadSummary {
  return {
    rows: Array.from({ length: totalRunder(antallOmganger) }, (_, i) => {
      const omganger = rundeOmganger(i + 1, antallOmganger);
      return {
        label: String(i + 1),
        rundeKey: `p${participant.id}-r${i + 1}`,
        cellPoeng: omganger.map(
          (o) => participant.omgangar.find((r) => r.omgang === o)?.poeng ?? null,
        ),
        cellRinger: omganger.map(
          (o) => participant.omgangar.find((r) => r.omgang === o)?.antall_ringer ?? null,
        ),
      };
    }),
  };
}

/** Pad header for one omgang: the runde it belongs to, with that runde's strip. */
function padHeader(
  court: CourtRow,
  participant: CourtRow["deltakarar"][number],
  omgang: number,
  antallOmganger: number,
): OmgangPadHeader {
  const runde = Math.ceil(omgang / OMGANGER_PER_RUNDE);
  const from = (runde - 1) * OMGANGER_PER_RUNDE + 1;
  const omganger = rundeOmganger(runde, antallOmganger);
  return {
    baneLabel: `Bane ${court.bane_nummer ?? "?"}`,
    rundeLabel: `Runde ${runde} av ${totalRunder(antallOmganger)}`,
    cellLabels: omganger.map((o) => String(o - from + 1)),
    cellPoeng: omganger.map((o) => participant.omgangar.find((r) => r.omgang === o)?.poeng ?? null),
    cellIndex: omgang - from,
    totalPoeng: participant.omgangar.reduce((sum, o) => sum + o.poeng, 0),
    totalRinger: participant.omgangar.reduce((sum, o) => sum + (o.antall_ringer ?? 0), 0),
    playerKey: `p${participant.id}`,
    rundeKey: `p${participant.id}-r${runde}`,
    summary: padSummary(participant, antallOmganger),
  };
}

/**
 * X-kast entry order: within one court, a player throws a full runde
 * (5 omganger) before the pad switches to the next player, runde by runde.
 */
function entryOrder(courts: CourtRow[], antallOmganger: number): EntrySlot[] {
  const slots: EntrySlot[] = [];
  for (const court of courts) {
    const players = sortedParticipants(court);
    for (let runde = 1; runde <= totalRunder(antallOmganger); runde++) {
      for (const participant of players) {
        const from = (runde - 1) * OMGANGER_PER_RUNDE + 1;
        const to = Math.min(runde * OMGANGER_PER_RUNDE, antallOmganger);
        for (let omgang = from; omgang <= to; omgang++) {
          slots.push({
            participant,
            omgang,
            header: padHeader(court, participant, omgang, antallOmganger),
          });
        }
      }
    }
  }
  return slots;
}

const xkastVariant: CourtPhaseVariant = {
  fase: "innledende",
  channelName: (stevneid) => `xkast-innledende-${stevneid}`,
  loadConfig: getXkastConfig,
  detailRows: (antallOmganger) =>
    Array.from({ length: totalRunder(antallOmganger) }, (_, i) => {
      const from = i * OMGANGER_PER_RUNDE + 1;
      const to = Math.min((i + 1) * OMGANGER_PER_RUNDE, antallOmganger);
      return {
        label: `R${i + 1}`,
        omganger: Array.from({ length: to - from + 1 }, (_, j) => from + j),
      };
    }),
  mainScore: "runder",
  actionScope: "court",
  entryOrder,
  padHeader,
  canSwapPlayers: true,
  playerScoring: true,
  emptyHint: (isAdmin) =>
    isAdmin
      ? "Ingen puljar er genererte enno. Start stevnet frå Info-fana."
      : "Ingen puljar er genererte enno.",
};

export const render = createCourtPhaseRenderer(xkastVariant);
