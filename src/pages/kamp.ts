import { getUser } from '@/services/authService'
import { logError } from '@/utils/logError'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { renderScoreboard, type ScoreboardOptions } from '@/components/Scoreboard'
import {
  getMatch,
  getMatchResultInfo,
  getNextMatchForOrganizer,
  getNextMatchForParticipant,
  isParticipantInMatch,
  confirmInitialMatch,
  confirmFinalMatch,
  subscribeToNextMatch,
} from '@/services/kampService'
import { getAllMatchSides, type MatchSide } from '@/utils/kamp'
import { throwerNameShort } from '@/utils/kaster'
import { autoGenerateFinaleAndBronzeFinal } from '@/services/kampGenereringCupService'
import { avmeldKanal } from '@/utils/realtime'
import type { MatchRow, MatchPlayerInMatch } from '@/services/kampService'
import type { Params } from '@/types'

const KAMP_POINT_VALUES = [1, 2, 3, 4, 6]

/** Shared state for the kamp view's navigation and confirm flows. */
interface MatchViewCtx {
  container: HTMLElement
  matchId: number
  match: MatchRow
  throwerId: number | null
  isOrganizer: boolean
  isParticipant: boolean
  tournamentName: string
  /** Scoreboard teardown — mutable because the scoreboard mounts after the ctx is built */
  cleanupRef: { current: (() => void) | null }
}

interface SideState {
  p1Side: MatchSide<MatchPlayerInMatch> | null
  p2Side: MatchSide<MatchPlayerInMatch> | null
  p3Side: MatchSide<MatchPlayerInMatch> | null
  p1ks: MatchPlayerInMatch | null
  p2ks: MatchPlayerInMatch | null
  p3ks: MatchPlayerInMatch | null
  hcp1: number
  hcp2: number
}

/** Sides ordered by startnummer — one member for Singel, two for Par/Mix. */
function buildSideState(
  match: MatchRow,
  startNumberMap: Record<number, number>,
  positionMap: Record<number, number>,
  hcpMap: Map<number, number>,
): SideState {
  const sides = getAllMatchSides(match.spelarar ?? [], startNumberMap, positionMap)
  const p1Side = sides[0] ?? null
  const p2Side = sides[1] ?? null
  const p3Side = match.er_tre_spelarar ? (sides[2] ?? null) : null
  const p1ks = p1Side?.rep ?? null
  const p2ks = p2Side?.rep ?? null
  return {
    p1Side, p2Side, p3Side, p1ks, p2ks,
    p3ks: p3Side?.rep ?? null,
    hcp1: p1ks ? (hcpMap.get(p1ks.kasterid) ?? 0) : 0,
    hcp2: p2ks ? (hcpMap.get(p2ks.kasterid) ?? 0) : 0,
  }
}

