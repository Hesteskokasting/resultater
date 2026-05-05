import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'
import { beregnGyldigeGruppeStorrelsar, beregnCupStruktur } from '../utils/kastemetoder-logikk.js'
import { genererCupRunde1, genererNesteCupRunde, genererFinaleOgBronsefinale } from './kampgenerering-db.js'
import { opnNumberpad } from './score-numberpad.js'
import { scoreForSp } from '../utils/kamp.js'

let kanal = null

export async function render(container, { id } = {}) {
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p class="laster">Laster…</p>'
  await lastOgVis(container, Number(id))
}

async function lastOgVis(container, stevneid) {
  const [{ data: stevne }, { data: kampar }, { data: resultat }, { data: grupper }] = await Promise.all([
    supabase.from('stevne').select(`
      id, navn, stevne_fase,
      avsluttendemetode:avsluttendekastemetodeid(id, navn)
    `).eq('id', stevneid).single(),
    supabase.from('kamp').select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer))
    `).eq('stevneid', stevneid).order('runde_nummer').order('bane_nummer'),
    supabase.from('resultat').select(`
      kasterid, startnummer, plassering, runde_eliminert,
      kamp_poeng_innl, score_poeng_innl,
      gruppe:gruppeid(id, navn)
    `).eq('stevneid', stevneid),
    supabase.from('gruppe').select('id, navn').in('navn', ['A', 'B']),
  ])

  if (!stevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  const innlKampar = (kampar ?? []).filter(k => k.fase === 'innledende')
  const avslKampar = (kampar ?? []).filter(k => k.fase === 'avsluttende')
  const alleInnlBekrefta = innlKampar.length > 0 && innlKampar.every(k => k.er_bekreftet)
  const harAvslKampar = avslKampar.length > 0
  const harGruppefordeling = (resultat ?? []).some(r => r.gruppe != null)

  const sisteRundeNr = harAvslKampar ? Math.max(...avslKampar.map(k => k.runde_nummer)) : 0
  const sisteRunde = avslKampar.filter(k => k.runde_nummer === sisteRundeNr)
  const erSisteRundeFullfort = sisteRunde.length > 0 && sisteRunde.every(k => k.er_bekreftet || k.er_walkover)

  const aktive = (resultat ?? []).filter(r => r.runde_eliminert == null)
  const harSemfinale = avslKampar.some(k => k.runde_navn === 'Semifinale')
  const semfinalarBekrefta = harSemfinale && avslKampar.filter(k => k.runde_navn === 'Semifinale').every(k => k.er_bekreftet)
  const harFinale = avslKampar.some(k => k.runde_navn === 'Finale')
  const finaleOgBronseBekrefta = harFinale && avslKampar.filter(k => k.runde_navn === 'Finale' || k.runde_navn === 'Bronsefinale').every(k => k.er_bekreftet)

  // Gruppeinfo-map
  const gruppeNavnMap = Object.fromEntries((grupper ?? []).map(g => [g.navn, g.id]))
  const startnrMap = Object.fromEntries((resultat ?? []).map(r => [r.kasterid, r.startnummer]))

  // Bygg namns-map frå kamp_spelar-data
  const namnMap = {}
  for (const k of (kampar ?? [])) {
    for (const sp of k.spelarar ?? []) {
      if (sp.kasterid && sp.kaster && !namnMap[sp.kasterid]) {
        namnMap[sp.kasterid] = `${sp.kaster.fornavn} ${sp.kaster.etternavn}`
      }
    }
  }
  // Berik resultat med namn
  const resultatMedNamn = (resultat ?? []).map(r => ({ ...r, _namn: namnMap[r.kasterid] ?? `Spelar ${r.kasterid}` }))

  // --- Stilling ---
  const stilling = beregnStilling(resultatMedNamn, avslKampar)

  // --- Render ---
  container.innerHTML = `
    <div class="px-3 py-2">
      ${renderOrgNav(stevneid, 'avsluttende')}
      ${renderHeader(stevne, stevneid, { alleInnlBekrefta, harAvslKampar, harGruppefordeling, erSisteRundeFullfort, aktive, harSemfinale, semfinalarBekrefta, harFinale, finaleOgBronseBekrefta })}
      ${harAvslKampar && harGruppefordeling ? renderHovudinnhald(avslKampar, stilling, startnrMap) : ''}
      ${stevne.stevne_fase === 'avsluttende' && !harGruppefordeling ? renderGruppefordeling(resultatMedNamn) : ''}
      ${stevne.stevne_fase === 'avsluttende' && harGruppefordeling && !harAvslKampar ? `<div class="avsl-stilling-einzel">${renderStilling(stilling)}</div>` : ''}
    </div>
  `

  bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, resultatMedNamn, grupper ?? [], gruppeNavnMap)

  if (harAvslKampar && harGruppefordeling) {
    bindKampEvents(container, stevneid, avslKampar, startnrMap, resultatMedNamn, aktive.length)
    abonnerPaaEndringar(container, stevneid)
  }
}

// --- Stilling ---

function beregnStilling(resultat, avslKampar) {
  const bekrefta = avslKampar.filter(k => k.er_bekreftet)
  return [...resultat].sort((a, b) => {
    const aAktiv = a.runde_eliminert == null
    const bAktiv = b.runde_eliminert == null
    if (aAktiv !== bAktiv) return aAktiv ? -1 : 1
    if (aAktiv) {
      // Aktive: sorter etter kamp_poeng_innl, score_poeng_innl
      return (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0)
        || (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0)
    }
    // Eliminerte: sorter etter runde_eliminert DESC (seinare = betre)
    return (b.runde_eliminert ?? 0) - (a.runde_eliminert ?? 0)
      || (a.startnummer ?? 0) - (b.startnummer ?? 0)
  })
}

// --- Header med handlingsknapp ---

function renderHeader(stevne, stevneid, state) {
  const { alleInnlBekrefta, harAvslKampar, harGruppefordeling, erSisteRundeFullfort,
    aktive, harSemfinale, semfinalarBekrefta, harFinale, finaleOgBronseBekrefta } = state
  const fase = stevne.stevne_fase

  let handlingsHtml = ''

  if (fase !== 'avsluttende') {
    if (!alleInnlBekrefta) {
      handlingsHtml = '<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>'
    } else {
      handlingsHtml = `<button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>`
    }
  } else if (!harGruppefordeling) {
    // Gruppefordeling UI = eiga seksjon under
  } else if (harGruppefordeling && !harAvslKampar) {
    handlingsHtml = `
      <label class="form-check-label me-2 small" for="seeding-toggle">Seeding</label>
      <div class="form-check form-switch d-inline-block me-2">
        <input class="form-check-input" type="checkbox" id="seeding-toggle" checked>
      </div>
      <button id="neste-runde-btn" class="btn btn-sm btn-success">Generer runde 1</button>
    `
  } else if (semfinalarBekrefta && !harFinale) {
    handlingsHtml = `<button id="generer-finale-btn" class="btn btn-sm btn-warning">Generer finale og bronsefinale</button>`
  } else if (erSisteRundeFullfort && !semfinalarBekrefta && !harFinale) {
    const aktiveAnt = aktive.length
    const label = aktiveAnt <= 4 ? 'Generer semifinalar' : 'Generer neste runde'
    handlingsHtml = `
      <label class="form-check-label me-2 small" for="seeding-toggle">Seeding</label>
      <div class="form-check form-switch d-inline-block me-2">
        <input class="form-check-input" type="checkbox" id="seeding-toggle" checked>
      </div>
      <button id="neste-runde-btn" class="btn btn-sm btn-warning">${label}</button>
    `
  }

  return `
    <div class="d-flex align-items-center gap-2 mb-3 avsl-fase-header">
      <h5 class="mb-0 flex-grow-1">${stevne.navn} — Avsluttande fase</h5>
      ${handlingsHtml}
    </div>
  `
}

// --- Gruppefordeling-UI ---

function renderGruppefordeling(resultat) {
  const n = resultat.length
  const splits = beregnGyldigeGruppeStorrelsar(n)

  // Sorter resultat etter innledende plassering (kamp_poeng_innl DESC, score_poeng_innl DESC)
  const sortert = [...resultat].sort((a, b) =>
    (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
    (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0) ||
    (a.startnummer ?? 0) - (b.startnummer ?? 0)
  ).map((r, i) => ({ ...r, cupPlassering: i + 1 }))

  const splitOptions = [
    ...splits.map((s, i) => `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${i}" value="${s.nA}" ${i === 0 ? 'checked' : ''}>
        <label class="form-check-label" for="split-${i}">A:${s.nA} — B:${s.nB}</label>
      </div>`),
    `<div class="form-check">
      <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${n}">
      <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
    </div>`,
  ].join('')

  const gruppePreview = renderGruppePreview(sortert, splits[0]?.nA ?? n)
  const strukturPreview = renderStrukturPreview(splits[0]?.nA ?? n, n - (splits[0]?.nA ?? n))

  return `
    <div id="gruppe-val-wrapper">
      <h5 class="text-center mb-3">Velg gruppestørrelser for sluttspill</h5>
      <div class="card mb-3 avsl-maks-600">
        <div class="card-body">
          ${splitOptions}
        </div>
      </div>
      <div id="gruppe-preview">${gruppePreview}</div>
      <div id="struktur-preview" class="mt-3">${strukturPreview}</div>
      <div class="mt-3 d-flex gap-2">
        <button id="bekreft-gruppe-btn" class="btn btn-primary">Bekreft val</button>
      </div>
    </div>
  `
}

function renderGruppePreview(sortert, nA) {
  const gruppeA = sortert.slice(0, nA)
  const gruppeB = sortert.slice(nA)

  function tabellRader(spel) {
    return spel.map(r => `
      <tr>
        <td>${r.cupPlassering}</td>
        <td>${r.startnummer ?? ''}</td>
        <td>${r._namn ?? ''}</td>
        <td class="text-center">${r.kamp_poeng_innl ?? 0}</td>
        <td class="text-center">${r.score_poeng_innl ?? 0}</td>
      </tr>`).join('')
  }

  const tabellHeader = `
    <thead class="table-dark"><tr>
      <th class="th-32">#</th><th class="th-36">S</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`

  const tabellA = `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tabellHeader}
      <tbody>${tabellRader(gruppeA)}</tbody>
    </table>`

  const tabellB = gruppeB.length ? `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tabellHeader}
      <tbody>${tabellRader(gruppeB)}</tbody>
    </table>` : ''

  return `
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${gruppeA.length})</h6>
        ${tabellA}
      </div>
      ${gruppeB.length ? `<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${gruppeB.length})</h6>
        ${tabellB}
      </div>` : ''}
    </div>`
}

