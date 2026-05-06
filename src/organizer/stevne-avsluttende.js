import { supabase } from '../supabase.js'
import { renderOrgNav } from './org-nav.js'
import { beregnGyldigeGruppeStorrelsar, beregnCupStruktur, gyldigeRunde1Oppsett } from '../utils/kastemetoder-logikk.js'
import { genererCupRunde1, genererNesteCupRunde, genererFinaleOgBronsefinale } from './kampgenerering-db.js'
import { opnNumberpad } from './score-numberpad.js'
import { scoreForSp } from '../utils/kamp.js'
import { slettKamperForFase, settStevneFaseTilInnledende } from '../utils/organizer-test-utils.js'
import { renderOrgBanner, sorterStilling } from './org-shared.js'

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

  const gruppeNavnMap = Object.fromEntries((grupper ?? []).map(g => [g.navn, g.id]))
  const startnrMap = Object.fromEntries((resultat ?? []).map(r => [r.kasterid, r.startnummer]))

  const namnMap = {}
  for (const k of (kampar ?? [])) {
    for (const sp of k.spelarar ?? []) {
      if (sp.kasterid && sp.kaster && !namnMap[sp.kasterid]) {
        namnMap[sp.kasterid] = `${sp.kaster.fornavn} ${sp.kaster.etternavn}`
      }
    }
  }
  const resultatMedNamn = (resultat ?? []).map(r => ({ ...r, _namn: namnMap[r.kasterid] ?? `Spelar ${r.kasterid}` }))

  const stilling = sorterStilling(
    resultatMedNamn.map(r => ({
      ...r,
      kamp_poeng: r.kamp_poeng_innl ?? 0,
      score_poeng: r.score_poeng_innl ?? 0,
    })),
    innlKampar
  )

  container.innerHTML = `
    <div class="px-3 py-2">
      ${renderOrgNav(stevneid, 'avsluttende')}
      ${renderHeader(stevne, stevneid, { alleInnlBekrefta, harAvslKampar, harGruppefordeling, erSisteRundeFullfort, aktive, harSemfinale, semfinalarBekrefta, harFinale, finaleOgBronseBekrefta })}
      ${harAvslKampar && harGruppefordeling ? renderHovudinnhald(avslKampar, stilling, startnrMap) : ''}
      ${stevne.stevne_fase === 'avsluttende' && !harGruppefordeling ? renderGruppefordeling(stilling) : ''}
      ${stevne.stevne_fase === 'avsluttende' && harGruppefordeling && !harAvslKampar ? `<div class="avsl-stilling-einzel">${renderStilling(stilling)}</div>` : ''}
    </div>
  `

  bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, stilling, grupper ?? [], gruppeNavnMap)

  if (harAvslKampar && harGruppefordeling) {
    bindKampEvents(container, stevneid, avslKampar, startnrMap, resultatMedNamn, aktive.length)
    abonnerPaaEndringar(container, stevneid)
  }
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

  const knapperHtml = `
    ${handlingsHtml}
    <button id="test-slett-avsl-btn" class="btn btn-sm btn-outline-danger">TEST: Slett kamper</button>
    <button id="test-fase-innledende-btn" class="btn btn-sm btn-outline-secondary">TEST: Fase → innledende</button>
  `

  return renderOrgBanner(`${stevne.navn} — Avsluttande fase`, knapperHtml)
}

// --- Gruppefordeling-UI ---

