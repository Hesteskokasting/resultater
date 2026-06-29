import { escHtml } from '@/utils/escHtml'
import type { RoundSetup } from '@/types'
import { calcValidGroupSizes, validRound1Setups, calcCupStructure } from '@/utils/kastemetoder-logikk'

interface StandingRowForGroup {
  startnummer?: number | string | null
  navn?: string | null
  kamp_poeng?: number | null
  score_poeng?: number | null
}

interface StandingRowWithCupRank extends StandingRowForGroup {
  cupPlassering: number
}

interface GroupAssignmentOptions {
  showPlayerList?: boolean
  initNa?: number | null
  initFormat?: { A?: RoundSetup | null; B?: RoundSetup | null } | null
}

export function renderGruppefordeling(
  resultatEllerN: number | StandingRowForGroup[],
  { showPlayerList = true, initNa = null, initFormat = null }: GroupAssignmentOptions = {},
): string {
  const n = typeof resultatEllerN === 'number' ? resultatEllerN : resultatEllerN.length
  const sortert: StandingRowWithCupRank[] = typeof resultatEllerN === 'number'
    ? []
    : resultatEllerN.map((r, i) => ({ ...r, cupPlassering: i + 1 }))

  const splits = calcValidGroupSizes(n)

  const resolvedNa = (() => {
    if (initNa === n) return n
    if (initNa != null && splits.some(s => s.nA === initNa)) return initNa
    return splits[0]?.nA ?? n
  })()
  const resolvedNb = n - resolvedNa

  const threeSplits = splits.filter(s => validRound1Setups(s.nA).some(o => o.c3 > 0))
  const twoSplits = splits.filter(s => !validRound1Setups(s.nA).some(o => o.c3 > 0))
  const showNone = validRound1Setups(n).length > 0

  const renderSplitRadios = (arr: { nA: number; nB: number }[], startIdx: number): string =>
    arr.map((s, i) => {
      const checked = s.nA === resolvedNa && !(initNa === n)
      const idx = startIdx + i
      return `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-${idx}" value="${s.nA}" ${checked ? 'checked' : ''}>
        <label class="form-check-label" for="split-${idx}">A:${s.nA} — B:${s.nB}</label>
      </div>`
    }).join('')

  const splitParts: string[] = []
  if (threeSplits.length) {
    splitParts.push(`<div class="text-muted small fw-semibold mb-1">3 spillere per bane (A)</div>${renderSplitRadios(threeSplits, 0)}`)
  }
  if (twoSplits.length) {
    if (splitParts.length) splitParts.push('<hr class="my-2">')
    splitParts.push(`<div class="text-muted small fw-semibold mb-1">2 spillere per bane (A)</div>${renderSplitRadios(twoSplits, threeSplits.length)}`)
  }
  if (showNone) {
    if (splitParts.length) splitParts.push('<hr class="my-2">')
    splitParts.push(`
      <div class="form-check">
        <input class="form-check-input" type="radio" name="gruppe-split" id="split-ingen" value="${n}" ${initNa === n ? 'checked' : ''}>
        <label class="form-check-label" for="split-ingen">Alle i A</label>
      </div>`)
  }
  const splitOptions = splitParts.join('')

  const initSetupA: RoundSetup | null = initFormat?.A ?? (validRound1Setups(resolvedNa)[0] ?? null)
  const initSetupB: RoundSetup | null = resolvedNb >= 2 ? (initFormat?.B ?? (validRound1Setups(resolvedNb)[0] ?? null)) : null

  const groupPreviewHtml = showPlayerList
    ? `<div id="gruppe-preview">${renderGruppePreview(sortert, resolvedNa, initSetupA?.walkovers ?? 0, initSetupB?.walkovers ?? 0)}</div>`
    : ''

  return `
    <div id="gruppe-val-wrapper" data-n="${n}">
      <h5 class="mb-3">Velg gruppefordeling for cup</h5>
      <div class="d-flex gruppe-layout gap-3 align-items-start mb-3">
        <div class="card">
          <div class="card-body">
            ${splitOptions}
          </div>
        </div>
        <div id="gruppe-paneler" class="d-flex gap-3 flex-wrap">
          <div id="gruppe-panel-a" class="avsl-gruppe-kol">
            ${renderGruppePanelInnhald('Gruppe A', resolvedNa, 'runde1-format-a', initSetupA)}
          </div>
          ${resolvedNb >= 2 ? `<div id="gruppe-panel-b" class="avsl-gruppe-kol">
            ${renderGruppePanelInnhald('Gruppe B', resolvedNb, 'runde1-format-b', initSetupB)}
          </div>` : ''}
        </div>
      </div>
      ${groupPreviewHtml}
      <div class="bekreft-banner">
        <button id="bekreft-gruppe-btn" class="btn btn-success btn-lg w-100">Bekreft gruppefordeling</button>
      </div>
    </div>
  `
}