function renderStrukturPreview(nA, nB) {
  const strukturA = nA >= 2 ? beregnCupStruktur(nA) : []
  const strukturB = nB >= 2 ? beregnCupStruktur(nB) : []

  function renderGruppeStruktur(label, runder) {
    if (!runder.length) return ''
    return `<div class="mb-2"><strong>${label}:</strong><ul class="mb-1 ps-3">${
      runder.map(r => `<li>Runde ${r.runde}: ${r.spelarar} spelarar → ${r.vidare} går vidare (${r.baner} baner)</li>`
      ).join('')
    }</ul></div>`
  }

  return `
    <div class="card avsl-maks-600">
      <div class="card-body">
        <strong>Sluttspillstruktur:</strong>
        ${renderGruppeStruktur('Gruppe A', strukturA)}
        ${nB > 0 ? renderGruppeStruktur('Gruppe B', strukturB) : ''}
        <p class="mb-0 small text-muted">Etter semfinalar: Finale og Bronsefinale</p>
      </div>
    </div>`
}

// --- Hovudinnhald (kampar + stilling) ---

function renderHovudinnhald(avslKampar, stilling, startnrMap) {
  const rundeMap = new Map()
  for (const k of avslKampar) {
    if (!rundeMap.has(k.runde_nummer)) rundeMap.set(k.runde_nummer, [])
    rundeMap.get(k.runde_nummer).push(k)
  }

  const gruppeNamn = (rKampar) => {
    const g = rKampar[0]?.gruppe_navn
    return g ? ` — Gruppe ${g}` : ''
  }

  // Group by runde, then within runde by gruppe
  const rundeHtml = [...rundeMap.entries()].map(([nr, rKampar]) => {
    const runde_namn = rKampar[0]?.runde_navn ?? `Runde ${nr}`
    // Split by gruppe_navn
    const etter_gruppe = {}
    for (const k of rKampar) {
      const g = k.gruppe_navn ?? '_'
      if (!etter_gruppe[g]) etter_gruppe[g] = []
      etter_gruppe[g].push(k)
    }

    return Object.entries(etter_gruppe).map(([g, gKampar]) => {
      const tittel = runde_namn + (g !== '_' ? ` — Gruppe ${g}` : '')
      return renderRunde(tittel, gKampar, startnrMap)
    }).join('')
  }).join('')

  return `
    <div class="d-flex gap-3 align-items-start">
      <div class="flex-grow-1">${rundeHtml}</div>
      <div class="avsl-stilling-kol">${renderStilling(stilling)}</div>
    </div>`
}

