import { getUser } from '@/services/authService'
import { logError } from '@/utils/logError'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { renderScoreboard, type ScoreboardOptions } from '@/components/Scoreboard'
import {
  hentKamp,
  hentKampResultatInfo,
  hentNesteKampOrganisator,
  hentNesteKampDeltakar,
  erDeltakarIKamp,
  bekreftInnledendeKamp,
  bekreftAvsluttendeKamp,
  subscribeToNesteKamp,
} from '@/services/kampService'
import { getAllMatchSides, type MatchSide } from '@/utils/kamp'
import { kasterNavnKort } from '@/utils/kaster'
import { autoGenererFinaleOgBronsefinale } from '@/services/kampGenereringCupService'
import { avmeldKanal } from '@/utils/realtime'
import type { KampRow, KampSpelarIKamp } from '@/services/kampService'
import type { Params } from '@/types'

const KAMP_POINT_VALUES = [1, 2, 3, 4, 6]

/** Shared state for the kamp view's navigation and confirm flows. */
interface KampViewCtx {
  container: HTMLElement
  kampId: number
  kamp: KampRow
  kasterid: number | null
  erArrangor: boolean
  erDeltakar: boolean
  stevneNavn: string
  /** Scoreboard teardown — mutable because the scoreboard mounts after the ctx is built */
  cleanupRef: { current: (() => void) | null }
}

interface SideState {
  p1Side: MatchSide<KampSpelarIKamp> | null
  p2Side: MatchSide<KampSpelarIKamp> | null
  p3Side: MatchSide<KampSpelarIKamp> | null
  p1ks: KampSpelarIKamp | null
  p2ks: KampSpelarIKamp | null
  p3ks: KampSpelarIKamp | null
  hcp1: number
  hcp2: number
}

/** Sides ordered by startnummer — one member for Singel, two for Par/Mix. */
function byggSideState(
  kamp: KampRow,
  startnrMap: Record<number, number>,
  posisjonMap: Record<number, number>,
  hcpMap: Map<number, number>,
): SideState {
  const sides = getAllMatchSides(kamp.spelarar ?? [], startnrMap, posisjonMap)
  const p1Side = sides[0] ?? null
  const p2Side = sides[1] ?? null
  const p3Side = kamp.er_tre_spelarar ? (sides[2] ?? null) : null
  const p1ks = p1Side?.rep ?? null
  const p2ks = p2Side?.rep ?? null
  return {
    p1Side, p2Side, p3Side, p1ks, p2ks,
    p3ks: p3Side?.rep ?? null,
    hcp1: p1ks ? (hcpMap.get(p1ks.kasterid) ?? 0) : 0,
    hcp2: p2ks ? (hcpMap.get(p2ks.kasterid) ?? 0) : 0,
  }
}

