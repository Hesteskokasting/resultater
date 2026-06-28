// ── Shared base for avsluttende-phase renderers ───────────────────────────────
//
// Usage: call createAvsluttendeRenderer(variant) once at module level in each
// kastemetode file. The factory returns a render() function that owns its own
// realtime channel, admin flag, and banner slot.
//
// AvsluttendeVariant config fields:
//   channelName(stevneid)       — realtime channel name, must be unique per variant
//   renderKamparHtml(ctx)       — HTML for the "Kampar" tab (shown when gruppefordeling exists)
//   bindKamparEvents(el, ctx)   — bind match interaction handlers
//   renderSetupHtml(ctx)        — HTML shown before gruppefordeling is set up
//   bindHeaderEvents(slot, ctx) — bind variant-specific banner button handlers
//
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  buildAvsluttendeStilling,
  renderStillingTabell,
  renderHovudInnhald,
  renderAvsluttendeKnappar,
  bindStillingDetaljar,
  bindTabToggle,
  getActiveTab,
  setActiveTab,
  lagOnEndringHandler,
  type StillingRad,
  type OrgKamp,
} from '@/organizer/org-shared'
import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { logError } from '@/utils/logError'
import { avmeldKanal } from '@/utils/realtime'
import {
  hentAvsluttendeKamper,
  subscribeToKampEndringar,
  type AvslKampRow,
  type AvslKampSpelarRow,
} from '@/services/kampService'
import {
  hentAvsluttendeStevne,
  setStevneErfullfort,
  hentPameldingCount,
  type AvslStevneRow,
} from '@/services/stevneService'
import {
  hentResultatForAvsluttende,
  hentGrupper,
  skrivPlaseringar,
  type AvslResultatRow,
} from '@/services/resultatService'
import { hentParForStevne } from '@/services/pameldingService'
import type { Runde1FormatTyped, Json } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

type AvslResultatKjent = AvslResultatRow & { kasterid: number }

export interface AvsluttendeContext {
  container: HTMLElement
  stevneid: number
  stevne: AvslStevneRow
  stilling: StillingRad[]
  startnrMap: Record<number, number>
  posisjonMap: Record<number, number>
  /** Par/Mix stevne — two players share a startnummer */
  erLag: boolean
  navnMap: Record<number, string>
  innlKampar: AvslKampRow[]
  avslKampar: AvslKampRow[]
  resultat: AvslResultatKjent[]
  isAdmin: boolean
  harGruppefordeling: boolean
  alleInnlBekrefta: boolean
  harAvslKampar: boolean
  runde1Format: Runde1FormatTyped | null
  /** Competing units for setup: complete pairs for lag-based stevner, enrolled players otherwise */
  unitCount: number
  gruppeNavnMap: Record<string, number>
  reload: () => Promise<void>
}