function renderRunde(tittel, kampar, startnrMap) {
  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">${tittel}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>Spelarar</th>
            <th class="th-120"></th>
          </tr>
        </thead>
        <tbody>
          ${kampar.map(k => kampRad(k, startnrMap)).join('')}
        </tbody>
      </table>
    </div>`
}

function kampRad(kamp, startnrMap) {
  const sp = (kamp.spelarar ?? []).sort((a, b) => a.posisjon - b.posisjon)

  const spelerNamn = (s) => {
    if (!s?.kaster) return '—'
    const nr = startnrMap[s.kasterid]
    const namn = `${s.kaster.fornavn} ${s.kaster.etternavn}`
    return nr ? `${namn} (${nr})` : namn
  }

  const spelarListe = kamp.er_walkover
    ? `${spelerNamn(sp[0])} <span class="badge bg-secondary">Walkover</span>`
    : sp.map((s, i) => {
        const tot = scoreForSp(s)
        const score = kamp.er_bekreftet || tot > 0 ? ` <span class="badge bg-light text-dark">${tot}</span>` : ''
        return `${spelerNamn(s)}${score}`
      }).join(' — ')

  const bekrefta = kamp.er_bekreftet || kamp.er_walkover
  const bekrfKlass = bekrefta ? 'btn-success' : 'btn-outline-secondary'
  const bekrfDisabled = bekrefta ? ' disabled' : ''

  return `
    <tr>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${spelarListe}</td>
      <td class="text-end pe-2">
        ${!kamp.er_walkover && !kamp.er_tre_spelarar ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${bekrefta ? ' disabled' : ''}>+</button>` : ''}
        <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}" title="Scoreboard"${bekrefta && !kamp.er_tre_spelarar ? ' disabled' : ''}>S</button>
        <button class="btn ${bekrfKlass} btn-sm" id="bekrft-${kamp.id}"${bekrfDisabled}>Bekreft</button>
      </td>
    </tr>`
}

function renderStilling(stilling) {
  return `
    <div>
      <h6 class="text-center fw-bold mb-1">Stilling</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-28">#</th>
            <th class="th-28">S</th>
            <th>NAMN</th>
            <th class="th-28 text-center">G</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
          </tr>
        </thead>
        <tbody>
          ${(() => {
            const aktivCount = stilling.filter(r => r.runde_eliminert == null).length
            return stilling.map((r, i) => {
              const erEliminert = r.runde_eliminert != null
              const erForsteEliminerte = erEliminert && i === aktivCount
              const separator = erForsteEliminerte
                ? `<tr><td colspan="6" class="avsl-elim-separator"></td></tr>`
                : ''
              return separator + `<tr>
                <td${erEliminert ? ' class="avsl-elim-plass"' : ''}>${i + 1}</td>
                <td>${r.startnummer ?? ''}</td>
                <td>${r._namn ?? `Spelar ${r.kasterid}`}</td>
                <td class="text-center">${r.gruppe?.navn ?? ''}</td>
                <td class="text-center">${r.kamp_poeng_innl ?? 0}</td>
                <td class="text-center">${r.score_poeng_innl ?? 0}</td>
              </tr>`
            }).join('')
          })()}
        </tbody>
      </table>
    </div>`
}

// --- Event binding ---

function bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, resultat, grupper, gruppeNavnMap) {
  // Start avsluttende fase
  container.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
    if (!alleInnlBekrefta) return
    const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  // Gruppefordeling
  if (!harGruppefordeling && stevne.stevne_fase === 'avsluttende') {
    const n = resultat.length
    const sortert = [...resultat].sort((a, b) =>
      (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
      (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0)
    )

    // Oppdater preview ved val-endring
    container.querySelectorAll('input[name="gruppe-split"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const nA = parseInt(radio.value)
        const sortmedNamn = sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 }))
        const prevEl = container.querySelector('#gruppe-preview')
        if (prevEl) prevEl.innerHTML = renderGruppePreview(sortmedNamn, nA)
        const strEl = container.querySelector('#struktur-preview')
        if (strEl) strEl.innerHTML = renderStrukturPreview(nA, n - nA)
      })
    })

    container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
      const valt = container.querySelector('input[name="gruppe-split"]:checked')
      if (!valt) return
      const nA = parseInt(valt.value)

      const gruppeAId = gruppeNavnMap['A'] ?? null
      const gruppeBId = gruppeNavnMap['B'] ?? null

      const updates = sortert.map((r, i) => {
        const erA = i < nA
        return supabase.from('resultat')
          .update({ gruppeid: erA ? gruppeAId : (gruppeBId ?? gruppeAId) })
          .eq('stevneid', stevneid).eq('kasterid', r.kasterid)
      })
      const results = await Promise.all(updates)
      const err = results.find(r => r.error)?.error
      if (err) { alert('Feil: ' + err.message); return }

      // Vis runde 1-generator med seeding-val
      await lastOgVis(container, stevneid)
    })
  }

  // Neste runde
  container.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
    const medSeeding = container.querySelector('#seeding-toggle')?.checked ?? true
    try {
      if (!harAvslKampar) {
        // Runde 1: bygg grupper frå resultat
        const sortert = [...resultat].sort((a, b) =>
          (b.kamp_poeng_innl ?? 0) - (a.kamp_poeng_innl ?? 0) ||
          (b.score_poeng_innl ?? 0) - (a.score_poeng_innl ?? 0)
        )
        const gruppeMap = {}
        sortert.forEach((r, i) => {
          const gNavn = r.gruppe?.navn ?? null
          const key = gNavn ?? '_ingen'
          if (!gruppeMap[key]) gruppeMap[key] = { gruppeNavn: gNavn, spelarar: [] }
          gruppeMap[key].spelarar.push({ kasterid: r.kasterid, plassering: i + 1 })
        })
        await genererCupRunde1(stevneid, Object.values(gruppeMap), medSeeding)
      } else {
        const res = await genererNesteCupRunde(stevneid, medSeeding)
        if (res.erSemfinale) alert('Semifinalar er generert!')
      }
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })

  // Generer finale
  container.querySelector('#generer-finale-btn')?.addEventListener('click', async () => {
    try {
      await genererFinaleOgBronsefinale(stevneid)
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })
}

