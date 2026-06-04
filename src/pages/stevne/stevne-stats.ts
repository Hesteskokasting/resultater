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

// ── HTML builders ─────────────────────────────────────────────────────────────

function fmtDiff(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

function mobilStatsHtml(spelarar: PlayerStats[]): string {
  return spelarar.map(s => `
    <div class="stats-kort">
      <div class="stats-kort-hovud">
        <span class="stats-kort-namn">${escHtml(s.navn)}</span>
        <span class="stats-kort-meta">K: ${s.matchCount} · Sko: ${s.shoesThrown} · ±: ${fmtDiff(s.scoreDiff)}</span>
      </div>
      <div class="stats-kort-rader">
        <span>R: ${s.ringers}</span>
        <span>R%: ${s.ringerPct.toFixed(1)}%</span>
        <span>DR: ${s.doubleRingers}</span>
        <span>4p: ${s.score4}</span>
        <span>3p: ${s.score3}</span>
        <span>2p: ${s.score2}</span>
        <span>1p: ${s.score1}</span>
        <span>0p: ${s.score0}</span>
      </div>
    </div>`).join('')
}

function desktopStatsHtml(spelarar: PlayerStats[]): string {
  const rows = spelarar.map(s => `
    <tr>
      <td class="stats-td-namn">${escHtml(s.navn)}</td>
      <td class="stats-td-num">${s.matchCount}</td>
      <td class="stats-td-num">${s.shoesThrown}</td>
      <td class="stats-td-num">${s.ringers}</td>
      <td class="stats-td-num">${s.ringerPct.toFixed(1)}%</td>
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
            <th class="stats-th-num">R</th>
            <th class="stats-th-num">R%</th>
            <th class="stats-th-num">DR</th>
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

    container.innerHTML = `
      <div class="stats-side">
        <div class="res-mobil-blokk">
          ${mobilStatsHtml(spelarar)}
        </div>
        <div class="res-desktop-blokk">
          ${desktopStatsHtml(spelarar)}
        </div>
      </div>`
  } catch (err) {
    logError('stevne-stats.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste statistikk.'))
  }
}