export interface AvsluttendeVariant {
  channelName: (stevneid: number) => string
  renderKamparHtml: (ctx: AvsluttendeContext) => string
  bindKamparEvents: (container: HTMLElement, ctx: AvsluttendeContext) => void
  renderSetupHtml: (ctx: AvsluttendeContext) => string
  bindHeaderEvents: (bannerSlot: HTMLElement | null, ctx: AvsluttendeContext) => void
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function parseRunde1Format(json: Json | null): Runde1FormatTyped | null {
  if (json == null || typeof json !== 'object' || Array.isArray(json)) return null
  return json as unknown as Runde1FormatTyped
}

function toOrgKamp(kampar: AvslKampRow[]): OrgKamp[] {
  return kampar.map(k => ({
    er_bekreftet: k.er_bekreftet,
    er_walkover: k.er_walkover,
    runde_nummer: k.runde_nummer,
    bane_nummer: k.bane_nummer,
    spelarar: toOrgSp(k.spelarar),
  }))
}

export function toOrgSp(sp: AvslKampSpelarRow[]) {
  return sp.map(s => ({
    kasterid: s.kasterid ?? 0,
    kamp_poeng: s.kamp_poeng ?? 0,
    score_poeng: s.score_poeng ?? 0,
    antall_ringer: s.antall_ringer,
    omgangar: s.omgangar,
    kaster: s.kaster,
  }))
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createAvsluttendeRenderer(variant: AvsluttendeVariant) {
  let kanal: RealtimeChannel | null = null
  let bannerSlot: HTMLElement | null = null
  let isAdmin = false
  const stillingExpandedIds = new Set<string>()

  async function render(
    container: HTMLElement,
    { id, isAdmin: _isAdmin = false }: { id: number; isAdmin?: boolean },
    _bannerSlot: HTMLElement | null = null,
  ): Promise<void> {
    bannerSlot = _bannerSlot
    isAdmin = _isAdmin
    if (kanal) { await avmeldKanal(kanal); kanal = null }
    container.replaceChildren(createLoadingState('Laster…'))
    await lastOgVis(container, id)
  }

  async function lastOgVis(container: HTMLElement, stevneid: number): Promise<void> {
    try {
      const [
        { data: stevne },
        { data: rawKampar },
        { data: rawResultat },
        { data: rawGrupper },
        { count: pameldingCount },
      ] = await Promise.all([
        hentAvsluttendeStevne(stevneid),
        hentAvsluttendeKamper(stevneid),
        hentResultatForAvsluttende(stevneid),
        hentGrupper(['A', 'B']),
        hentPameldingCount(stevneid),
      ])

      if (!stevne) {
        container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
        return
      }

      const typedResultat = rawResultat.filter((r): r is AvslResultatKjent => r.kasterid != null)
      const innlKampar = rawKampar.filter(k => k.fase === 'innledende')
      const avslKampar = rawKampar.filter(k => k.fase === 'avsluttende')

      const startnrMap: Record<number, number> = {}
      const posisjonMap: Record<number, number> = {}
      const snrCount = new Map<number, number>()
      for (const r of typedResultat) {
        if (r.startnummer != null) {
          startnrMap[r.kasterid] = r.startnummer
          snrCount.set(r.startnummer, (snrCount.get(r.startnummer) ?? 0) + 1)
        }
        if (r.posisjon != null) posisjonMap[r.kasterid] = r.posisjon
      }
      // Par/Mix: two players share a startnummer
      const erLag = [...snrCount.values()].some(c => c > 1)

      const navnMap: Record<number, string> = {}
      for (const k of rawKampar) {
        for (const sp of k.spelarar) {
          if (sp.kasterid && sp.kaster && !navnMap[sp.kasterid]) {
            navnMap[sp.kasterid] = `${sp.kaster.fornavn} ${sp.kaster.etternavn}`
          }
        }
      }

      const innlKamparOrg = toOrgKamp(innlKampar)
      const stilling = buildAvsluttendeStilling(innlKamparOrg, typedResultat, navnMap, startnrMap, posisjonMap)

      const alleInnlBekrefta = innlKampar.length > 0 && innlKampar.every(k => k.er_bekreftet)
      const harAvslKampar = avslKampar.length > 0
      const harNokonKampar = innlKampar.length > 0 || harAvslKampar
      const allMatchesConfirmed = harNokonKampar &&
        innlKampar.every(k => k.er_bekreftet) &&
        avslKampar.every(k => k.er_bekreftet)
      const harGruppefordeling = typedResultat.some(r => r.gruppe != null)
      const gruppeNavnMap: Record<string, number> = Object.fromEntries(rawGrupper.map(g => [g.navn, g.id]))
      const runde1Format = parseRunde1Format(stevne.runde1_format)

      // Lag-based: the competing unit is a pair, so setup must count
      // complete pairs — not enrolled players
      let unitCount = pameldingCount ?? 0
      if (stevne.kategori?.erlagbasert) {
        const { data: pairs } = await hentParForStevne(stevneid)
        unitCount = pairs.length
      }

      const ctx: AvsluttendeContext = {
        container,
        stevneid,
        stevne,
        stilling,
        startnrMap,
        posisjonMap,
        erLag,
        navnMap,
        innlKampar,
        avslKampar,
        resultat: typedResultat,
        isAdmin,
        harGruppefordeling,
        alleInnlBekrefta,
        harAvslKampar,
        runde1Format,
        unitCount,
        gruppeNavnMap,
        reload: () => lastOgVis(container, stevneid),
      }

      if (isAdmin && bannerSlot) {
        bannerSlot.innerHTML = renderAvsluttendeKnappar(stevne, {
          allMatchesConfirmed,
          harAvslKampar,
          harGruppefordeling,
          harPrekonfigurertFormat: runde1Format != null && stevne.stevne_fase !== 'avsluttende',
        })
      }

      const activeTab = getActiveTab(container)

      if (harGruppefordeling) {
        const stillingHtml = renderStillingTabell(stilling, innlKamparOrg, startnrMap, {
          tableId: 'stilling-avsl',
          harGrupper: true,
          harEliminasjon: true,
          posisjonMap,
          unitLabel: erLag ? 'par' : 'spelarar',
        })
        container.innerHTML = renderHovudInnhald(variant.renderKamparHtml(ctx), stillingHtml)
        bindStillingDetaljar(container, 'stilling-avsl', stillingExpandedIds)
        bindTabToggle(container)
        if (activeTab === 'stilling') setActiveTab(container, 'stilling')
        variant.bindKamparEvents(container, ctx)
        abonnerPaaEndringar(container, stevneid)
      } else {
        container.innerHTML = variant.renderSetupHtml(ctx)
      }

      bannerSlot?.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
        if (!await confirmDialog({ title: 'Fullfør turnering', message: 'Vil du fullføre turneringa? Dette kan ikkje angrast.', danger: true })) return
        // Sort by gruppe so A gets 1..nA, B gets nA+1..nA+nB.
        // sorterStilling mixes groups together; filtering preserves correct within-group order.
        const stillingByGruppe = [
          ...stilling.filter(r => r.gruppe?.navn === 'A'),
          ...stilling.filter(r => r.gruppe?.navn === 'B'),
          ...stilling.filter(r => r.gruppe?.navn !== 'A' && r.gruppe?.navn !== 'B'),
        ]
        const { error: plErr } = await skrivPlaseringar(stevneid, stillingByGruppe)
        if (plErr) { showToast('Feil ved lagring av plasseringar', 'error'); return }
        const { error } = await setStevneErfullfort(stevneid)
        if (error) { showToast('Feil ved fullføring av turnering', 'error'); return }
        await lastOgVis(container, stevneid)
      })

      variant.bindHeaderEvents(bannerSlot, ctx)
    } catch (err) {
      logError('avsluttendeBase.lastOgVis', err)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste avsluttande fase.'))
    }
  }

  function abonnerPaaEndringar(container: HTMLElement, stevneid: number): void {
    if (kanal) return
    const onEndring = lagOnEndringHandler(stevneid, ['avsluttende'], container, lastOgVis, () => {
      if (kanal) { void avmeldKanal(kanal); kanal = null }
    })
    kanal = subscribeToKampEndringar(stevneid, variant.channelName(stevneid), onEndring)
  }

  return render
}
