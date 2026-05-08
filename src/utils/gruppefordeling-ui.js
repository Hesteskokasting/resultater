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

  const splitOptions = [
    ...splits.map((s, i) => {
      const checked = s.nA === resolvedNa && !(initNa === n)
      return `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${i}" value="${s.nA}" ${checked ? 'checked' : ''}>
        <label class="form-check-label" for="split-${i}">A:${s.nA} — B:${s.nB}</label>
      </div>`
    }),
    `<div class="form-check">
      <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${n}" ${initNa === n ? 'checked' : ''}>
      <label class="form-check-label" for="split-ingen">Ingen gruppeinndeling (alle i A)</label>
    </div>`,
  ].join('')

  const initOppsettA = initFormat?.A ?? (gyldigeRunde1Oppsett(resolvedNa)[0] ?? null)
  const initOppsettB = resolvedNb >= 2 ? (initFormat?.B ?? (gyldigeRunde1Oppsett(resolvedNb)[0] ?? null)) : null
  const strukturPreview = renderStrukturPreview(resolvedNa, resolvedNb, initOppsettA, initOppsettB)

  const gruppePreviewHtml = visSpelarliste
    ? `<div id="gruppe-preview">${renderGruppePreview(sortert, resolvedNa, initOppsettA?.walkovers ?? 0, initOppsettB?.walkovers ?? 0)}</div>`
    : ''

  return `
    <div id="gruppe-val-wrapper" data-n="${n}">
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
        <div class="avsl-gruppe-kol">${renderRunde1FormatVeljar('Gruppe A', resolvedNa, 'runde1-format-a', initOppsettA)}</div>
        <div class="avsl-gruppe-kol">${resolvedNb >= 2 ? renderRunde1FormatVeljar('Gruppe B', resolvedNb, 'runde1-format-b', initOppsettB) : ''}</div>
      </div>
      ${gruppePreviewHtml}
      <div class="mt-3 d-flex gap-2">
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

export function renderStrukturPreview(nA, nB, oppsettA = null, oppsettB = null) {
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
      </div>
    </div>`
}

function oppsettLabel(o) {
  const wo = o.walkovers > 0 ? `${o.walkovers} wo` : '0 wo'
  if (o.c3 > 0) return `${wo}, ${o.c3} baner av 3`
  return `${wo}, ${o.c2} baner av 2`
}

export function renderRunde1FormatVeljar(gruppeLabel, n, radioName, initOppsett = null) {
  const oppsett = gyldigeRunde1Oppsett(n)
  if (oppsett.length <= 1) return ''
  const radios = oppsett.map((o, i) => {
    const id = `${radioName}-${i}`
    const val = JSON.stringify(o)
    const checked = initOppsett
      ? (o.walkovers === initOppsett.walkovers && o.c3 === initOppsett.c3 && o.c2 === initOppsett.c2)
      : i === 0
    return `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="${radioName}" id="${id}"
          value='${val}' data-oppsett='${val}' ${checked ? 'checked' : ''}>
        <label class="form-check-label" for="${id}">${oppsettLabel(o)}</label>
      </div>`
  }).join('')
  return `
    <div class="mb-2">
      <span class="small fw-semibold">${gruppeLabel} format:</span>
      ${radios}
    </div>`
}
