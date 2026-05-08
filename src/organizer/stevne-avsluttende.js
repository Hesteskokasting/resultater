import { supabase } from '../supabase.js'
import { gyldigeRunde1Oppsett } from '../utils/kastemetoder-logikk.js'
import { renderGruppefordeling, renderGruppePreview, renderGruppePanelInnhald, renderStrukturListeHtml } from '../utils/gruppefordeling-ui.js'
import { genererCupRunde1, genererNesteCupRunde, genererNesteCupRundeForGruppe, genererFinaleOgBronsefinale } from './kampgenerering-db.js'
import { opnNumberpad } from './score-numberpad.js'
import { scoreForSp } from '../utils/kamp.js'
import { sorterStilling, renderAvsluttendeKnappar, lagOnEndringHandler } from './org-shared.js'

let kanal = null
let bannerSlot = null
let isAdmin = false

export async function render(container, { id, isAdmin: _isAdmin = false } = {}, _bannerSlot = null) {
  bannerSlot = _bannerSlot
  isAdmin = _isAdmin
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p class="laster">Laster…</p>'
  await lastOgVis(container, Number(id))
}

async function lastOgVis(container, stevneid) {
  const [{ data: stevne }, { data: kampar }, { data: resultat }, { data: grupper }, { count: pameldingCount }] = await Promise.all([
    supabase.from('stevne').select(`
      id, navn, stevne_fase, erfullfort, runde1_format,
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
    supabase.from('pamelding').select('id', { count: 'exact', head: true }).eq('stevneid', stevneid),
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

  const initNa = stevne.runde1_format?.nA ?? null
  const harPrekonfigurertFormat = stevne.runde1_format != null && stevne.stevne_fase !== 'avsluttende'
  const previewN = pameldingCount ?? 0

  if (isAdmin) bannerSlot.innerHTML = renderAvsluttendeKnappar(stevne, { alleInnlBekrefta, harAvslKampar, harGruppefordeling, erSisteRundeFullfort, aktive, harSemfinale, semfinalarBekrefta, harFinale, finaleOgBronseBekrefta, harPrekonfigurertFormat })

  container.innerHTML = `
    <div class="px-3 py-2">
      ${harGruppefordeling ? renderHovudinnhald(avslKampar, stilling, startnrMap, aktive.length, isAdmin) : ''}
      ${!harGruppefordeling && stevne.stevne_fase === 'avsluttende'
        ? (isAdmin
            ? renderGruppefordeling(stilling, { visSpelarliste: true, initNa, initFormat: stevne.runde1_format })
            : '<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>')
        : ''}
      ${!harGruppefordeling && stevne.stevne_fase !== 'avsluttende' && previewN > 0 && isAdmin
        ? renderGruppefordeling(previewN, { visSpelarliste: false, initNa, initFormat: stevne.runde1_format })
        : ''}
    </div>
  `

  bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, stilling, grupper ?? [], gruppeNavnMap, avslKampar)

  if (harGruppefordeling) {
    abonnerPaaEndringar(container, stevneid)
    if (harAvslKampar) bindKampEvents(container, stevneid, avslKampar, startnrMap, resultatMedNamn, aktive.length)
    bindTabKnappar(container)
  }
}

// --- Hovudinnhald (kampar + stilling) ---

function renderHovudinnhald(avslKampar, stilling, startnrMap, totalAktive, isAdmin = true) {
  const gruppeNamn = [...new Set(stilling.map(r => r.gruppe?.navn).filter(Boolean))].sort()

  const gruppeKolonnar = gruppeNamn.map(g => {
    const kampar = avslKampar.filter(k => k.gruppe_navn === g)
    const stillingG = stilling.filter(r => r.gruppe?.navn === g)
    const aktiveCount = stillingG.filter(r => r.runde_eliminert == null).length
    const totalCount = stillingG.length
    const sisteRundeNr = kampar.length ? Math.max(...kampar.map(k => k.runde_nummer)) : 0
    const sisteRunde = kampar.filter(k => k.runde_nummer === sisteRundeNr)
    const sisteRundeFullfort = sisteRunde.length > 0 && sisteRunde.every(k => k.er_bekreftet || k.er_walkover)
    const visGenerer = isAdmin && (kampar.length === 0 || sisteRundeFullfort) && aktiveCount > 1 && totalAktive > 4
    return renderGruppeKolonne(g, kampar, aktiveCount, totalCount, sisteRundeNr, visGenerer, startnrMap, isAdmin)
  }).join('')

  return `
    <div class="avsl-hovudinnhald">
      <div class="avsl-tab-knappar btn-group w-100">
        <button class="btn btn-primary avsl-tab-btn" data-tab="kamper">Kamper</button>
        <button class="btn btn-outline-primary avsl-tab-btn" data-tab="resultat">Resultat</button>
      </div>
      <div class="d-flex gap-3 align-items-start avsl-innhald-rad">
        <div class="d-flex gap-3 flex-grow-1 flex-wrap avsl-kampar-panel">${gruppeKolonnar}</div>
        <div class="avsl-stilling-kol">${renderStilling(stilling)}</div>
      </div>
    </div>`
}

function renderGruppeKolonne(gruppeNavn, kampar, aktiveCount, totalCount, sisteRundeNr, visGenerer, startnrMap, isAdmin = true) {
  const rundeMap = new Map()
  for (const k of kampar) {
    if (!rundeMap.has(k.runde_nummer)) rundeMap.set(k.runde_nummer, [])
    rundeMap.get(k.runde_nummer).push(k)
  }

  const rundarHtml = [...rundeMap.entries()].reverse().map(([nr, rKampar]) => {
    const tittel = rKampar[0]?.runde_navn ?? `Runde ${nr}`
    const synligeKampar = rKampar.filter(k => !k.er_walkover)
    if (!synligeKampar.length) return ''
    return `
      <h6 class="fw-bold text-center mb-1">${tittel}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${synligeKampar.map(k => renderKampBlock(k, startnrMap, isAdmin)).join('')}
      </div>`
  }).join('')

  const nasteRunde = sisteRundeNr + 1
  const genererKnapp = visGenerer
    ? `<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${gruppeNavn}" data-runde="${nasteRunde}">
         Generer runde ${nasteRunde}
       </button>`
    : ''

  return `
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${gruppeNavn} (${totalCount} spelarar)</h6>
      ${genererKnapp}
      ${rundarHtml}
    </div>`
}

function renderKampBlock(kamp, startnrMap, isAdmin = true) {
  const sp = (kamp.spelarar ?? []).sort((a, b) =>
    (startnrMap[a.kasterid] ?? 999) - (startnrMap[b.kasterid] ?? 999)
  )

  const spelarNamn = s => s?.kaster ? `${s.kaster.fornavn} ${s.kaster.etternavn}` : '—'

  const spelarRader = kamp.er_walkover
    ? `<tr>
        <td>${startnrMap[sp[0]?.kasterid] ?? ''}</td>
        <td colspan="2">${spelarNamn(sp[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`
    : sp.map(s => {
        const tot = scoreForSp(s)
        const score = kamp.er_bekreftet || tot > 0 ? tot : '0'
        return `<tr>
          <td class="th-36">${startnrMap[s.kasterid] ?? ''}</td>
          <td>${spelarNamn(s)}</td>
          <td class="text-end">${score}</td>
        </tr>`
      }).join('')

  const bekrefta = kamp.er_bekreftet || kamp.er_walkover
  const harOmgangar = (kamp.omgangar ?? []).length > 0
  const bekrftKlass = bekrefta ? 'btn-success' : 'btn-outline-secondary'
  const bekrftTekst = kamp.er_tre_spelarar
    ? (bekrefta ? 'Endre plassering' : 'Sett plassering')
    : 'Bekreft'
  const bekrftDisabled = (bekrefta && !kamp.er_tre_spelarar) || (!bekrefta && harOmgangar)

  return `
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${kamp.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${spelarRader}
          <tr class="">
            <td colspan="3" class="text-end pe-1">
              ${isAdmin && !kamp.er_walkover && !kamp.er_tre_spelarar
                ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${bekrefta ? ' disabled' : ''}>+</button> `
                : ''}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}"
                title="Scoreboard"${bekrefta && !kamp.er_tre_spelarar ? ' disabled' : ''}>S</button>
              ${isAdmin ? `<button class="btn ${bekrftKlass} btn-sm" id="bekrft-${kamp.id}"${bekrftDisabled ? ' disabled' : ''}>${bekrftTekst}</button>` : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`
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
      ? `<tr class=""><td colspan="5" class="fw-semibold ps-2">Gruppe ${g}</td></tr>`
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

// --- Dialog for å generere runde per gruppe ---

function opnGenererRundeDialog(container, stevneid, gruppeNavn, stillingForGruppe, avslKampar, runde, runde1Format) {
  const aktive = stillingForGruppe.filter(r => r.runde_eliminert == null)
  const totalCount = stillingForGruppe.length
  const n = aktive.length

  const runde1Oppsett = runde === 1 ? (runde1Format?.[gruppeNavn] ?? null) : null

  const wo = runde1Oppsett?.walkovers ?? 0
  const c3 = runde1Oppsett ? runde1Oppsett.c3 : (n % 3 === 0 ? n / 3 : 0)
  const c2 = runde1Oppsett ? runde1Oppsett.c2 : (n % 3 === 0 ? 0 : n / 2)
  const totalBaner = c3 + c2
  const pool1 = aktive.slice(wo, wo + totalBaner)
  const pool2 = aktive.slice(wo + totalBaner, wo + 2 * totalBaner)
  const pool3 = aktive.slice(wo + 2 * totalBaner)

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderModal(medSeeding) {
    const poolsHtml = medSeeding && totalBaner > 0
      ? [
          { label: 'Seeding 1', pool: pool1 },
          { label: 'Seeding 2', pool: pool2 },
          ...(pool3.length ? [{ label: 'Seeding 3', pool: pool3 }] : []),
        ].map(({ label, pool }) => `
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${label}</strong>
            ${pool.map(r => `<div class="small">${r._namn ?? ''} — ${r.kamp_poeng_innl ?? 0}p (${r.score_poeng_innl ?? 0})</div>`).join('')}
          </div>`).join('')
      : aktive.map((r, i) => `<div class="small">${i + 1}. ${r._namn ?? ''} — ${r.kamp_poeng_innl ?? 0}p (${r.score_poeng_innl ?? 0})</div>`).join('')

    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${gruppeNavn} — Runde ${runde}</h5>
        <p class="text-muted small mb-2">${n} av ${totalCount} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${medSeeding ? 'checked' : ''}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${poolsHtml}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`

    modal.querySelector('#seeding-dlg').addEventListener('change', e => renderModal(e.target.checked))
    modal.querySelector('#avbryt-gen-btn').addEventListener('click', () => modal.remove())
    modal.querySelector('#bekreft-gen-btn').addEventListener('click', async () => {
      const medSeedingVal = modal.querySelector('#seeding-dlg').checked
      modal.remove()
      try {
        if (runde === 1) {
          const spelarar = aktive.map((r, i) => ({ kasterid: r.kasterid, plassering: i + 1 }))
          await genererCupRunde1(stevneid, [{ gruppeNavn, spelarar, runde1Oppsett }], medSeedingVal, runde1Format)
        } else {
          await genererNesteCupRundeForGruppe(stevneid, gruppeNavn, medSeedingVal)
        }
        await lastOgVis(container, stevneid)
      } catch (e) {
        alert('Feil: ' + e.message)
      }
    })
  }

  renderModal(true)
}

// --- Event binding ---

function bindHeaderEvents(container, stevneid, stevne, alleInnlBekrefta, harGruppefordeling, harAvslKampar, resultat, grupper, gruppeNavnMap, avslKampar) {
  bannerSlot?.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
    if (!alleInnlBekrefta) return
    const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  if (!harGruppefordeling) {
    const nFromDom = parseInt(container.querySelector('#gruppe-val-wrapper')?.dataset.n ?? '0')
    const n = nFromDom || resultat.length
    const sortert = [...resultat]

    // Hjelpefunksjon: les valt oppsett for ei gruppe frå radio-inputs
    function lesValtOppsett(radioName, nGruppe) {
      const valtRadio = container.querySelector(`input[name="${radioName}"]:checked`)
      if (valtRadio?.dataset.oppsett) {
        try { return JSON.parse(valtRadio.dataset.oppsett) } catch { /* fall through */ }
      }
      return gyldigeRunde1Oppsett(nGruppe)[0] ?? null
    }

    // Format-panel: event delegation på #gruppe-paneler handterer alle format-radios
    const panelerEl = container.querySelector('#gruppe-paneler')
    if (panelerEl) {
      panelerEl.addEventListener('change', (e) => {
        if (!e.target.matches('input[name^="runde1-format"]')) return
        const nA = parseInt(container.querySelector('input[name="gruppe-split"]:checked')?.value ?? n)
        const nB = n - nA
        const oppsettA = lesValtOppsett('runde1-format-a', nA)
        const oppsettB = lesValtOppsett('runde1-format-b', nB)
        if (e.target.name === 'runde1-format-a') {
          const strEl = container.querySelector('#struktur-a')
          if (strEl) strEl.outerHTML = renderStrukturListeHtml(nA, oppsettA, 'a')
        } else {
          const strEl = container.querySelector('#struktur-b')
          if (strEl) strEl.outerHTML = renderStrukturListeHtml(nB, oppsettB, 'b')
        }
        const woA = oppsettA?.walkovers ?? 0
        const woB = oppsettB?.walkovers ?? 0
        const prevEl = container.querySelector('#gruppe-preview')
        if (prevEl) prevEl.innerHTML = renderGruppePreview(
          sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 })), nA, woA, woB
        )
      })
    }

    container.querySelectorAll('input[name="gruppe-split"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const nA = parseInt(radio.value)
        const nB = n - nA
        const sortmedNamn = sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 }))
        const oppsettA = gyldigeRunde1Oppsett(nA)[0] ?? null
        const oppsettB = nB >= 2 ? (gyldigeRunde1Oppsett(nB)[0] ?? null) : null
        if (panelerEl) {
          panelerEl.innerHTML =
            `<div id="gruppe-panel-a" class="avsl-gruppe-kol">
              ${renderGruppePanelInnhald('Gruppe A', nA, 'runde1-format-a', oppsettA)}
            </div>` +
            (nB >= 2 ? `<div id="gruppe-panel-b" class="avsl-gruppe-kol">
              ${renderGruppePanelInnhald('Gruppe B', nB, 'runde1-format-b', oppsettB)}
            </div>` : '')
        }
        const woA = oppsettA?.walkovers ?? 0
        const woB = oppsettB?.walkovers ?? 0
        const prevEl = container.querySelector('#gruppe-preview')
        if (prevEl) prevEl.innerHTML = renderGruppePreview(sortmedNamn, nA, woA, woB)
      })
    })

    container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
      const valt = container.querySelector('input[name="gruppe-split"]:checked')
      if (!valt) return
      const nA = parseInt(valt.value)
      const nB = n - nA
      const oppsettA = lesValtOppsett('runde1-format-a', nA)
      const oppsettB = nB >= 2 ? lesValtOppsett('runde1-format-b', nB) : null
      const { error: fmtErr } = await supabase
        .from('stevne').update({ runde1_format: { A: oppsettA, B: oppsettB, nA } }).eq('id', stevneid)
      if (fmtErr) { alert('Feil: ' + fmtErr.message); return }

      if (stevne.stevne_fase === 'avsluttende') {
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
      }

      await lastOgVis(container, stevneid)
    })
  }

  bannerSlot?.querySelector('#endre-gruppeinndeling-btn')?.addEventListener('click', async () => {
    if (!confirm('Tilbakestill gruppeinndelinga? Gruppefordeling og format vert fjerna.')) return
    await Promise.all([
      supabase.from('resultat').update({ gruppeid: null }).eq('stevneid', stevneid),
      supabase.from('stevne').update({ runde1_format: null }).eq('id', stevneid),
    ])
    await lastOgVis(container, stevneid)
  })

  bannerSlot?.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
    const medSeeding = bannerSlot?.querySelector('#seeding-toggle')?.checked ?? true
    try {
      const res = await genererNesteCupRunde(stevneid, medSeeding)
      if (res.erSemfinale) alert('Semifinalar er generert!')
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })

  if (harGruppefordeling) {
    container.querySelectorAll('[data-generer-gruppe]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gNavn = btn.dataset.genererGruppe
        const runde = parseInt(btn.dataset.runde)
        const stillingForGruppe = resultat.filter(r => r.gruppe?.navn === gNavn)
        opnGenererRundeDialog(container, stevneid, gNavn, stillingForGruppe, avslKampar, runde, stevne.runde1_format)
      })
    })
  }

  bannerSlot?.querySelector('#generer-finale-btn')?.addEventListener('click', async () => {
    try {
      await genererFinaleOgBronsefinale(stevneid)
      await lastOgVis(container, stevneid)
    } catch (e) {
      alert('Feil: ' + e.message)
    }
  })

  bannerSlot?.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
    if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
    const { error } = await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
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
  const allKasterids = sp.map(s => s.kasterid).filter(Boolean)

  // Clear previous elimination result for players in this match before setting new
  await supabase.from('resultat')
    .update({ runde_eliminert: null })
    .eq('stevneid', stevneid)
    .eq('runde_eliminert', kamp.runde_nummer)
    .in('kasterid', allKasterids)
  if (erFinale) {
    await supabase.from('resultat')
      .update({ plassering: null })
      .eq('stevneid', stevneid)
      .in('kasterid', allKasterids)
  }

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

// --- Tab-toggle (mobil) ---

function bindTabKnappar(container) {
  const wrapper = container.querySelector('.avsl-hovudinnhald')
  if (!wrapper) return
  container.querySelectorAll('.avsl-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isResultat = btn.dataset.tab === 'resultat'
      wrapper.classList.toggle('avsl-vis-resultat', isResultat)
      container.querySelectorAll('.avsl-tab-btn').forEach(b => {
        b.classList.toggle('btn-primary', b.dataset.tab === btn.dataset.tab)
        b.classList.toggle('btn-outline-primary', b.dataset.tab !== btn.dataset.tab)
      })
    })
  })
}

// --- Sanntid ---

function abonnerPaaEndringar(container, stevneid) {
  if (kanal) return
  const onEndring = lagOnEndringHandler(stevneid, ['avsluttende'], container, lastOgVis, () => {
    supabase.removeChannel(kanal); kanal = null
  })
  kanal = supabase
    .channel(`stevne-avsl-${stevneid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onEndring)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = payload.new?.stevneid ?? payload.old?.stevneid
      if (sid === stevneid) onEndring()
    })
    .subscribe()
}
