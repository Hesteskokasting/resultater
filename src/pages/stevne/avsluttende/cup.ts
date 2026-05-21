import { gyldigeRunde1Oppsett } from '@/utils/kastemetoder-logikk'
import {
  renderGruppefordeling,
  renderGruppePreview,
  renderGruppePanelInnhald,
  renderStrukturListeHtml,
} from '@/organizer/gruppefordelingUi'
import { genererFinaleOgBronsefinale } from '@/services/kampGenereringCupService'
import { opnGenererRundeDialog } from './_avslCupGenererRundeDialog'
import { opnTreSpelarBekreftDialog } from './_avslCupTreSpelarDialog'
import { showNumberpad } from '@/components/ScoreNumberpad'
import { scoreForSp } from '@/utils/kamp'
import {
  beregnKanBekrefte,
  type StillingRad,
} from '@/organizer/org-shared'
import { escHtml } from '@/utils/escHtml'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import type { RundeOppsett } from '@/types'
import {
  harAlleSemifinalarBekrefta,
  bekreftCupKamp,
  oppdaterVinnarTapar,
  oppdaterKampSpelarScoreRask,
  slettKampOmgangar,
  hentKampSpelarar,
  type AvslKampRow,
  type AvslKampSpelarRow,
} from '@/services/kampService'
import {
  oppdaterStevneFase,
  setRunde1Format,
} from '@/services/stevneService'
import {
  setGruppeInndeling,
  clearGruppeInndeling,
  type AvslResultatRow,
} from '@/services/resultatService'
import {
  createAvsluttendeRenderer,
  type AvsluttendeContext,
  type AvsluttendeVariant,
} from './avsluttendeBase'

// ── Cup variant ───────────────────────────────────────────────────────────────