export function renderGruppePreview(
  sortert: StandingRowWithCupRank[],
  nA: number,
  woA = 0,
  woB = 0,
): string {
  const groupA = sortert.slice(0, nA)
  const groupB = sortert.slice(nA)

  function tableRows(spel: StandingRowWithCupRank[], woCount = 0): string {
    return spel.map((r, i) => {
      const erWo = i < woCount
      return `
      <tr>
        <td>${r.cupPlassering}</td>
        <td>${escHtml(r.navn ?? '')}${erWo ? ' <span class="badge bg-info text-dark">Walkover</span>' : ''}</td>
        <td class="text-center">${r.kamp_poeng ?? 0}</td>
        <td class="text-center">${r.score_poeng ?? 0}</td>
      </tr>`
    }).join('')
  }

  const tableHeader = `
    <thead class="org-thead"><tr>
      <th class="th-32">#</th><th>NAMN</th>
      <th class="th-44 text-center">KP</th>
      <th class="th-44 text-center">SP</th>
    </tr></thead>`

  const tableA = `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tableHeader}
      <tbody>${tableRows(groupA, woA)}</tbody>
    </table>`

  const tableB = groupB.length ? `
    <table class="table table-bordered table-sm bg-white mb-0">
      ${tableHeader}
      <tbody>${tableRows(groupB, woB)}</tbody>
    </table>` : ''

  return `
    <div class="d-flex gap-3 flex-wrap">
      <div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE A (${groupA.length})</h6>
        ${tableA}
      </div>
      ${groupB.length ? `<div class="avsl-gruppe-kol">
        <h6 class="fw-bold text-center">GRUPPE B (${groupB.length})</h6>
        ${tableB}
      </div>` : ''}
    </div>`
}

function setupLabel(o: RoundSetup): string {
  const perBane = o.c3 > 0 ? 3 : 2
  return `${o.walkovers} walkover - ${perBane} deltakere per bane`
}

function renderRound1FormatSelector(
  _groupLabel: string,
  n: number,
  radioName: string,
  initSetup: RoundSetup | null = null,
): string {
  const setups = validRound1Setups(n)
  if (setups.length <= 1) return ''
  const radios = setups.map((o, i) => {
    const id = `${radioName}-${i}`
    const val = JSON.stringify(o)
    const checked = initSetup
      ? (o.walkovers === initSetup.walkovers && o.c3 === initSetup.c3 && o.c2 === initSetup.c2)
      : i === 0
    const btnClass = o.c3 > 0 ? 'btn-outline-success' : 'btn-outline-warning'
    return `
      <input type="radio" class="btn-check" name="${radioName}" id="${id}"
        value='${val}' data-oppsett='${val}' autocomplete="off" ${checked ? 'checked' : ''}>
      <label class="btn btn-sm ${btnClass}" for="${id}">${setupLabel(o)}</label>`
  }).join('')
  return `<div class="d-flex flex-column align-items-start gap-1 mb-2">${radios}</div>`
}

export function renderStrukturListeHtml(n: number, setup: RoundSetup | null, suffix: string): string {
  const rounds = n >= 2 ? calcCupStructure(n, { runde1: setup }) : []
  const rows = rounds.map((r, i) => {
    const wo = r.walkovers ?? 0
    const active = r.players - wo
    const participantsCell = wo > 0
      ? `${active} <span class="text-muted">(${wo} w.o.)</span>`
      : `${active}`
    let perLane: string
    if (i === 0 && setup) {
      perLane = setup.c3 > 0 && setup.c2 > 0 ? '2/3' : setup.c3 > 0 ? '3' : '2'
    } else {
      perLane = r.players % r.lanes === 0 ? String(r.players / r.lanes) : '2/3'
    }
    return `<tr${r.threePlayers ? ' class="fw-bold"' : ''}>
      <td>${r.runde}</td>
      <td>${participantsCell}</td>
      <td>${r.lanes}</td>
      <td>${perLane}</td>
    </tr>`
  }).join('')
  return `<div id="struktur-${suffix}">
    <table class="table table-sm table-bordered mb-0">
      <thead><tr>
        <th>Runde</th><th>Deltakere</th><th>Baner</th><th>Per bane</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`
}

export function renderGruppePanelInnhald(
  label: string,
  n: number,
  radioName: string,
  setup: RoundSetup | null,
): string {
  const suffix = radioName.slice(-1)
  const formatSelector = renderRound1FormatSelector(label, n, radioName, setup)
  const title = formatSelector ? `${label}: Velg format` : `${label} (${n})`
  return `
    <div class="card">
      <div class="card-body">
        <h6 class="fw-bold mb-2">${title}</h6>
        ${formatSelector}
        ${renderStrukturListeHtml(n, setup, suffix)}
      </div>
    </div>`
}