function buildScoreboardOptions(ctx: MatchViewCtx, sides: SideState, omgangEl: HTMLElement | null): ScoreboardOptions {
  return {
    pointValues: KAMP_POINT_VALUES,
    erArrangor: ctx.isOrganizer,
    erDeltakar: ctx.isParticipant,
    onBekreft: orderedKasterids => confirmMatch(ctx, sides, orderedKasterids),
    onKampBekreft: (ctx.isOrganizer || ctx.isParticipant) ? () => navigateToNextMatch(ctx) : undefined,
    omgangEl,
    p3ks: sides.p3ks,
    hcp1: sides.hcp1,
    hcp2: sides.hcp2,
    p1Navn: sideLabel(sides.p1Side),
    p2Navn: sideLabel(sides.p2Side),
    p3Navn: sideLabel(sides.p3Side),
    p1Ids: sides.p1Side?.members.map(m => m.id) ?? null,
    p2Ids: sides.p2Side?.members.map(m => m.id) ?? null,
    p3Ids: sides.p3Side?.members.map(m => m.id) ?? null,
  }
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildMatchWrapper(ctx: MatchViewCtx, middle: string, body: string, middleId?: string): string {
  return `
    <div class="sb-kamp-wrapper">
      <div class="sb-kamp-topbar">
        <div class="sb-kamp-topbar-venstre">
          <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
          <span class="sb-kamp-stevnenavn">${escHtml(ctx.tournamentName)}</span>
        </div>
        <div${middleId ? ` id="${middleId}"` : ''} class="sb-kamp-topbar-midten">${middle}</div>
        <div class="sb-kamp-topbar-høgre">
          <span class="sb-kamp-info-full">Runde ${ctx.match.runde_nummer} - Bane ${ctx.match.bane_nummer}</span>
          <span class="sb-kamp-info-kort">R${ctx.match.runde_nummer} - B${ctx.match.bane_nummer}</span>
        </div>
      </div>
      ${body}
    </div>
  `
}

/** Par/Mix: both members' short names; Singel (one member): null so the default name is used. */
function sideLabel(side: MatchSide<MatchPlayerInMatch> | null): string | null {
  if (!side || side.members.length < 2) return null
  return side.members.map(m => throwerNameShort(m.kaster)).join(' / ')
}

function showMatchError(container: HTMLElement, message: string): void {
  container.querySelector('.sb-error-banner')?.remove()
  const banner = document.createElement('div')
  banner.className = 'sb-error-banner alert alert-danger m-2'
  banner.textContent = message
  container.prepend(banner)
}

// ── Next match navigation ─────────────────────────────────────────────────────

async function fetchNextMatch(ctx: MatchViewCtx): Promise<{ id: number } | null> {
  if (ctx.isOrganizer) {
    const { data } = await getNextMatchForOrganizer(ctx.match.stevneid, ctx.match.bane_nummer ?? 0)
    return data
  }
  if (ctx.throwerId == null) return null
  const { data } = await getNextMatchForParticipant(ctx.match.stevneid, ctx.throwerId)
  return data
}

async function isRelevantMatch(
  ctx: MatchViewCtx,
  nextMatch: { id: number; bane_nummer: number | null; er_walkover: boolean },
): Promise<boolean> {
  if (nextMatch.er_walkover) return false
  if (ctx.isOrganizer) return nextMatch.bane_nummer === ctx.match.bane_nummer
  if (ctx.throwerId == null) return false
  return isParticipantInMatch(nextMatch.id, ctx.throwerId)
}

function showWaitingForNextMatch(ctx: MatchViewCtx): void {
  sessionStorage.setItem(`ventar-neste-${ctx.matchId}`, '1')
  ctx.container.innerHTML = buildMatchWrapper(
    ctx,
    'Fullført',
    `<div class="sb-waiting-content">
      <div class="alert alert-info sb-waiting-text">Ventar på neste kamp…</div>
      <button class="btn btn-primary btn-lg w-100 sb-waiting-refresh">Oppdater</button>
    </div>`,
  )

  ctx.container.querySelector('.sb-waiting-refresh')?.addEventListener('click', () => {
    location.reload()
  })

  const channel = subscribeToNextMatch(ctx.match.stevneid, ctx.matchId, async (nextMatch) => {
    if (await isRelevantMatch(ctx, nextMatch)) {
      await avmeldKanal(channel)
      location.replace(`#/kamp/${nextMatch.id}`)
    }
  })

  window.addEventListener('hashchange', () => {
    sessionStorage.removeItem(`ventar-neste-${ctx.matchId}`)
    void avmeldKanal(channel)
  }, { once: true })
}

async function navigateToNextMatch(ctx: MatchViewCtx): Promise<void> {
  const next = await fetchNextMatch(ctx)
  if (next) {
    location.replace(`#/kamp/${next.id}`)
    return
  }
  ctx.cleanupRef.current?.()
  ctx.cleanupRef.current = null
  if (ctx.isOrganizer || ctx.isParticipant) showWaitingForNextMatch(ctx)
  else await render(ctx.container, { id: ctx.matchId })
}

// ── Confirm ───────────────────────────────────────────────────────────────────

async function confirmMatch(ctx: MatchViewCtx, sides: SideState, orderedKasterids?: number[] | null): Promise<void> {
  const { p1Side, p2Side, hcp1, hcp2 } = sides
  const p1ks = p1Side?.rep ?? null
  const p2ks = p2Side?.rep ?? null
  const confirmData = {
    p1: p1ks ? { playerId: p1ks.id, kasterid: p1ks.kasterid, scorePoints: p1ks.score_poeng } : null,
    p2: p2ks ? { playerId: p2ks.id, kasterid: p2ks.kasterid, scorePoints: p2ks.score_poeng } : null,
    p1PartnerId: p1Side?.members[1]?.id ?? null,
    p2PartnerId: p2Side?.members[1]?.id ?? null,
  }

  if (ctx.match.fase === 'avsluttende') {
    const { error } = await confirmFinalMatch({
      kampId: ctx.matchId,
      ...confirmData,
      orderedKasterids: orderedKasterids ?? null,
    })
    if (error) { showMatchError(ctx.container, 'Feil ved bekreftelse av kamp.'); return }
    await autoGenerateFinaleAndBronzeFinal(ctx.matchId)
  } else {
    const { error } = await confirmInitialMatch({
      kampId: ctx.matchId,
      ...confirmData,
      hcp1,
      hcp2,
      erWalkover: ctx.match.er_walkover,
    })
    if (error) { showMatchError(ctx.container, 'Feil ved bekreftelse av kamp.'); return }
  }

  await navigateToNextMatch(ctx)
}

// ── Loading ───────────────────────────────────────────────────────────────────

async function fetchMatchAndAuth(
  container: HTMLElement,
  matchId: number,
): Promise<{ match: MatchRow; auth: Awaited<ReturnType<typeof getUser>> } | null> {
  try {
    const [matchResult, authResult] = await Promise.all([getMatch(matchId), getUser()])
    if (!matchResult.data) {
      container.replaceChildren(createErrorBanner('Kamp ikkje funne.'))
      return null
    }
    return { match: matchResult.data, auth: authResult }
  } catch (err) {
    logError('render:kamp', err)
    container.replaceChildren(createErrorBanner('Feil ved lasting av kamp.'))
    return null
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement, params: Params): Promise<void> {
  const matchId = Number(params.id)

  const mainHeader = document.querySelector<HTMLElement>('.top-header')
  if (mainHeader) mainHeader.classList.add('hidden')
  container.classList.add('sb-fullskjerm-modus')

  const cleanupRef: MatchViewCtx['cleanupRef'] = { current: null }

  window.addEventListener('hashchange', () => {
    if (mainHeader) mainHeader.classList.remove('hidden')
    container.classList.remove('sb-fullskjerm-modus')
    cleanupRef.current?.()
    cleanupRef.current = null
  }, { once: true })

  container.replaceChildren(createLoadingState('Laster…'))

  const loaded = await fetchMatchAndAuth(container, matchId)
  if (!loaded) return
  const { match, auth } = loaded

  const throwerId = auth?.profil?.kasterid ?? null
  const role = auth?.profil?.role ?? null
  const isOrganizer  = role === 'admin' || role === 'klubbadmin'
  const isParticipant = throwerId != null && (match.spelarar ?? []).some(s => s.kasterid === throwerId)

  const throwerIds = (match.spelarar ?? []).map(s => s.kasterid).filter((id): id is number => id != null)
  const { startNumberMap, positionMap, hcpMap } = await getMatchResultInfo(match.stevneid, throwerIds)

  const sides = buildSideState(match, startNumberMap, positionMap, hcpMap)

  const ctx: MatchViewCtx = {
    container,
    matchId,
    match,
    throwerId,
    isOrganizer,
    isParticipant,
    tournamentName: match.stevne?.navn ?? '',
    cleanupRef,
  }

  container.innerHTML = buildMatchWrapper(
    ctx,
    'Omgang 1',
    '<div id="sb-container" class="sb-page"></div>',
    'sb-omgang-tittel',
  )

  container.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('.sb-tilbake-btn')) {
      if (history.length > 1) history.back()
      else window.close()
    }
  })

  if (match.er_bekreftet && sessionStorage.getItem(`ventar-neste-${matchId}`)) {
    await navigateToNextMatch(ctx)
    return
  }

  const sbContainer = container.querySelector<HTMLElement>('#sb-container')
  if (!sbContainer) return
  const omgangEl = container.querySelector<HTMLElement>('#sb-omgang-tittel')

  cleanupRef.current = await renderScoreboard(
    sbContainer, match, sides.p1ks, sides.p2ks,
    buildScoreboardOptions(ctx, sides, omgangEl),
  )
}
