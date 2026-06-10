import { getUser } from '@/services/authService'
import { logError } from '@/utils/logError'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { renderScoreboard } from '@/components/Scoreboard'
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

const KAMP_POINT_VALUES = [1, 2, 3, 4, 6]

export async function render(container: HTMLElement, params: Record<string, string | number | undefined>): Promise<void> {
  const kampId = Number(params.id)

  const hovudHeader = document.querySelector<HTMLElement>('.topp-header')
  if (hovudHeader) hovudHeader.classList.add('skjult')
  container.classList.add('sb-fullskjerm-modus')

  let sbCleanup: (() => void) | null = null

  window.addEventListener('hashchange', () => {
    if (hovudHeader) hovudHeader.classList.remove('skjult')
    container.classList.remove('sb-fullskjerm-modus')
    sbCleanup?.()
    sbCleanup = null
  }, { once: true })

  container.replaceChildren(createLoadingState('Laster…'))

  let kamp: KampRow
  let auth: Awaited<ReturnType<typeof getUser>>

  try {
    const [kampResult, authResult] = await Promise.all([hentKamp(kampId), getUser()])
    if (!kampResult.data) {
      container.replaceChildren(createErrorBanner('Kamp ikkje funne.'))
      return
    }
    kamp = kampResult.data
    auth = authResult
  } catch (err) {
    logError('render:kamp', err)
    container.replaceChildren(createErrorBanner('Feil ved lasting av kamp.'))
    return
  }

  const kasterids = (kamp.spelarar ?? []).map(s => s.kasterid).filter((id): id is number => id != null)
  const { startnrMap, posisjonMap, hcpMap } = await hentKampResultatInfo(kamp.stevneid, kasterids)

  // Sides ordered by startnummer — one member for Singel, two for Par/Mix.
  const sides = getAllMatchSides(kamp.spelarar ?? [], startnrMap, posisjonMap)
  const kasterid = auth?.profil?.kasterid ?? null
  const rolle = auth?.profil?.rolle ?? null
  const erArrangor = rolle === 'admin' || rolle === 'klubbadmin'
  const erDeltakar = kasterid != null && (kamp.spelarar ?? []).some(s => s.kasterid === kasterid)

  const p1Side = sides[0] ?? null
  const p2Side = sides[1] ?? null
  const p3Side = kamp.er_tre_spelarar ? (sides[2] ?? null) : null

  const p1ks: KampSpelarIKamp | null = p1Side?.rep ?? null
  const p2ks: KampSpelarIKamp | null = p2Side?.rep ?? null
  const p3ks: KampSpelarIKamp | null = p3Side?.rep ?? null

  function sideLabel(side: MatchSide<KampSpelarIKamp> | null): string | null {
    if (!side || side.members.length < 2) return null
    return side.members.map(m => kasterNavnKort(m.kaster)).join(' / ')
  }

  const hcp1 = p1ks ? (hcpMap.get(p1ks.kasterid) ?? 0) : 0
  const hcp2 = p2ks ? (hcpMap.get(p2ks.kasterid) ?? 0) : 0
  const stevneNavn = kamp.stevne?.navn ?? ''

  function lagKampWrapper(midten: string, body: string, midtenId?: string): string {
    return `
      <div class="sb-kamp-wrapper">
        <div class="sb-kamp-topbar">
          <div class="sb-kamp-topbar-venstre">
            <button class="sb-tilbake-btn" aria-label="Tilbake">←</button>
            <span class="sb-kamp-stevnenavn">${escHtml(stevneNavn)}</span>
          </div>
          <div${midtenId ? ` id="${midtenId}"` : ''} class="sb-kamp-topbar-midten">${midten}</div>
          <div class="sb-kamp-topbar-høgre">
            <span class="sb-kamp-info-full">Runde ${kamp.runde_nummer} - Bane ${kamp.bane_nummer}</span>
            <span class="sb-kamp-info-kort">R${kamp.runde_nummer} - B${kamp.bane_nummer}</span>
          </div>
        </div>
        ${body}
      </div>
    `
  }

  container.innerHTML = lagKampWrapper(
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

  const sbContainer = container.querySelector<HTMLElement>('#sb-container')
  const omgangEl = container.querySelector<HTMLElement>('#sb-omgang-tittel')

  async function hentNesteKamp(): Promise<{ id: number } | null> {
    if (erArrangor) {
      const { data } = await hentNesteKampOrganisator(kamp.stevneid, kamp.bane_nummer ?? 0)
      return data
    }
    if (kasterid == null) return null
    const { data } = await hentNesteKampDeltakar(kamp.stevneid, kasterid)
    return data
  }

  async function erRelevantKamp(nyKamp: { id: number; bane_nummer: number | null; er_walkover: boolean }): Promise<boolean> {
    if (nyKamp.er_walkover) return false
    if (erArrangor) return nyKamp.bane_nummer === kamp.bane_nummer
    if (kasterid == null) return false
    return erDeltakarIKamp(nyKamp.id, kasterid)
  }

  function visVentePaaNesteKamp(): void {
    sessionStorage.setItem(`ventar-neste-${kampId}`, '1')
    container.innerHTML = lagKampWrapper(
      'Fullført',
      `<div class="sb-ventar-innhald">
        <div class="alert alert-success mb-3"><strong>Kampen er ferdig!</strong></div>
        <div class="alert alert-info">Ventar på neste kamp…</div>
      </div>`,
    )

    const kanal = subscribeToNesteKamp(kamp.stevneid, kampId, async (nyKamp) => {
      if (await erRelevantKamp(nyKamp)) {
        await avmeldKanal(kanal)
        location.hash = `#/kamp/${nyKamp.id}`
      }
    })

    window.addEventListener('hashchange', () => {
      sessionStorage.removeItem(`ventar-neste-${kampId}`)
      void avmeldKanal(kanal)
    }, { once: true })
  }

  async function navigerTilNesteKamp(): Promise<void> {
    const neste = await hentNesteKamp()
    if (neste) {
      location.hash = `#/kamp/${neste.id}`
    } else if (erArrangor || erDeltakar) {
      sbCleanup?.()
      sbCleanup = null
      visVentePaaNesteKamp()
    } else {
      sbCleanup?.()
      sbCleanup = null
      await render(container, { id: kampId })
    }
  }

  function visKampFeil(melding: string): void {
    container.querySelector('.sb-feil-banner')?.remove()
    const banner = document.createElement('div')
    banner.className = 'sb-feil-banner alert alert-danger m-2'
    banner.textContent = melding
    container.prepend(banner)
  }

  async function onBekreft(orderedKasterids?: number[] | null): Promise<void> {
    const bekreftData = {
      p1: p1ks ? { spelarId: p1ks.id, kasterid: p1ks.kasterid, scorePoeng: p1ks.score_poeng } : null,
      p2: p2ks ? { spelarId: p2ks.id, kasterid: p2ks.kasterid, scorePoeng: p2ks.score_poeng } : null,
    }

    if (kamp.fase === 'avsluttende') {
      const { error } = await bekreftAvsluttendeKamp({
        kampId,
        ...bekreftData,
        orderedKasterids: orderedKasterids ?? null,
      })
      if (error) { visKampFeil('Feil ved bekreftelse av kamp.'); return }
      await autoGenererFinaleOgBronsefinale(kampId)
    } else {
      const { error } = await bekreftInnledendeKamp({
        kampId,
        ...bekreftData,
        hcp1,
        hcp2,
        erWalkover: kamp.er_walkover,
        p1PartnerId: p1Side?.members[1]?.id ?? null,
        p2PartnerId: p2Side?.members[1]?.id ?? null,
      })
      if (error) { visKampFeil('Feil ved bekreftelse av kamp.'); return }
    }

    await navigerTilNesteKamp()
  }

  if (kamp.er_bekreftet && sessionStorage.getItem(`ventar-neste-${kampId}`)) {
    await navigerTilNesteKamp()
    return
  }

  if (!sbContainer) return

  sbCleanup = await renderScoreboard(sbContainer, kamp, p1ks, p2ks, {
    pointValues: KAMP_POINT_VALUES,
    erArrangor,
    erDeltakar,
    onBekreft,
    onKampBekreft: (erArrangor || erDeltakar) ? navigerTilNesteKamp : undefined,
    omgangEl,
    p3ks,
    hcp1,
    hcp2,
    p1Navn: sideLabel(p1Side),
    p2Navn: sideLabel(p2Side),
    p3Navn: sideLabel(p3Side),
  })
}
