import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../supabase.js'
import { gyldigeRunde1Oppsett } from '../../utils/kastemetoder-logikk.js'
import {
  renderGruppefordeling,
  renderGruppePreview,
  renderGruppePanelInnhald,
  renderStrukturListeHtml,
} from '../../organizer/gruppefordelingUi.js'
import {
  genererCupRunde1,
  genererNesteCupRundeForGruppe,
  genererFinaleOgBronsefinale,
} from '../../organizer/kampgenereringDb.js'
import { opnNumberpad } from '../../components/ScoreNumberpad.js'
import { scoreForSp } from '../../utils/kamp.js'
import {
  sorterStilling,
  renderAvsluttendeKnappar,
  lagOnEndringHandler,
  bindStillingDetaljar,
  renderHovudInnhald,
  bindTabToggle,
  renderStillingTabell,
  beregnKanBekrefte,
  type OrgKamp,
  type OrgKampSpelar,
  type StillingRad,
} from '../../organizer/org-shared.js'
import { escHtml } from '../../utils/escHtml.js'
import type { RundeOppsett, Json } from '../../types'

// ── Interfaces ─────────────────────────────────────────────────────────────

interface Runde1FormatTyped {
  A?: RundeOppsett | null
  B?: RundeOppsett | null
  nA?: number | null
}

interface AvslKampOmgang {
  score: number | null
  antall_ringer: number | null
}

interface AvslKampSpelar extends OrgKampSpelar {
  id: number
  kasterid: number
  posisjon: number | null
  score_poeng: number
  kamp_poeng: number
  antall_ringer: number
  kaster: { fornavn: string; etternavn: string } | null
  omgangar: AvslKampOmgang[] | null
}

interface AvslKamp extends OrgKamp {
  id: number
  fase: string
  runde_nummer: number
  bane_nummer: number | null
  gruppe_navn: string | null
  runde_navn: string | null
  er_tre_spelarar: boolean | null
  spelarar: AvslKampSpelar[] | null
}

interface AvslResultat {
  kasterid: number
  startnummer: number | null
  plassering: number | null
  runde_eliminert: number | null
  kamp_poeng_innl: number | null
  score_poeng_innl: number | null
  gruppe: { id: number; navn: string } | null
}

interface AvslResultatMedNavn extends AvslResultat {
  namn: string
}

interface AvslStevne {
  id: number
  navn: string
  stevne_fase: string | null
  erfullfort: boolean
  runde1_format: Runde1FormatTyped | null
  avsluttendemetode: { id: number; navn: string } | null
}

interface AktuellSpelarRow {
  id: number
  kasterid: number
  score_poeng: number | null
  antall_ringer: number | null
  omgangar: { score: number | null; antall_ringer: number | null }[] | null
}

// ── Module state ────────────────────────────────────────────────────────────

let kanal: RealtimeChannel | null = null
let bannerSlot: HTMLElement | null = null
let isAdmin = false

// ── Render ──────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin: _isAdmin = false }: { id?: number | string | null; isAdmin?: boolean } = {},
  _bannerSlot: HTMLElement | null = null,
): Promise<void> {
  bannerSlot = _bannerSlot
  isAdmin = _isAdmin
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.innerHTML = '<p class="laster">Laster…</p>'
  await lastOgVis(container, Number(id))
}

