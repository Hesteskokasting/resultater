import { supabase } from '../../../supabase'
import { opnNumberpad } from '../../../components/ScoreNumberpad'
import { beregnKampPoeng, hentP1P2, scoreForSp, ringerForSp } from '../../../utils/kamp'
import { autoFullforInnledendeKamper } from '../../../organizer/organizerTestUtils'
import {
  byggInnledendeSpelMap, sorterStilling, renderInnledendeKnappar, lagOnEndringHandler,
  bindStillingDetaljar, renderHovudInnhald, bindTabToggle, renderStillingTabell, beregnKanBekrefte,
  type OrgKamp, type OrgKampSpelar,
} from '../../../organizer/org-shared'
import { printStartkort } from '../../../organizer/startkort-print'
import { escHtml } from '../../../utils/escHtml'
import { createLoadingState } from '../../../components/LoadingState'
import { createErrorBanner } from '../../../components/ErrorBanner'
import { logError } from '../../../utils/logError'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { InnlKamp, InnlKampSpelar, InnlResultat, InnlStevne } from './types'

// ── Module state ──────────────────────────────────────────────────────────────

let kanal: RealtimeChannel | null = null
let bannerSlot: HTMLElement | null = null
let isAdmin = false

// ── Public entry point ────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin: _isAdmin = false }: { id: number; isAdmin?: boolean },
  _bannerSlot: HTMLElement | null = null,
): Promise<void> {
  bannerSlot = _bannerSlot
  isAdmin = _isAdmin
  if (kanal) { supabase.removeChannel(kanal); kanal = null }
  container.replaceChildren(createLoadingState('Laster…'))
  await lastOgVis(container, id)
}

// ── Data fetch + render ───────────────────────────────────────────────────────

