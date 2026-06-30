// ── Shared base for innledende-phase renderers ────────────────────────────────
//
// Usage: call createInnledendeRenderer(variant) once at module level in each
// kastemetode file. The factory returns a render() function that owns its own
// realtime channel, admin flag, and banner slot — so two variants running
// simultaneously never share state.
//
// InnledendeVariant config fields:
//   channelName(stevneid)   — realtime channel name, must be unique per variant
//   logPrefix               — prepended to logError context strings
//   erSwiss                 — whether to render the "Neste runde" button
//   onReset?()              — called on each render(); use to reset variant state
//   getBannerExtra(ctx)     — returns HTML appended after the shared admin buttons
//   bindBannerExtra(slot, ctx) — binds click handlers for the extra HTML above
//   filterRundar?(rundeMap) — optionally filter which rounds to display; default: all
//
// To add a new kastemetode: create a thin file (~30-50 lines) that defines
// an InnledendeVariant and exports `createInnledendeRenderer(variant)`.
// See gloppen.ts (no-Swiss) and nordhordland.ts (Swiss) for examples.
//
import { showScoreEditor } from '@/organizer/scoreEditor'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { getMatchSides, groupStandingsByPair, scoreForPlayer, type MatchSide } from '@/utils/kamp'
import { autoCompleteInitialRoundMatches } from '@/services/testDataService'
import {
  buildInitialPlayerMap, sortStandings, renderInitialButtons, createChangeHandler,
  bindStandingDetails, renderMainContent, bindTabToggle, getActiveTab, setActiveTab, renderStandingTable, canConfirmMatch,
  sideNameHtml,
  type StandingRow,
} from '@/organizer/org-shared'
import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { logError } from '@/utils/logError'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  getInitialRoundMatches, hasMatchRounds,
  updateMatchPlayerScoreFast, confirmInitialMatch, subscribeToMatchChanges, unconfirmMatch,
  type InitialMatchRow, type InitialMatchPlayerRow,
} from '@/services/kampService'
import {
  getInitialPhaseTournament, setTournamentCompleted,
  type InitialPhaseTournamentRow,
} from '@/services/stevneService'
import { avmeldKanal } from '@/utils/realtime'
import { livePillHtml } from '@/components/LivePill'
import {
  getResultsForInitialRound, writePlacements,
  type InitialResultRow,
} from '@/services/resultatService'

// ── Variant API ───────────────────────────────────────────────────────────────

export interface InnledendeContext {
  container: HTMLElement
  stevneid: number
  stevne: InitialPhaseTournamentRow
  alleKamper: InitialMatchRow[]
  rundeMap: Map<number, InitialMatchRow[]>
  startnrMap: Record<number, number>
  stilling: StandingRow[]
  isAdmin: boolean
  erAlleKamperBekreftet: boolean
  reload: () => Promise<void>
}

