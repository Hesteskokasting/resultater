import { scoreForSp, hentP1P2 } from '../utils/kamp'
import { escHtml } from '../utils/escHtml'
import type { Tables } from '../types'

// Minimal shapes for organizer kamp data (spelarar is an aliased join from kamp_spelar)
export interface OrgKampSpelar {
  kasterid: number
  kamp_poeng: number
  score_poeng: number
  posisjon?: number | null
  antall_ringer?: number | null
  omgangar?: Pick<Tables<'kamp_omgang'>, 'score' | 'antall_ringer'>[] | null
  kaster?: { fornavn: string; etternavn: string } | null
}

export interface OrgKamp extends Pick<Tables<'kamp'>, 'er_bekreftet' | 'er_walkover' | 'runde_nummer' | 'bane_nummer'> {
  spelarar?: OrgKampSpelar[] | null
}

export interface KampForSortering {
  er_bekreftet: boolean
  spelarar?: {
    kasterid: number | null
    kamp_poeng: number | null
    score_poeng?: number | null
    omgangar?: { score?: number | null }[] | null
  }[] | null
}

export interface StillingRad {
  kasterid: number
  namn?: string | null
  startnummer?: number | null
  kamp_poeng?: number | null
  score_poeng?: number | null
  runde_eliminert?: number | null
  plassering?: number | null
  hcp?: number | null
  gruppe?: { navn: string } | null
  antall_kamper?: number | null
}

interface StillingOpts {
  tableId?: string
  isAdmin?: boolean
  stevneid?: number | null
  harHcp?: boolean
  harGrupper?: boolean
  harEliminasjon?: boolean
  harAntallKamper?: boolean
}

export function renderSpelarkamparDetalj(
  kasterid: number,
  kamper: OrgKamp[] | null | undefined,
  startnrMap: Record<number, number>,
): string {
  const eineKamper = (kamper ?? [])
    .filter(k => k.spelarar?.some(sp => sp.kasterid === kasterid))
    .sort((a, b) => a.runde_nummer - b.runde_nummer)

  if (!eineKamper.length) {
    return '<tr><td colspan="4" class="text-muted small fst-italic text-center">Ingen kampar</td></tr>'
  }

  return eineKamper.map(kamp => {
    const sp  = kamp.spelarar?.find(s => s.kasterid === kasterid)
    const opp = kamp.spelarar?.find(s => s.kasterid !== kasterid)
    const erWalkoverSeier = kamp.er_walkover && (!opp || !opp.kaster)

    const oppNamn = erWalkoverSeier
      ? 'Walkover'
      : (opp?.kaster ? `${escHtml(opp.kaster.fornavn)} ${escHtml(opp.kaster.etternavn)}` : '—')
    const oppNr = erWalkoverSeier ? '' : (opp?.kasterid ? (startnrMap[opp.kasterid] ?? '') : '')
    const oppVis = oppNr ? `${oppNamn} (${oppNr})` : oppNamn

    const myScore  = erWalkoverSeier ? 21 : scoreForSp(sp)
    const oppScore = erWalkoverSeier ? 0  : scoreForSp(opp)
    const resultat = `${myScore} - ${oppScore}`

    return `<tr>
      <td class="text-center">${kamp.runde_nummer}</td>
      <td class="text-center">${kamp.bane_nummer ?? ''}</td>
      <td>${oppVis}</td>
      <td class="text-center">${resultat}</td>
    </tr>`
  }).join('')
}

export function beregnKanBekrefte(
  kamp: OrgKamp,
  sp: OrgKampSpelar[],
  harOmgangar: boolean,
  hcpMap: Record<number, number> = {},
): boolean {
  if (kamp.er_bekreftet) return false
  if (kamp.er_walkover) return true
  if (harOmgangar) return false
  const hcp1 = hcpMap[sp[0]?.kasterid] ?? 0
  const hcp2 = hcpMap[sp[1]?.kasterid] ?? 0
  const s1 = scoreForSp(sp[0])
  const s2 = sp[1] ? scoreForSp(sp[1]) : 0
  return s1 + hcp1 >= 21 || s2 + hcp2 >= 21
}

export function renderHovudInnhald(kamperHtml: string, stillingHtml: string): string {
  return `
    <div class="org-hovud-innhald">
      <div class="org-tab-knappar btn-group w-100 mb-2">
        <button class="btn btn-primary org-tab-btn" data-tab="kamper">Kampar</button>
        <button class="btn btn-outline-primary org-tab-btn" data-tab="stilling">Stilling</button>
      </div>
      <div class="d-flex gap-3 align-items-start org-innhald-rad">
        <div class="flex-grow-1 org-kampar-panel">${kamperHtml}</div>
        <div class="org-stilling-kol">${stillingHtml}</div>
      </div>
    </div>`
}