async function lastOgVis(container: HTMLElement, stevneid: number): Promise<void> {
  const [
    { data: rawStevne },
    { data: rawKampar },
    { data: rawResultat },
    { data: rawGrupper },
    { count: pameldingCount },
  ] = await Promise.all([
    supabase.from('stevne').select(`
      id, navn, stevne_fase, erfullfort, runde1_format,
      avsluttendemetode:avsluttendekastemetodeid(id, navn)
    `).eq('id', stevneid).single(),
    supabase.from('kamp').select(`
      id, fase, runde_nummer, bane_nummer, gruppe_navn, runde_navn,
      er_bekreftet, er_walkover, er_tre_spelarar,
      spelarar:kamp_spelar(id, kasterid, posisjon, score_poeng, kamp_poeng, antall_ringer,
        kaster:kasterid(fornavn, etternavn),
        omgangar:kamp_omgang(score, antall_ringer))
    `).eq('stevneid', stevneid).order('runde_nummer').order('bane_nummer'),
    supabase.from('resultat').select(`
      kasterid, startnummer, plassering, runde_eliminert,
      kamp_poeng_innl, score_poeng_innl,
      gruppe:gruppeid(id, navn)
    `).eq('stevneid', stevneid),
    supabase.from('gruppe').select('id, navn').in('navn', ['A', 'B']),
    supabase.from('pamelding').select('id', { count: 'exact', head: true }).eq('stevneid', stevneid),
  ])

  if (!rawStevne) {
    container.innerHTML = '<p class="feil">Stevne ikkje funne.</p>'
    return
  }

  // Supabase infers complex join types that don't match our interfaces directly
  const stevne = rawStevne as unknown as AvslStevne
  const typedKampar = (rawKampar ?? []) as unknown as AvslKamp[]
  const typedResultat = (rawResultat ?? []) as unknown as AvslResultat[]
  const typedGrupper = (rawGrupper ?? []) as { id: number; navn: string }[]

  const innlKampar = typedKampar.filter(k => k.fase === 'innledende')
  const avslKampar = typedKampar.filter(k => k.fase === 'avsluttende')
  const alleInnlBekrefta = innlKampar.length > 0 && innlKampar.every(k => k.er_bekreftet)
  const harAvslKampar = avslKampar.length > 0
  const harGruppefordeling = typedResultat.some(r => r.gruppe != null)

  const aktive = typedResultat.filter(r => r.runde_eliminert == null)

  const gruppeNavnMap: Record<string, number> = Object.fromEntries(typedGrupper.map(g => [g.navn, g.id]))
  const startnrMap: Record<number, number> = {}
  for (const r of typedResultat) {
    if (r.startnummer != null) startnrMap[r.kasterid] = r.startnummer
  }

  const namnMap: Record<number, string> = {}
  for (const k of typedKampar) {
    for (const sp of k.spelarar ?? []) {
      if (sp.kasterid && sp.kaster && !namnMap[sp.kasterid]) {
        namnMap[sp.kasterid] = `${sp.kaster.fornavn} ${sp.kaster.etternavn}`
      }
    }
  }
  const resultatMedNavn: AvslResultatMedNavn[] = typedResultat.map(r => ({
    ...r,
    namn: namnMap[r.kasterid] ?? `Spelar ${r.kasterid}`,
  }))

  const stillingInput: StillingRad[] = resultatMedNavn.map(r => ({
    kasterid: r.kasterid,
    namn: r.namn,
    startnummer: r.startnummer,
    plassering: r.plassering,
    runde_eliminert: r.runde_eliminert,
    kamp_poeng: r.kamp_poeng_innl ?? 0,
    score_poeng: r.score_poeng_innl ?? 0,
    gruppe: r.gruppe ? { navn: r.gruppe.navn } : null,
  }))
  const stilling = sorterStilling(stillingInput, innlKampar)

  const initNa = stevne.runde1_format?.nA ?? null
  const harPrekonfigurertFormat = stevne.runde1_format != null && stevne.stevne_fase !== 'avsluttende'
  const previewN = pameldingCount ?? 0

  if (isAdmin && bannerSlot) {
    bannerSlot.innerHTML = renderAvsluttendeKnappar(stevne, {
      alleInnlBekrefta,
      harAvslKampar,
      harGruppefordeling,
      harPrekonfigurertFormat,
    })
  }

  container.innerHTML = `
    <div class="px-3 py-2">
      ${harGruppefordeling ? renderHovudinnhald(avslKampar, stilling, startnrMap, isAdmin) : ''}
      ${!harGruppefordeling && stevne.stevne_fase === 'avsluttende'
        ? (isAdmin
            ? renderGruppefordeling(stilling, { visSpelarliste: true, initNa, initFormat: stevne.runde1_format })
            : '<p class="text-muted fst-italic">Gruppefordeling er ikkje klar enno.</p>')
        : ''}
      ${!harGruppefordeling && stevne.stevne_fase !== 'avsluttende' && previewN > 0 && isAdmin
        ? renderGruppefordeling(previewN, { visSpelarliste: false, initNa, initFormat: stevne.runde1_format })
        : ''}
    </div>
  `

  bindStillingDetaljar(container, 'stilling-avsl')
  bindHeaderEvents(
    container,
    stevneid,
    stevne,
    alleInnlBekrefta,
    harGruppefordeling,
    harAvslKampar,
    resultatMedNavn,
    typedGrupper,
    gruppeNavnMap,
    avslKampar,
  )

  if (harGruppefordeling) {
    abonnerPaaEndringar(container, stevneid)
    if (harAvslKampar) bindKampEvents(container, stevneid, avslKampar, startnrMap, resultatMedNavn, aktive.length, isAdmin)
    bindTabToggle(container)
  }
}

