import { scoreForSp, hentP1P2 } from '../utils/kamp.js'

export function renderOrgBanner(stevneNavn, knapperHtml = '') {
  return `
    <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
      <h5 class="mb-0 flex-grow-1">${stevneNavn}</h5>
      ${knapperHtml}
    </div>
  `
}

export function byggInnledendeSpelMap(alleKamper, startnrMap) {
  const spelMap = {}
  const ekteKasterids = new Set()

  for (const kamp of alleKamper) {
    const [, byeP2] = kamp.er_walkover ? hentP1P2(kamp.spelarar, startnrMap) : []
    for (const sp of kamp.spelarar ?? []) {
      if (!sp.kasterid || !sp.kaster) continue
      if (kamp.er_walkover && sp.kasterid === byeP2?.kasterid) continue
      ekteKasterids.add(sp.kasterid)
      if (!spelMap[sp.kasterid]) {
        spelMap[sp.kasterid] = {
          kasterid: sp.kasterid,
          namn: `${sp.kaster.fornavn} ${sp.kaster.etternavn}`,
          startnummer: startnrMap[sp.kasterid] ?? null,
          kamp_poeng: 0,
          score_poeng: 0,
          antall_kamper: 0,
        }
      }
      if (kamp.er_bekreftet) {
        spelMap[sp.kasterid].kamp_poeng += sp.kamp_poeng
        spelMap[sp.kasterid].score_poeng += sp.score_poeng
        spelMap[sp.kasterid].antall_kamper += 1
      }
    }
  }

  return { spelMap, ekteKasterids }
}

export function sorterStilling(stilling, kamper) {
  const bekrefta = kamper.filter(k => k.er_bekreftet)

  return [...stilling].sort((a, b) => {
    // 1. Aktive (runde_eliminert == null) kjem alltid først
    const aAktiv = a.runde_eliminert == null
    const bAktiv = b.runde_eliminert == null
    if (aAktiv !== bAktiv) return aAktiv ? -1 : 1

    // For eliminerte: seinare runde = betre plassering
    if (!aAktiv) {
      const rundeDiff = (b.runde_eliminert ?? 0) - (a.runde_eliminert ?? 0)
      if (rundeDiff !== 0) return rundeDiff
    }

    // 2. Kamppoeng DESC
    if (b.kamp_poeng !== a.kamp_poeng) return b.kamp_poeng - a.kamp_poeng

    // 3. Scorepoeng DESC
    if (b.score_poeng !== a.score_poeng) return b.score_poeng - a.score_poeng

    // 4. Innbyrdes (kamppoeng i kampar der begge møttest)
    let kpA = 0, kpB = 0
    for (const kamp of bekrefta) {
      const spA = kamp.spelarar?.find(s => s.kasterid === a.kasterid)
      const spB = kamp.spelarar?.find(s => s.kasterid === b.kasterid)
      if (spA && spB) { kpA += spA.kamp_poeng ?? 0; kpB += spB.kamp_poeng ?? 0 }
    }
    if (kpA !== kpB) return kpB - kpA

    // 5. Høgaste score i ein enkeltkamp (samanlikn sorterte lister)
    const scoresFor = (kid) => bekrefta
      .flatMap(k => k.spelarar?.filter(s => s.kasterid === kid) ?? [])
      .map(s => scoreForSp(s))
      .sort((x, y) => y - x)
    const sA = scoresFor(a.kasterid)
    const sB = scoresFor(b.kasterid)
    for (let i = 0; i < Math.min(sA.length, sB.length); i++) {
      if (sB[i] !== sA[i]) return sB[i] - sA[i]
    }

    // 6. Startnummer ASC
    return (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity)
  })
}
