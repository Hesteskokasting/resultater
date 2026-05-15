import { startcardTemplate, type RoundInfo } from '../utils/startcard/startcard-template'

interface StartkortKlubb {
  kortnavn?: string | null
  navn?: string | null
}

interface StartkortKaster {
  fornavn: string
  etternavn: string
  klubb?: StartkortKlubb | null
}

interface StartkortKampSpelar {
  kasterid: number
  kaster?: StartkortKaster | null
}

interface StartkortKamp {
  spelarar?: StartkortKampSpelar[] | null
  er_walkover?: boolean | null
  bane_nummer?: number | null
}

interface StartkortStillingRad {
  kasterid: number
  startnummer?: number | string | null
  namn?: string | null
}

interface StartkortStevne {
  navn: string
}

interface StartkortSpelarData {
  startnummer: number | string
  namn: string | null
  klubb: string
  roundInfos: RoundInfo[]
}

const CSS_URL = new URL('../utils/startcard/startcard.css', import.meta.url).href

export function printStartkort(
  stevne: StartkortStevne,
  alleKamper: StartkortKamp[],
  rundeMap: Map<number, StartkortKamp[]>,
  startnrMap: Record<number, number>,
  stilling: StartkortStillingRad[],
): void {
  const sortertRundar = [...rundeMap.keys()].sort((a, b) => a - b)

  const spelarar: StartkortSpelarData[] = stilling
    .map(s => ({
      startnummer: s.startnummer ?? '',
      namn: s.namn ?? null,
      klubb: hentKlubbNamn(s.kasterid, alleKamper),
      roundInfos: buildRoundInfos(s.kasterid, sortertRundar, rundeMap, startnrMap),
    }))
    .sort((a, b) => (Number(a.startnummer) || Infinity) - (Number(b.startnummer) || Infinity))

  const printWindow = window.open('', '_blank')
  if (!printWindow) { alert('Kunne ikkje opne utskriftsvindu.'); return }

  printWindow.document.title = `Startkort – ${stevne.navn}`
  const styleLink = printWindow.document.createElement('link')
  styleLink.rel = 'stylesheet'
  styleLink.href = CSS_URL
  printWindow.document.head.appendChild(styleLink)

  spelarar.forEach(sp => {
    const card = startcardTemplate(sp.startnummer, sp.namn, sp.klubb, stevne.navn, sp.roundInfos)
    printWindow.document.body.appendChild(card)
  })

  printWindow.document.close()
  styleLink.onload = () => {
    setTimeout(() => { printWindow.focus(); printWindow.print() }, 50)
  }
}

function hentKlubbNamn(kasterid: number, alleKamper: StartkortKamp[]): string {
  for (const kamp of alleKamper) {
    const sp = kamp.spelarar?.find(s => s.kasterid === kasterid)
    if (sp?.kaster?.klubb) return sp.kaster.klubb.kortnavn || sp.kaster.klubb.navn || ''
  }
  return ''
}

function buildRoundInfos(
  kasterid: number,
  sortertRundar: number[],
  rundeMap: Map<number, StartkortKamp[]>,
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
