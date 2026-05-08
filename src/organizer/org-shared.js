import { scoreForSp, hentP1P2 } from '../utils/kamp.js'

export function renderSpelarkamparDetalj(kasterid, kamper, startnrMap) {
  const eineKamper = (kamper ?? [])
    .filter(k => k.spelarar?.some(sp => sp.kasterid === kasterid))
    .sort((a, b) => a.runde_nummer - b.runde_nummer)

  if (!eineKamper.length) {
    return '<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>'
  }

  return eineKamper.map(kamp => {
    const sp = kamp.spelarar?.find(s => s.kasterid === kasterid)
    const opp = kamp.spelarar?.find(s => s.kasterid !== kasterid)
    const erWalkoverSeier = kamp.er_walkover && (!opp || !opp.kaster)

    const oppNamn = erWalkoverSeier
      ? 'Walkover'
      : (opp?.kaster ? `${opp.kaster.fornavn} ${opp.kaster.etternavn}` : '—')
    const oppNr = erWalkoverSeier ? '' : (opp?.kasterid ? (startnrMap[opp.kasterid] ?? '') : '')
    const oppVis = oppNr ? `${oppNamn} (${oppNr})` : oppNamn

    const myScore = erWalkoverSeier ? 21 : scoreForSp(sp)
    const oppScore = erWalkoverSeier ? 0 : scoreForSp(opp)
    const harScore = kamp.er_bekreftet || kamp.er_walkover || myScore > 0 || oppScore > 0
    const resultat = `${myScore} - ${oppScore}`

    return `<tr>
      <td class="text-center">${kamp.runde_nummer}</td>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${oppVis}</td>
      <td class="text-center">${resultat}</td>
    </tr>`
  }).join('')
}

export function bindStillingDetaljar(container, tableId) {
  const tabell = container.querySelector(`#${tableId}`)
  if (!tabell) return
  tabell.addEventListener('click', e => {
    const rad = e.target.closest('tr[data-kasterid]')
    if (!rad || rad.classList.contains('stilling-detalj')) return
    const kid = rad.dataset.kasterid
    const detaljRad = tabell.querySelector(`tr.stilling-detalj[data-kasterid="${kid}"]`)
    if (!detaljRad) return
    const erSkjult = detaljRad.hidden
    tabell.querySelectorAll('tr.stilling-detalj').forEach(r => { r.hidden = true })
    tabell.querySelectorAll('tr[data-kasterid]').forEach(r => r.classList.remove('stilling-aktiv'))
    if (erSkjult) {
      detaljRad.hidden = false
      rad.classList.add('stilling-aktiv')
    }
  })
}

export function lagOnEndringHandler(stevneid, faner, container, lastOgVisFn, stopFn) {
  return function onEndring() {
    const hash = location.hash
    const erPaaSide = faner.some(f =>
      hash === `#/stevne/${stevneid}/organizer/${f}` ||
      hash === `#/stevne/${stevneid}/live/${f}`
    )
    if (erPaaSide) {
      lastOgVisFn(container, stevneid)
    } else {
      stopFn()
    }
  }
}

export function renderInnledendeKnappar(stevne, erAlleKamperBekreftet, erSwiss) {
  return `
    ${erSwiss ? `<button id="neste-runde-btn" class="btn btn-sm btn-warning"${stevne.erfullfort || !erAlleKamperBekreftet ? ' disabled' : ''}>Generer neste runde</button>` : ''}
    <button id="fullfor-btn" class="btn btn-sm btn-primary"${stevne.erfullfort || !erAlleKamperBekreftet ? ' disabled' : ''}>Start avsluttande fase</button>
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${stevne.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
  `
}

export function renderAvsluttendeKnappar(stevne, state) {
  const { alleInnlBekrefta, harAvslKampar, harGruppefordeling, erSisteRundeFullfort,
    aktive, harSemfinale, semfinalarBekrefta, harFinale, finaleOgBronseBekrefta,
    harPrekonfigurertFormat = false } = state
  const fase = stevne.stevne_fase

  let handlingsHtml = ''

  if (fase !== 'avsluttende') {
    if (!alleInnlBekrefta) {
      handlingsHtml = '<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>'
    } else {
      handlingsHtml = `
        <button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${harPrekonfigurertFormat ? `<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>` : ''}`
    }
  } else if (!harGruppefordeling) {
    // Gruppefordeling UI = eiga seksjon under
  } else if (harGruppefordeling && !harAvslKampar) {
    handlingsHtml = `<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`
  } else if (semfinalarBekrefta && !harFinale) {
    handlingsHtml = `<button id="generer-finale-btn" class="btn btn-sm btn-warning">Generer finale og bronsefinale</button>`
  } else if (erSisteRundeFullfort && !semfinalarBekrefta && !harFinale && aktive.length <= 4) {
    handlingsHtml = `
      <label class="form-check-label me-2 small" for="seeding-toggle">Seeding</label>
      <div class="form-check form-switch d-inline-block me-2">
        <input class="form-check-input" type="checkbox" id="seeding-toggle" checked>
      </div>
      <button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer semifinalar</button>
    `
  }

  return `
    ${handlingsHtml}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${stevne.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>
  `
}

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