// ── Hovudinnhald (kampar + stilling) ───────────────────────────────────────

function renderHovudinnhald(
  avslKampar: AvslKamp[],
  stilling: StillingRad[],
  startnrMap: Record<number, number>,
  isAdminLocal = true,
): string {
  const gruppeNamn = [...new Set(stilling.map(r => r.gruppe?.navn).filter((n): n is string => n != null))].sort()
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
    const visGenerer = isAdminLocal && (kampar.length === 0 || sisteRundeFullfort) && aktiveCount > 1 && !harSemifinaleIGruppe
    return renderGruppeKolonne(g, kampar, aktiveCount, totalCount, sisteRundeNr, visGenerer, startnrMap, isAdminLocal, stillingMap)
  }).join('')

  const kamperHtml = `<div class="d-flex gap-3 flex-wrap">${gruppeKolonnar}</div>`
  const stillingHtml = renderStillingTabell(stilling, avslKampar, startnrMap, {
    tableId: 'stilling-avsl',
    harGrupper: true,
    harEliminasjon: true,
  })

  return renderHovudInnhald(kamperHtml, stillingHtml)
}

function renderGruppeKolonne(
  gruppeNavn: string,
  kampar: AvslKamp[],
  _aktiveCount: number,
  totalCount: number,
  sisteRundeNr: number,
  visGenerer: boolean,
  startnrMap: Record<number, number>,
  isAdminLocal = true,
  stillingMap: Record<number, StillingRad> = {},
): string {
  const rundeMap = new Map<number, AvslKamp[]>()
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
  kamp: AvslKamp,
  startnrMap: Record<number, number>,
  isAdminLocal = true,
  stillingMap: Record<number, StillingRad> = {},
): string {
  const sp = (kamp.spelarar ?? []).sort((a, b) =>
    (startnrMap[a.kasterid] ?? 999) - (startnrMap[b.kasterid] ?? 999)
  )

  const spelarNamn = (s: AvslKampSpelar | undefined): string =>
    s?.kaster ? `${escHtml(s.kaster.fornavn)} ${escHtml(s.kaster.etternavn)}` : '—'

  const bekrefta = kamp.er_bekreftet || kamp.er_walkover
  const kanEndreScore = isAdminLocal && kamp.er_bekreftet && !kamp.er_tre_spelarar

  const spelarRader = kamp.er_walkover
    ? `<tr>
        <td>${startnrMap[sp[0]?.kasterid] ?? ''}</td>
        <td colspan="2">${spelarNamn(sp[0])} <span class="badge bg-secondary">Walkover</span></td>
      </tr>`
    : sp.map(s => {
        const tot = scoreForSp(s)
        const score = tot > 0 ? tot : '—'
        const erEliminert = kamp.er_bekreftet && stillingMap[s.kasterid]?.runde_eliminert === kamp.runde_nummer
        const erVidare = kamp.er_bekreftet && !erEliminert
        const radKlass = erEliminert ? 'kamp-eliminert' : (erVidare ? 'kamp-vidare' : '')
        const scoreAttr = kanEndreScore
          ? ` data-endre-score="${kamp.id}" class="text-center score-redigerbar"`
          : ' class="text-center"'
        return `<tr${radKlass ? ` class="${radKlass}"` : ''}>
          <td class="th-36 text-center">${startnrMap[s.kasterid] ?? ''}</td>
          <td>${spelarNamn(s)}</td>
          <td${scoreAttr}>${score}</td>
        </tr>`
      }).join('')

  const harOmgangar = (kamp.spelarar ?? []).some(s => (s.omgangar?.length ?? 0) > 0)

  let bekrftKlass: string, bekrftTekst: string, bekrftDisabled: boolean, bekreftKnappKlass: string
  if (kamp.er_tre_spelarar) {
    bekrftKlass = bekrefta ? 'btn-success' : 'btn-outline-secondary'
    bekrftTekst = bekrefta ? 'Endre plassering' : 'Sett plassering'
    bekrftDisabled = false
    bekreftKnappKlass = ''
  } else {
    const kanBekrefte = beregnKanBekrefte(kamp, sp as unknown as OrgKampSpelar[], harOmgangar)
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

// ── Dialog for å generere runde per gruppe ──────────────────────────────────

function opnGenererRundeDialog(
  container: HTMLElement,
  stevneid: number,
  gruppeNavn: string,
  stillingForGruppe: AvslResultatMedNavn[],
  _avslKampar: AvslKamp[],
  runde: number,
  runde1Format: Runde1FormatTyped | null,
): void {
  const aktive = stillingForGruppe.filter(r => r.runde_eliminert == null)
  const totalCount = stillingForGruppe.length
  const n = aktive.length

  const runde1Oppsett: RundeOppsett | null = runde === 1 ? (runde1Format?.[gruppeNavn as 'A' | 'B'] ?? null) : null

  const wo = runde1Oppsett?.walkovers ?? 0
  const c3 = runde1Oppsett ? runde1Oppsett.c3 : (n % 3 === 0 ? n / 3 : 0)
  const c2 = runde1Oppsett ? runde1Oppsett.c2 : (n % 3 === 0 ? 0 : n / 2)
  const totalBaner = c3 + c2
  const pool1 = aktive.slice(wo, wo + totalBaner)
  const pool2 = aktive.slice(wo + totalBaner, wo + 2 * totalBaner)
  const pool3 = aktive.slice(wo + 2 * totalBaner)

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderModal(medSeeding: boolean): void {
    const poolsHtml = medSeeding && totalBaner > 0
      ? [
          { label: 'Seeding 1', pool: pool1 },
          { label: 'Seeding 2', pool: pool2 },
          ...(pool3.length ? [{ label: 'Seeding 3', pool: pool3 }] : []),
        ].map(({ label, pool }) => `
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${escHtml(label)}</strong>
            ${pool.map(r => `<div class="small">${escHtml(r.namn)} — ${r.kamp_poeng_innl ?? 0}p (${r.score_poeng_innl ?? 0})</div>`).join('')}
          </div>`).join('')
      : aktive.map((r, i) => `<div class="small">${i + 1}. ${escHtml(r.namn)} — ${r.kamp_poeng_innl ?? 0}p (${r.score_poeng_innl ?? 0})</div>`).join('')

    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${escHtml(gruppeNavn)} — Runde ${runde}</h5>
        <p class="text-muted small mb-2">${n} av ${totalCount} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${medSeeding ? 'checked' : ''}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${poolsHtml}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`

    modal.querySelector<HTMLInputElement>('#seeding-dlg')!.addEventListener('change', e =>
      renderModal((e.target as HTMLInputElement).checked)
    )
    modal.querySelector('#avbryt-gen-btn')!.addEventListener('click', () => modal.remove())
    modal.querySelector('#bekreft-gen-btn')!.addEventListener('click', async () => {
      const medSeedingVal = modal.querySelector<HTMLInputElement>('#seeding-dlg')!.checked
      modal.remove()
      try {
        if (runde === 1) {
          const spelarar = aktive.map((r, i) => ({ kasterid: r.kasterid, plassering: i + 1 }))
          await genererCupRunde1(
            stevneid,
            [{ gruppeNavn, spelarar, runde1Oppsett }],
            medSeedingVal,
            // kampgenereringDb accesses only 'A', 'B', etc. — never 'nA'
            runde1Format as unknown as Record<string, RundeOppsett | undefined>,
          )
        } else {
          await genererNesteCupRundeForGruppe(stevneid, gruppeNavn, medSeedingVal)
        }
        await lastOgVis(container, stevneid)
      } catch (e) {
        alert('Feil: ' + (e instanceof Error ? e.message : String(e)))
      }
    })
  }

  renderModal(true)
}

// ── Event binding ───────────────────────────────────────────────────────────

function bindHeaderEvents(
  container: HTMLElement,
  stevneid: number,
  stevne: AvslStevne,
  alleInnlBekrefta: boolean,
  harGruppefordeling: boolean,
  _harAvslKampar: boolean,
  resultat: AvslResultatMedNavn[],
  _grupper: { id: number; navn: string }[],
  gruppeNavnMap: Record<string, number>,
  avslKampar: AvslKamp[],
): void {
  bannerSlot?.querySelector('#start-avsl-btn')?.addEventListener('click', async () => {
    if (!alleInnlBekrefta) return
    const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  if (!harGruppefordeling) {
    const nFromDom = parseInt(container.querySelector<HTMLElement>('#gruppe-val-wrapper')?.dataset.n ?? '0')
    const n = nFromDom || resultat.length
    const sortert = [...resultat]

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
          sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 })), nA, woA, woB
        )
      })
    }

    container.querySelectorAll<HTMLInputElement>('input[name="gruppe-split"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const nA = parseInt(radio.value)
        const nB = n - nA
        const sortmedNamn = sortert.map((r, i) => ({ ...r, cupPlassering: i + 1 }))
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
        if (prevEl) prevEl.innerHTML = renderGruppePreview(sortmedNamn, nA, woA, woB)
      })
    })

    container.querySelector('#bekreft-gruppe-btn')?.addEventListener('click', async () => {
      const valt = container.querySelector<HTMLInputElement>('input[name="gruppe-split"]:checked')
      if (!valt) return
      const nA = parseInt(valt.value)
      const nB = n - nA
      const oppsettA = lesValtOppsett('runde1-format-a', nA)
      const oppsettB = nB >= 2 ? lesValtOppsett('runde1-format-b', nB) : null
      const { error: fmtErr } = await supabase
        .from('stevne').update({ runde1_format: { A: oppsettA, B: oppsettB, nA } as unknown as Json }).eq('id', stevneid)
      if (fmtErr) { alert('Feil: ' + fmtErr.message); return }

      if (stevne.stevne_fase === 'avsluttende') {
        const gruppeAId = gruppeNavnMap['A'] ?? null
        const gruppeBId = gruppeNavnMap['B'] ?? null

        const updates = sortert.map((r, i) => {
          const erA = i < nA
          return supabase.from('resultat')
            .update({ gruppeid: erA ? gruppeAId : (gruppeBId ?? gruppeAId) })
            .eq('stevneid', stevneid).eq('kasterid', r.kasterid)
        })
        const results = await Promise.all(updates)
        const err = results.find(r => r.error)?.error
        if (err) { alert('Feil: ' + err.message); return }
      }

      await lastOgVis(container, stevneid)
    })
  }

  bannerSlot?.querySelector('#endre-gruppeinndeling-btn')?.addEventListener('click', async () => {
    if (!confirm('Tilbakestill gruppeinndelinga? Gruppefordeling og format vert fjerna.')) return
    await Promise.all([
      supabase.from('resultat').update({ gruppeid: null }).eq('stevneid', stevneid),
      supabase.from('stevne').update({ runde1_format: null }).eq('id', stevneid),
    ])
    await lastOgVis(container, stevneid)
  })

  if (harGruppefordeling) {
    container.querySelectorAll<HTMLElement>('[data-generer-gruppe]').forEach(btn => {
      btn.addEventListener('click', () => {
        const gNavn = btn.dataset.genererGruppe ?? ''
        const runde = parseInt(btn.dataset.runde ?? '1')
        const stillingForGruppe = resultat.filter(r => r.gruppe?.navn === gNavn)
        opnGenererRundeDialog(container, stevneid, gNavn, stillingForGruppe, avslKampar, runde, stevne.runde1_format)
      })
    })
  }

  bannerSlot?.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
    if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
    const { error } = await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })
}

function bindKampEvents(
  container: HTMLElement,
  stevneid: number,
  avslKampar: AvslKamp[],
  startnrMap: Record<number, number>,
  resultat: AvslResultatMedNavn[],
  antallAktive: number,
  _isAdmin = false,
): void {
  for (const kamp of avslKampar) {
    const sp = (kamp.spelarar ?? []).slice().sort((a, b) => a.posisjon ?? 0 - (b.posisjon ?? 0))

    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', async () => {
      const p1 = sp[0]
      const p2 = sp[1]
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      opnNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
        const updates: PromiseLike<unknown>[] = []
        if (p1) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s1 }).eq('id', p1.id))
        if (p2) updates.push(supabase.from('kamp_spelar').update({ score_poeng: s2 }).eq('id', p2.id))
        await Promise.all(updates)
        await lastOgVis(container, stevneid)
      })
    })

    container.querySelector(`#scoreboard-${kamp.id}`)?.addEventListener('click', () => {
      location.hash = `#/kamp/${kamp.id}`
    })

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', () => {
      if (kamp.er_tre_spelarar) {
        opnTreSpelarBekreftDialog(container, kamp, sp, stevneid, startnrMap, resultat, antallAktive)
      } else {
        bekreftCupKamp2Spelar(container, stevneid, kamp, sp, antallAktive)
      }
    })

    if (_isAdmin && kamp.er_bekreftet && !kamp.er_tre_spelarar) {
      const p1 = sp[0]
      const p2 = sp[1]
      const p1Namn = p1?.kaster ? `${p1.kaster.fornavn} ${p1.kaster.etternavn}` : '—'
      const p2Namn = p2?.kaster ? `${p2.kaster.fornavn} ${p2.kaster.etternavn}` : '—'
      const handler = (): void => {
        opnNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (nyS1, nyS2) => {
          const spelarIds = [p1?.id, p2?.id].filter((x): x is number => x != null)
          if (spelarIds.length) await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarIds)
          const updates = [
            ...(p1 ? [supabase.from('kamp_spelar').update({ score_poeng: nyS1 }).eq('id', p1.id)] : []),
            ...(p2 ? [supabase.from('kamp_spelar').update({ score_poeng: nyS2 }).eq('id', p2.id)] : []),
          ]
          const results = await Promise.all(updates)
          const dbErr = results.find(r => r.error)?.error
          if (dbErr) { alert('DB-feil: ' + dbErr.message); return }
          const nyVinnar = nyS1 >= nyS2 ? p1 : p2
          const nyTapar = nyS1 >= nyS2 ? p2 : p1
          await _oppdaterVinnarTapar(stevneid, kamp, sp, nyVinnar?.kasterid, nyTapar?.kasterid)
          await lastOgVis(container, stevneid)
        })
      }
      container.querySelectorAll<HTMLElement>(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
    }
  }
}

