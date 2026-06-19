import type { RoundInfo } from './startcard-template'

export interface PrintKlubb {
  kortnavn?: string | null
  navn?: string | null
}

export interface PrintKaster {
  fornavn: string
  etternavn: string
  klubb?: PrintKlubb | null
}

export interface PrintMatchPlayer {
  kasterid: number
  kaster?: PrintKaster | null
}

export interface PrintMatch {
  spelarar?: PrintMatchPlayer[] | null
  er_walkover?: boolean | null
  bane_nummer?: number | null
}

export function hentKlubbNamn(kasterid: number, alleKamper: PrintMatch[]): string {
  for (const kamp of alleKamper) {
    const sp = kamp.spelarar?.find(s => s.kasterid === kasterid)
    if (sp?.kaster?.klubb) return sp.kaster.klubb.kortnavn || sp.kaster.klubb.navn || ''
  }
  return ''
}

export function buildRoundInfos(
  kasterid: number,
  sortertRundar: number[],
  rundeMap: Map<number, PrintMatch[]>,
  startnrMap: Record<number, number>,
): RoundInfo[] {
  return sortertRundar.map(nr => {
    const kamp = (rundeMap.get(nr) ?? []).find(k => k.spelarar?.some(sp => sp.kasterid === kasterid))
    if (!kamp) return { court: '', opponentId: '', opponentName: '' }
    const opp = kamp.spelarar?.find(sp => sp.kasterid !== kasterid)
    const erWalkoverSeier = kamp.er_walkover && !opp?.kaster
    if (erWalkoverSeier) {
      return {
        court: kamp.bane_nummer ?? '',
        matchPoints: '2',
        playerScore: '21',
        opponentId: '-',
        opponentName: 'Walkover',
        opponentScore: '-',
      }
    }
    return {
      court: kamp.bane_nummer ?? '',
      opponentId: opp?.kasterid ? (startnrMap[opp.kasterid] ?? '') : '',
      opponentName: opp?.kaster ? `${opp.kaster.fornavn} ${opp.kaster.etternavn}` : '',
    }
  })
}