async function lastOgVis(container: HTMLElement, stevneid: number): Promise<void> {
  try {
  const [{ data: stevne }, { data: rawKamper }, { data: resultatListe }] = await Promise.all([
    supabase.from('stevne').select(`
      id, navn, erfullfort, stevne_fase,
      kastemetode:innledendekastemetodeid(id, navn)
    `).eq('id', stevneid).single(),
    supabase.from('kamp')
      .select(`
        id, stevneid, runde_nummer, bane_nummer, er_bekreftet, er_walkover, fase,
        spelarar:kamp_spelar(
          id, kasterid, score_poeng, kamp_poeng, antall_ringer, posisjon,
          kaster:kasterid(id, fornavn, etternavn, klubb:klubbid(kortnavn, navn)),
          omgangar:kamp_omgang(score, antall_ringer)
        )
      `)
      .eq('stevneid', stevneid)
      .eq('fase', 'innledende')
      .order('runde_nummer')
      .order('bane_nummer'),
    supabase.from('resultat')
      .select('kasterid, startnummer, hcp')
      .eq('stevneid', stevneid),
  ])

  if (!stevne) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  const typedStevne = stevne as unknown as InnlStevne
  const alleKamper = ((rawKamper ?? []) as unknown as InnlKamp[]).sort(
    (a, b) => a.runde_nummer - b.runde_nummer || (a.bane_nummer ?? 0) - (b.bane_nummer ?? 0),
  )
  const typedResultat = (resultatListe ?? []) as InnlResultat[]

  const startnrMap: Record<number, number> = Object.fromEntries(typedResultat.map(r => [r.kasterid, r.startnummer ?? 0]))
  const hcpMap: Record<number, number> = Object.fromEntries(typedResultat.filter(r => (r.hcp ?? 0) > 0).map(r => [r.kasterid, r.hcp ?? 0]))

  const rundeMap = new Map<number, InnlKamp[]>()
  for (const kamp of alleKamper) {
    if (!rundeMap.has(kamp.runde_nummer)) rundeMap.set(kamp.runde_nummer, [])
    rundeMap.get(kamp.runde_nummer)!.push(kamp)
  }

  const { spelMap, ekteKasterids } = byggInnledendeSpelMap(alleKamper as unknown as OrgKamp[], startnrMap)

  const stilling = sorterStilling(
    Object.values(spelMap)
      .filter(s => ekteKasterids.has(s.kasterid))
      .map(s => ({ ...s, hcp: typedResultat.find(r => r.kasterid === s.kasterid)?.hcp ?? 0 })),
    alleKamper as unknown as OrgKamp[],
  )

  const erAlleKamperBekreftet = alleKamper.length > 0 && alleKamper.every(k => k.er_bekreftet)
  const kanEndreKampar = isAdmin && typedStevne.stevne_fase !== 'avsluttende'

  const startkortKnappHtml = isAdmin
    ? `<button class="btn btn-sm btn-outline-info" id="startkort-btn">Startkort</button>`
    : ''

  if (bannerSlot) {
    bannerSlot.innerHTML = (isAdmin ? renderInnledendeKnappar(typedStevne, erAlleKamperBekreftet, false) : '') + startkortKnappHtml
  }

  const kamperHtml = [...rundeMap.entries()].map(([nr, rKamper]) => renderRunde(nr, rKamper, startnrMap, kanEndreKampar, hcpMap)).join('')
  const harHcp = isAdmin || stilling.some(s => (s.hcp ?? 0) > 0)
  const stillingHtml = renderStillingTabell(stilling, alleKamper as unknown as OrgKamp[], startnrMap, {
    tableId: 'stilling-innl',
    isAdmin,
    stevneid,
    harHcp,
    harAntallKamper: true,
  })

  container.innerHTML = renderHovudInnhald(kamperHtml, stillingHtml)

  bindTabToggle(container)
  bindStillingDetaljar(container, 'stilling-innl')

  if (isAdmin) {
    container.querySelectorAll('.stilling-hcp-celle').forEach(celle => {
      celle.addEventListener('click', async (e) => {
        e.stopPropagation()
        const el = e.currentTarget as HTMLElement
        const kid = Number(el.dataset.kasterid)
        const sid = Number(el.dataset.stevneid)
        const gjeldande = typedResultat.find(r => r.kasterid === kid)?.hcp ?? 0
        const input = prompt('Sett HCP for spelar:', String(gjeldande))
        if (input === null) return
        const nyHcp = parseInt(input, 10)
        if (isNaN(nyHcp) || nyHcp < 0) { alert('Ugyldig HCP-verdi'); return }
        const { error } = await supabase.from('resultat').update({ hcp: nyHcp }).eq('stevneid', sid).eq('kasterid', kid)
        if (error) { alert('Feil ved lagring: ' + error.message); return }
        await lastOgVis(container, stevneid)
      })
    })
  }

  bannerSlot?.querySelector('#startkort-btn')?.addEventListener('click', () => {
    printStartkort(typedStevne, alleKamper as never, rundeMap as never, startnrMap, stilling)
  })

  bannerSlot?.querySelector('#fullfor-btn')?.addEventListener('click', () => fullforTurnering(container, stevneid))

  bannerSlot?.querySelector('#fullfør-turnering-btn')?.addEventListener('click', async () => {
    if (!confirm('Vil du fullføre turneringa? Dette kan ikkje angrast.')) return
    const { error } = await supabase.from('stevne').update({ erfullfort: true }).eq('id', stevneid)
    if (error) { alert('Feil: ' + error.message); return }
    await lastOgVis(container, stevneid)
  })

  bannerSlot?.querySelector('#test-autofullfør-btn')?.addEventListener('click', async (e) => {
    if (!confirm('Autofullfør alle ubekreftede innledande kamper?')) return
    ;(e.currentTarget as HTMLButtonElement).disabled = true
    await autoFullforInnledendeKamper(stevneid)
    await lastOgVis(container, stevneid)
  })

  for (const kamp of alleKamper) {
    container.querySelector(`#plus-${kamp.id}`)?.addEventListener('click', async () => {
      const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
      const spelarIds = [p1?.id, p2?.id].filter((id): id is number => id != null)

      let harOmgangar = false
      if (spelarIds.length) {
        const { data: omg } = await supabase
          .from('kamp_omgang')
          .select('id')
          .in('kamp_spelar_id', spelarIds)
          .limit(1)
        harOmgangar = (omg?.length ?? 0) > 0
      }

      if (harOmgangar && !confirm('Dette sletter detaljar for denne kampen. Er du sikker på at du vil fortsette?')) return

      const p1Namn = p1?.kaster ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn)}` : '—'
      const p2Namn = p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn)}` : '—'

      opnNumberpad(p1Namn, p2Namn, scoreForSp(p1), scoreForSp(p2), async (s1, s2) => {
        if (harOmgangar && spelarIds.length) {
          await supabase.from('kamp_omgang').delete().in('kamp_spelar_id', spelarIds)
        }
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

    container.querySelector(`#bekrft-${kamp.id}`)?.addEventListener('click', () =>
      bekreftKamp(container, stevneid, kamp, startnrMap, hcpMap),
    )

    if (kanEndreKampar && kamp.er_bekreftet) {
      const [p1, p2] = hentP1P2(kamp.spelarar, startnrMap)
      const p1Namn = p1?.kaster ? `${escHtml(p1.kaster.fornavn)} ${escHtml(p1.kaster.etternavn)}` : '—'
      const p2Namn = p2?.kaster ? `${escHtml(p2.kaster.fornavn)} ${escHtml(p2.kaster.etternavn)}` : '—'
      const handler = () => {
        opnNumberpad(p1Namn, p2Namn, p1?.score_poeng ?? 0, p2?.score_poeng ?? 0, async (nyS1, nyS2) => {
          const [kp1, kp2] = beregnKampPoeng(nyS1, nyS2)
          let dbErr: string | null = null
          if (p1) {
            const { error } = await supabase.from('kamp_spelar').update({ score_poeng: nyS1, kamp_poeng: kp1 }).eq('id', p1.id)
            if (error) dbErr = error.message
          }
          if (!dbErr && p2) {
            const { error } = await supabase.from('kamp_spelar').update({ score_poeng: nyS2, kamp_poeng: kp2 }).eq('id', p2.id)
            if (error) dbErr = error.message
          }
          if (dbErr) { alert('DB-feil: ' + dbErr); return }
          await lastOgVis(container, stevneid)
        })
      }
      container.querySelectorAll(`[data-endre-score="${kamp.id}"]`).forEach(celle => celle.addEventListener('click', handler))
    }
  }

  abonnerPaaEndringar(container, stevneid)
  } catch (err) {
    logError('gloppen.lastOgVis', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste innledande fase.'))
  }
}

// ── Realtime ──────────────────────────────────────────────────────────────────

function abonnerPaaEndringar(container: HTMLElement, stevneid: number): void {
  if (kanal) return
  const onEndring = lagOnEndringHandler(stevneid, ['innledende'], container, lastOgVis, () => {
    if (kanal) { supabase.removeChannel(kanal); kanal = null }
  })
  kanal = supabase
    .channel(`stevne-innl-gloppen-${stevneid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' }, onEndring)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp' }, (payload) => {
      const sid = (payload.new as Record<string, unknown>)?.stevneid ?? (payload.old as Record<string, unknown>)?.stevneid
      if (sid === stevneid) onEndring()
    })
    .subscribe()
}

// ── Round rendering ───────────────────────────────────────────────────────────

function renderRunde(
  nr: number,
  kamper: InnlKamp[],
  startnrMap: Record<number, number>,
  admin: boolean,
  hcpMap: Record<number, number> = {},
): string {
  return `
    <div class="mb-3">
      <h6 class="text-center fw-bold mb-1">Runde ${nr}</h6>
      <table class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="th-36 text-center">B</th>
            <th>P1</th>
            <th class="th-48 text-center">S1</th>
            <th class="th-48 text-center">S2</th>
            <th>P2</th>
            ${admin ? '<th class="th-148"></th>' : '<th class="th-48"></th>'}
          </tr>
        </thead>
        <tbody>
          ${kamper.map(k => kampRad(k, startnrMap, admin, hcpMap)).join('')}
        </tbody>
      </table>
    </div>`
}

function kampRad(
  kamp: InnlKamp,
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

  const sp = [p1, p2].filter((s): s is InnlKampSpelar => s != null)
  const kanBekrefte = beregnKanBekrefte(kamp as unknown as OrgKamp, sp as unknown as OrgKampSpelar[], harOmgangar, hcpMap)
  const bekrfKlass = kamp.er_bekreftet ? 'btn-secondary' : (kanBekrefte ? 'btn-success' : 'btn-outline-secondary')
  const bekrfTekst = kamp.er_bekreftet ? 'Bekreftet' : 'Bekreft'
  const bekrfDisabled = kamp.er_bekreftet || !kanBekrefte ? ' disabled' : ''
  const scoreboardDisabled = kamp.er_bekreftet && !harOmgangar ? ' disabled' : ''
  const scoreEndrAttr = admin && kamp.er_bekreftet ? ` data-endre-score="${kamp.id}" class="text-center score-redigerbar"` : ' class="text-center"'
  return `
    <tr>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${p1Vis}</td>
      <td${scoreEndrAttr}>${harPoeng ? s1 : ''}</td>
      <td${scoreEndrAttr}>${harPoeng ? s2 : ''}</td>
      <td>${p2Vis}</td>
      <td class="text-end pe-2 text-nowrap">
        ${admin ? `<button class="btn btn-primary btn-sm" id="plus-${kamp.id}"${kamp.er_bekreftet ? ' disabled' : ''}>+</button>` : ''}
        <button class="btn btn-secondary btn-sm" id="scoreboard-${kamp.id}" data-bane="${kamp.bane_nummer ?? ''}" title="Scoreboard"${scoreboardDisabled}>S</button>
        ${admin ? `<button class="btn ${bekrfKlass} btn-sm btn-bekreft" id="bekrft-${kamp.id}"${bekrfDisabled}>${bekrfTekst}</button>` : ''}
      </td>
    </tr>`
}

// ── Match confirmation ────────────────────────────────────────────────────────

interface BekreftKampSpelar {
  id: number
  kasterid: number
  score_poeng: number
  antall_ringer: number
  posisjon: number | null
  omgangar: { score: number | null; antall_ringer: number | null }[] | null
}

async function bekreftKamp(
  container: HTMLElement,
  stevneid: number,
  kamp: InnlKamp,
  startnrMap: Record<number, number>,
  hcpMap: Record<number, number> = {},
): Promise<void> {
  const { data: rawSpelarar, error: spErr } = await supabase
    .from('kamp_spelar')
    .select('id, kasterid, score_poeng, antall_ringer, posisjon, omgangar:kamp_omgang(score, antall_ringer)')
    .eq('kampid', kamp.id)

  if (spErr) { alert('Feil ved henting av kampdata: ' + spErr.message); return }

  const spelarar = (rawSpelarar ?? []) as unknown as BekreftKampSpelar[]
  const [p1, p2] = hentP1P2(spelarar, startnrMap)
  const hcp1 = hcpMap[p1?.kasterid ?? -1] ?? 0
  const hcp2 = hcpMap[p2?.kasterid ?? -1] ?? 0

  const harOmg1 = (p1?.omgangar?.length ?? 0) > 0
  const harOmg2 = (p2?.omgangar?.length ?? 0) > 0
  const s1 = kamp.er_walkover ? 21 : (scoreForSp(p1) + (harOmg1 ? hcp1 : 0))
  const s2 = kamp.er_walkover ? 0 : (scoreForSp(p2) + (harOmg2 ? hcp2 : 0))
  const r1 = kamp.er_walkover ? 0 : ringerForSp(p1)
  const r2 = 0

  const [kp1, kp2] = beregnKampPoeng(s1, s2)

  const spelarUpdates: PromiseLike<unknown>[] = []
  if (p1) spelarUpdates.push(supabase.from('kamp_spelar').update({ score_poeng: s1, kamp_poeng: kp1, antall_ringer: r1 }).eq('id', p1.id))
  if (p2) spelarUpdates.push(supabase.from('kamp_spelar').update({ score_poeng: s2, kamp_poeng: kp2, antall_ringer: r2 }).eq('id', p2.id))
  await Promise.all(spelarUpdates)

  const { error: kampErr } = await supabase.from('kamp').update({ er_bekreftet: true }).eq('id', kamp.id)
  if (kampErr) { alert('DB-feil: ' + kampErr.message); return }

  await lastOgVis(container, stevneid)
}

// ── Phase transition ──────────────────────────────────────────────────────────

async function fullforTurnering(_container: HTMLElement, stevneid: number): Promise<void> {
  if (!confirm('Start avsluttande fase?')) return
  const { error } = await supabase.from('stevne').update({ stevne_fase: 'avsluttende' }).eq('id', stevneid)
  if (error) { alert('Feil: ' + error.message); return }
  location.hash = `#/stevne/${stevneid}/avsluttende`
}