// ── Bekreft 2-spelar cup-kamp ───────────────────────────────────────────────

async function bekreftCupKamp2Spelar(
  container: HTMLElement,
  stevneid: number,
  kamp: AvslKamp,
  sp: AvslKampSpelar[],
  antallAktive: number,
): Promise<void> {
  const p1 = sp[0]
  const p2 = sp[1]

  const { data: rawAktuellSp } = await supabase
    .from('kamp_spelar')
    .select('id, kasterid, score_poeng, antall_ringer, omgangar:kamp_omgang(score, antall_ringer)')
    .eq('kampid', kamp.id)
  const aktuellSp = rawAktuellSp as unknown as AktuellSpelarRow[] | null

  const ak1 = aktuellSp?.find(s => s.id === p1?.id)
  const ak2 = aktuellSp?.find(s => s.id === p2?.id)

  const s1 = scoreForSp(ak1 ?? p1)
  const s2 = scoreForSp(ak2 ?? p2)

  if (s1 === 0 && s2 === 0 && !confirm('Ingen score registrert. Vil du bekrefte kampen likevel?')) return

  const vinnar = s1 >= s2 ? p1 : p2
  const tapar = s1 >= s2 ? p2 : p1

  await _lagreCupKampResultat(stevneid, kamp, sp, vinnar?.kasterid ? [vinnar.kasterid] : [], tapar?.kasterid ?? null, antallAktive)
  await _autoGenererFinaleViss(stevneid, kamp)
  await lastOgVis(container, stevneid)
}

