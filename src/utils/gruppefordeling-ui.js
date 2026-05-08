import { beregnGyldigeGruppeStorrelsar, gyldigeRunde1Oppsett, beregnCupStruktur } from './kastemetoder-logikk.js'

export function renderGruppefordeling(resultatEllerN, { visSpelarliste = true, initNa = null, initFormat = null } = {}) {
  const n = typeof resultatEllerN === 'number' ? resultatEllerN : resultatEllerN.length
  const sortert = typeof resultatEllerN === 'number'
    ? []
    : resultatEllerN.map((r, i) => ({ ...r, cupPlassering: i + 1 }))

  const splits = beregnGyldigeGruppeStorrelsar(n)

  const resolvedNa = (() => {
    if (initNa === n) return n
    if (initNa != null && splits.some(s => s.nA === initNa)) return initNa
    return splits[0]?.nA ?? n
  })()
  const resolvedNb = n - resolvedNa

  const treSplits = splits.filter(s => gyldigeRunde1Oppsett(s.nA).some(o => o.c3 > 0))
  const toSplits = splits.filter(s => !gyldigeRunde1Oppsett(s.nA).some(o => o.c3 > 0))
  const visIngen = gyldigeRunde1Oppsett(n).length > 0

  const renderSplitRadios = (arr, startIdx) => arr.map((s, i) => {
    const checked = s.nA === resolvedNa && !(initNa === n)
    const idx = startIdx + i
    return `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${idx}" value="${s.nA}" ${checked ? 'checked' : ''}>
        <label class="form-check-label" for="split-${idx}">A:${s.nA} — B:${s.nB}</label>
      </div>`
  }).join('')

  const splitParts = []
  if (treSplits.length) {
    splitParts.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane</div>${renderSplitRadios(treSplits, 0)}`)
  }
  if (toSplits.length) {
    if (splitParts.length) splitParts.push('<hr class="my-2">')
    splitParts.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane</div>${renderSplitRadios(toSplits, treSplits.length)}`)
  }
  if (visIngen) {
    if (splitParts.length) splitParts.push('<hr class="my-2">')
    splitParts.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${n}" ${initNa === n ? 'checked' : ''}>
        <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
      </div>`)
  }
  const splitOptions = splitParts.join('')

  const initOppsettA = initFormat?.A ?? (gyldigeRunde1Oppsett(resolvedNa)[0] ?? null)
  const initOppsettB = resolvedNb >= 2 ? (initFormat?.B ?? (gyldigeRunde1Oppsett(resolvedNb)[0] ?? null)) : null

  const gruppePreviewHtml = visSpelarliste
    ? `<div id="gruppe-preview">${renderGruppePreview(sortert, resolvedNa, initOppsettA?.walkovers ?? 0, initOppsettB?.walkovers ?? 0)}</div>`
    : ''

  return `
    <div id="gruppe-val-wrapper" data-n="${n}">
      <h5 class="text-center mb-3">Velg gruppestørrelser for sluttspill</h5>
      <div class="d-flex gap-3 align-items-start flex-wrap mb-3">
        <div class="card">
          <div class="card-body">
            ${splitOptions}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${renderGruppePanelInnhald('Gruppe A', resolvedNa, 'runde1-format-a', initOppsettA)}
          </div>
          ${resolvedNb >= 2 ? `<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${renderGruppePanelInnhald('Gruppe B', resolvedNb, 'runde1-format-b', initOppsettB)}
          </div>` : ''}
        </div>
      </div>
      ${gruppePreviewHtml}
      <div class="mt-3 d-flex justify-content-end">
        <button id="bekreft-gruppe-btn" class="btn btn-primary">Bekreft val</button>
      </div>
    </div>
  `
}

export function renderGruppePreview(sortert, nA, woA = 0, woB = 0) {
  const gruppeA = sortert.slice(0, nA)
  const gruppeB = sortert.slice(nA)

  function tabellRader(spel, woCount = 0) {
    return spel.map((r, i) => {
      const erWo = i < woCount
      return `
      <tr>
        <td>${r.cupPlassering}</td>
        <td>${r.startnummer ?? ''}</td>
        <td>${r._namn ?? ''}${erWo ? ' <span class="badge bg-info text-dark">Walkover</span>' : ''}</td>
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

function oppsettLabel(o) {
  const perBane = o.c3 > 0 ? 3 : 2
  return `${o.walkovers} walkover - ${perBane} deltakere per bane`
}

function renderRunde1FormatVeljar(gruppeLabel, n, radioName, initOppsett = null) {
  const oppsett = gyldigeRunde1Oppsett(n)
  if (oppsett.length <= 1) return ''
  const radios = oppsett.map((o, i) => {
    const id = `${radioName}-${i}`
    const val = JSON.stringify(o)
    const checked = initOppsett
      ? (o.walkovers === initOppsett.walkovers && o.c3 === initOppsett.c3 && o.c2 === initOppsett.c2)
      : i === 0
    const btnClass = o.c3 > 0 ? 'btn-outline-success' : 'btn-outline-warning'
    return `
      <input type="radio" class="btn-check" name="${radioName}" id="${id}"
        value='${val}' data-oppsett='${val}' autocomplete="off" ${checked ? 'checked' : ''}>
      <label class="btn btn-sm ${btnClass}" for="${id}">${oppsettLabel(o)}</label>`
  }).join('')
  return `<div class="d-flex flex-column align-items-start gap-1 mb-2">${radios}</div>`
}

export function renderStrukturListeHtml(n, oppsett, suffix) {
  const runder = n >= 2 ? beregnCupStruktur(n, { runde1: oppsett }) : []
  const items = runder.map((r, i) => {
    let banerInfo
    if (i === 0 && oppsett) {
      const aktive = r.spelarar - (r.walkovers ?? 0)
      const woInfo = (r.walkovers ?? 0) > 0 ? ` - ${r.walkovers} walkover` : ''
      banerInfo = `${aktive} deltakere - ${r.baner} baner${woInfo}`
    } else {
      banerInfo = `${r.spelarar} deltakere - ${r.baner} baner`
    }
    return `<li${r.treSpelarar ? ' class="fw-bold"' : ''}>Runde ${r.runde}: ${banerInfo}</li>`
  }).join('')
  return `<div id="struktur-${suffix}"><ul class="mb-0 ps-3">${items}</ul></div>`
}

export function renderGruppePanelInnhald(label, n, radioName, oppsett) {
  const suffix = radioName.slice(-1)
  const formatVeljar = renderRunde1FormatVeljar(label, n, radioName, oppsett)
  const tittel = formatVeljar ? `${label}: Velg format` : `${label} (${n})`
  return `
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${tittel}</h6>
        ${formatVeljar}
        ${renderStrukturListeHtml(n, oppsett, suffix)}
      </div>
    </div>`
}
