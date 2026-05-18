import { lagKasterSlug, kasterNavn } from '../utils/kaster'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { createEmptyState } from '../components/EmptyState'
import { createTable } from '../components/Table'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { hentNmData } from '../services/nmvinnereService'
import type { NmKategoriKonfig, NmKjonn, NmResultatRow } from '../services/nmvinnereService'

// ── Konstanter ────────────────────────────────────────────────────────────────

const KATEGORIAR: NmKategoriKonfig[] = [
  { id: 1,  namn: 'Singel',       kjonnFilter: 'historisk', fraaAr: 1985, aapentFraAr: 2013, merknad: '(åpen klasse fra 2013)' },
  { id: 2,  namn: 'Par',          kjonnFilter: 'historisk', fraaAr: 1987, aapentFraAr: 2009, merknad: '(åpen klasse fra 2009)' },
  { id: 3,  namn: 'Mix',          kjonnFilter: false,       fraaAr: 1986, merknad: '(NM Mix 2011 ble ikke arrangert)' },
  { id: 4,  namn: 'Lag',          kjonnFilter: false,       fraaAr: 2016 },
  { id: 7,  namn: 'X-kast',       kjonnFilter: 'historisk', fraaAr: 2009, aapentFraAr: 2013, merknad: '(åpen klasse fra 2013)' },
  { id: 9,  namn: 'Hesteskogolf', kjonnFilter: 'alltid',    fraaAr: 2006 },
  { id: 10, namn: 'Kongelag',     kjonnFilter: false,       fraaAr: 2023 },
]

// ── Typar ─────────────────────────────────────────────────────────────────────

type NmKaster = NonNullable<NmResultatRow['kaster']>

interface VinnareEntry {
  ar: number | null
  stevneId: number | undefined
  kastere: NmKaster[]
  klubb: NmResultatRow['klubb']
}

// ── Tilstand ──────────────────────────────────────────────────────────────────

const filtre: { kategoriId: number; kjonn: NmKjonn } = { kategoriId: 1, kjonn: 'open' }

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function hentAr(datoStr: string | null | undefined): number | null {
  return datoStr ? parseInt(datoStr.substring(0, 4)) : null
}

function defaultKjonn(kjonnFilter: NmKategoriKonfig['kjonnFilter']): NmKjonn {
  return kjonnFilter === 'alltid' ? 'alle' : 'open'
}

function subtittelTekst(kategorinavn: string, kjonn: NmKjonn): string {
  if (kjonn === 'herrer') return `${kategorinavn} Herrer`
  if (kjonn === 'damer')  return `${kategorinavn} Damer`
  return kategorinavn
}

// ── Filtrering og gruppering ──────────────────────────────────────────────────