function byggScoreboardOptions(ctx: KampViewCtx, sider: SideState, omgangEl: HTMLElement | null): ScoreboardOptions {
  return {
    pointValues: KAMP_POINT_VALUES,
    erArrangor: ctx.erArrangor,
    erDeltakar: ctx.erDeltakar,
    onBekreft: orderedKasterids => bekreftKamp(ctx, sider, orderedKasterids),
    onKampBekreft: (ctx.erArrangor || ctx.erDeltakar) ? () => navigerTilNesteKamp(ctx) : undefined,
    omgangEl,
    p3ks: sider.p3ks,
    hcp1: sider.hcp1,
    hcp2: sider.hcp2,
    p1Navn: sideLabel(sider.p1Side),
    p2Navn: sideLabel(sider.p2Side),
    p3Navn: sideLabel(sider.p3Side),
    p1Ids: sider.p1Side?.members.map(m => m.id) ?? null,
    p2Ids: sider.p2Side?.members.map(m => m.id) ?? null,
    p3Ids: sider.p3Side?.members.map(m => m.id) ?? null,
  }
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function lagKampWrapper(ctx: KampViewCtx, midten: string, body: string, midtenId?: string): string {
  return `
    <div class="sb-kamp-wrapper">
      <div class="sb-kamp-topbar">
        <div class="sb-kamp-topbar-venstre">
          <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
          <span class="sb-kamp-stevnenavn">${escHtml(ctx.stevneNavn)}</span>
        </div>
        <div${midtenId ? ` id="${midtenId}"` : ''} class="sb-kamp-topbar-midten">${midten}</div>
        <div class="sb-kamp-topbar-høgre">
          <span class="sb-kamp-info-full">Runde ${ctx.kamp.runde_nummer} - Bane ${ctx.kamp.bane_nummer}</span>
          <span class="sb-kamp-info-kort">R${ctx.kamp.runde_nummer} - B${ctx.kamp.bane_nummer}</span>
        </div>
      </div>
      ${body}
    </div>
  `
}

/** Par/Mix: both members' short names; Singel (one member): null so the default name is used. */
function sideLabel(side: MatchSide<KampSpelarIKamp> | null): string | null {
  if (!side || side.members.length < 2) return null
  return side.members.map(m => kasterNavnKort(m.kaster)).join(' / ')
}

function visKampFeil(container: HTMLElement, melding: string): void {
  container.querySelector('.sb-feil-banner')?.remove()
  const banner = document.createElement('div')
  banner.className = 'sb-feil-banner alert alert-danger m-2'
  banner.textContent = melding
  container.prepend(banner)
}

// ── Neste kamp-navigasjon ─────────────────────────────────────────────────────

async function hentNesteKamp(ctx: KampViewCtx): Promise<{ id: number } | null> {
  if (ctx.erArrangor) {
    const { data } = await hentNesteKampOrganisator(ctx.kamp.stevneid, ctx.kamp.bane_nummer ?? 0)
    return data
  }
  if (ctx.kasterid == null) return null
  const { data } = await hentNesteKampDeltakar(ctx.kamp.stevneid, ctx.kasterid)
  return data
}

async function erRelevantKamp(
  ctx: KampViewCtx,
  nyKamp: { id: number; bane_nummer: number | null; er_walkover: boolean },
): Promise<boolean> {
  if (nyKamp.er_walkover) return false
  if (ctx.erArrangor) return nyKamp.bane_nummer === ctx.kamp.bane_nummer
  if (ctx.kasterid == null) return false
  return erDeltakarIKamp(nyKamp.id, ctx.kasterid)
}

function visVentePaaNesteKamp(ctx: KampViewCtx): void {
  sessionStorage.setItem(`ventar-neste-${ctx.kampId}`, '1')
  ctx.container.innerHTML = lagKampWrapper(
    ctx,
    'Fullført',
    `<div class="sb-ventar-innhald">
      <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
      <div class="alert alert-info">Ventar på neste kamp…</div>
    </div>`,
  )

  const kanal = subscribeToNesteKamp(ctx.kamp.stevneid, ctx.kampId, async (nyKamp) => {
    if (await erRelevantKamp(ctx, nyKamp)) {
      await avmeldKanal(kanal)
      location.hash = `#/kamp/${nyKamp.id}`
    }
  })

  window.addEventListener('hashchange', () => {
    sessionStorage.removeItem(`ventar-neste-${ctx.kampId}`)
    void avmeldKanal(kanal)
  }, { once: true })
}

async function navigerTilNesteKamp(ctx: KampViewCtx): Promise<void> {
  const neste = await hentNesteKamp(ctx)
  if (neste) {
    location.hash = `#/kamp/${neste.id}`
    return
  }
  ctx.cleanupRef.current?.()
  ctx.cleanupRef.current = null
  if (ctx.erArrangor || ctx.erDeltakar) visVentePaaNesteKamp(ctx)
  else await render(ctx.container, { id: ctx.kampId })
}

// ── Bekreft ───────────────────────────────────────────────────────────────────

async function bekreftKamp(ctx: KampViewCtx, sides: SideState, orderedKasterids?: number[] | null): Promise<void> {
  const { p1Side, p2Side, hcp1, hcp2 } = sides
  const p1ks = p1Side?.rep ?? null
  const p2ks = p2Side?.rep ?? null
  const bekreftData = {
    p1: p1ks ? { spelarId: p1ks.id, kasterid: p1ks.kasterid, scorePoeng: p1ks.score_poeng } : null,
    p2: p2ks ? { spelarId: p2ks.id, kasterid: p2ks.kasterid, scorePoeng: p2ks.score_poeng } : null,
    p1PartnerId: p1Side?.members[1]?.id ?? null,
    p2PartnerId: p2Side?.members[1]?.id ?? null,
  }

  if (ctx.kamp.fase === 'avsluttende') {
    const { error } = await bekreftAvsluttendeKamp({
      kampId: ctx.kampId,
      ...bekreftData,
      orderedKasterids: orderedKasterids ?? null,
    })
    if (error) { visKampFeil(ctx.container, 'Feil ved bekreftelse av kamp.'); return }
    await autoGenererFinaleOgBronsefinale(ctx.kampId)
  } else {
    const { error } = await bekreftInnledendeKamp({
      kampId: ctx.kampId,
      ...bekreftData,
      hcp1,
      hcp2,
      erWalkover: ctx.kamp.er_walkover,
    })
    if (error) { visKampFeil(ctx.container, 'Feil ved bekreftelse av kamp.'); return }
  }

  await navigerTilNesteKamp(ctx)
}

// ── Lasting ───────────────────────────────────────────────────────────────────

async function lastKampOgAuth(
  container: HTMLElement,
  kampId: number,
): Promise<{ kamp: KampRow; auth: Awaited<ReturnType<typeof getUser>> } | null> {
  try {
    const [kampResult, authResult] = await Promise.all([hentKamp(kampId), getUser()])
    if (!kampResult.data) {
      container.replaceChildren(createErrorBanner('Kamp ikkje funne.'))
      return null
    }
    return { kamp: kampResult.data, auth: authResult }
  } catch (err) {
    logError('render:kamp', err)
    container.replaceChildren(createErrorBanner('Feil ved lasting av kamp.'))
    return null
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement, params: Params): Promise<void> {
  const kampId = Number(params.id)

  const hovudHeader = document.querySelector<HTMLElement>('.topp-header')
  if (hovudHeader) hovudHeader.classList.add('skjult')
  container.classList.add('sb-fullskjerm-modus')

  const cleanupRef: KampViewCtx['cleanupRef'] = { current: null }

  window.addEventListener('hashchange', () => {
    if (hovudHeader) hovudHeader.classList.remove('skjult')
    container.classList.remove('sb-fullskjerm-modus')
    cleanupRef.current?.()
    cleanupRef.current = null
  }, { once: true })

  container.replaceChildren(createLoadingState('Laster…'))

  const lastet = await lastKampOgAuth(container, kampId)
  if (!lastet) return
  const { kamp, auth } = lastet

  const kasterids = (kamp.spelarar ?? []).map(s => s.kasterid).filter((id): id is number => id != null)
  const { startnrMap, posisjonMap, hcpMap } = await hentKampResultatInfo(kamp.stevneid, kasterids)

  const sider = byggSideState(kamp, startnrMap, posisjonMap, hcpMap)
  const kasterid = auth?.profil?.kasterid ?? null
  const rolle = auth?.profil?.rolle ?? null
  const erArrangor = rolle === 'admin' || rolle === 'klubbadmin'
  const erDeltakar = kasterid != null && (kamp.spelarar ?? []).some(s => s.kasterid === kasterid)

  const ctx: KampViewCtx = {
    container,
    kampId,
    kamp,
    kasterid,
    erArrangor,
    erDeltakar,
    stevneNavn: kamp.stevne?.navn ?? '',
    cleanupRef,
  }

  container.innerHTML = lagKampWrapper(
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

  if (kamp.er_bekreftet && sessionStorage.getItem(`ventar-neste-${kampId}`)) {
    await navigerTilNesteKamp(ctx)
    return
  }

  const sbContainer = container.querySelector<HTMLElement>('#sb-container')
  if (!sbContainer) return
  const omgangEl = container.querySelector<HTMLElement>('#sb-omgang-tittel')

  cleanupRef.current = await renderScoreboard(
    sbContainer, kamp, sider.p1ks, sider.p2ks,
    byggScoreboardOptions(ctx, sider, omgangEl),
  )
}
