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
import { showNumberpad } from '@/components/ScoreNumberpad'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { promptDialog } from '@/components/PromptDialog'
import { beregnKampPoeng, hentP1P2, scoreForSp } from '@/utils/kamp'
import { autoFullforInnledendeKamper } from '@/services/testDataService'
import {
  byggInnledendeSpelMap, sorterStilling, renderInnledendeKnappar, lagOnEndringHandler,
  bindStillingDetaljar, renderHovudInnhald, bindTabToggle, getActiveTab, setActiveTab, renderStillingTabell, beregnKanBekrefte,
  type StillingRad,
} from '@/organizer/org-shared'
import { escHtml } from '@/utils/escHtml'
import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { logError } from '@/utils/logError'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  hentInnledendeKamper, harKampOmgangar, slettKampOmgangar,
  oppdaterKampSpelarScoreRask, bekreftInnledendeKamp, subscribeToKampEndringar,
  type InnlKampRow, type InnlKampSpelarRow,
} from '@/services/kampService'
import {
  hentInnledendeStevne, setStevneErfullfort,
  type InnlStevneRow,
} from '@/services/stevneService'
import { avmeldKanal } from '@/utils/realtime'
import {
  hentResultatForInnledende, oppdaterResultatHcp, skrivPlaseringar,
} from '@/services/resultatService'

// ── Variant API ───────────────────────────────────────────────────────────────

export interface InnledendeContext {
  container: HTMLElement
  stevneid: number
  stevne: InnlStevneRow
  alleKamper: InnlKampRow[]
  rundeMap: Map<number, InnlKampRow[]>
  startnrMap: Record<number, number>
  stilling: StillingRad[]
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
  filterRundar?: (rundeMap: Map<number, InnlKampRow[]>) => Map<number, InnlKampRow[]>
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createInnledendeRenderer(variant: InnledendeVariant) {
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
    variant.onReset?.()
    if (kanal) { await avmeldKanal(kanal); kanal = null }
    container.replaceChildren(createLoadingState('Laster…'))
    await lastOgVis(container, id)
  }

  async function lastOgVis(container: HTMLElement, stevneid: number): Promise<void> {
    try {
      const [{ data: stevne }, { data: alleKamper }, { data: resultat }] = await Promise.all([
        hentInnledendeStevne(stevneid),
        hentInnledendeKamper(stevneid),
        hentResultatForInnledende(stevneid),
      ])

      if (!stevne) {
        container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
        return
      }

      const startnrMap: Record<number, number> = Object.fromEntries(
        resultat.filter(r => r.kasterid != null).map(r => [r.kasterid!, r.startnummer ?? 0]),
      )
      const hcpMap: Record<number, number> = Object.fromEntries(
        resultat.filter(r => r.kasterid != null && (r.hcp ?? 0) > 0).map(r => [r.kasterid!, r.hcp ?? 0]),
      )

      const rundeMap = new Map<number, InnlKampRow[]>()
      for (const kamp of alleKamper) {
        if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
        rundeMap.get(kamp.runde_nummer)!.push(kamp)
      }

      const { spelMap, ekteKasterids } = byggInnledendeSpelMap(alleKamper, startnrMap)

      const stilling = sorterStilling(
        Object.values(spelMap)
          .filter(s => ekteKasterids.has(s.kasterid))
          .map(s => ({ ...s, hcp: resultat.find(r => r.kasterid === s.kasterid)?.hcp ?? 0 })),
        alleKamper,
      )

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

      if (bannerSlot) {
        bannerSlot.innerHTML = (isAdmin ? renderInnledendeKnappar(stevne, variant.erSwiss) : '') + variant.getBannerExtra(ctx)
        variant.bindBannerExtra(bannerSlot, ctx)

        bannerSlot.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
          if (!await confirmDialog({ title: 'Fullfør turnering', message: 'Vil du fullføre turneringa? Dette kan ikkje angrast.', danger: true })) return
          const { error: plErr } = await skrivPlaseringar(stevneid, stilling)
          if (plErr) { showToast('Feil ved lagring av plasseringar', 'error'); return }
          const { error } = await setStevneErfullfort(stevneid)
          if (error) { showToast('Feil ved lagring', 'error'); return }
          await lastOgVis(container, stevneid)
        })

        bannerSlot.querySelector('#test-autofullfør-btn')?.addEventListener('click', async (e) => {
          const btn = e.currentTarget as HTMLButtonElement
          if (!await confirmDialog({ title: 'Autofullfør kampar', message: 'Autofullfør alle ubekreftede innledande kampar?' })) return
          btn.disabled = true
          await autoFullforInnledendeKamper(stevneid)
          await lastOgVis(container, stevneid)
        })
      }