const cupVariant: AvsluttendeVariant = {
  channelName: (stevneid) => `stevne-avsl-cup-${stevneid}`,

  renderKamparHtml: (ctx) => {
    const { avslKampar, stilling, startnrMap, isAdmin } = ctx
    const gruppeNamn = [...new Set(
      stilling.map(r => r.gruppe?.navn).filter((n): n is string => n != null),
    )].sort()
    const stillingMap: Record<number, StillingRad> = Object.fromEntries(stilling.map(r => [r.kasterid, r]))

    const gruppeKolonnar = gruppeNamn.map(g => {
      const kampar = avslKampar.filter(k => k.gruppe_navn === g)
      const stillingG = stilling.filter(r => r.gruppe?.navn === g)
      const aktiveCount = stillingG.filter(r => r.runde_eliminert == null).length
      const totalCount = stillingG.length
      const sisteRundeNr = kampar.length ? Math.max(...kampar.map(k => k.runde_nummer)) : 0
      const sisteRunde = kampar.filter(k => k.runde_nummer === sisteRundeNr)
      const sisteRundeFullfort = sisteRunde.length > 0 && sisteRunde.every(k => k.er_bekreftet || k.er_walkover)
      const harSemifinaleIGruppe = kampar.some(k => k.runde_navn === 'Semifinale')
      const visGenerer = isAdmin && (kampar.length === 0 || sisteRundeFullfort) && aktiveCount > 1 && !harSemifinaleIGruppe
      return renderGruppeKolonne(g, kampar, aktiveCount, totalCount, sisteRundeNr, visGenerer, startnrMap, isAdmin, stillingMap)
    }).join('')

    return `<div class="d-flex gap-3 flex-wrap">${gruppeKolonnar}</div>`
  },

  bindKamparEvents: (container, ctx) => {
    if (!ctx.isAdmin && ctx.avslKampar.length === 0) return
    bindKampEvents(container, ctx.stevneid, ctx.avslKampar, ctx.isAdmin, ctx.reload)
  },

  renderSetupHtml: (ctx) => {
    const { stevne, isAdmin, runde1Format, pameldingCount, stilling } = ctx
    const initNa = runde1Format?.nA ?? null

    if (stevne.stevne_fase === 'avsluttende') {
      if (!isAdmin) return '<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>'
      return renderGruppefordeling(stilling, { visSpelarliste: true, initNa, initFormat: runde1Format })
    }

    if (pameldingCount > 0 && isAdmin) {
      return renderGruppefordeling(pameldingCount, { visSpelarliste: false, initNa, initFormat: runde1Format })
    }

    return ''
  },

  bindHeaderEvents: (bannerSlot, ctx) => {
    const { container, stevneid, stevne, stilling, runde1Format, alleInnlBekrefta, harGruppefordeling, gruppeNavnMap, reload } = ctx

    bannerSlot?.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
      if (!alleInnlBekrefta) return
      const { error } = await oppdaterStevneFase(stevneid, 'avsluttende')
      if (error) { showToast('Feil ved oppstart av avsluttande fase', 'error'); return }

      if (runde1Format?.nA != null) {
        const nA = runde1Format.nA
        const gruppeAId = gruppeNavnMap['A'] ?? null
        const gruppeBId = gruppeNavnMap['B'] ?? null
        const updates = stilling.map((r, i) => ({
          kasterid: r.kasterid,
          gruppeid: i < nA ? gruppeAId : (gruppeBId ?? gruppeAId),
        }))
        const { error: grErr } = await setGruppeInndeling(stevneid, updates)
        if (grErr) { showToast('Feil ved lagring av gruppefordeling', 'error'); return }
      }

      await reload()
    })

    if (!harGruppefordeling) {
      const n = stilling.length

      function lesValtOppsett(radioName: string, nGruppe: number): RundeOppsett | null {
        const valtRadio = container.querySelector<HTMLInputElement>(`input[name="${radioName}"]:checked`)
        if (valtRadio?.dataset.oppsett) {
          try { return JSON.parse(valtRadio.dataset.oppsett) as RundeOppsett } catch { /* fall through */ }
        }
        return gyldigeRunde1Oppsett(nGruppe)[0] ?? null
      }

      const panelerEl = container.querySelector<HTMLElement>('#gruppe-paneler')
      if (panelerEl) {
        panelerEl.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement
          if (!target.matches('input[name^="runde1-format"]')) return
          const nA = parseInt(container.querySelector<HTMLInputElement>('input[name="gruppe-split"]:checked')?.value ?? String(n))
          const nB = n - nA
          const oppsettA = lesValtOppsett('runde1-format-a', nA)
          const oppsettB = lesValtOppsett('runde1-format-b', nB)
          if (target.name === 'runde1-format-a') {
            const strEl = container.querySelector('#struktur-a')
            if (strEl) strEl.outerHTML = renderStrukturListeHtml(nA, oppsettA, 'a')
          } else {
            const strEl = container.querySelector('#struktur-b')
            if (strEl) strEl.outerHTML = renderStrukturListeHtml(nB, oppsettB, 'b')
          }
          const woA = oppsettA?.walkovers ?? 0
          const woB = oppsettB?.walkovers ?? 0
          const prevEl = container.querySelector('#gruppe-preview')
          if (prevEl) prevEl.innerHTML = renderGruppePreview(
            stilling.map((r, i) => ({ ...r, cupPlassering: i + 1 })), nA, woA, woB,
          )
        })
      }

      container.querySelectorAll<HTMLInputElement>('input[name="gruppe-split"]').forEach(radio => {
        radio.addEventListener('change', () => {
          const nA = parseInt(radio.value)
          const nB = n - nA
          const oppsettA = gyldigeRunde1Oppsett(nA)[0] ?? null
          const oppsettB = nB >= 2 ? (gyldigeRunde1Oppsett(nB)[0] ?? null) : null
          if (panelerEl) {
            panelerEl.innerHTML =
              `<div id="gruppe-panel-a" class="avsl-gruppe-kol">
                ${renderGruppePanelInnhald('Gruppe A', nA, 'runde1-format-a', oppsettA)}
              </div>` +
              (nB >= 2 ? `<div id="gruppe-panel-b" class="avsl-gruppe-kol">
                ${renderGruppePanelInnhald('Gruppe B', nB, 'runde1-format-b', oppsettB)}
              </div>` : '')
          }
          const woA = oppsettA?.walkovers ?? 0
          const woB = oppsettB?.walkovers ?? 0
          const prevEl = container.querySelector('#gruppe-preview')
          if (prevEl) prevEl.innerHTML = renderGruppePreview(
            stilling.map((r, i) => ({ ...r, cupPlassering: i + 1 })), nA, woA, woB,
          )
        })
      })

      container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
        const valt = container.querySelector<HTMLInputElement>('input[name="gruppe-split"]:checked')
        if (!valt) return
        const nA = parseInt(valt.value)
        const nB = n - nA
        const oppsettA = lesValtOppsett('runde1-format-a', nA)
        const oppsettB = nB >= 2 ? lesValtOppsett('runde1-format-b', nB) : null
        const { error: fmtErr } = await setRunde1Format(stevneid, { A: oppsettA, B: oppsettB, nA })
        if (fmtErr) { showToast('Feil ved lagring av format', 'error'); return }

        if (stevne.stevne_fase === 'avsluttende') {
          const gruppeAId = gruppeNavnMap['A'] ?? null
          const gruppeBId = gruppeNavnMap['B'] ?? null
          const updates = stilling.map((r, i) => ({
            kasterid: r.kasterid,
            gruppeid: i < nA ? gruppeAId : (gruppeBId ?? gruppeAId),
          }))
          const { error } = await setGruppeInndeling(stevneid, updates)
          if (error) { showToast('Feil ved lagring av gruppefordeling', 'error'); return }
        }

        await reload()
      })
    }

    bannerSlot?.querySelector('#endre-gruppeinndeling-btn')?.addEventListener('click', async () => {
      if (!await confirmDialog({ title: 'Tilbakestill gruppeinndeling', message: 'Gruppefordeling og format vert fjerna.', danger: true })) return
      await Promise.all([
        clearGruppeInndeling(stevneid),
        setRunde1Format(stevneid, null),
      ])
      await reload()
    })

    if (harGruppefordeling) {
      container.querySelectorAll<HTMLElement>('[data-generer-gruppe]').forEach(btn => {
        btn.addEventListener('click', () => {
          const gNavn = btn.dataset.genererGruppe ?? ''
          const runde = parseInt(btn.dataset.runde ?? '1')
          const stillingForGruppe = stilling.filter(r => r.gruppe?.navn === gNavn)
          opnGenererRundeDialog(stevneid, gNavn, stillingForGruppe, runde, runde1Format, reload)
        })
      })
    }
  },
}