export function bindTabToggle(container: HTMLElement): void {
  const wrapper = container.querySelector<HTMLElement>('.org-hovud-innhald')
  if (!wrapper) return
  container.querySelectorAll<HTMLButtonElement>('.org-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isStilling = btn.dataset.tab === 'stilling'
      wrapper.classList.toggle('org-vis-stilling', isStilling)
      container.querySelectorAll<HTMLButtonElement>('.org-tab-btn').forEach(b => {
        b.classList.toggle('btn-primary', b.dataset.tab === btn.dataset.tab)
        b.classList.toggle('btn-outline-primary', b.dataset.tab !== btn.dataset.tab)
      })
    })
  })
}

export function renderStillingTabell(
  stilling: StillingRad[],
  kamper: OrgKamp[],
  startnrMap: Record<number, number>,
  opts: StillingOpts = {},
): string {
  const {
    tableId        = 'stilling-tabell',
    isAdmin        = false,
    stevneid       = null,
    harHcp         = false,
    harGrupper     = false,
    harEliminasjon = false,
    harAntallKamper = false,
  } = opts

  const extraCols = (harHcp ? 1 : 0) + (harAntallKamper ? 1 : 0)
  const colspan   = 5 + extraCols
  const thW       = harAntallKamper ? 'th-32' : 'th-28'

  const gruppeMap = new Map<string, StillingRad[]>()
  for (const r of stilling) {
    const g = harGrupper ? (r.gruppe?.navn ?? '_') : '_'
    if (!gruppeMap.has(g)) gruppeMap.set(g, [])
    gruppeMap.get(g)!.push(r)
  }

  const harFleirGrupper = gruppeMap.size > 1 || !gruppeMap.has('_')
  const tittel = harAntallKamper ? `${stilling.length} spelarar` : 'Stilling'

  const rows = [...gruppeMap.entries()].flatMap(([g, spelararIGruppe]) => {
    const gruppeHeader = harFleirGrupper && g !== '_'
      ? `<tr><td colspan="${colspan}" class="fw-semibold ps-2">Gruppe ${escHtml(g)}</td></tr>`
      : ''
    const playerRows = spelararIGruppe.map((r, i) => {
      const erEliminert = harEliminasjon && r.runde_eliminert != null
      const hcp = r.hcp ?? 0
      const hcpCelle = harHcp
        ? (isAdmin
          ? `<td class="text-center stilling-hcp-celle" data-kasterid="${r.kasterid}" data-stevneid="${stevneid}">${hcp > 0 ? hcp : '—'}</td>`
          : `<td class="text-center">${hcp > 0 ? hcp : '—'}</td>`)
        : ''
      const antallCelle = harAntallKamper
        ? `<td class="text-center">${r.antall_kamper ?? 0}</td>`
        : ''
      return `
        <tr data-kasterid="${r.kasterid}" class="stilling-spelar-rad">
          <td${erEliminert ? ' class="avsl-elim-plass"' : ''}>${i + 1}</td>
          <td>${r.startnummer ?? ''}</td>
          <td>${escHtml(r.namn ?? `Spelar ${r.kasterid}`)}</td>
          ${antallCelle}
          <td class="text-center">${r.kamp_poeng ?? 0}</td>
          <td class="text-center">${r.score_poeng ?? 0}</td>
          ${hcpCelle}
        </tr>
        <tr class="stilling-detalj" data-kasterid="${r.kasterid}" hidden>
          <td colspan="${colspan}" class="p-0">
            <table class="stilling-detalj-tabell table table-sm table-bordered mb-0">
              <thead><tr>
                <th class="text-center">Runde</th>
                <th class="text-center">Bane</th>
                <th>Motstandar</th>
                <th class="text-center">Resultat</th>
              </tr></thead>
              <tbody>${renderSpelarkamparDetalj(r.kasterid, kamper, startnrMap)}</tbody>
            </table>
          </td>
        </tr>`
    }).join('')
    return gruppeHeader + playerRows
  }).join('')

  return `
    <div>
      <h6 class="text-center fw-bold mb-1">${tittel}</h6>
      <table id="${tableId}" class="table table-bordered table-sm mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th class="${thW}">#</th>
            <th class="${thW}">S</th>
            <th>NAMN</th>
            ${harAntallKamper ? '<th class="th-50 text-center">ANT.</th>' : ''}
            <th class="th-44 text-center">KP</th>
            <th class="th-44 text-center">SP</th>
            ${harHcp ? '<th class="th-44 text-center">HCP</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

export function bindStillingDetaljar(
  container: HTMLElement,
  tableId: string,
  expandedIds: Set<string> = new Set(),
): void {
  const tabell = container.querySelector<HTMLElement>(`#${tableId}`)
  if (!tabell) return

  // Restore rows that were open before the last re-render
  expandedIds.forEach(kid => {
    const detaljRad = tabell.querySelector<HTMLElement>(`tr.stilling-detalj[data-kasterid="${kid}"]`)
    const spelarRad = tabell.querySelector<HTMLElement>(`tr.stilling-spelar-rad[data-kasterid="${kid}"]`)
    if (detaljRad) detaljRad.removeAttribute('hidden')
    if (spelarRad) {
      spelarRad.classList.add('stilling-aktiv')
      spelarRad.setAttribute('aria-expanded', 'true')
    }
  })

  tabell.querySelectorAll<HTMLElement>('tr.stilling-spelar-rad').forEach(rad => {
    rad.setAttribute('tabindex', '0')
    if (!rad.hasAttribute('aria-expanded')) rad.setAttribute('aria-expanded', 'false')
  })

  function toggle(rad: HTMLElement): void {
    const kid = rad.dataset.kasterid
    if (!kid) return
    const detaljRad = tabell!.querySelector<HTMLElement>(`tr.stilling-detalj[data-kasterid="${kid}"]`)
    if (!detaljRad) return
    const wasHidden = !!detaljRad.hidden
    detaljRad.hidden = !wasHidden
    rad.classList.toggle('stilling-aktiv', wasHidden)
    rad.setAttribute('aria-expanded', String(wasHidden))
    if (wasHidden) expandedIds.add(kid)
    else expandedIds.delete(kid)
  }

  tabell.addEventListener('click', e => {
    const rad = (e.target as HTMLElement).closest<HTMLElement>('tr.stilling-spelar-rad')
    if (rad) toggle(rad)
  })

  tabell.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const rad = (e.target as HTMLElement).closest<HTMLElement>('tr.stilling-spelar-rad')
    if (!rad) return
    e.preventDefault()
    toggle(rad)
  })
}