export interface InnledendeVariant {
  channelName: (stevneid: number) => string
  logPrefix: string
  erSwiss: boolean
  onReset?: () => void
  getBannerExtra: (ctx: InnledendeContext) => string
  bindBannerExtra: (bannerSlot: HTMLElement, ctx: InnledendeContext) => void
  filterRundar?: (rundeMap: Map<number, InitialMatchRow[]>) => Map<number, InitialMatchRow[]>
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createInnledendeRenderer(variant: InnledendeVariant) {
  let kanal: RealtimeChannel | null = null
  let bannerSlot: HTMLElement | null = null
  let isAdmin = false
  const stillingExpandedIds = new Set<string>()
  let prevConfirmedIds: Set<number> | null = null
  let pendingAnimationIds = new Set<number>()

  async function render(
    container: HTMLElement,
    { id, isAdmin: _isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot
    isAdmin = _isAdmin
    variant.onReset?.()
    if (kanal) { await avmeldKanal(kanal); kanal = null }
    container.replaceChildren(createLoadingState('Laster…'))
    await lastOgVis(container, id)
  }

  async function lastOgVis(container: HTMLElement, stevneid: number): Promise<void> {
    try {
      const [{ data: stevne }, { data: alleKamper }, { data: resultat }] = await Promise.all([
        getInitialPhaseTournament(stevneid),
        getInitialRoundMatches(stevneid),
        getResultsForInitialRound(stevneid),
      ])

      if (!stevne) {
        container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
        return
      }

      const { startnrMap, hcpMap, posisjonMap, erLag } = byggDeltakarMaps(resultat)
      const rundeMap = byggRundeMap(alleKamper)
      const stilling = byggStilling(alleKamper, resultat, startnrMap, posisjonMap, erLag)
      const idsToFlash = beregnFlashIds(alleKamper)

      const erAlleKamperBekreftet = alleKamper.length > 0 && alleKamper.every(k => k.er_bekreftet)
      const kanEndreKampar = isAdmin && stevne.stevne_fase !== 'avsluttende'

      const ctx: InnledendeContext = {
        container,
        stevneid,
        stevne,
        alleKamper,
        rundeMap,
        startnrMap,
        stilling,
        isAdmin,
        erAlleKamperBekreftet,
        reload: () => lastOgVis(container, stevneid),
      }

      setupBanner(ctx)

      const rundarSomVisast = (variant.filterRundar ?? (m => m))(rundeMap)
      const kamperHtml = [...rundarSomVisast.entries()]
        .map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap, kanEndreKampar, hcpMap, posisjonMap))
        .join('') + renderKampLegend()
      const stillingHtml = renderStandingTable(stilling, alleKamper, startnrMap, {
        tableId: 'standing-initial',
        hasMatchCount: true,
        positionMap: posisjonMap,
        unitLabel: erLag ? 'par' : 'spelarar',
      })

      const activeTab = getActiveTab(container)
      container.innerHTML = renderMainContent(kamperHtml, stillingHtml)
      bindTabToggle(container)
      if (activeTab === 'standing') setActiveTab(container, 'standing')
      bindStandingDetails(container, 'standing-initial', stillingExpandedIds)

      applyFlashClasses(container, idsToFlash, alleKamper)


      for (const kamp of alleKamper) {
        bindKampEvents(container, stevneid, kamp, startnrMap, hcpMap, posisjonMap, kanEndreKampar)
      }

      abonnerPaaEndringar(container, stevneid)
    } catch (err) {
      logError(`${variant.logPrefix}.lastOgVis`, err)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste innleiande fase.'))
    }
  }

  /** Tracks confirmed-match ids across renders so the newly-confirmed rows flash once. */
  function beregnFlashIds(alleKamper: InitialMatchRow[]): Set<number> {
    const currentConfirmedIds = new Set(alleKamper.filter(k => k.er_bekreftet).map(k => k.id))
    const newlyConfirmedIds = prevConfirmedIds
      ? new Set([...currentConfirmedIds].filter(id => !prevConfirmedIds!.has(id)))
      : new Set<number>()
    const idsToFlash = new Set([...newlyConfirmedIds, ...pendingAnimationIds])
    pendingAnimationIds = new Set(newlyConfirmedIds)
    prevConfirmedIds = currentConfirmedIds
    return idsToFlash
  }