// ── Dialog for 3-spelar bekreftelse ────────────────────────────────────────

function opnTreSpelarBekreftDialog(
  container: HTMLElement,
  kamp: AvslKamp,
  sp: AvslKampSpelar[],
  stevneid: number,
  _startnrMap: Record<number, number>,
  _resultat: AvslResultatMedNavn[],
  antallAktive: number,
): void {
  const namns = sp.map(s =>
    s?.kaster
      ? `${escHtml(s.kaster.fornavn)} ${escHtml(s.kaster.etternavn)}`
      : `Spelar ${s?.posisjon ?? '?'}`
  )
  const valt: number[] = []

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderDialog(): void {
    const eliminert = valt.length === 2 ? sp.find(s => !valt.includes(s.kasterid)) : null
    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${sp.map((s, i) => {
            const idx = valt.indexOf(s.kasterid)
            const erValt = idx !== -1
            const erEliminert = !!eliminert && eliminert.kasterid === s.kasterid
            const plasseringLabel = idx === 0 ? '1. plass' : idx === 1 ? '2. plass' : ''
            return `<button
              class="btn ${erValt ? 'btn-success' : erEliminert ? 'btn-outline-danger' : 'btn-outline-secondary'} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${s.kasterid}"
              ${erEliminert ? 'disabled' : ''}
            ><span>${namns[i]}</span>${
              plasseringLabel ? `<span class="badge bg-success-subtle text-success-emphasis">${plasseringLabel}</span>` :
              erEliminert ? `<span class="badge bg-danger">Eliminert</span>` : ''
            }</button>`
          }).join('')}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${valt.length !== 2 ? 'disabled' : ''}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `

    modal.querySelector('#avbryt-tre-btn')!.addEventListener('click', () => modal.remove())

    modal.querySelectorAll<HTMLElement>('[data-kasterid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const kid = Number(btn.dataset.kasterid)
        const idx = valt.indexOf(kid)
        if (idx !== -1) valt.splice(idx, 1)
        else if (valt.length < 2) valt.push(kid)
        renderDialog()
      })
    })

    modal.querySelector('#bekreft-tre-btn')?.addEventListener('click', async () => {
      if (valt.length !== 2) return
      const eliminertId = sp.find(s => !valt.includes(s.kasterid))?.kasterid
      modal.remove()
      await _lagreCupKampResultat(stevneid, kamp, sp, [...valt], eliminertId ?? null, antallAktive)
      await _autoGenererFinaleViss(stevneid, kamp)
      await lastOgVis(container, stevneid)
    })
  }

  renderDialog()
}

// ── Auto-generer finale når alle semfinalar i gruppa er bekrefta ─────────────

async function _autoGenererFinaleViss(stevneid: number, kamp: AvslKamp): Promise<void> {
  if (kamp.runde_navn !== 'Semifinale' || !kamp.gruppe_navn) return
  const { data: semis } = await supabase.from('kamp')
    .select('er_bekreftet')
    .eq('stevneid', stevneid)
    .eq('gruppe_navn', kamp.gruppe_navn)
    .eq('runde_navn', 'Semifinale')
  if (semis?.every(s => s.er_bekreftet)) {
    await genererFinaleOgBronsefinale(stevneid, kamp.gruppe_navn)
  }
}

// ── Oppdater vinnar/tapar etter score-endring på bekrefta kamp ───────────────

async function _oppdaterVinnarTapar(
  stevneid: number,
  kamp: AvslKamp,
  sp: AvslKampSpelar[],
  nyVinnarId: number | null | undefined,
  nyTaparId: number | null | undefined,
): Promise<void> {
  const allKasterids = sp.map(s => s.kasterid).filter((id): id is number => id != null)
  const erFinale = kamp.runde_navn === 'Finale'
  const erBronsefinale = kamp.runde_navn === 'Bronsefinale'

  if (erFinale || erBronsefinale) {
    await supabase.from('resultat')
      .update({ runde_eliminert: null, plassering: null })
      .eq('stevneid', stevneid)
      .in('kasterid', allKasterids)
    const tapPlass = erFinale ? 2 : 4
    if (nyTaparId) await supabase.from('resultat')
      .update({ runde_eliminert: kamp.runde_nummer, plassering: tapPlass })
      .eq('stevneid', stevneid).eq('kasterid', nyTaparId)
    const vinUpdate = erFinale
      ? { plassering: 1 }
      : { runde_eliminert: kamp.runde_nummer, plassering: 3 }
    if (nyVinnarId) await supabase.from('resultat')
      .update(vinUpdate)
      .eq('stevneid', stevneid).eq('kasterid', nyVinnarId)
  } else {
    await supabase.from('resultat')
      .update({ runde_eliminert: null })
      .eq('stevneid', stevneid)
      .eq('runde_eliminert', kamp.runde_nummer)
      .in('kasterid', allKasterids)
    if (nyTaparId) await supabase.from('resultat')
      .update({ runde_eliminert: kamp.runde_nummer })
      .eq('stevneid', stevneid).eq('kasterid', nyTaparId)
  }
}

// ── Lagre cup-kamp-resultat ─────────────────────────────────────────────────

async function _lagreCupKampResultat(
  stevneid: number,
  kamp: AvslKamp,
  sp: AvslKampSpelar[],
  vidareIds: number[],
  eliminertId: number | null,
  _antallAktive: number,
): Promise<void> {
  await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)

  if (!eliminertId) return

  const erFinale = kamp.runde_navn === 'Finale' || kamp.runde_navn === 'Bronsefinale'
  const allKasterids = sp.map(s => s.kasterid).filter((id): id is number => id != null)

  if (erFinale) {
    await supabase.from('resultat')
      .update({ runde_eliminert: null, plassering: null })
      .eq('stevneid', stevneid)
      .in('kasterid', allKasterids)
  } else {
    await supabase.from('resultat')
      .update({ runde_eliminert: null })
      .eq('stevneid', stevneid)
      .eq('runde_eliminert', kamp.runde_nummer)
      .in('kasterid', allKasterids)
  }

  const elimUpdate = erFinale
    ? { runde_eliminert: kamp.runde_nummer, plassering: kamp.runde_navn === 'Finale' ? 2 : 4 }
    : { runde_eliminert: kamp.runde_nummer }

  await supabase.from('resultat')
    .update(elimUpdate)
    .eq('stevneid', stevneid).eq('kasterid', eliminertId)

  if (kamp.runde_navn === 'Finale' && vidareIds.length > 0) {
    await supabase.from('resultat')
      .update({ plassering: 1 })
      .eq('stevneid', stevneid).eq('kasterid', vidareIds[0])
  }
  if (kamp.runde_navn === 'Bronsefinale' && vidareIds.length > 0) {
    await supabase.from('resultat')
      .update({ plassering: 3, runde_eliminert: kamp.runde_nummer })
      .eq('stevneid', stevneid).eq('kasterid', vidareIds[0])
  }
}

// ── Sanntid ─────────────────────────────────────────────────────────────────

function abonnerPaaEndringar(container: HTMLElement, stevneid: number): void {
  if (kanal) return
  const onEndring = lagOnEndringHandler(stevneid, ['avsluttende'], container, lastOgVis, () => {
    if (kanal) { supabase.removeChannel(kanal); kanal = null }
  })
  kanal = supabase
    .channel(`stevne-avsl-${stevneid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onEndring)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = (payload.new as { stevneid?: number })?.stevneid ?? (payload.old as { stevneid?: number })?.stevneid
      if (sid === stevneid) onEndring()
    })
    .subscribe()
}
