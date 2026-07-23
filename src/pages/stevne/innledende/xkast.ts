import { getXkastConfig, type CourtRow } from '@/services/xkastKongelagService'
import {
  createCourtPhaseRenderer,
  sortedParticipants,
  type CourtPhaseVariant,
  type EntrySlot,
} from '@/organizer/xkastKongelagView'

const OMGANGER_PER_RUNDE = 5

function rundeSum(omgangar: CourtRow['deltakarar'][number]['omgangar'], runde: number): number | null {
  const from = (runde - 1) * OMGANGER_PER_RUNDE + 1
  const to = runde * OMGANGER_PER_RUNDE
  const rows = omgangar.filter(o => o.omgang >= from && o.omgang <= to)
  if (!rows.length) return null
  return rows.reduce((sum, o) => sum + o.poeng, 0)
}

function totalRunder(antallOmganger: number): number {
  return Math.ceil(antallOmganger / OMGANGER_PER_RUNDE)
}

/**
 * X-kast entry order: within one court, a player throws a full runde
 * (5 omganger) before the pad switches to the next player, runde by runde.
 */
function entryOrder(courts: CourtRow[], antallOmganger: number): EntrySlot[] {
  const slots: EntrySlot[] = []
  for (const court of courts) {
    const players = sortedParticipants(court)
    for (let runde = 1; runde <= totalRunder(antallOmganger); runde++) {
      for (const participant of players) {
        const from = (runde - 1) * OMGANGER_PER_RUNDE + 1
        const to = Math.min(runde * OMGANGER_PER_RUNDE, antallOmganger)
        for (let omgang = from; omgang <= to; omgang++) {
          slots.push({
            participant,
            omgang,
            contextLabel: `Bane ${court.bane_nummer ?? '?'} · Runde ${runde}`,
          })
        }
      }
    }
  }
  return slots
}

const xkastVariant: CourtPhaseVariant = {
  fase: 'innledende',
  channelName: (stevneid) => `xkast-innledende-${stevneid}`,
  loadConfig: getXkastConfig,
  scoreColumnHeaders: (antallOmganger) =>
    Array.from({ length: totalRunder(antallOmganger) }, (_, i) => `R${i + 1}`),
  scoreCellValues: (participant, antallOmganger) =>
    Array.from({ length: totalRunder(antallOmganger) }, (_, i) => rundeSum(participant.omgangar, i + 1)),
  registerScope: 'court',
  entryOrder,
  emptyHint: (isAdmin) => isAdmin
    ? 'Ingen puljar er genererte enno. Start stevnet frå Info-fana.'
    : 'Ingen puljar er genererte enno.',
}

export const render = createCourtPhaseRenderer(xkastVariant)