export function lagOnEndringHandler(
  stevneid: number,
  faner: string[],
  container: HTMLElement,
  lastOgVisFn: (container: HTMLElement, stevneid: number) => void,
  stopFn: () => void,
): () => void {
  return function onEndring() {
    const hash = location.hash
    const erPaaSide = faner.some(f => hash === `#/stevne/${stevneid}/${f}`)
    if (erPaaSide) {
      lastOgVisFn(container, stevneid)
    } else {
      stopFn()
    }
  }
}

export function renderInnledendeKnappar(
  stevne: Pick<Tables<'stevne'>, 'erfullfort'>,
  erAlleKamperBekreftet: boolean,
  erSwiss: boolean,
): string {
  return `
    ${erSwiss ? `<button id="neste-runde-btn" class="btn btn-sm btn-warning">Generer neste runde</button>` : ''}
    <button id="fullfor-btn" class="btn btn-sm btn-primary"${stevne.erfullfort || !erAlleKamperBekreftet ? ' disabled' : ''}>Start avsluttande fase</button>
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${stevne.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>
    <button id="test-autofullfør-btn" class="btn btn-sm btn-outline-warning">TEST: Autofullfør</button>
  `
}

interface AvsluttendeState {
  alleInnlBekrefta: boolean
  harAvslKampar: boolean
  harGruppefordeling: boolean
  harPrekonfigurertFormat?: boolean
}

export function renderAvsluttendeKnappar(
  stevne: Pick<Tables<'stevne'>, 'erfullfort' | 'stevne_fase'>,
  state: AvsluttendeState,
): string {
  const { alleInnlBekrefta, harAvslKampar, harGruppefordeling, harPrekonfigurertFormat = false } = state
  const fase = stevne.stevne_fase

  let handlingsHtml = ''

  if (fase !== 'avsluttende') {
    if (!alleInnlBekrefta) {
      handlingsHtml = '<span class="badge bg-warning text-dark">Innledande fase er ikkje ferdig</span>'
    } else {
      handlingsHtml = `
        <button id="start-avsl-btn" class="btn btn-sm btn-success">Start avsluttande fase</button>
        ${harPrekonfigurertFormat ? `<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppefordeling</button>` : ''}`
    }
  } else if (!harGruppefordeling) {
    // Gruppefordeling UI = eiga seksjon under
  } else if (harGruppefordeling && !harAvslKampar) {
    handlingsHtml = `<button id="endre-gruppeinndeling-btn" class="btn btn-sm btn-outline-secondary">Endre gruppeinndeling</button>`
  }

  return `
    ${handlingsHtml}
    <button id="fullfør-turnering-btn" class="btn btn-sm btn-danger"${stevne.erfullfort ? ' disabled' : ''}>Fullfør turnering</button>
  `
}