      const rundarSomVisast = (variant.filterRundar ?? (m => m))(rundeMap)
      const kamperHtml = [...rundarSomVisast.entries()].map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap, kanEndreKampar, hcpMap)).join('') + renderKampLegend()
      const harHcp = isAdmin || stilling.some(s => (s.hcp ?? 0) > 0)
      const stillingHtml = renderStillingTabell(stilling, alleKamper, startnrMap, {
        tableId: 'stilling-innl',
        isAdmin,
        stevneid,
        harHcp,
        harAntallKamper: true,
      })

      const activeTab = getActiveTab(container)
      container.innerHTML = renderHovudInnhald(kamperHtml, stillingHtml)
      bindTabToggle(container)
      if (activeTab === 'stilling') setActiveTab(container, 'stilling')
      bindStillingDetaljar(container, 'stilling-innl', stillingExpandedIds)

      if (isAdmin) {
        container.querySelectorAll('.stilling-hcp-celle').forEach(celle => {
          celle.addEventListener('click', async (e) => {
            e.stopPropagation()
            const el = e.currentTarget as HTMLElement
            const kid = Number(el.dataset.kasterid)
            const sid = Number(el.dataset.stevneid)
            const gjeldande = resultat.find(r => r.kasterid === kid)?.hcp ?? 0
            const input = await promptDialog({ title: 'Sett HCP', message: 'Sett HCP for spelar:', defaultValue: String(gjeldande), inputType: 'number' })
            if (input === null) return
            const nyHcp = parseInt(input, 10)
            if (isNaN(nyHcp) || nyHcp < 0) { showToast('Ugyldig HCP-verdi', 'error'); return }
            const { error } = await oppdaterResultatHcp(sid, kid, nyHcp)
            if (error) { showToast('Feil ved lagring av HCP', 'error'); return }
            await lastOgVis(container, stevneid)
          })
        })
      }

      for (const kamp of alleKamper) {
        // ── Plus button handler (shared by desktop #plus-* and mobile #m-plus-*) ──
        const onPlusKlikk = async () => {
          const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
          const spelarIds = [p1?.id, p2?.id].filter((id): id is number => id != null)
          const harOmgangar = spelarIds.length ? await harKampOmgangar(spelarIds) : false

          if (harOmgangar && !await confirmDialog({ title: 'Slett detaljar', message: 'Dette sletter detaljar for denne kampen. Er du sikker?' })) return

          const p1Namn = p1?.kaster ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn)}` : '—'
          const p2Namn = p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn)}` : '—'

          showNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
            try {
              if (harOmgangar && spelarIds.length) await slettKampOmgangar(spelarIds)
              await Promise.all([
                p1 ? oppdaterKampSpelarScoreRask(p1.id, s1) : Promise.resolve({ error: null }),
                p2 ? oppdaterKampSpelarScoreRask(p2.id, s2) : Promise.resolve({ error: null }),
              ])
            } catch (err) {
              logError(`${variant.logPrefix}:plusCallback`, err)
              showToast('Feil ved lagring av score', 'error')
              return
            }
            await lastOgVis(container, stevneid)
          })
        }

        container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', onPlusKlikk)

        container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
          window.open(`#/kamp/${kamp.id}`, '_blank')
        })

        container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', async (e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.disabled = true
          btn.textContent = 'Lagrer…'
          try {
            const ok = await bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap)
            if (!ok) { btn.disabled = false; btn.textContent = 'Bekreft' }
          } catch {
            btn.disabled = false
            btn.textContent = 'Bekreft'
          }
        })

        if (kanEndreKampar && kamp.er_bekreftet) {
          const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
          const p1Namn = p1?.kaster ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn)}` : '—'
          const p2Namn = p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn)}` : '—'
          const handler = () => {
            showNumberpad(p1Namn, p2Namn, p1?.score_poeng ?? 0, p2?.score_poeng ?? 0, async (nyS1, nyS2) => {
              const [kp1, kp2] = beregnKampPoeng(nyS1, nyS2)
              try {
                await Promise.all([
                  p1 ? oppdaterKampSpelarScoreRask(p1.id, nyS1, kp1) : Promise.resolve({ error: null }),
                  p2 ? oppdaterKampSpelarScoreRask(p2.id, nyS2, kp2) : Promise.resolve({ error: null }),
                ])
              } catch (err) {
                logError(`${variant.logPrefix}:adminReScore`, err)
                showToast('Feil ved lagring av score', 'error')
                return
              }
              await lastOgVis(container, stevneid)
            })
          }
          container.querySelectorAll(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
        }

        // ── Mobile row interaction ─────────────────────────────────────────────
        const mobilRad = container.querySelector<HTMLElement>(`.kamp-rad-mobil[data-kamp-id="${kamp.id}"]`)
        if (mobilRad) {
          if (isAdmin) {
            mobilRad.querySelector('.kamp-rad-mobil__hoved')?.addEventListener('click', () => {
              const expanded = mobilRad.dataset.expanded === 'true'
              container.querySelectorAll<HTMLElement>('.kamp-rad-mobil[data-expanded="true"]').forEach(r => {
                r.dataset.expanded = 'false'
                r.setAttribute('aria-expanded', 'false')
              })
              mobilRad.dataset.expanded = expanded ? 'false' : 'true'
              mobilRad.setAttribute('aria-expanded', String(!expanded))
            })

            // Mobile plus
            container.querySelector(`#m-plus-${kamp.id}`)?.addEventListener('click', (e) => {
              e.stopPropagation()
              void onPlusKlikk()
            })

            // Mobile scoreboard
            container.querySelector(`#m-scoreboard-${kamp.id}`)?.addEventListener('click', (e) => {
              e.stopPropagation()
              window.open(`#/kamp/${kamp.id}`, '_blank')
            })

            // Mobile bekreft
            container.querySelector(`#m-bekrft-${kamp.id}`)?.addEventListener('click', async (e) => {
              e.stopPropagation()
              const btn = e.currentTarget as HTMLButtonElement
              btn.disabled = true
              btn.textContent = 'Lagrer…'
              const ok = await bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap)
              if (!ok) { btn.disabled = false; btn.textContent = 'Bekreft' }
            })
          } else {
            mobilRad.addEventListener('click', () => {
              window.open(`#/kamp/${kamp.id}`, '_blank')
            })
          }
        }
      }

      abonnerPaaEndringar(container, stevneid)
    } catch (err) {
      logError(`${variant.logPrefix}.lastOgVis`, err)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste innledande fase.'))
    }
  }

  function abonnerPaaEndringar(container: HTMLElement, stevneid: number): void {
    if (kanal) return
    const onEndring = lagOnEndringHandler(stevneid, ['innledende'], container, lastOgVis, () => {
      if (kanal) { void avmeldKanal(kanal); kanal = null }
    })
    kanal = subscribeToKampEndringar(stevneid, variant.channelName(stevneid), onEndring)
  }

  async function bekreftKamp(
    container: HTMLElement,
    stevneid: number,
    kamp: InnlKampRow,
    startnrMap: Record<number, number>,
    hcpMap: Record<number, number> = {},
  ): Promise<boolean> {
    const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
    const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
    const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

    const { error } = await bekreftInnledendeKamp({
      kampId: kamp.id,
      p1: p1 ? { spelarId: p1.id, kasterid: p1.kasterid, scorePoeng: p1.score_poeng } : null,
      p2: p2 ? { spelarId: p2.id, kasterid: p2.kasterid, scorePoeng: p2.score_poeng } : null,
      hcp1,
      hcp2,
      erWalkover: kamp.er_walkover,
    })
    if (error) { showToast('DB-feil ved bekreft', 'error'); return false }
    await lastOgVis(container, stevneid)
    return true
  }

  return render
}

