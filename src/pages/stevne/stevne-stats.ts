import { kasterNavn } from '@/utils/kaster'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createEmptyState } from '@/components/EmptyState'
import { hentKamperForStats } from '@/services/stevneStatsService'
import type { StatsKampRow } from '@/services/stevneStatsService'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayerStats {
  kasterid: number
  navn: string
  matchCount: number
  shoesThrown: number
  ringers: number
  ringerPct: number
  doubleRingers: number
  score4: number
  score3: number
  score2: number
  score1: number
  score0: number
  scoreDiff: number
}

// ── Aggregation ───────────────────────────────────────────────────────────────

function aggregateStats(kamper: StatsKampRow[]): PlayerStats[] {
  const map = new Map<number, PlayerStats>()

  for (const kamp of kamper) {
    if (kamp.er_walkover) continue
    const spelarar = kamp.spelarar

    for (const sp of spelarar) {
      const opponentScore = spelarar
        .filter(o => o.kasterid !== sp.kasterid)
        .reduce((sum, o) => sum + o.score_poeng, 0)

      if (!map.has(sp.kasterid)) {
        map.set(sp.kasterid, {
          kasterid: sp.kasterid,
          navn: kasterNavn(sp.kaster),
          matchCount: 0,
          shoesThrown: 0,
          ringers: 0,
          ringerPct: 0,
          doubleRingers: 0,
          score4: 0,
          score3: 0,
          score2: 0,
          score1: 0,
          score0: 0,
          scoreDiff: 0,
        })
      }

      const stats = map.get(sp.kasterid)!
      if (sp.omgangar.length > 0) stats.matchCount++
      stats.scoreDiff += sp.score_poeng - opponentScore

      for (const o of sp.omgangar) {
        stats.shoesThrown += 2
        if (o.antall_ringer != null) stats.ringers += o.antall_ringer
        if (o.antall_ringer === 2) stats.doubleRingers++
        if (o.score === 4) stats.score4++
        else if (o.score === 3) stats.score3++
        else if (o.score === 2) stats.score2++
        else if (o.score === 1) stats.score1++
        else if (o.score === 0) stats.score0++
      }
    }
  }

  const result = [...map.values()].filter(s => s.shoesThrown > 0)

  for (const s of result) {
    s.ringerPct = s.shoesThrown > 0 ? (s.ringers / s.shoesThrown) * 100 : 0
  }

  return result.sort((a, b) => b.shoesThrown - a.shoesThrown)
}

// ── HTML builder ──────────────────────────────────────────────────────────────

function fmtDiff(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

function statsTabellHtml(spelarar: PlayerStats[]): string {
  const rows = spelarar.map(s => `
    <tr>
      <td class="stats-td-namn">${escHtml(s.navn)}</td>
      <td class="stats-td-num">${s.matchCount}</td>
      <td class="stats-td-num">${s.shoesThrown}</td>
      <td class="stats-td-num stats-td-ringer">${s.ringers}</td>
      <td class="stats-td-num stats-td-ringer">${s.ringerPct.toFixed(1)}%</td>
      <td class="stats-td-num">${s.doubleRingers}</td>
      <td class="stats-td-num">${s.score4}</td>
      <td class="stats-td-num">${s.score3}</td>
      <td class="stats-td-num">${s.score2}</td>
      <td class="stats-td-num">${s.score1}</td>
      <td class="stats-td-num">${s.score0}</td>
      <td class="stats-td-diff ${s.scoreDiff >= 0 ? 'stats-td-pos' : 'stats-td-neg'}">${fmtDiff(s.scoreDiff)}</td>
    </tr>`).join('')

  return `
    <div class="stats-tabell-wrap">
      <table class="stats-tabell">
        <thead>
          <tr>
            <th class="stats-th-namn">Namn</th>
            <th class="stats-th-num">K</th>
            <th class="stats-th-num">Sko</th>
            <th class="stats-th-num stats-th-ringer">R</th>
            <th class="stats-th-num stats-th-ringer">R%</th>
            <th class="stats-th-num">6p</th>
            <th class="stats-th-num">4p</th>
            <th class="stats-th-num">3p</th>
            <th class="stats-th-num">2p</th>
            <th class="stats-th-num">1p</th>
            <th class="stats-th-num">0p</th>
            <th class="stats-th-diff">±</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

// ── Drag-scroll ───────────────────────────────────────────────────────────────

function bindDragScroll(el: HTMLElement): void {
  let isDown = false
  let startX = 0
  let scrollLeft = 0

  el.addEventListener('mousedown', e => {
    isDown = true
    el.classList.add('is-grabbing')
    startX = e.pageX - el.offsetLeft
    scrollLeft = el.scrollLeft
  })
  el.addEventListener('mouseleave', () => { isDown = false; el.classList.remove('is-grabbing') })
  el.addEventListener('mouseup',    () => { isDown = false; el.classList.remove('is-grabbing') })
  el.addEventListener('mousemove', e => {
    if (!isDown) return
    e.preventDefault()
    el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX)
  })
}

// ── Sticky columns ────────────────────────────────────────────────────────────

function bindStickyColumns(table: HTMLTableElement, count: number): void {
  const rows = [...table.querySelectorAll<HTMLTableRowElement>('tr')]
  if (!rows.length) return
  // Measure widths from the first row before mutating anything
  const widths = [...rows[0].cells].slice(0, count).map(c => c.offsetWidth)
  for (const row of rows) {
    let offset = 0
    for (let i = 0; i < count && i < row.cells.length; i++) {
      const cell = row.cells[i]
      cell.classList.add('stats-col-sticky')
      if (i === count - 1) cell.classList.add('stats-col-sticky-last')
      cell.style.setProperty('--col-left', `${offset}px`)
      offset += widths[i]
    }
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState('Laster statistikk…'))

  try {
    const { data, error } = await hentKamperForStats(id)

    if (error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste statistikk.'))
      return
    }

    const spelarar = aggregateStats(data)

    if (!spelarar.length) {
      container.replaceChildren(createEmptyState('Ingen bekrefte kampar enno.'))
      return
    }

    container.innerHTML = `<div class="stats-side">${statsTabellHtml(spelarar)}</div>`

    const wrap = container.querySelector<HTMLElement>('.stats-tabell-wrap')
    const table = container.querySelector<HTMLTableElement>('.stats-tabell')
    if (wrap) bindDragScroll(wrap)
    if (table) bindStickyColumns(table, 1) // NAMN only
  } catch (err) {
    logError('stevne-stats.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste statistikk.'))
  }
}
