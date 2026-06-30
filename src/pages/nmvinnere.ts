import { buildThrowerSlug, throwerName } from '@/utils/kaster'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { getNMData } from '@/services/nmvinnereService'
import type { NMCategoryConfig, NMGender, NMResultRow } from '@/services/nmvinnereService'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: NMCategoryConfig[] = [
  { id: 1,  navn: 'Singel',       kjonnFilter: 'historisk', fraaAr: 1985, aapentFraAr: 2013, merknad: '(åpen klasse fra 2013)' },
  { id: 2,  navn: 'Par',          kjonnFilter: 'historisk', fraaAr: 1987, aapentFraAr: 2009, merknad: '(åpen klasse fra 2009)' },
  { id: 3,  navn: 'Mix',          kjonnFilter: false,       fraaAr: 1986, merknad: '(NM Mix 2011 ble ikke arrangert)' },
  { id: 4,  navn: 'Lag',          kjonnFilter: false,       fraaAr: 2016 },
  { id: 7,  navn: 'X-kast',       kjonnFilter: 'historisk', fraaAr: 2009, aapentFraAr: 2013, merknad: '(åpen klasse fra 2013)' },
  { id: 9,  navn: 'Hesteskogolf', kjonnFilter: 'alltid',    fraaAr: 2006 },
  { id: 10, navn: 'Kongelag',     kjonnFilter: false,       fraaAr: 2023 },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type NmThrower = NonNullable<NMResultRow['kaster']>

interface WinnersEntry {
  year: number | null
  tournamentId: number | undefined
  throwers: NmThrower[]
  klubb: NMResultRow['klubb']
}

// ── State ─────────────────────────────────────────────────────────────────────

const filter: { categoryId: number; gender: NMGender } = { categoryId: 1, gender: 'open' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractYear(dateStr: string | null | undefined): number | null {
  return dateStr ? parseInt(dateStr.substring(0, 4)) : null
}

function defaultGender(kjonnFilter: NMCategoryConfig['kjonnFilter']): NMGender {
  return kjonnFilter === 'alltid' ? 'alle' : 'open'
}

function subtitleText(categoryName: string, gender: NMGender): string {
  if (gender === 'herrer') return `${categoryName} Herrer`
  if (gender === 'damer')  return `${categoryName} Damer`
  return categoryName
}

// ── Filtering and grouping ────────────────────────────────────────────────────

function buildList(allData: NMResultRow[]): WinnersEntry[] {
  const groupMap = new Map<string, WinnersEntry>()
  for (const r of allData) {
    const key = `${r.stevne?.id}-${r.klasseid}`
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        year: extractYear(r.stevne?.dato),
        tournamentId: r.stevne?.id,
        throwers: [],
        klubb: r.klubb,
      })
    }
    if (r.kaster) groupMap.get(key)!.throwers.push(r.kaster)
  }
  return [...groupMap.values()].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function createNMTable(list: WinnersEntry[]): HTMLElement {
  if (!list.length) return createEmptyState('Ingen vinnere funnet.')

  function throwerLink(k: NmThrower): HTMLAnchorElement {
    const a = document.createElement('a')
    a.href = `#/kastere/${buildThrowerSlug(k)}`
    a.className = 'tl-link'
    a.textContent = throwerName(k)
    return a
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'nm-table-wrapper'
  wrapper.appendChild(createTable<WinnersEntry>({
    rows: list,
    columns: [
      {
        label: 'År',
        thClass: 'nm-td-ar',
        cellClass: 'nm-td-ar',
        render: ({ year, tournamentId }) => {
          if (!tournamentId) return String(year ?? '–')
          const a = document.createElement('a')
          a.href = `#/stevne/${tournamentId}/resultat`
          a.className = 'tl-link'
          a.textContent = String(year ?? '–')
          return a
        },
      },
      {
        label: 'Navn',
        render: ({ throwers }) => {
          if (!throwers.length) return '–'
          const frag = document.createDocumentFragment()
          throwers.forEach((k, i) => {
            if (i > 0) frag.appendChild(document.createTextNode(' og '))
            frag.appendChild(throwerLink(k))
          })
          return frag
        },
      },
      {
        label: 'Klubb',
        render: ({ klubb }) => klubb?.navn ?? '–',
      },
    ],
  }))
  return wrapper
}

function pageSkeletonHtml(category: NMCategoryConfig, maxYear: number): string {
  const title = `Norgesmestere ${category.fraaAr} - ${maxYear}`

  const categoryOptions = CATEGORIES.map(k =>
    `<option value="${k.id}"${k.id === filter.categoryId ? ' selected' : ''}>${escHtml(k.navn)}</option>`
  ).join('')

  let genderHtml = ''
  if (category.kjonnFilter === 'historisk') {
    genderHtml = `
      <select id="nm-gender" class="tl-select">
        <option value="open"${filter.gender === 'open' ? ' selected' : ''}>Åpen klasse</option>
        <option value="herrer"${filter.gender === 'herrer' ? ' selected' : ''}>Herrer</option>
        <option value="damer"${filter.gender === 'damer' ? ' selected' : ''}>Damer</option>
      </select>`
  } else if (category.kjonnFilter === 'alltid') {
    genderHtml = `
      <select id="nm-gender" class="tl-select">
        <option value="alle"${filter.gender === 'alle' ? ' selected' : ''}>Alle</option>
        <option value="herrer"${filter.gender === 'herrer' ? ' selected' : ''}>Herrer</option>
        <option value="damer"${filter.gender === 'damer' ? ' selected' : ''}>Damer</option>
      </select>`
  }

  return `
    <div class="content-page">
      <div class="nc-filter-rad">
        <select id="nm-category" class="tl-select">${categoryOptions}</select>
        ${genderHtml}
      </div>
      <h1 class="nm-title">${escHtml(title)}</h1>
      <h2 id="nm-subtitle" class="nm-subtitle">${escHtml(subtitleText(category.navn, filter.gender))}</h2>
      <p class="nm-note">${category.merknad ? escHtml(category.merknad) : ''}</p>
      <div id="nm-table-container"></div>
    </div>`
}

// ── Render ────────────────────────────────────────────────────────────────────

async function renderCategory(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState('Laster NM-vinnere…'))

  const category = CATEGORIES.find(k => k.id === filter.categoryId)!

  try {
    const { data, error } = await getNMData(category, filter.gender)
    if (error) {
      logError('nmvinnere.renderCategory', error)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste NM-vinnere.'))
      return
    }

    const maxYear = data.reduce((m, r) => Math.max(m, extractYear(r.stevne?.dato) ?? 0), 0) || new Date().getFullYear()
    container.innerHTML = pageSkeletonHtml(category, maxYear)
    container.querySelector<HTMLElement>('#nm-table-container')!.replaceChildren(createNMTable(buildList(data)))

    const categoryEl = container.querySelector<HTMLSelectElement>('#nm-category')!
    categoryEl.addEventListener('change', async () => {
      filter.categoryId = Number(categoryEl.value)
      const newCategory = CATEGORIES.find(k => k.id === filter.categoryId)!
      filter.gender = defaultGender(newCategory.kjonnFilter)
      await renderCategory(container)
    })

    const genderEl = container.querySelector<HTMLSelectElement>('#nm-gender')
    genderEl?.addEventListener('change', async () => {
      filter.gender = genderEl.value as NMGender
      await renderCategory(container)
    })
  } catch (err) {
    logError('nmvinnere.renderCategory', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste NM-vinnere.'))
  }
}

export async function render(container: HTMLElement): Promise<void> {
  filter.categoryId = 1
  filter.gender = defaultGender(CATEGORIES[0]!.kjonnFilter)
  await renderCategory(container)
}