// ── Shared rendering (pure — no closure state) ────────────────────────────────

type KampStatus = 'ferdig' | 'pagaar' | 'ikke-startet'

function resolveKampStatus(kamp: InnlKampRow, harPoeng: boolean, harOmgangar: boolean): KampStatus {
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
  kamper: InnlKampRow[],
  startnrMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
): string {
  const desktopRader = kamper.map(k => kampRad(k, startnrMap, admin, hcpMap)).join('')
  const mobilRader  = kamper.map(k => kampRadMobil(k, startnrMap, admin, hcpMap)).join('')

  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-sm kamp-tabell mb-0 kamp-tabell--desktop">
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

function kampRad(
  kamp: InnlKampRow,
  startnrMap: Record<number, number>,
  admin = true,
  hcpMap: Record<number, number> = {},
): string {
  const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)

  const p1Nr = p1?.kasterid ? (startnrMap[p1.kasterid] ?? '') : ''
  const p2Nr = p2?.kasterid ? (startnrMap[p2.kasterid] ?? '') : ''

  const p1Namn = p1?.kaster ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn)}` : '—'
  const p2ErBye = kamp.er_walkover && !p2?.kaster
  const p2Namn = p2ErBye ? 'Walkover' : (p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn)}` : '—')

  const p1Vis = p1Nr ? `${p1Namn} (${p1Nr})` : p1Namn
  const p2Vis = p2ErBye
    ? (p2Nr ? `Walkover (${p2Nr})` : 'Walkover')
    : (p2Nr ? `${p2Namn} (${p2Nr})` : p2Namn)

  const harOmg1 = (p1?.omgangar?.length ?? 0) > 0
  const harOmg2 = (p2?.omgangar?.length ?? 0) > 0
  const harOmgangar = harOmg1 || harOmg2
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

  const s1Raw = kamp.er_bekreftet ? (p1?.score_poeng ?? 0) : (scoreForSp(p1) + (harOmg1 ? hcp1 : 0))
  const s2Raw = kamp.er_bekreftet ? (p2?.score_poeng ?? 0) : (scoreForSp(p2) + (harOmg2 ? hcp2 : 0))

  const erUbekreftaWalkover = kamp.er_walkover && !kamp.er_bekreftet
  const s1 = erUbekreftaWalkover ? 21 : s1Raw
  const s2 = erUbekreftaWalkover ? 0 : s2Raw
  const harPoeng = kamp.er_bekreftet || kamp.er_walkover || harOmgangar || s1Raw > 0 || s2Raw > 0

  const status = resolveKampStatus(kamp, harPoeng, harOmgangar)
  const sp = [p1, p2].filter((s): s is InnlKampSpelarRow => s != null)
  const kanBekrefte = beregnKanBekrefte(kamp, sp, harOmgangar, hcpMap)
  const kanEndreScore = admin && kamp.er_bekreftet && !kamp.er_walkover && !harOmgangar
  const scoreCls = `text-center innl-score-cel${kanEndreScore ? ' score-redigerbar' : ''}`
  const scoreExtra = kanEndreScore ? ` data-endre-score="${kamp.id}"` : ''

  let knapperTd: string
  if (kamp.er_bekreftet) {
    knapperTd = `<td class="text-end pe-2"><span class="kamp-bekreftet-indikator">✓ Bekreftet</span></td>`
  } else if (admin) {
    const plusPrimaer  = status === 'ikke-startet'
    const scorePrimaer = harOmgangar
    const bekrftPrimaer = kanBekrefte
    const plusKl  = `kamp-knapp${plusPrimaer  ? ' kamp-knapp-primaer' : ''}`
    const scoreKl = `kamp-knapp${scorePrimaer ? ' kamp-knapp-primaer' : ''}`
    const bekrftKl = `kamp-knapp${bekrftPrimaer ? ' kamp-knapp-suksess' : ''}`
    knapperTd = `<td class="text-end pe-2 text-nowrap">
        <button class="${plusKl}" id="plus-${kamp.id}">+</button>
        <button class="${scoreKl}" id="scoreboard-${kamp.id}" title="Scoreboard">Score</button>
        <button class="${bekrftKl}" id="bekrft-${kamp.id}"${!kanBekrefte ? ' disabled' : ''}>Bekreft</button>
      </td>`
  } else {
    knapperTd = `<td class="text-end pe-2">
        <button class="kamp-knapp" id="scoreboard-${kamp.id}" title="Scoreboard">Score</button>
      </td>`
  }

  return `
    <tr class="kamp-rad-desktop" data-status="${status}">
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td class="${scoreCls}"${scoreExtra}>${harPoeng ? `<span class="innl-score-inner"><span class="innl-s1">${s1}</span><span class="innl-sep">–</span><span class="innl-s2">${s2}</span></span>` : '—'}</td>
      <td>${p2Vis}</td>
      ${knapperTd}
    </tr>`
}