export function renderOrgBanner(stevneNavn: string, knapperHtml = ''): string {
  return `
    <div class="org-fase-header d-flex align-items-center gap-2 mb-3">
      <h5 class="mb-0 flex-grow-1">${escHtml(stevneNavn)}</h5>
      ${knapperHtml}
    </div>
  `
}

export interface SpelMapRad {
  kasterid: number
  namn: string
  startnummer: number | null
  kamp_poeng: number
  score_poeng: number
  antall_kamper: number
}

export function byggInnledendeSpelMap(
  alleKamper: OrgKamp[],
  startnrMap: Record<number, number>,
): { spelMap: Record<number, SpelMapRad>; ekteKasterids: Set<number> } {
  const spelMap: Record<number, SpelMapRad> = {}
  const ekteKasterids = new Set<number>()

  for (const kamp of alleKamper) {
    const [, byeP2] = kamp.er_walkover ? hentP1P2(kamp.spelarar, startnrMap) : [null, null]
    for (const sp of kamp.spelarar ?? []) {
      if (!sp.kasterid || !sp.kaster) continue
      if (kamp.er_walkover && sp.kasterid === byeP2?.kasterid) continue
      ekteKasterids.add(sp.kasterid)
      if (!spelMap[sp.kasterid]) {
        spelMap[sp.kasterid] = {
          kasterid:      sp.kasterid,
          namn:          `${sp.kaster.fornavn} ${sp.kaster.etternavn}`,
          startnummer:   startnrMap[sp.kasterid] ?? null,
          kamp_poeng:    0,
          score_poeng:   0,
          antall_kamper: 0,
        }
      }
      if (kamp.er_bekreftet) {
        spelMap[sp.kasterid].kamp_poeng    += sp.kamp_poeng
        spelMap[sp.kasterid].score_poeng   += sp.score_poeng
        spelMap[sp.kasterid].antall_kamper += 1
      }
    }
  }

  return { spelMap, ekteKasterids }
}

export function sorterStilling(stilling: StillingRad[], kamper: KampForSortering[]): StillingRad[] {
  const bekrefta = kamper.filter(k => k.er_bekreftet)

  return [...stilling].sort((a, b) => {
    // Aktive (runde_eliminert == null) kjem alltid først
    const aAktiv = a.runde_eliminert == null
    const bAktiv = b.runde_eliminert == null
    if (aAktiv !== bAktiv) return aAktiv ? -1 : 1

    // For eliminerte: seinare runde = betre plassering
    if (!aAktiv) {
      const rundeDiff = (b.runde_eliminert ?? 0) - (a.runde_eliminert ?? 0)
      if (rundeDiff !== 0) return rundeDiff
      const pA = a.plassering ?? Infinity
      const pB = b.plassering ?? Infinity
      if (pA !== pB) return pA - pB
    }

    if (b.kamp_poeng !== a.kamp_poeng) return (b.kamp_poeng ?? 0) - (a.kamp_poeng ?? 0)
    if (b.score_poeng !== a.score_poeng) return (b.score_poeng ?? 0) - (a.score_poeng ?? 0)

    // Innbyrdes (kamppoeng i kampar der begge møttest)
    let kpA = 0, kpB = 0
    for (const kamp of bekrefta) {
      const spA = kamp.spelarar?.find(s => s.kasterid === a.kasterid)
      const spB = kamp.spelarar?.find(s => s.kasterid === b.kasterid)
      if (spA && spB) { kpA += spA.kamp_poeng ?? 0; kpB += spB.kamp_poeng ?? 0 }
    }
    if (kpA !== kpB) return kpB - kpA

    // Høgaste score i ein enkeltkamp
    const scoresFor = (kid: number) => bekrefta
      .flatMap(k => k.spelarar?.filter(s => s.kasterid === kid) ?? [])
      .map(s => scoreForSp(s))
      .sort((x, y) => y - x)
    const sA = scoresFor(a.kasterid)
    const sB = scoresFor(b.kasterid)
    for (let i = 0; i < Math.min(sA.length, sB.length); i++) {
      if (sB[i] !== sA[i]) return sB[i] - sA[i]
    }

    return (a.startnummer ?? Infinity) - (b.startnummer ?? Infinity)
  })
}
