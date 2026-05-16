import { logError } from '../utils/logError'
import { escHtml } from '../utils/escHtml'
import { errMsg } from '../utils/adminForms'
import {
  hentVentandeKoblingar,
  hentBrukarEpost,
  oppdaterKoblingStatus,
  hentAlleBrukarar,
  oppdaterBrukarRolle,
  hentKlubbadminBrukarar,
  hentKlubbadminTildelte,
  leggTilKlubbadminTilgang,
  fjernKlubbadminTilgang,
} from '../services/adminService'
import { hentKlubbar } from '../services/klubbService'
import { hentKastereByIds } from '../services/kasterService'
import { createLoadingState } from '../components/LoadingState'
import { createEmptyState } from '../components/EmptyState'

type Fane = 'kobling' | 'brukarar' | 'klubbadmin'

const FANER: Fane[] = ['kobling', 'brukarar', 'klubbadmin']
const FANE_LABEL: Record<Fane, string> = {
  kobling:    'Koblingforespørslar',
  brukarar:   'Brukarar',
  klubbadmin: 'Klubbadmin-tilgang',
}

export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div class="container py-4 admin-skjema-xl">
      <h2 class="mb-3">Administrasjon</h2>
      <ul class="nav nav-tabs mb-4" id="admin-faner">
        ${FANER.map((f, i) => `<li class="nav-item">
          <button class="nav-link${i === 0 ? ' active' : ''}" data-fane="${f}">${FANE_LABEL[f]}</button>
        </li>`).join('')}
      </ul>
      <div id="admin-innhald"></div>
    </div>`

  const innhald = container.querySelector<HTMLElement>('#admin-innhald')!

  async function visFane(fane: Fane): Promise<void> {
    container.querySelectorAll<HTMLElement>('[data-fane]').forEach(k => {
      k.classList.toggle('active', k.dataset.fane === fane)
    })
    createLoadingState("Laster...")
    if (fane === 'kobling')    await _visKobling(innhald)
    if (fane === 'brukarar')   await _visBrukarar(innhald)
    if (fane === 'klubbadmin') await _visKlubbadmin(innhald)
  }

  container.querySelector('#admin-faner')!.addEventListener('click', e => {
    const knapp = (e.target as HTMLElement).closest<HTMLElement>('[data-fane]')
    if (knapp?.dataset.fane) visFane(knapp.dataset.fane as Fane)
  })

  visFane('kobling')
}

// ── Koblingforespørslar ──────────────────────────────────────

async function _visKobling(el: HTMLElement): Promise<void> {
  const { data, error } = await hentVentandeKoblingar()
  if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
  if (!data.length) { el.replaceChildren(createEmptyState('Ingen ventande forespørslar.')); return }

  const brukarIds = data.map(r => r.id)
  const kasterIds = data.map(r => r.kobling_kasterid).filter((x): x is number => x !== null)

  const [{ data: epostar }, { data: kastere }] = await Promise.all([
    hentBrukarEpost(brukarIds),
    hentKastereByIds(kasterIds),
  ])

  const epostMap  = Object.fromEntries((epostar  ?? []).map(r => [r.id, r.epost]))
  const kasterMap = new Map((kastere ?? []).map(k => [k.id, k] as const))

  el.innerHTML = `<table class="table table-hover">
    <thead><tr><th>E-post</th><th>Vil koblast til</th><th>Handling</th></tr></thead>
    <tbody>
      ${data.map(r => {
        const k = r.kobling_kasterid ? kasterMap.get(r.kobling_kasterid) : null
        const klubb = k?.klubb as { navn: string } | null | undefined
        const kastNamn = k
          ? `${escHtml(k.fornavn)} ${escHtml(k.etternavn)} (${escHtml(klubb?.navn ?? '')})`
          : '—'
        return `<tr data-id="${r.id}" data-kasterid="${r.kobling_kasterid ?? ''}">
          <td>${escHtml(epostMap[r.id] ?? r.id)}</td>
          <td>${kastNamn}</td>
          <td>
            <button class="btn btn-sm btn-success me-1 godkjenn-knapp">Godkjenn</button>
            <button class="btn btn-sm btn-outline-danger avvis-knapp">Avvis</button>
          </td>
        </tr>`
      }).join('')}
    </tbody>
  </table>`

  el.querySelectorAll<HTMLButtonElement>('.godkjenn-knapp').forEach(knapp => {
    knapp.addEventListener('click', async () => {
      const rad      = knapp.closest<HTMLElement>('tr')!
      const kasterid = rad.dataset.kasterid ? Number(rad.dataset.kasterid) : null
      const { error } = await oppdaterKoblingStatus(rad.dataset.id!, kasterid, 'godkjent')
      if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
      _visKobling(el)
    })
  })
  el.querySelectorAll<HTMLButtonElement>('.avvis-knapp').forEach(knapp => {
    knapp.addEventListener('click', async () => {
      const rad = knapp.closest<HTMLElement>('tr')!
      const { error } = await oppdaterKoblingStatus(rad.dataset.id!, null, 'avvist')
      if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
      _visKobling(el)
    })
  })
}

// ── Brukarar ────────────────────────────────────────────────

async function _visBrukarar(el: HTMLElement): Promise<void> {
  const { data, error } = await hentAlleBrukarar()
  if (error) { el.innerHTML = `<div class="alert alert-danger">${escHtml(errMsg(error))}</div>`; return }
  if (!data.length) { el.replaceChildren(createEmptyState('Ingen brukarar.')); return }

  const ids = data.map(r => r.id)
  const { data: epostar } = await hentBrukarEpost(ids)
  const epostMap = Object.fromEntries((epostar ?? []).map(r => [r.id, r.epost]))

  const rolleOptions = ['bruker', 'klubbadmin', 'admin']
    .map(r => `<option value="${r}">${r}</option>`).join('')

  el.innerHTML = `
    <div id="brukar-feil" class="alert alert-danger d-none"></div>
    <table class="table table-hover">
      <thead><tr><th>E-post</th><th>Rolle</th><th>Kobling</th><th></th></tr></thead>
      <tbody>
        ${data.map(r => `<tr data-id="${r.id}">
          <td>${escHtml(epostMap[r.id] ?? r.id)}</td>
          <td>
            <select class="form-select form-select-sm rolle-vel sel-auto">
              ${rolleOptions}
            </select>
          </td>
          <td><span class="badge bg-secondary">${escHtml(r.kobling_status)}</span></td>
          <td><button class="btn btn-sm btn-primary lagre-rolle">Lagre</button></td>
        </tr>`).join('')}
      </tbody>
    </table>`

  data.forEach(r => {
    const rad = el.querySelector<HTMLElement>(`tr[data-id="${r.id}"]`)
    if (rad) rad.querySelector<HTMLSelectElement>('.rolle-vel')!.value = r.rolle
  })

  el.querySelectorAll<HTMLButtonElement>('.lagre-rolle').forEach(knapp => {
    knapp.addEventListener('click', async () => {
      const rad     = knapp.closest<HTMLElement>('tr')!
      const nyRolle = rad.querySelector<HTMLSelectElement>('.rolle-vel')!.value
      const feil    = el.querySelector<HTMLElement>('#brukar-feil')!
      feil.classList.add('d-none')
      const { error } = await oppdaterBrukarRolle(rad.dataset.id!, nyRolle)
      if (error) {
        feil.textContent = errMsg(error)
        feil.classList.remove('d-none')
      } else {
        knapp.textContent = '✓'
        setTimeout(() => { knapp.textContent = 'Lagre' }, 2000)
      }
    })
  })
}

// ── Klubbadmin-tilgang ───────────────────────────────────────

async function _visKlubbadmin(el: HTMLElement): Promise<void> {
  let brukarar: { id: string }[]
  let klubbar: { id: number; navn: string; logourl: string | null }[]
  let tildelte: { bruker_id: string; klubbid: number }[]

  try {
    const results = await Promise.all([
      hentKlubbadminBrukarar(),
      hentKlubbar(),
      hentKlubbadminTildelte(),
    ])
    brukarar = results[0].data
    klubbar  = results[1].data
    tildelte = results[2].data
  } catch (err) {
    logError('admin._visKlubbadmin', err)
    el.innerHTML = `<div class="alert alert-danger">Kunne ikkje laste data.</div>`
    return
  }

  if (!brukarar.length) { el.replaceChildren(createEmptyState('Ingen brukarar med rolle "klubbadmin".')); return }

  const ids = brukarar.map(r => r.id)
  const { data: epostar } = await hentBrukarEpost(ids)
  const epostMap = Object.fromEntries((epostar ?? []).map(r => [r.id, r.epost]))

  const tildelteMap: Record<string, Set<number>> = {}
  tildelte.forEach(r => {
    if (!tildelteMap[r.bruker_id]) tildelteMap[r.bruker_id] = new Set()
    tildelteMap[r.bruker_id].add(r.klubbid)
  })

  const klubbOptions = klubbar.map(k =>
    `<option value="${k.id}">${escHtml(k.navn)}</option>`,
  ).join('')

  el.innerHTML = `
    <div id="ka-feil" class="alert alert-danger d-none"></div>
    ${brukarar.map(b => {
      const mine = [...(tildelteMap[b.id] ?? [])]
      const merkteKlubbar = mine.map(kid => {
        const k = klubbar.find(x => x.id === kid)
        return k ? `<span class="badge bg-primary me-1" data-kid="${kid}">${escHtml(k.navn)} <button class="btn-close btn-close-white btn-close-xs fjern-klubb"></button></span>` : ''
      }).join('')
      return `<div class="card mb-3" data-bruker="${b.id}">
        <div class="card-body">
          <h6 class="card-title mb-2">${escHtml(epostMap[b.id] ?? b.id)}</h6>
          <div class="ka-klubbar mb-2">${merkteKlubbar || '<span class="text-muted small">Ingen klubbar tildelt</span>'}</div>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm legg-til-vel sel-auto">
              <option value="">Legg til klubb…</option>
              ${klubbOptions}
            </select>
            <button class="btn btn-sm btn-success legg-til-knapp">Legg til</button>
          </div>
        </div>
      </div>`
    }).join('')}`

  el.querySelectorAll<HTMLButtonElement>('.legg-til-knapp').forEach(knapp => {
    knapp.addEventListener('click', async () => {
      const kort    = knapp.closest<HTMLElement>('[data-bruker]')!
      const velg    = kort.querySelector<HTMLSelectElement>('.legg-til-vel')!
      const klubbid = Number(velg.value)
      if (!klubbid) return
      const feil = el.querySelector<HTMLElement>('#ka-feil')!
      feil.classList.add('d-none')
      const { error } = await leggTilKlubbadminTilgang(kort.dataset.bruker!, klubbid)
      if (error) { feil.textContent = errMsg(error); feil.classList.remove('d-none'); return }
      _visKlubbadmin(el)
    })
  })

  el.querySelectorAll<HTMLButtonElement>('.fjern-klubb').forEach(knapp => {
    knapp.addEventListener('click', async e => {
      e.stopPropagation()
      const badge = knapp.closest<HTMLElement>('[data-kid]')!
      const kort  = knapp.closest<HTMLElement>('[data-bruker]')!
      const feil  = el.querySelector<HTMLElement>('#ka-feil')!
      feil.classList.add('d-none')
      const { error } = await fjernKlubbadminTilgang(kort.dataset.bruker!, Number(badge.dataset.kid))
      if (error) { feil.textContent = errMsg(error); feil.classList.remove('d-none'); return }
      _visKlubbadmin(el)
    })
  })
}