function byggListe(alleData: NmResultatRow[]): VinnareEntry[] {
  const gruppeMap = new Map<string, VinnareEntry>()
  for (const r of alleData) {
    const nokkel = `${r.stevne?.id}-${r.klasseid}`
    if (!gruppeMap.has(nokkel)) {
      gruppeMap.set(nokkel, {
        ar: hentAr(r.stevne?.dato),
        stevneId: r.stevne?.id,
        kastere: [],
        klubb: r.klubb,
      })
    }
    if (r.kaster) gruppeMap.get(nokkel)!.kastere.push(r.kaster)
  }
  return [...gruppeMap.values()].sort((a, b) => (b.ar ?? 0) - (a.ar ?? 0))
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function kasterLenkjeHtml(k: NmKaster): string {
  return `<a href="#/kastere/${lagKasterSlug(k)}" class="tl-lenkje">${escHtml(kasterNavn(k))}</a>`
}

function createNmTabell(liste: VinnareEntry[]): HTMLElement {
  if (!liste.length) return createEmptyState('Ingen vinnere funnet.')

  const rader = liste.map(({ ar, stevneId, kastere, klubb }) => {
    const namnHtml = kastere.map(kasterLenkjeHtml).join(' og ') || '–'
    const arHtml = stevneId
      ? `<a href="#/stevne/${stevneId}/resultat" class="tl-lenkje">${ar ?? '–'}</a>`
      : String(ar ?? '–')
    return `
      <tr>
        <td class="nm-td-ar">${arHtml}</td>
        <td>${namnHtml}</td>
        <td>${escHtml(klubb?.navn ?? '–')}</td>
      </tr>`
  }).join('')

  const wrapper = document.createElement('div')
  wrapper.className = 'nm-tabell-wrapper'
  wrapper.appendChild(createTable(
    [{ label: 'År', class: 'nm-td-ar' }, { label: 'Navn' }, { label: 'Klubb' }],
    rader,
  ))
  return wrapper
}

function sideSkelettHtml(kategori: NmKategoriKonfig, maxAr: number): string {
  const tittel = `Norgesmestere ${kategori.fraaAr} - ${maxAr}`

  const katOptions = KATEGORIAR.map(k =>
    `<option value="${k.id}"${k.id === filtre.kategoriId ? ' selected' : ''}>${escHtml(k.namn)}</option>`
  ).join('')

  let kjonnHtml = ''
  if (kategori.kjonnFilter === 'historisk') {
    kjonnHtml = `
      <select id="nm-kjonn" class="tl-select">
        <option value="open"${filtre.kjonn === 'open' ? ' selected' : ''}>Åpen klasse</option>
        <option value="herrer"${filtre.kjonn === 'herrer' ? ' selected' : ''}>Herrer</option>
        <option value="damer"${filtre.kjonn === 'damer' ? ' selected' : ''}>Damer</option>
      </select>`
  } else if (kategori.kjonnFilter === 'alltid') {
    kjonnHtml = `
      <select id="nm-kjonn" class="tl-select">
        <option value="alle"${filtre.kjonn === 'alle' ? ' selected' : ''}>Alle</option>
        <option value="herrer"${filtre.kjonn === 'herrer' ? ' selected' : ''}>Herrer</option>
        <option value="damer"${filtre.kjonn === 'damer' ? ' selected' : ''}>Damer</option>
      </select>`
  }

  return `
    <div class="nc-side">
      <div class="nc-filter-rad">
        <select id="nm-kategori" class="tl-select">${katOptions}</select>
        ${kjonnHtml}
      </div>
      <h1 class="nm-tittel">${escHtml(tittel)}</h1>
      <h2 id="nm-undertittel" class="nm-undertittel">${escHtml(subtittelTekst(kategori.namn, filtre.kjonn))}</h2>
      <p class="nm-merknad">${kategori.merknad ? escHtml(kategori.merknad) : ''}</p>
      <div id="nm-tabell-container"></div>
    </div>`
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderKategori(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState('Laster NM-vinnere…'))

  const kategori = KATEGORIAR.find(k => k.id === filtre.kategoriId)!

  try {
    const { data, error } = await hentNmData(kategori, filtre.kjonn)
    if (error) {
      logError('nmvinnere.renderKategori', error)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste NM-vinnere.'))
      return
    }

    const maxAr = data.reduce((m, r) => Math.max(m, hentAr(r.stevne?.dato) ?? 0), 0) || new Date().getFullYear()
    container.innerHTML = sideSkelettHtml(kategori, maxAr)
    container.querySelector<HTMLElement>('#nm-tabell-container')!.replaceChildren(createNmTabell(byggListe(data)))

    const kategoriEl = container.querySelector<HTMLSelectElement>('#nm-kategori')!
    kategoriEl.addEventListener('change', async () => {
      filtre.kategoriId = Number(kategoriEl.value)
      const nyKat = KATEGORIAR.find(k => k.id === filtre.kategoriId)!
      filtre.kjonn = defaultKjonn(nyKat.kjonnFilter)
      await renderKategori(container)
    })

    const kjonnEl = container.querySelector<HTMLSelectElement>('#nm-kjonn')
    kjonnEl?.addEventListener('change', async () => {
      filtre.kjonn = kjonnEl.value as NmKjonn
      await renderKategori(container)
    })
  } catch (err) {
    logError('nmvinnere.renderKategori', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste NM-vinnere.'))
  }
}

export async function render(container: HTMLElement): Promise<void> {
  filtre.kategoriId = 1
  filtre.kjonn = defaultKjonn(KATEGORIAR[0].kjonnFilter)
  await renderKategori(container)
}