  function setupBanner(ctx: InnledendeContext): void {
    if (!bannerSlot) return
    bannerSlot.innerHTML = (isAdmin ? renderInitialButtons(ctx.stevne, variant.erSwiss) : '') + variant.getBannerExtra(ctx)
    variant.bindBannerExtra(bannerSlot, ctx)

    bannerSlot.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
      if (!await confirmDialog({ title: 'Fullfør turnering', message: 'Vil du fullføre turneringa? Dette kan ikkje angrast.', danger: true })) return
      const { error: plErr } = await writePlacements(ctx.stevneid, ctx.stilling)
      if (plErr) { showToast('Feil ved lagring av plasseringar', 'error'); return }
      const { error } = await setTournamentCompleted(ctx.stevneid)
      if (error) { showToast('Feil ved lagring', 'error'); return }
      await ctx.reload()
    })

    bannerSlot.querySelector('#test-autofullfør-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget as HTMLButtonElement
      if (!await confirmDialog({ title: 'Autofullfør kampar', message: 'Autofullfør alle ubekreftede innleiande kampar?' })) return
      btn.disabled = true
      await autoCompleteInitialRoundMatches(ctx.stevneid)
      await ctx.reload()
    })
  }

  function bindScoreRedigering(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startnrMap: Record<number, number>,
    posisjonMap: Record<number, number>,
  ): void {
    const [side1, side2] = getMatchSides(kamp.spelarar, startnrMap, posisjonMap)
    const p1 = side1?.rep ?? null
    const p2 = side2?.rep ?? null
    const spelarIds = [...(side1?.members ?? []), ...(side2?.members ?? [])].map(m => m.id)

    const onScoreKlikk = async () => {
      const hasOmgangar = spelarIds.length ? await hasMatchRounds(spelarIds) : false
      await showScoreEditor({
        side1Name: sideNavn(side1, false),
        side2Name: sideNavn(side2, false),
        currentS1: sideScore(side1, kamp.er_bekreftet),
        currentS2: sideScore(side2, kamp.er_bekreftet),
        playerIds: spelarIds,
        hasRounds: hasOmgangar,
        logPrefix: variant.logPrefix,
        onSave: async (nyS1, nyS2) => {
          await Promise.all([
            p1 ? updateMatchPlayerScoreFast(p1.id, nyS1) : Promise.resolve({ error: null }),
            p2 ? updateMatchPlayerScoreFast(p2.id, nyS2) : Promise.resolve({ error: null }),
            ...(kamp.er_bekreftet ? [unconfirmMatch(kamp.id)] : []),
          ])
          return null
        },
        onSaved: () => lastOgVis(container, stevneid),
      })
    }

    container.querySelectorAll(`[data-endre-score="${kamp.id}"]`).forEach(el => el.addEventListener('click', onScoreKlikk))
    container.querySelector(`#m-score-${kamp.id}`)?.addEventListener('click', (e) => {
      e.stopPropagation()
      void onScoreKlikk()
    })
  }

  function lagBekreftHandler(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startnrMap: Record<number, number>,
    hcpMap: Record<number, number>,
    posisjonMap: Record<number, number>,
    stopProp: boolean,
  ): (e: Event) => Promise<void> {
    return async (e: Event) => {
      if (stopProp) e.stopPropagation()
      const btn = e.currentTarget as HTMLButtonElement
      btn.disabled = true
      btn.textContent = 'Lagrer…'
      try {
        const ok = await bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap, posisjonMap)
        if (!ok) { btn.disabled = false; btn.textContent = 'Bekreft' }
      } catch {
        btn.disabled = false
        btn.textContent = 'Bekreft'
      }
    }
  }

  function bindMobilRad(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startnrMap: Record<number, number>,
    hcpMap: Record<number, number>,
    posisjonMap: Record<number, number>,
  ): void {
    const mobilRad = container.querySelector<HTMLElement>(`.kamp-rad-mobil[data-kamp-id="${kamp.id}"]`)
    if (!mobilRad) return

    if (!isAdmin) {
      mobilRad.addEventListener('click', () => { window.open(`#/kamp/${kamp.id}`, '_blank') })
      return
    }

    mobilRad.querySelector('.kamp-rad-mobil__hoved')?.addEventListener('click', () => {
      const expanded = mobilRad.dataset.expanded === 'true'
      container.querySelectorAll<HTMLElement>('.kamp-rad-mobil[data-expanded="true"]').forEach(r => {
        r.dataset.expanded = 'false'
        r.setAttribute('aria-expanded', 'false')
      })
      mobilRad.dataset.expanded = expanded ? 'false' : 'true'
      mobilRad.setAttribute('aria-expanded', String(!expanded))
    })
    container.querySelector(`#m-scoreboard-${kamp.id}`)?.addEventListener('click', (e) => {
      e.stopPropagation()
      window.open(`#/kamp/${kamp.id}`, '_blank')
    })
    container.querySelector(`#m-bekrft-${kamp.id}`)?.addEventListener('click',
      lagBekreftHandler(container, stevneid, kamp, startnrMap, hcpMap, posisjonMap, true))
  }

  function bindKampEvents(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startnrMap: Record<number, number>,
    hcpMap: Record<number, number>,
    posisjonMap: Record<number, number>,
    kanEndreKampar: boolean,
  ): void {
    if (kanEndreKampar) bindScoreRedigering(container, stevneid, kamp, startnrMap, posisjonMap)

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      window.open(`#/kamp/${kamp.id}`, '_blank')
    })
    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click',
      lagBekreftHandler(container, stevneid, kamp, startnrMap, hcpMap, posisjonMap, false))

    bindMobilRad(container, stevneid, kamp, startnrMap, hcpMap, posisjonMap)
  }

  function abonnerPaaEndringar(container: HTMLElement, stevneid: number): void {
    if (kanal) return
    const onEndring = createChangeHandler(stevneid, ['innledende'], container, lastOgVis, () => {
      if (kanal) { void avmeldKanal(kanal); kanal = null }
    })
    kanal = subscribeToMatchChanges(stevneid, variant.channelName(stevneid), onEndring)
  }

  async function bekreftKamp(
    container: HTMLElement,
    stevneid: number,
    kamp: InitialMatchRow,
    startnrMap: Record<number, number>,
    hcpMap: Record<number, number> = {},
    posisjonMap: Record<number, number> = {},
  ): Promise<boolean> {
    const [side1, side2] = getMatchSides(kamp.spelarar, startnrMap, posisjonMap)
    const p1 = side1?.rep ?? null
    const p2 = side2?.rep ?? null
    const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
    const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

    const { error } = await confirmInitialMatch({
      kampId: kamp.id,
      p1: p1 ? { playerId: p1.id, kasterid: p1.kasterid, scorePoints: p1.score_poeng } : null,
      p2: p2 ? { playerId: p2.id, kasterid: p2.kasterid, scorePoints: p2.score_poeng } : null,
      hcp1,
      hcp2,
      erWalkover: kamp.er_walkover,
      p1PartnerId: side1?.members[1]?.id ?? null,
      p2PartnerId: side2?.members[1]?.id ?? null,
    })
    if (error) { showToast('DB-feil ved bekreft', 'error'); return false }
    await lastOgVis(container, stevneid)
    return true
  }

  return render
}