function bindKampEvents(container, stevneid, avslKampar, startnrMap, resultat, antallAktive) {
  for (const kamp of avslKampar) {
    const sp = (kamp.spelarar ?? []).sort((a, b) => a.posisjon - b.posisjon)

    // + knapp (2-spelar, enter scores via numberpad)
    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', async () => {
      const p1 = sp[0]
      const p2 = sp[1]
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      opnNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
        const updates = []
        if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1 }).eq('id', p1.id))
        if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2 }).eq('id', p2.id))
        await Promise.all(updates)
        await lastOgVis(container, stevneid)
      })
    })

    // Scoreboard-knapp
    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      location.hash = `#/kamp/${kamp.id}`
    })

    // Bekreft-knapp
    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', () => {
      if (kamp.er_tre_spelarar) {
        opnTreSpelarBekreftDialog(container, kamp, sp, stevneid, startnrMap, resultat, antallAktive)
      } else {
        bekreftCupKamp2Spelar(container, stevneid, kamp, sp, antallAktive)
      }
    })
  }
}

// --- Bekreft 2-spelar cup-kamp ---

async function bekreftCupKamp2Spelar(container, stevneid, kamp, sp, antallAktive) {
  const p1 = sp[0]
  const p2 = sp[1]

  // Hent oppdaterte scores frå DB
  const { data: aktuellSp } = await supabase
    .from('kamp_spelar')
    .select('id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)')
    .eq('kampid', kamp.id)

  const ak1 = aktuellSp?.find(s => s.id === p1?.id)
  const ak2 = aktuellSp?.find(s => s.id === p2?.id)

  const s1 = scoreForSp(ak1 ?? p1)
  const s2 = scoreForSp(ak2 ?? p2)

  if (s1 === 0 && s2 === 0 && !confirm('Ingen score registrert. Vil du bekrefte kampen likevel?')) return

  const vinnar = s1 >= s2 ? p1 : p2
  const tapar = s1 >= s2 ? p2 : p1

  await _lagreCupKampResultat(stevneid, kamp, sp, vinnar?.kasterid ? [vinnar.kasterid] : [], tapar?.kasterid ?? null, antallAktive)
  await lastOgVis(container, stevneid)
}