export const render = createAvsluttendeRenderer(cupVariant)

// ── Group column rendering ────────────────────────────────────────────────────

function renderGruppeKolonne(
  gruppeNavn: string,
  kampar: AvslKampRow[],
  _aktiveCount: number,
  totalCount: number,
  sisteRundeNr: number,
  visGenerer: boolean,
  startnrMap: Record<number, number>,
  isAdminLocal = true,
  stillingMap: Record<number, StillingRad> = {},
): string {
  const rundeMap = new Map<number, AvslKampRow[]>()
  for (const k of kampar) {
    if (!rundeMap.has(k.runde_nummer)) rundeMap.set(k.runde_nummer, [])
    rundeMap.get(k.runde_nummer)!.push(k)
  }

  const rundarHtml = [...rundeMap.entries()].reverse().map(([nr, rKampar]) => {
    const tittel = rKampar[0]?.runde_navn ?? `Runde ${nr}`
    const synligeKampar = rKampar.filter(k => !k.er_walkover)
    if (!synligeKampar.length) return ''
    return `
      <h6 class="fw-bold text-center mb-1">${escHtml(tittel)}</h6>
      <div class="d-flex flex-wrap gap-2 mb-2">
        ${synligeKampar.map(k => renderKampBlock(k, startnrMap, isAdminLocal, stillingMap)).join('')}
      </div>`
  }).join('')

  const nasteRunde = sisteRundeNr + 1
  const genererKnapp = visGenerer
    ? `<button class="btn btn-success w-100 mt-2"
         data-generer-gruppe="${escHtml(gruppeNavn)}" data-runde="${nasteRunde}">
         Generer runde ${nasteRunde}
       </button>`
    : ''

  return `
    <div class="avsl-gruppe-kol">
      <h6 class="text-center fw-bold mb-2">Gruppe ${escHtml(gruppeNavn)} (${totalCount} spelarar)</h6>
      ${genererKnapp}
      ${rundarHtml}
    </div>`
}