// ── Data-bygging (pure — no closure state) ────────────────────────────────────

interface DeltakarMaps {
  startnrMap: Record<number, number>
  hcpMap: Record<number, number>
  posisjonMap: Record<number, number>
  /** Par/Mix: two players share a startnummer */
  erLag: boolean
}

function byggDeltakarMaps(resultat: InitialResultRow[]): DeltakarMaps {
  const startnrMap: Record<number, number> = Object.fromEntries(
    resultat.filter(r => r.kasterid != null).map(r => [r.kasterid!, r.startnummer ?? 0]),
  )
  const hcpMap: Record<number, number> = Object.fromEntries(
    resultat.filter(r => r.kasterid != null && (r.hcp ?? 0) > 0).map(r => [r.kasterid!, r.hcp ?? 0]),
  )
  const posisjonMap: Record<number, number> = Object.fromEntries(
    resultat.filter(r => r.kasterid != null && r.posisjon != null).map(r => [r.kasterid!, r.posisjon!]),
  )
  const snrCount = new Map<number, number>()
  for (const r of resultat) {
    if (r.kasterid == null || r.startnummer == null) continue
    snrCount.set(r.startnummer, (snrCount.get(r.startnummer) ?? 0) + 1)
  }
  return { startnrMap, hcpMap, posisjonMap, erLag: [...snrCount.values()].some(c => c > 1) }
}