function kampRadMobil(
  kamp: InnlKampRow,
  startnrMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
): string {
  const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)

  const p1NavnKort = p1?.kaster
    ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn.charAt(0))}.`
    : '—'
  const p2ErBye = kamp.er_walkover && !p2?.kaster
  const p2NavnKort = p2ErBye
    ? 'Walkover'
    : (p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn.charAt(0))}.` : '—')

  const harOmg1 = (p1?.omgangar?.length ?? 0) > 0
  const harOmg2 = (p2?.omgangar?.length ?? 0) > 0
  const harOmgangar = harOmg1 || harOmg2
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

  const s1Raw = kamp.er_bekreftet ? (p1?.score_poeng ?? 0) : (scoreForSp(p1) + (harOmg1 ? hcp1 : 0))
  const s2Raw = kamp.er_bekreftet ? (p2?.score_poeng ?? 0) : (scoreForSp(p2) + (harOmg2 ? hcp2 : 0))
  const erUbekreftaWalkover = kamp.er_walkover && !kamp.er_bekreftet
  const s1 = erUbekreftaWalkover ? 21 : s1Raw
  const s2 = erUbekreftaWalkover ? 0 : s2Raw
  const harPoeng = kamp.er_bekreftet || kamp.er_walkover || harOmgangar || s1Raw > 0 || s2Raw > 0

  const status = resolveKampStatus(kamp, harPoeng, harOmgangar)
  const resultatTekst = harPoeng
    ? `<span class="innl-score-inner"><span class="innl-s1">${s1}</span><span class="innl-sep">–</span><span class="innl-s2">${s2}</span></span>`
    : '—'

  let knapperHtml = ''
  if (admin) {
    const sp = [p1, p2].filter((s): s is InnlKampSpelarRow => s != null)
    const kanBekrefte = beregnKanBekrefte(kamp, sp, harOmgangar, hcpMap)
    const bekrftCell = kamp.er_bekreftet
      ? `<span class="kamp-bekreftet-mobil">✓ Bekreftet</span>`
      : `<button class="kamp-knapp-mobil kamp-knapp-bekreft-mobil" id="m-bekrft-${kamp.id}"${!kanBekrefte ? ' disabled' : ''}>Bekreft</button>`
    knapperHtml = `
      <div class="kamp-mobil-knapper">
        <button class="kamp-knapp-mobil" id="m-plus-${kamp.id}"${kamp.er_bekreftet ? ' disabled' : ''}>+ Resultat</button>
        <button class="kamp-knapp-mobil" id="m-scoreboard-${kamp.id}">Score</button>
        ${bekrftCell}
      </div>`
  }

  const rolleKlass = admin ? '' : ' kamp-rad-mobil--viewer'
  return `
    <li class="kamp-rad-mobil${rolleKlass}" data-kamp-id="${kamp.id}" data-status="${status}" role="button" tabindex="0">
      <div class="kamp-rad-mobil__hoved">
        <span class="kamp-mobil-bane">${kamp.bane_nummer ?? ''}</span>
        <span class="kamp-mobil-namn">${p1NavnKort} vs ${p2NavnKort}</span>
        <span class="kamp-mobil-resultat">${resultatTekst}</span>
      </div>
      ${knapperHtml}
    </li>`
}
