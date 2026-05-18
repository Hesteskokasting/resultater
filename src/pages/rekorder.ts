import { kasterNavn, lagKasterSlug } from '../utils/kaster'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { createEmptyState } from '../components/EmptyState'
import { createTable } from '../components/Table'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { hentAlleRekorder } from '../services/rekorderService'
import type { RekorderRow } from '../services/rekorderService'

// ── Konstanter ────────────────────────────────────────────────────────────────

interface MetodeKonfig {
  verdi: string
  label: string
  maxPoeng: number
}

const METODAR: MetodeKonfig[] = [
  { verdi: 'kongelag',  label: 'Kongelag',  maxPoeng: 200 },
  { verdi: 'minimatch', label: 'Minimatch', maxPoeng: 300 },
  { verdi: 'halvmatch', label: 'Halvmatch', maxPoeng: 500 },
  { verdi: 'heilmatch', label: 'Heilmatch', maxPoeng: 1000 },
]

// ── Typar ─────────────────────────────────────────────────────────────────────

interface RekorderFiltre {
  metode: string
  kjonn: 'alle' | 'herrer' | 'damer'
  sokeTekst: string
}

type RangetRad = RekorderRow & { plassering: number }

// ── Tilstand ──────────────────────────────────────────────────────────────────

const filtre: RekorderFiltre = { metode: 'kongelag', kjonn: 'alle', sokeTekst: '' }

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function erDame(item: RekorderRow): boolean {
  return (item.kjonn_navn ?? '').toLowerCase().includes('dame')
}

// ── Filtrering og rangering ───────────────────────────────────────────────────

function byggOgFiltrerListe(alleData: RekorderRow[]): RangetRad[] {
  const sok = filtre.sokeTekst.trim().toLowerCase()

  const filtrert = alleData.filter(item => {
    if (item.metode !== filtre.metode) return false
    if (filtre.kjonn === 'damer' && !erDame(item)) return false
    if (filtre.kjonn === 'herrer' && erDame(item)) return false
    if (sok) {
      const namn = kasterNavn({ fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' }).toLowerCase()
      const klubb = (item.klubb_navn ?? '').toLowerCase()
      if (!namn.includes(sok) && !klubb.includes(sok)) return false
    }
    return true
  })

  filtrert.sort((a, b) => (b.poeng ?? 0) - (a.poeng ?? 0))

  let pl = 1
  return filtrert.map((item, i) => {
    if (i > 0 && (item.poeng ?? 0) < (filtrert[i - 1].poeng ?? 0)) pl = i + 1
    return { ...item, plassering: pl }
  })
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function createRekordTabell(liste: RangetRad[]): HTMLElement {
  if (!liste.length) return createEmptyState('Ingen rekorder funnet.')

  const rader = liste.map(item => {
    const slug = lagKasterSlug({ id: item.kasterid ?? 0, fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' })
    const dameCls = erDame(item) ? ' class="rek-dame-rad"' : ''
    const poengHtml = item.stevne_id
      ? `<span class="rek-poeng-celle" title="${escHtml(item.stevne_navn ?? '')}" data-stevneid="${item.stevne_id}">${item.poeng}</span>`
      : String(item.poeng ?? '–')
    return `
      <tr${dameCls}>
        <td>${item.plassering}</td>
        <td><a href="#/kastere/${slug}" class="tl-lenkje">${escHtml(kasterNavn({ fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' }))}</a></td>
        <td>${escHtml(item.klubb_navn ?? '–')}</td>
        <td>${poengHtml}</td>
        <td>${item.ar ?? '–'}</td>
      </tr>`
  }).join('')

  const wrapper = document.createElement('div')
  wrapper.className = 'rek-tabell-wrapper'
  wrapper.appendChild(createTable(
    [
      { label: 'Pl.', class: 'rek-th-pl' },
      { label: 'Navn' },
      { label: 'Klubb' },
      { label: 'Poeng', class: 'rek-th-poeng' },
      { label: 'År', class: 'rek-th-ar' },
    ],
    rader,
  ))
  return wrapper
}

function sideSkelettHtml(): string {
  const metodeOptions = METODAR.map(m =>
    `<option value="${m.verdi}"${m.verdi === filtre.metode ? ' selected' : ''}>${escHtml(m.label)}</option>`
  ).join('')

  return `
    <div class="nc-side">
      <h1 class="rek-tittel">Rekorder</h1>
      <p id="rek-maks-tekst" class="rek-maks-tekst"></p>
      <div class="nc-filter-rad">
        <select id="rek-metode" class="tl-select">${metodeOptions}</select>
        <select id="rek-kjonn" class="tl-select">
          <option value="alle">Alle</option>
          <option value="herrer">Herrer</option>
          <option value="damer">Damer</option>
        </select>
        <input id="rek-sok" type="text" class="tl-select" placeholder="Søk på etternavn/klubb" value="">
      </div>
      <div id="rek-tabell-container"></div>
    </div>`
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filtre.metode = 'kongelag'
  filtre.kjonn = 'alle'
  filtre.sokeTekst = ''

  container.replaceChildren(createLoadingState('Laster rekorder…'))

  try {
    const { data, error } = await hentAlleRekorder()
    if (error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste rekorder.'))
      return
    }

    container.innerHTML = sideSkelettHtml()

    function oppdaterMaksTekst(): void {
      const metode = METODAR.find(m => m.verdi === filtre.metode)!
      container.querySelector<HTMLElement>('#rek-maks-tekst')!.textContent = `(Maks poengsum: ${metode.maxPoeng})`
    }

    function oppdaterTabell(): void {
      container.querySelector<HTMLElement>('#rek-tabell-container')!.replaceChildren(createRekordTabell(byggOgFiltrerListe(data)))
    }

    oppdaterMaksTekst()
    oppdaterTabell()

    container.querySelector<HTMLSelectElement>('#rek-metode')!.addEventListener('change', e => {
      filtre.metode = (e.target as HTMLSelectElement).value
      oppdaterMaksTekst()
      oppdaterTabell()
    })

    container.querySelector<HTMLSelectElement>('#rek-kjonn')!.addEventListener('change', e => {
      filtre.kjonn = (e.target as HTMLSelectElement).value as RekorderFiltre['kjonn']
      oppdaterTabell()
    })

    container.querySelector<HTMLInputElement>('#rek-sok')!.addEventListener('input', e => {
      filtre.sokeTekst = (e.target as HTMLInputElement).value
      oppdaterTabell()
    })

    container.addEventListener('click', e => {
      const celle = (e.target as Element).closest<HTMLElement>('.rek-poeng-celle')
      if (celle?.dataset.stevneid) {
        location.hash = `#/stevne/${celle.dataset.stevneid}/resultat`
      }
    })
  } catch (err) {
    logError('rekorder.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste rekorder.'))
  }
}