function byggRundeMap(alleKamper: InitialMatchRow[]): Map<number, InitialMatchRow[]> {
  const rundeMap = new Map<number, InitialMatchRow[]>()
  for (const kamp of alleKamper) {
    if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
    rundeMap.get(kamp.runde_nummer)!.push(kamp)
  }
  return rundeMap
}

function byggStilling(
  alleKamper: InitialMatchRow[],
  resultat: InitialResultRow[],
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
  erLag: boolean,
): StandingRow[] {
  const { playerMap, realThrowerIds } = buildInitialPlayerMap(alleKamper, startnrMap)
  const stillingRader = Object.values(playerMap)
    .filter(s => realThrowerIds.has(s.kasterid))
    .map(s => ({ ...s, hcp: resultat.find(r => r.kasterid === s.kasterid)?.hcp ?? 0 }))
  return sortStandings(
    erLag ? groupStandingsByPair(stillingRader, posisjonMap) : stillingRader,
    alleKamper,
  )
}

/** Adds the one-shot flash class to rows whose match was just confirmed. */
function applyFlashClasses(container: HTMLElement, idsToFlash: Set<number>, alleKamper: InitialMatchRow[]): void {
  for (const kampId of idsToFlash) {
    container.querySelectorAll(`[data-kamp-id="${kampId}"]`).forEach(el => el.classList.add('kamp-ny-bekreftet'))
    const kamp = alleKamper.find(k => k.id === kampId)
    if (!kamp) continue
    for (const sp of kamp.spelarar) {
      container.querySelectorAll(`#standing-initial tr.standing-player-row[data-kasterid="${sp.kasterid}"] td`).forEach(el => el.classList.add('standing-new-confirmed'))
    }
  }
}

// ── Shared rendering (pure — no closure state) ────────────────────────────────

/** Any member of the side has omgang rows (pair members alternate omgangar). */
function sideHarOmgangar(side: MatchSide<InitialMatchPlayerRow> | null): boolean {
  return side?.members.some(m => (m.omgangar?.length ?? 0) > 0) ?? false
}

/** Side total: each member carries only the omgangar they threw themselves. */
function sideScore(side: MatchSide<InitialMatchPlayerRow> | null, erBekreftet: boolean): number {
  if (!side) return 0
  return side.members.reduce((sum, m) => sum + (erBekreftet ? (m.score_poeng ?? 0) : scoreForPlayer(m)), 0)
}

const sideNavn = sideNameHtml

type KampStatus = 'ferdig' | 'pagaar' | 'ikke-startet'

function resolveKampStatus(kamp: InitialMatchRow, harPoeng: boolean, harOmgangar: boolean): KampStatus {
  if (kamp.er_bekreftet) return 'ferdig'
  if (harOmgangar || harPoeng) return 'pagaar'
  return 'ikke-startet'
}

function renderKampLegend(): string {
  return `
    <div class="kamp-legend">
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ikke"></div> Ikke startet</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--pagaar"></div> Pågår</div>
      <div class="kamp-legend__item"><div class="kamp-legend__stripe kamp-legend__stripe--ferdig"></div> Ferdig</div>
    </div>`
}

