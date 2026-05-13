import { kasterNavn, lagKasterSlug, lagKlubbSlug } from '../utils/kaster'
import { getUser } from '../utils/auth'
import { lasterHtml, feilHtml } from '../utils/pageStates'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { hentKlubbar, hentKlubbById } from '../services/klubbService'
import { hentKastereListeAktive, hentKlubbMedlemmar } from '../services/kasterService'
import type { PageRenderFn } from '../types'
import type { KlubbListeRow } from '../services/klubbService'
import type { MedlemRow } from '../services/kasterService'

const PLACEHOLDER_LOGO = 'https://placehold.co/200x200/444/888?text=?'

const filtreListe = { sokeTekst: '' }
const filtreDetalj = { sokeTekst: '' }

// ── HTML-byggjarar: Liste ─────────────────────────────────────────────────────

function klubbKortHtml(k: KlubbListeRow): string {
  return `
    <a href="#/klubber/${lagKlubbSlug(k)}" class="kaster-kort">
      <img src="${escHtml(k.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(k.navn)}" loading="lazy">
      <div class="kaster-namn">${escHtml(k.navn)}</div>
    </a>`
}

function listeSkelettHtml(): string {
  return `
    <div class="nc-side">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnamn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`
}

// ── HTML-byggjarar: Detalj ────────────────────────────────────────────────────

function detaljSkelettHtml(klubb: KlubbListeRow, antall: number): string {
  return `
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/klubber" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <div class="klubb-detalj-header">
        <img src="${escHtml(klubb.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(klubb.navn)}" class="klubb-logo-stor">
        <h1 class="klubb-detalj-tittel">${escHtml(klubb.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${antall})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="klubb-detalj-sok" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="klubb-detalj-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="klubb-detalj-liste"></div>
    </div>`
}

function medlemTabellHtml(medlemmar: MedlemRow[], sokeTekst: string): string {
  const sok = sokeTekst.trim().toLowerCase()
  const filtrert = sok
    ? medlemmar.filter(k => kasterNavn(k).toLowerCase().includes(sok))
    : medlemmar

  if (!filtrert.length) return '<p class="nc-ingen">Ingen aktive utøvarar funnet.</p>'

  const rader = filtrert.map((k, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><a href="#/kastere/${lagKasterSlug(k)}" class="tl-lenkje">${escHtml(kasterNavn(k))}</a></td>
      <td>${escHtml(k.klasse?.navn ?? '–')}</td>
      <td>${k.medlemsnummer ?? '–'}</td>
    </tr>`).join('')

  return `
    <div class="table-responsive">
      <table class="nc-tabell">
        <thead class="nc-thead">
          <tr><th>#</th><th>Utøvar</th><th>Klasse</th><th>Nr.</th></tr>
        </thead>
        <tbody>${rader}</tbody>
      </table>
    </div>`
}

// ── Render: Liste ─────────────────────────────────────────────────────────────

async function renderListe(container: HTMLElement): Promise<void> {
  container.innerHTML = lasterHtml('Laster klubbar...')

  try {
    const [{ data: alleKlubbar, error }, { data: alleKastere }] = await Promise.all([
      hentKlubbar(),
      hentKastereListeAktive(),
    ])

    if (error) {
      container.innerHTML = feilHtml('Kunne ikkje laste klubbar.')
      return
    }

    const kasterPerKlubb = new Map<number, string[]>()
    for (const k of alleKastere) {
      if (!k.klubb?.id) continue
      if (!kasterPerKlubb.has(k.klubb.id)) kasterPerKlubb.set(k.klubb.id, [])
      kasterPerKlubb.get(k.klubb.id)!.push(kasterNavn(k).toLowerCase())
    }

    container.innerHTML = listeSkelettHtml()

    const grid = container.querySelector<HTMLElement>('#klubb-grid')!
    const sokInput = container.querySelector<HTMLInputElement>('#klubb-sok')!

    function filtrerOgVis(): void {
      const sok = filtreListe.sokeTekst.trim().toLowerCase()
      const filtrert = sok
        ? alleKlubbar.filter(k =>
            k.navn.toLowerCase().includes(sok) ||
            (kasterPerKlubb.get(k.id) ?? []).some(n => n.includes(sok))
          )
        : alleKlubbar
      grid.innerHTML = filtrert.length
        ? filtrert.map(klubbKortHtml).join('')
        : '<p class="nc-ingen">Ingen klubbar funnet.</p>'
    }

    filtrerOgVis()

    sokInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        filtreListe.sokeTekst = sokInput.value
        filtrerOgVis()
      }
    })

    container.querySelector('#klubb-sok-knapp')!.addEventListener('click', () => {
      filtreListe.sokeTekst = sokInput.value
      filtrerOgVis()
    })

    void getUser().then(auth => {
      if (auth?.profil?.rolle !== 'admin') return
      const bar = document.createElement('div')
      bar.className = 'mb-2 px-2'
      bar.innerHTML = `<a href="#/klubber/ny" class="btn btn-sm btn-success">+ Ny klubb</a>`
      container.querySelector('.nc-side')?.prepend(bar)
    })
  } catch (err) {
    logError('renderListe', err)
    container.innerHTML = feilHtml('Kunne ikkje laste klubbar.')
  }
}

// ── Render: Detalj ────────────────────────────────────────────────────────────

async function renderDetalj(container: HTMLElement, id: number): Promise<void> {
  filtreDetalj.sokeTekst = ''
  container.innerHTML = lasterHtml('Laster klubb...')

  try {
    const [klubbRes, { data: medlemmar }] = await Promise.all([
      hentKlubbById(id),
      hentKlubbMedlemmar(id),
    ])

    if (klubbRes.error || !klubbRes.data) {
      container.innerHTML = feilHtml('Kunne ikkje laste klubb.')
      return
    }

    const klubb = klubbRes.data

    container.innerHTML = detaljSkelettHtml(klubb, medlemmar.length)

    const listeContainer = container.querySelector<HTMLElement>('#klubb-detalj-liste')!
    const sokInput = container.querySelector<HTMLInputElement>('#klubb-detalj-sok')!

    function oppdaterListe(): void {
      listeContainer.innerHTML = medlemTabellHtml(medlemmar, filtreDetalj.sokeTekst)
    }

    oppdaterListe()

    sokInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        filtreDetalj.sokeTekst = sokInput.value
        oppdaterListe()
      }
    })

    container.querySelector('#klubb-detalj-sok-knapp')!.addEventListener('click', () => {
      filtreDetalj.sokeTekst = sokInput.value
      oppdaterListe()
    })

    void getUser().then(auth => {
      if (!auth?.profil) return
      const kanRedigere = auth.profil.rolle === 'admin' ||
        (auth.profil.rolle === 'klubbadmin' && auth.klubber.includes(id))
      if (!kanRedigere) return
      const bar = document.createElement('div')
      bar.className = 'mb-2 px-2'
      bar.innerHTML = `<a href="#/klubber/${id}/admin" class="btn btn-sm btn-warning">Rediger klubb</a>`
      container.querySelector('.nc-side')?.prepend(bar)
    })
  } catch (err) {
    logError('renderDetalj', err)
    container.innerHTML = feilHtml('Kunne ikkje laste klubb.')
  }
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export const render: PageRenderFn = async (container, params) => {
  if (params.id) {
    await renderDetalj(container, Number(params.id))
  } else {
    await renderListe(container)
  }
}