function renderKampBlock(
  kamp: AvslKampRow,
  startnrMap: Record<number, number>,
  isAdminLocal = true,
  stillingMap: Record<number, StillingRad> = {},
): string {
  const sp = kamp.spelarar.slice().sort((a, b) =>
    (startnrMap[a.kasterid ?? 0] ?? 999) - (startnrMap[b.kasterid ?? 0] ?? 999)
  )

  const spelarNamn = (s: AvslKampSpelarRow | undefined): string =>
    s?.kaster ? `${escHtml(s.kaster.fornavn)} ${escHtml(s.kaster.etternavn)}` : '—'

  const bekrefta = kamp.er_bekreftet || kamp.er_walkover
  const kanEndreScore = isAdminLocal && kamp.er_bekreftet && !kamp.er_tre_spelarar

  const spelarRader = kamp.er_walkover
    ? `<tr>
        <td>${startnrMap[sp[0]?.kasterid ?? 0] ?? ''}</td>
        <td colspan="2">${spelarNamn(sp[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`
    : sp.map(s => {
        const tot = scoreForSp(s)
        const score = tot > 0 ? tot : '—'
        const erEliminert = kamp.er_bekreftet && stillingMap[s.kasterid ?? 0]?.runde_eliminert === kamp.runde_nummer
        const erVidare = kamp.er_bekreftet && !erEliminert
        const radKlass = erEliminert ? 'kamp-eliminert' : (erVidare ? 'kamp-vidare' : '')
        const scoreAttr = kanEndreScore
          ? ` data-endre-score="${kamp.id}" class="text-center score-redigerbar"`
          : ' class="text-center"'
        return `<tr${radKlass ? ` class="${radKlass}"` : ''}>
          <td class="th-36 text-center">${startnrMap[s.kasterid ?? 0] ?? ''}</td>
          <td>${spelarNamn(s)}</td>
          <td${scoreAttr}>${score}</td>
        </tr>`
      }).join('')

  const harOmgangar = sp.some(s => (s.omgangar?.length ?? 0) > 0)

  let bekrftKlass: string, bekrftTekst: string, bekrftDisabled: boolean, bekreftKnappKlass: string
  if (kamp.er_tre_spelarar) {
    bekrftKlass = bekrefta ? 'btn-success' : 'btn-outline-secondary'
    bekrftTekst = bekrefta ? 'Endre plassering' : 'Sett plassering'
    bekrftDisabled = false
    bekreftKnappKlass = ''
  } else {
    const kanBekrefte = beregnKanBekrefte(kamp, toOrgSp(sp), harOmgangar)
    bekrftKlass = bekrefta ? 'btn-secondary' : (kanBekrefte ? 'btn-success' : 'btn-outline-secondary')
    bekrftTekst = bekrefta ? 'Bekreftet' : 'Bekreft'
    bekrftDisabled = bekrefta || !kanBekrefte
    bekreftKnappKlass = ' btn-bekreft'
  }

  return `
    <div class="avsl-kamp-block">
      <div class="text-center small fw-semibold text-muted mb-1">Bane ${kamp.bane_nummer}</div>
      <table class="table table-sm table-bordered mb-0 bg-white">
        <tbody>
          ${spelarRader}
          <tr>
            <td colspan="3" class="text-end pe-1">
              ${isAdminLocal && !kamp.er_walkover && !kamp.er_tre_spelarar
                ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${bekrefta ? ' disabled' : ''}>+</button> `
                : ''}
              <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}"
                title="Scoreboard"${bekrefta && !kamp.er_tre_spelarar ? ' disabled' : ''}>S</button>
              ${isAdminLocal ? `<button class="btn ${bekrftKlass} btn-sm${bekreftKnappKlass}" id="bekrft-${kamp.id}"${bekrftDisabled ? ' disabled' : ''}>${bekrftTekst}</button>` : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>`
}

// ── Local spelarar conversion (OrgKamp shape) ─────────────────────────────────

function toOrgSp(sp: AvslKampSpelarRow[]) {
  return sp.map(s => ({
    kasterid: s.kasterid ?? 0,
    kamp_poeng: s.kamp_poeng ?? 0,
    score_poeng: s.score_poeng ?? 0,
    posisjon: s.posisjon,
    antall_ringer: s.antall_ringer,
    omgangar: s.omgangar,
    kaster: s.kaster,
  }))
}

// ── Match event binding ───────────────────────────────────────────────────────

function bindKampEvents(
  container: HTMLElement,
  stevneid: number,
  avslKampar: AvslKampRow[],
  isAdminLocal: boolean,
  reload: () => Promise<void>,
): void {
  for (const kamp of avslKampar) {
    const sp = kamp.spelarar.slice().sort((a, b) => (a.posisjon ?? 0) - (b.posisjon ?? 0))

    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', async () => {
      const p1 = sp[0]
      const p2 = sp[1]
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      showNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
        const updates: Promise<unknown>[] = []
        if (p1?.id) updates.push(oppdaterKampSpelarScoreRask(p1.id, s1))
        if (p2?.id) updates.push(oppdaterKampSpelarScoreRask(p2.id, s2))
        await Promise.all(updates)
        await reload()
      })
    })

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      window.open(`#/kamp/${kamp.id}`, '_blank')
    })

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', async (e) => {
      if (kamp.er_tre_spelarar) {
        opnTreSpelarBekreftDialog(kamp, sp, stevneid, async () => { await autoGenererFinaleViss(stevneid, kamp); await reload() })
      } else {
        const btn = e.currentTarget as HTMLButtonElement
        btn.disabled = true
        btn.textContent = 'Lagrer…'
        const ok = await bekreftCupKamp2Spelar(stevneid, kamp, sp, reload)
        if (!ok) { btn.disabled = false; btn.textContent = 'Bekreft' }
      }
    })

    if (isAdminLocal && kamp.er_bekreftet && !kamp.er_tre_spelarar) {
      const p1 = sp[0]
      const p2 = sp[1]
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      const allKasterids = sp.map(s => s.kasterid).filter((id): id is number => id != null)
      const handler = (): void => {
        showNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (nyS1, nyS2) => {
          const spelarIds = [p1?.id, p2?.id].filter((x): x is number => x != null)
          if (spelarIds.length) {
            const { error } = await slettKampOmgangar(spelarIds)
            if (error) { showToast('DB-feil ved sletting av omgangar', 'error'); return }
          }
          const updates: Promise<{ error: unknown }>[] = []
          if (p1?.id) updates.push(oppdaterKampSpelarScoreRask(p1.id, nyS1))
          if (p2?.id) updates.push(oppdaterKampSpelarScoreRask(p2.id, nyS2))
          const results = await Promise.all(updates)
          const dbErr = results.find(r => r.error)?.error
          if (dbErr) { showToast('DB-feil ved oppdatering av score', 'error'); return }
          const nyVinnarId = nyS1 >= nyS2 ? p1?.kasterid : p2?.kasterid
          const nyTaparId = nyS1 >= nyS2 ? p2?.kasterid : p1?.kasterid
          await oppdaterVinnarTapar({
            stevneId: stevneid,
            rundeNummer: kamp.runde_nummer,
            rundeNavn: kamp.runde_navn,
            allKasterids,
            nyVinnarId,
            nyTaparId,
          })
          await reload()
        })
      }
      container.querySelectorAll<HTMLElement>(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
    }
  }
}