function renderGruppefordeling(resultat) {
  const n = resultat.length
  const splits = beregnGyldigeGruppeStorrelsar(n)

  const sortert = resultat.map((r, i) => ({ ...r, cupPlassering: i + 1 }))

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

  const initNa = splits[0]?.nA ?? n
  const initNb = n - initNa
  const initOppsettA = gyldigeRunde1Oppsett(initNa)[0] ?? null
  const initOppsettB = initNb >= 2 ? (gyldigeRunde1Oppsett(initNb)[0] ?? null) : null
  const gruppePreview = renderGruppePreview(sortert, initNa,
    initOppsettA?.walkovers ?? 0,
    initOppsettB?.walkovers ?? 0
  )
  const strukturPreview = renderStrukturPreview(initNa, initNb, initOppsettA, initOppsettB)

  return `
    <div id="gruppe-val-wrapper">
      <h5 class="text-center mb-3">Velg gruppestørrelser for sluttspill</h5>
      <div class="d-flex gap-3 align-items-stretch flex-wrap mb-3">
        <div class="card">
          <div class="card-body">
            ${splitOptions}
          </div>
        </div>
        <div id="struktur-preview" class="flex-grow-1">${strukturPreview}</div>
      </div>
      <div id="runde1-format-veljar" class="d-flex gap-3 flex-wrap mb-2">
        <div class="avsl-gruppe-kol">${renderRunde1FormatVeljar('Gruppe A', initNa, 'runde1-format-a')}</div>
        <div class="avsl-gruppe-kol">${initNb >= 2 ? renderRunde1FormatVeljar('Gruppe B', initNb, 'runde1-format-b') : ''}</div>
      </div>
      <div id="gruppe-preview">${gruppePreview}</div>
      <div class="mt-3 d-flex gap-2">
        <button id="bekreft-gruppe-btn" class="btn btn-primary">Bekreft val</button>
      </div>
    </div>
  `
}

