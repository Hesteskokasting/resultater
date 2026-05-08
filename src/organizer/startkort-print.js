import { startcardTemplate } from '../utils/startcard/startcard-template.js'

const CSS_URL = new URL('../utils/startcard/startcard.css', import.meta.url).href

export function printStartkort(stevne, alleKamper, rundeMap, startnrMap, stilling) {
  const sortertRundar = [...rundeMap.keys()].sort((a, b) => a - b)

  const spelarar = stilling
    .map(s => ({
      startnummer: s.startnummer ?? '',
      namn: s.namn,
      klubb: hentKlubbNamn(s.kasterid, alleKamper),
      roundInfos: buildRoundInfos(s.kasterid, sortertRundar, rundeMap, startnrMap),
    }))
    .sort((a, b) => (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity))

  const printWindow = window.open('', '_blank')
  if (!printWindow) { alert('Kunne ikkje opne utskriftsvindu.'); return }

  printWindow.document.title = `Startkort – ${stevne.namn}`
  const styleLink = printWindow.document.createElement('link')
  styleLink.rel = 'stylesheet'
  styleLink.href = CSS_URL
  printWindow.document.head.appendChild(styleLink)

  spelarar.forEach(sp => {
    const card = startcardTemplate(sp.startnummer, sp.namn, sp.klubb, stevne.namn, sp.roundInfos)
    printWindow.document.body.appendChild(card)
  })

  printWindow.document.close()
  styleLink.onload = () => {
    setTimeout(() => { printWindow.focus(); printWindow.print() }, 50)
  }
}

function hentKlubbNamn(kasterid, alleKamper) {
  for (const kamp of alleKamper) {
    const sp = kamp.spelarar?.find(s => s.kasterid === kasterid)
    if (sp?.kaster?.klubb) return sp.kaster.klubb.kortnavn || sp.kaster.klubb.navn || ''
  }
  return ''
}

function buildRoundInfos(kasterid, sortertRundar, rundeMap, startnrMap) {
  return sortertRundar.map(nr => {
    const kamp = (rundeMap.get(nr) ?? []).find(k => k.spelarar?.some(sp => sp.kasterid === kasterid))
    if (!kamp) return { court: '', opponentId: '', opponentName: '' }
    const opp = kamp.spelarar?.find(sp => sp.kasterid !== kasterid)
    return {
      court: kamp.bane_nummer ?? '',
      opponentId: opp?.kasterid ? (startnrMap[opp.kasterid] ?? '') : '',
      opponentName: opp?.kaster ? `${opp.kaster.fornavn} ${opp.kaster.etternavn}` : '',
    }
  })
}
