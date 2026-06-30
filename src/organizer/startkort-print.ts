import { startcardTemplate } from '@/utils/startcard/startcard-template'
import { buildRoundInfos, hentKlubbNamn, type PrintMatch } from '@/utils/startcard/roundInfoBuilder'
import type { RoundInfo } from '@/utils/startcard/startcard-template'
import { logError } from '@/utils/logError'

interface PrintStandingsRow {
  kasterid: number
  startnummer?: number | string | null
  navn?: string | null
}

interface PrintTournament {
  navn: string
}

interface PrintPlayerData {
  startnummer: number | string
  navn: string | null
  klubb: string
  roundInfos: RoundInfo[]
}

const CSS_URL = new URL('../utils/startcard/startcard.css', import.meta.url).href

export function printStartCard(
  stevne: PrintTournament,
  allMatches: PrintMatch[],
  rundeMap: Map<number, PrintMatch[]>,
  startnrMap: Record<number, number>,
  stilling: PrintStandingsRow[],
): void {
  const sortedRounds = [...rundeMap.keys()].sort((a, b) => a - b)

  const players: PrintPlayerData[] = stilling
    .map(s => ({
      startnummer: s.startnummer ?? '',
      navn: s.navn ?? null,
      klubb: hentKlubbNamn(s.kasterid, allMatches),
      roundInfos: buildRoundInfos(s.kasterid, sortedRounds, rundeMap, startnrMap),
    }))
    .sort((a, b) => (Number(a.startnummer) || Infinity) - (Number(b.startnummer) || Infinity))

  const printWindow = window.open('', '_blank')
  if (!printWindow) { logError('printStartCard', 'Popup blocked — could not open print window'); return }

  printWindow.document.title = `Startkort – ${stevne.navn}`
  const styleLink = printWindow.document.createElement('link')
  styleLink.rel = 'stylesheet'
  styleLink.href = CSS_URL
  printWindow.document.head.appendChild(styleLink)

  players.forEach(sp => {
    const card = startcardTemplate(sp.startnummer, sp.navn, sp.klubb, stevne.navn, sp.roundInfos)
    printWindow.document.body.appendChild(card)
  })

  printWindow.document.close()
  styleLink.onload = () => {
    setTimeout(() => { printWindow.focus(); printWindow.print() }, 50)
  }
}