function renderGruppePreview(sortert, nA, woA = 0, woB = 0) {
  const gruppeA = sortert.slice(0, nA)
  const gruppeB = sortert.slice(nA)

  function tabellRader(spel, woCount = 0) {
    return spel.map((r, i) => {
      const erWo = i < woCount
      return `
      <tr>
        <td>${r.cupPlassering}</td>
        <td>${r.startnummer ?? ''}</td>
        <td>${r._namn ?? ''}${erWo ? ' <span class="badge bg-info text-dark">WO</span>' : ''}</td>
        <td class="text-center">${r.kamp_poeng_innl ?? 0}</td>
        <td class="text-center">${r.score_poeng_innl ?? 0}</td>
      </tr>`
    }).join('')
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
      <tbody>${tabellRader(gruppeA, woA)}</tbody>
    </table>`

  const tabellB = gruppeB.length ? `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tabellHeader}
      <tbody>${tabellRader(gruppeB, woB)}</tbody>
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

function renderStrukturPreview(nA, nB, oppsettA = null, oppsettB = null) {
  const strukturA = nA >= 2 ? beregnCupStruktur(nA, { runde1: oppsettA }) : []
  const strukturB = nB >= 2 ? beregnCupStruktur(nB, { runde1: oppsettB }) : []

  function renderGruppeStruktur(label, runder) {
    if (!runder.length) return ''
    return `<div><strong>${label}:</strong><ul class="mb-1 ps-3">${
      runder.map(r => `<li>Runde ${r.runde}: ${r.spelarar} spelarar → ${r.vidare} går vidare (${r.baner} baner)</li>`
      ).join('')
    }</ul></div>`
  }

  return `
    <div class="card h-100">
      <div class="card-body">
        <div class="d-flex gap-4 flex-wrap">
          ${renderGruppeStruktur('Gruppe A', strukturA)}
          ${nB > 0 ? renderGruppeStruktur('Gruppe B', strukturB) : ''}
        </div>
        <p class="mb-0 small text-muted">Etter semfinalar: Finale og Bronsefinale</p>
      </div>
    </div>`
}

// Genererer etiketten for eit runde1-oppsett
function oppsettLabel(o) {
  const wo = o.walkovers > 0 ? `${o.walkovers} wo` : '0 wo'
  if (o.c3 > 0) return `${wo}, ${o.c3} baner av 3`
  return `${wo}, ${o.c2} baner av 2`
}

// Viser radio-knapper for val av runde 1-format for éi gruppe.
// Returnerer tom streng viss det berre finst éitt gyldig oppsett.
function renderRunde1FormatVeljar(gruppeLabel, n, radioName) {
  const oppsett = gyldigeRunde1Oppsett(n)
  if (oppsett.length <= 1) return ''
  const radios = oppsett.map((o, i) => {
    const id = `${radioName}-${i}`
    const val = JSON.stringify(o)
    return `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="${radioName}" id="${id}"
          value='${val}' data-oppsett='${val}' ${i === 0 ? 'checked' : ''}>
        <label class="form-check-label" for="${id}">${oppsettLabel(o)}</label>
      </div>`
  }).join('')
  return `
    <div class="mb-2">
      <span class="small fw-semibold">${gruppeLabel} format:</span>
      ${radios}
    </div>`
}

// --- Hovudinnhald (kampar + stilling) ---

function renderHovudinnhald(avslKampar, stilling, startnrMap) {
  const rundeMap = new Map()
  for (const k of avslKampar) {
    if (!rundeMap.has(k.runde_nummer)) rundeMap.set(k.runde_nummer, [])
    rundeMap.get(k.runde_nummer).push(k)
  }

  const rundeHtml = [...rundeMap.entries()].map(([nr, rKampar]) => {
    const runde_namn = rKampar[0]?.runde_navn ?? `Runde ${nr}`
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
    : sp.map((s) => {
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
  const gruppeMap = new Map()
  for (const r of stilling) {
    const g = r.gruppe?.navn ?? '_'
    if (!gruppeMap.has(g)) gruppeMap.set(g, [])
    gruppeMap.get(g).push(r)
  }

  const harFleirGrupper = gruppeMap.size > 1 || !gruppeMap.has('_')

  const rows = [...gruppeMap.entries()].flatMap(([g, spelararIGruppe]) => {
    const aktivCount = spelararIGruppe.filter(r => r.runde_eliminert == null).length
    const gruppeHeader = harFleirGrupper && g !== '_'
      ? `<tr class="table-secondary"><td colspan="5" class="fw-semibold ps-2">Gruppe ${g}</td></tr>`
      : ''
    const playerRows = spelararIGruppe.map((r, i) => {
      const erEliminert = r.runde_eliminert != null
      const separator = erEliminert && i === aktivCount
        ? `<tr><td colspan="5" class="avsl-elim-separator"></td></tr>`
        : ''
      return separator + `<tr>
        <td${erEliminert ? ' class="avsl-elim-plass"' : ''}>${i + 1}</td>
        <td>${r.startnummer ?? ''}</td>
        <td>${r._namn ?? `Spelar ${r.kasterid}`}</td>
        <td class="text-center">${r.kamp_poeng_innl ?? 0}</td>
        <td class="text-center">${r.score_poeng_innl ?? 0}</td>
      </tr>`
    }).join('')
    return gruppeHeader + playerRows
  }).join('')

  return `
    <div>
      <h6 class="text-center fw-bold mb-1">Stilling</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-28">#</th>
            <th class="th-28">S</th>
            <th>NAMN</th>
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

// --- Event binding ---

function bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, resultat, grupper, gruppeNavnMap) {
  container.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
    if (!alleInnlBekrefta) return
    const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  if (!harGruppefordeling && stevne.stevne_fase === 'avsluttende') {
    const n = resultat.length
    const sortert = [...resultat]

    // Hjelpefunksjon: les valt oppsett for ei gruppe frå radio-inputs
    function lesValtOppsett(radioName, nGruppe) {
      const valtRadio = container.querySelector(`input[name="${radioName}"]:checked`)
      if (valtRadio?.dataset.oppsett) {
        try { return JSON.parse(valtRadio.dataset.oppsett) } catch { /* fall through */ }
      }
      return gyldigeRunde1Oppsett(nGruppe)[0] ?? null
    }

    container.querySelectorAll('input[name="gruppe-split"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const nA = parseInt(radio.value)
        const nB = n - nA
        const sortmedNamn = sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 }))
        // Oppdater format-veljar for ny gruppestørrelse
        const fmtEl = container.querySelector('#runde1-format-veljar')
        if (fmtEl) {
          fmtEl.innerHTML =
            `<div class="avsl-gruppe-kol">${renderRunde1FormatVeljar('Gruppe A', nA, 'runde1-format-a')}</div>` +
            `<div class="avsl-gruppe-kol">${nB >= 2 ? renderRunde1FormatVeljar('Gruppe B', nB, 'runde1-format-b') : ''}</div>`
          // Re-bind format-radio change etter at ny HTML er sett inn
          bindFormatRadioChange(nA, nB)
        }
        const strEl = container.querySelector('#struktur-preview')
        if (strEl) strEl.innerHTML = renderStrukturPreview(nA, nB, lesValtOppsett('runde1-format-a', nA), lesValtOppsett('runde1-format-b', nB))
        // Oppdater spelarliste med walkover-markering basert på valt format
        const woA = lesValtOppsett('runde1-format-a', nA)?.walkovers ?? 0
        const woB = lesValtOppsett('runde1-format-b', nB)?.walkovers ?? 0
        const prevEl = container.querySelector('#gruppe-preview')
        if (prevEl) prevEl.innerHTML = renderGruppePreview(sortmedNamn, nA, woA, woB)
      })
    })

    function bindFormatRadioChange(nA, nB) {
      container.querySelectorAll('input[name^="runde1-format"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const strEl = container.querySelector('#struktur-preview')
          if (strEl) strEl.innerHTML = renderStrukturPreview(nA, nB, lesValtOppsett('runde1-format-a', nA), lesValtOppsett('runde1-format-b', nB))
          const woA = lesValtOppsett('runde1-format-a', nA)?.walkovers ?? 0
          const woB = lesValtOppsett('runde1-format-b', nB)?.walkovers ?? 0
          const prevEl = container.querySelector('#gruppe-preview')
          if (prevEl) prevEl.innerHTML = renderGruppePreview(
            sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 })), nA, woA, woB
          )
        })
      })
    }
    // Bind for initiell gruppestørrelse (les frå checked radio)
    const initChecked = container.querySelector('input[name="gruppe-split"]:checked')
    const initNa = initChecked ? parseInt(initChecked.value) : (beregnGyldigeGruppeStorrelsar(n)[0]?.nA ?? n)
    bindFormatRadioChange(initNa, n - initNa)

    container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
      const valt = container.querySelector('input[name="gruppe-split"]:checked')
      if (!valt) return
      const nA = parseInt(valt.value)
      const nB = n - nA
      // Lagre valt format til sessionStorage
      const oppsettA = lesValtOppsett('runde1-format-a', nA)
      const oppsettB = nB >= 2 ? lesValtOppsett('runde1-format-b', nB) : null
      sessionStorage.setItem('runde1Format', JSON.stringify({ A: oppsettA, B: oppsettB }))

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

      await lastOgVis(container, stevneid)
    })
  }

  container.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
    const medSeeding = container.querySelector('#seeding-toggle')?.checked ?? true
    try {
      if (!harAvslKampar) {
        const sortert = [...resultat]
        const gruppeMap = {}
        sortert.forEach((r, i) => {
          const gNavn = r.gruppe?.navn ?? null
          const key = gNavn ?? '_ingen'
          if (!gruppeMap[key]) gruppeMap[key] = { gruppeNavn: gNavn, spelarar: [] }
          gruppeMap[key].spelarar.push({ kasterid: r.kasterid, plassering: i + 1 })
        })
        // Les lagra runde 1-format frå sessionStorage (sett ved "Bekreft val")
        let runde1Format = {}
        try { runde1Format = JSON.parse(sessionStorage.getItem('runde1Format') ?? '{}') } catch { /* bruk standard */ }
        sessionStorage.removeItem('runde1Format')
        const grupper = Object.values(gruppeMap).map(g => ({
          ...g,
          runde1Oppsett: runde1Format[g.gruppeNavn ?? 'A'] ?? null,
        }))
        await genererCupRunde1(stevneid, grupper, medSeeding)
      } else {
        const res = await genererNesteCupRunde(stevneid, medSeeding)
        if (res.erSemfinale) alert('Semifinalar er generert!')
      }
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })

  container.querySelector('#generer-finale-btn')?.addEventListener('click', async () => {
    try {
      await genererFinaleOgBronsefinale(stevneid)
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })

  container.querySelector('#test-slett-avsl-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Slett alle avsluttande kamper?')) return
    e.currentTarget.disabled = true
    await slettKamperForFase(stevneid, 'avsluttende')
    await lastOgVis(container, stevneid)
  })

  container.querySelector('#test-fase-innledende-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Sett stevne_fase til "innledende"?')) return
    e.currentTarget.disabled = true
    await settStevneFaseTilInnledende(stevneid)
    await lastOgVis(container, stevneid)
  })
}

function bindKampEvents(container, stevneid, avslKampar, startnrMap, resultat, antallAktive) {
  for (const kamp of avslKampar) {
    const sp = (kamp.spelarar ?? []).sort((a, b) => a.posisjon - b.posisjon)

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

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      location.hash = `#/kamp/${kamp.id}`
    })

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
  const valt = []

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