// --- Dialog for 3-spelar bekreftelse ---

function opnTreSpelarBekreftDialog(container, kamp, sp, stevneid, startnrMap, resultat, antallAktive) {
  const namns = sp.map(s => s?.kaster ? `${s.kaster.fornavn} ${s.kaster.etternavn}` : `Spelar ${s?.posisjon}`)
  const valt = [] // kasterids i rekkefølgje (første = 1. plass)

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function render() {
    const eliminert = valt.length === 2 ? sp.find(s => !valt.includes(s.kasterid)) : null
    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${sp.map((s, i) => {
            const idx = valt.indexOf(s.kasterid)
            const erValt = idx !== -1
            const erEliminert = !!eliminert && eliminert.kasterid === s.kasterid
            const plasseringLabel = idx === 0 ? '1. plass' : idx === 1 ? '2. plass' : ''
            return `<button
              class="btn ${erValt ? 'btn-success' : erEliminert ? 'btn-outline-danger' : 'btn-outline-secondary'} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${s.kasterid}"
              ${erEliminert ? 'disabled' : ''}
            ><span>${namns[i]}</span>${
              plasseringLabel ? `<span class="badge bg-success-subtle text-success-emphasis">${plasseringLabel}</span>` :
              erEliminert ? `<span class="badge bg-danger">Eliminert</span>` : ''
            }</button>`
          }).join('')}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${valt.length !== 2 ? 'disabled' : ''}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `

    modal.querySelector('#avbryt-tre-btn').addEventListener('click', () => modal.remove())

    modal.querySelectorAll('[data-kasterid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const kid = Number(btn.dataset.kasterid)
        const idx = valt.indexOf(kid)
        if (idx !== -1) valt.splice(idx, 1)
        else if (valt.length < 2) valt.push(kid)
        render()
      })
    })

    modal.querySelector('#bekreft-tre-btn')?.addEventListener('click', async () => {
      if (valt.length !== 2) return
      const eliminertId = sp.find(s => !valt.includes(s.kasterid))?.kasterid
      modal.remove()
      await _lagreCupKampResultat(stevneid, kamp, sp, [...valt], eliminertId, antallAktive)
      await lastOgVis(container, stevneid)
    })
  }

  render()
}

// --- Lagre cup-kamp-resultat ---

async function _lagreCupKampResultat(stevneid, kamp, sp, vidareIds, eliminertId, antallAktive) {
  await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)

  if (!eliminertId) return

  const erFinale = kamp.runde_navn === 'Finale' || kamp.runde_navn === 'Bronsefinale'
  const elimUpdate = erFinale
    ? { runde_eliminert: kamp.runde_nummer, plassering: kamp.runde_navn === 'Finale' ? 2 : 4 }
    : { runde_eliminert: kamp.runde_nummer }

  await supabase.from('resultat')
    .update(elimUpdate)
    .eq('stevneid', stevneid).eq('kasterid', eliminertId)

  // Sett plassering for vinnaren av Finale
  if (kamp.runde_navn === 'Finale' && vidareIds.length > 0) {
    await supabase.from('resultat')
      .update({ plassering: 1 })
      .eq('stevneid', stevneid).eq('kasterid', vidareIds[0])
  }
  if (kamp.runde_navn === 'Bronsefinale' && vidareIds.length > 0) {
    await supabase.from('resultat')
      .update({ plassering: 3 })
      .eq('stevneid', stevneid).eq('kasterid', vidareIds[0])
  }
}

// --- Sanntid ---

function abonnerPaaEndringar(container, stevneid) {
  if (kanal) return
  kanal = supabase
    .channel(`stevne-avsl-${stevneid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, () => {
      if (location.hash === `#/stevne/${stevneid}/organizer/avsluttende`) {
        lastOgVis(container, stevneid)
      } else {
        supabase.removeChannel(kanal); kanal = null
      }
    })
    .subscribe()
}