// ── Confirm 2-player cup match ────────────────────────────────────────────────

async function bekreftCupKamp2Spelar(
  stevneid: number,
  kamp: AvslKampRow,
  sp: AvslKampSpelarRow[],
  reload: () => Promise<void>,
): Promise<boolean> {
  const p1 = sp[0]
  const p2 = sp[1]

  const { data: aktuellSp } = await hentKampSpelarar(kamp.id)

  const ak1 = aktuellSp.find(s => s.id === p1?.id)
  const ak2 = aktuellSp.find(s => s.id === p2?.id)

  const s1 = scoreForSp(ak1 ?? p1)
  const s2 = scoreForSp(ak2 ?? p2)

  if (s1 === 0 && s2 === 0 && !await confirmDialog({ title: 'Ingen score registrert', message: 'Vil du bekrefte kampen likevel?' })) return false

  const vinnar = s1 >= s2 ? p1 : p2
  const tapar = s1 >= s2 ? p2 : p1
  const allKasterids = sp.map(s => s.kasterid).filter((id): id is number => id != null)
  const vidareIds = vinnar?.kasterid != null ? [vinnar.kasterid] : []

  const { error } = await bekreftCupKamp({
    kampId: kamp.id,
    stevneId: stevneid,
    rundeNummer: kamp.runde_nummer,
    rundeNavn: kamp.runde_navn,
    allKasterids,
    eliminertId: tapar?.kasterid ?? null,
    vidareIds,
  })
  if (error) { showToast('DB-feil ved bekreft', 'error'); return false }

  await autoGenererFinaleViss(stevneid, kamp)
  await reload()
  return true
}

// ── Auto-generate finale when all semis in group are confirmed ────────────────

async function autoGenererFinaleViss(stevneid: number, kamp: AvslKampRow): Promise<void> {
  if (kamp.runde_navn !== 'Semifinale' || !kamp.gruppe_navn) return
  if (await harAlleSemifinalarBekrefta(stevneid, kamp.gruppe_navn)) {
    await genererFinaleOgBronsefinale(stevneid, kamp.gruppe_navn)
  }
}