function renderRunde(
  nr: number,
  kamper: InitialMatchRow[],
  startnrMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  posisjonMap: Record<number, number> = {},
): string {
  const desktopRader = kamper.map(k => kampRad(k, startnrMap, admin, hcpMap, posisjonMap)).join('')
  const mobilRader  = kamper.map(k => kampRadMobil(k, startnrMap, admin, hcpMap, posisjonMap)).join('')

  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-sm match-table mb-0 match-table--desktop">
        <thead class="org-thead">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-96 text-center innl-score-th">SCORE</th>
            <th>P2</th>
            ${admin ? '<th class="th-148"></th>' : '<th class="th-80"></th>'}
          </tr>
        </thead>
        <tbody>${desktopRader}</tbody>
      </table>
      <ul class="kamp-liste-mobil list-unstyled mb-0">${mobilRader}</ul>
    </div>`
}

/** A side's raw score: confirmed total, or live omgang sum plus handicap. */
function sideRawScore(side: MatchSide<InitialMatchPlayerRow> | null, erBekreftet: boolean, harOmg: boolean, hcp: number): number {
  if (erBekreftet) return sideScore(side, true)
  return sideScore(side, false) + (harOmg ? hcp : 0)
}

/** Displayed scores: an unconfirmed walkover shows 21–0; otherwise the raw side totals. */
function beregnRadScorar(
  kamp: InitialMatchRow,
  side1: MatchSide<InitialMatchPlayerRow> | null,
  side2: MatchSide<InitialMatchPlayerRow> | null,
  harOmg1: boolean,
  harOmg2: boolean,
  hcp1: number,
  hcp2: number,
): { s1: number; s2: number; harPoeng: boolean } {
  const s1Raw = sideRawScore(side1, kamp.er_bekreftet, harOmg1, hcp1)
  const s2Raw = sideRawScore(side2, kamp.er_bekreftet, harOmg2, hcp2)
  const erUbekreftaWalkover = kamp.er_walkover && !kamp.er_bekreftet
  const harPoeng = kamp.er_bekreftet || kamp.er_walkover || harOmg1 || harOmg2 || s1Raw > 0 || s2Raw > 0
  return {
    s1: erUbekreftaWalkover ? 21 : s1Raw,
    s2: erUbekreftaWalkover ? 0 : s2Raw,
    harPoeng,
  }
}

/** Per-match view state shared by the desktop and mobile row renderers. */
function beregnKampRadState(
  kamp: InitialMatchRow,
  startnrMap: Record<number, number>,
  hcpMap: Record<number, number>,
  posisjonMap: Record<number, number>,
) {
  const [side1, side2] = getMatchSides(kamp.spelarar, startnrMap, posisjonMap)
  const p1 = side1?.rep ?? null
  const p2 = side2?.rep ?? null
  const p2ErBye = kamp.er_walkover && !p2?.kaster

  const harOmg1 = sideHarOmgangar(side1)
  const harOmg2 = sideHarOmgangar(side2)
  const harOmgangar = harOmg1 || harOmg2
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

  const { s1, s2, harPoeng } = beregnRadScorar(kamp, side1, side2, harOmg1, harOmg2, hcp1, hcp2)

  const sp = [p1, p2].filter((s): s is InitialMatchPlayerRow => s != null)
  return {
    side1, side2, p1, p2, p2ErBye, harOmgangar, s1, s2, harPoeng,
    status: resolveKampStatus(kamp, harPoeng, harOmgangar),
    kanBekrefte: canConfirmMatch(kamp, sp, harOmgangar, hcpMap),
    isLive: harOmgangar && !kamp.er_bekreftet,
  }
}

function scoreInnerHtml(s1: number | string, s2: number | string, sep = '–'): string {
  return `<span class="innl-score-inner"><span class="innl-s1">${s1}</span><span class="innl-sep">${sep}</span><span class="innl-s2">${s2}</span></span>`
}

/** Prefixes the startnummer in parentheses when present. */
function medStartnr(namn: string, nr: number | string): string {
  return nr ? `${namn} (${nr})` : namn
}

/** The right-hand action cell for a desktop match row. */
function kampRadKnapperTd(kamp: InitialMatchRow, admin: boolean, harOmgangar: boolean, kanBekrefte: boolean, isLive: boolean): string {
  if (kamp.er_bekreftet) {
    return `<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`
  }
  const pill = isLive ? livePillHtml() : ''
  if (!admin) {
    return `<td class="text-end pe-2 text-nowrap">
        ${pill}
        <button class="kamp-knapp" id="scoreboard-${kamp.id}" title="Scoreboard">Scoreboard</button>
      </td>`
  }
  const scoreKl = `kamp-knapp${harOmgangar ? ' kamp-knapp-primaer' : ''}`
  const bekrftKl = `kamp-knapp${kanBekrefte ? ' kamp-knapp-suksess' : ''}`
  return `<td class="text-end pe-2 text-nowrap">
        ${pill}
        <button class="${scoreKl}" id="scoreboard-${kamp.id}" title="Scoreboard">Scoreboard</button>
        <button class="${bekrftKl}" id="bekrft-${kamp.id}"${!kanBekrefte ? ' disabled' : ''}>Bekreft</button>
      </td>`
}

function kampRad(
  kamp: InitialMatchRow,
  startnrMap: Record<number, number>,
  admin = true,
  hcpMap: Record<number, number> = {},
  posisjonMap: Record<number, number> = {},
): string {
  const { side1, side2, p1, p2, p2ErBye, harOmgangar, s1, s2, harPoeng, status, kanBekrefte, isLive } =
    beregnKampRadState(kamp, startnrMap, hcpMap, posisjonMap)

  const p1Nr = p1?.kasterid ? (startnrMap[p1.kasterid] ?? '') : ''
  const p2Nr = p2?.kasterid ? (startnrMap[p2.kasterid] ?? '') : ''
  const p1Vis = medStartnr(sideNavn(side1, false), p1Nr)
  const p2Vis = medStartnr(p2ErBye ? 'Walkover' : sideNavn(side2, false), p2Nr)

  const kanEndreScore = admin && !kamp.er_walkover
  const scoreCls = `text-center innl-score-cel${kanEndreScore ? ' score-redigerbar' : ''}`
  const scoreExtra = kanEndreScore ? ` data-endre-score="${kamp.id}"` : ''

  return `
    <tr class="kamp-rad-desktop" data-kamp-id="${kamp.id}" data-status="${status}">
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td class="${scoreCls}"${scoreExtra}>${harPoeng ? scoreInnerHtml(s1, s2) : '—'}</td>
      <td>${p2Vis}</td>
      ${kampRadKnapperTd(kamp, admin, harOmgangar, kanBekrefte, isLive)}
    </tr>`
}

function kampRadMobil(
  kamp: InitialMatchRow,
  startnrMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
  posisjonMap: Record<number, number> = {},
): string {
  const { side1, side2, p2ErBye, s1, s2, harPoeng, status, kanBekrefte, isLive } =
    beregnKampRadState(kamp, startnrMap, hcpMap, posisjonMap)

  const p1NavnKort = sideNavn(side1, true)
  const p2NavnKort = p2ErBye ? 'Walkover' : sideNavn(side2, true)
  const resultatTekst = harPoeng ? scoreInnerHtml(s1, s2) : scoreInnerHtml('', '', '—')

  const kanEndreScore = admin && !kamp.er_walkover
  const resultatAttr = kanEndreScore ? ` id="m-score-${kamp.id}"` : ''
  const resultatKlass = kanEndreScore ? ' score-redigerbar' : ''
  const rolleKlass = admin ? '' : ' kamp-rad-mobil--viewer'

  return `
    <li class="kamp-rad-mobil${rolleKlass}" data-kamp-id="${kamp.id}" data-status="${status}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${kamp.bane_nummer ?? ''}</span>
        <span class="kamp-mobil-namn"><span class="kamp-mobil-namn__p1">${p1NavnKort}</span><span class="kamp-mobil-namn__p2"><span class="kamp-mobil-vs">vs</span> ${p2NavnKort}</span></span>
        <span class="kamp-mobil-pill-slot">${isLive ? livePillHtml() : ''}</span>
        <span class="kamp-mobil-resultat${resultatKlass}"${resultatAttr}>${resultatTekst}</span>
      </div>
      ${admin ? kampRadMobilKnapper(kamp, kanBekrefte) : ''}
    </li>`
}

/** The mobile score/confirm button row, shown only to admins. */
function kampRadMobilKnapper(kamp: InitialMatchRow, kanBekrefte: boolean): string {
  const bekrftCell = kamp.er_bekreftet
    ? `<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`
    : `<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${kamp.id}"${!kanBekrefte ? ' disabled' : ''}>Bekreft</button>`
  return `
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-scoreboard-${kamp.id}">Scoreboard</button>
        ${bekrftCell}
      </div>`
}
