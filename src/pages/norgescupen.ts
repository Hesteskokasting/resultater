import { throwerName } from '@/utils/kaster'
import { logError } from '@/utils/logError'
import { bindExpandableRows } from '@/utils/expandableRows'
import { formaterPoeng, buildSingleList, buildTeamList } from '@/utils/norgescup'
import { getRules, getTournamentsAndResults } from '@/services/norgescupService'
import { formatDate, yearOptions } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import type { Tables } from '@/types'
import type { ResultWithRelations, TournamentForNC } from '@/services/norgescupService'
import type { SingleListRow, TeamListRow } from '@/utils/norgescup'
import { escHtml } from '@/utils/escHtml'

const FIRST_YEAR = 2007
const FIRST_MULTI_CUP_YEAR = 2024

interface Filter {
  year: number
  cupType: string
  classNum: number
  view: 'singel' | 'lag'
}

interface NCCache {
  year: number | null
  rules: Tables<'antallTellendeNc'> | null
  tournaments: TournamentForNC[]
  results: ResultWithRelations[]
}

const filter: Filter = {
  year: new Date().getFullYear(),
  cupType: 'NC',
  classNum: 1,
  view: 'singel',
}

let cache: NCCache = {
  year: null,
  rules: null,
  tournaments: [],
  results: [],
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchAndBufferData(year: number): Promise<boolean> {
  if (cache.year === year) return true

  try {
    const [{ data: rules, error: e1 }, { stevner, resultater, error: e2 }] = await Promise.all([
      getRules(year),
      getTournamentsAndResults(year),
    ])

    if (e1 || e2) return false

    cache.year = year
    cache.rules = rules
    cache.tournaments = stevner
    cache.results = resultater
    return true
  } catch (err) {
    logError('fetchAndBufferData', err)
    return false
  }
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function descriptionText(rules: Tables<'antallTellendeNc'>, cupType: string): string {
  if (cupType === 'SNC') return `Dei ${rules.max_snc} beste SNC-stevna er teljande`
  if (cupType === 'DNC') return `Dei ${rules.max_dnc} beste DNC-stevna er teljande`
  return `Dei ${rules.maxtotal} beste stevna, herav maks ${rules.max_nc_total} NC-stevner og ${rules.max_snc_total} SNC-stevner er teljande`
}

function viewTabsHtml(selectedView: string): string {
  return `
    <div class="nc-class-tabs nc-view-tabs">
      <button class="nc-class-tab${selectedView === 'singel' ? ' active' : ''}" data-view="singel">Singel</button>
      <button class="nc-class-tab${selectedView === 'lag' ? ' active' : ''}" data-view="lag">Lag</button>
    </div>`
}

function classTabsHtml(selectedClass: number, year: number): string {
  const tabs = year <= 2025
    ? `<div class="nc-class-tabs">
        <button class="nc-class-tab${selectedClass === 1 ? ' active' : ''}" data-class="1">Klasse 1</button>
        <button class="nc-class-tab${selectedClass === 2 ? ' active' : ''}" data-class="2">Klasse 2</button>
      </div>`
    : ''
  return `
    <div class="nc-class-tabs-wrapper">
      ${tabs}
      <span class="nc-click-hint">Klikk poengsum for å vise detaljer</span>
    </div>`
}

function teamPointsCellContent(points: number): DocumentFragment {
  const frag = document.createDocumentFragment()
  frag.appendChild(document.createTextNode(formaterPoeng(points)))
  const chevron = document.createElement('span')
  chevron.className = 'nc-chevron'
  chevron.textContent = ' ▼'
  frag.appendChild(chevron)
  return frag
}

function createSingleTable(list: SingleListRow[]): HTMLElement {
  if (list.length === 0) return createEmptyState('Ingen resultater funnet.')

  return createTable<SingleListRow>({
    rows: list,
    rowClass: 'nc-single-row',
    rowAttrs: (_, i) => ({ 'data-idx': String(i) }),
    detailRowClass: 'nc-detail-row d-none',
    detailRow: item => createTable({
      rows: item.detaljRader,
      tableClass: 'detalj-tabell',
      theadClass: '',
      columns: [
        { label: 'Dato',   render: r => formatDate(r._stevne?.dato) },
        { label: 'Type',   render: r => r._stevne?.typeNavn ?? '–' },
        { label: 'Stevne', render: r => r._stevne?.navn ?? '–' },
        { label: 'Pl.',    render: r => String(r.plassering ?? '–') },
        { label: 'Poeng',  render: r => formaterPoeng(r.nc_poeng) },
      ],
    }),
    columns: [
      {
        label: 'Pl.',
        thClass: 'nc-td-pl',
        cellClass: 'nc-td-pl',
        render: item => String(item.plassering),
      },
      { label: 'Navn',  render: item => item.navn },
      { label: 'Klubb', render: item => item.klubb },
      {
        label: 'Poeng',
        thClass: 'nc-td-points',
        cellClass: 'nc-td-points nc-points-cell',
        cellAttrs: (_, i) => ({ 'data-idx': String(i) }),
        render: item => teamPointsCellContent(item.totalPoeng),
      },
    ],
  })
}

function createTeamTable(teamList: TeamListRow[]): HTMLElement {
  if (teamList.length === 0) return createEmptyState('Ingen lag funnet.')

  return createTable<TeamListRow>({
    rows: teamList,
    rowClass: 'nc-team-row',
    rowAttrs: (_, i) => ({ 'data-team-idx': String(i) }),
    detailRowClass: 'nc-team-detail-row d-none',
    detailRow: item => createTable({
      rows: item.bidragsytere,
      tableClass: 'detalj-tabell',
      showHeader: false,
      columns: [
        { label: '', render: b => throwerName(b.kaster) },
        { label: '', cellClass: 'nc-td-points', render: b => formaterPoeng(b.sum) },
      ],
    }),
    columns: [
      {
        label: 'Pl.',
        thClass: 'nc-td-pl',
        cellClass: 'nc-td-pl',
        render: item => String(item.plassering),
      },
      { label: 'Klubb', render: item => item.klubb?.navn ?? '–' },
      {
        label: 'Poeng',
        thClass: 'nc-td-points',
        cellClass: 'nc-td-points nc-team-points-cell',
        cellAttrs: (_, i) => ({ 'data-team-idx': String(i) }),
        render: item => teamPointsCellContent(item.lagTotal),
      },
    ],
  })
}

function pageSkeletonHtml(year: number, cupType: string): string {
  return `
    <div class="content-page">
      <h1 class="nc-main-title">Norgescupen ${year}</h1>
      <div class="nc-filter-rad">
        <select id="nc-year" class="tl-select">${yearOptions(year, FIRST_YEAR)}</select>
        <select id="nc-cuptype" class="tl-select${year < FIRST_MULTI_CUP_YEAR ? ' d-none' : ''}">
          <option value="NC"${cupType === 'NC' ? ' selected' : ''}>NC</option>
          <option value="SNC"${cupType === 'SNC' ? ' selected' : ''}>SNC</option>
          <option value="DNC"${cupType === 'DNC' ? ' selected' : ''}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-view-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filter.year = new Date().getFullYear()
  filter.cupType = 'NC'
  filter.classNum = 1
  filter.view = 'singel'
  cache = { year: null, rules: null, tournaments: [], results: [] }

  container.replaceChildren(createLoadingState('Laster Norgescupen...'))

  const ok = await fetchAndBufferData(filter.year)
  if (!ok) {
    container.replaceChildren(createErrorBanner('Kunne ikkje laste data for Norgescupen.'))
    return
  }

  container.innerHTML = pageSkeletonHtml(filter.year, filter.cupType)

  function updateView(): void {
    const { year, cupType, classNum, view } = filter
    const { rules } = cache
    const content = container.querySelector<HTMLElement>('#nc-content')!

    ;(container.querySelector('.nc-main-title') as HTMLElement).textContent = `Norgescupen ${year}`
    container.querySelector('#nc-cuptype')!.classList.toggle('d-none', year < FIRST_MULTI_CUP_YEAR)

    container.querySelector('#nc-view-tabs-container')!.innerHTML =
      cupType === 'NC' ? viewTabsHtml(view) : ''

    if (view === 'lag' && cupType === 'NC') {
      content.innerHTML = `
        <section>
          <h2 class="nc-section-title">NC Lag ${year} (Kun klasse 1)</h2>
          <p class="nc-description">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-click-hint nc-click-hint-row">Klikk poengsum for å vise detaljar</div>
          <div id="nc-team-table-container"></div>
        </section>`

      const teamContainer = content.querySelector<HTMLElement>('#nc-team-table-container')!
      if (!rules) {
        teamContainer.replaceChildren(createEmptyState('Ingen data.'))
      } else {
        const teamList = buildTeamList(cache.results, cache.tournaments, rules, year < 2026)
        teamContainer.replaceChildren(createTeamTable(teamList))
        bindExpandableRows(teamContainer, { triggerSel: '.nc-team-points-cell', idAttr: 'team-idx', detailSel: '.nc-team-detail-row', lookupRoot: content })
      }
    } else {
      content.innerHTML = `
        <section id="nc-single-section">
          <h2 class="nc-section-title">${escHtml(cupType)} Singel ${year}${year <= 2025 ? ` - Klasse ${classNum}` : ''}</h2>
          <p class="nc-description">${rules ? descriptionText(rules, cupType) : `Ingen telleregel funnet for ${year}`}</p>
          <div id="nc-class-tabs-container">${classTabsHtml(classNum, year)}</div>
          <div id="nc-single-table-container"></div>
        </section>`

      const singleContainer = content.querySelector<HTMLElement>('#nc-single-table-container')!
      if (!rules) {
        singleContainer.replaceChildren(createEmptyState('Ingen data.'))
      } else {
        const singleList = buildSingleList(cache.results, cache.tournaments, rules, cupType, classNum, year < 2026)
        singleContainer.replaceChildren(createSingleTable(singleList))
        bindExpandableRows(singleContainer, { triggerSel: '.nc-points-cell', idAttr: 'idx', detailSel: '.nc-detail-row', lookupRoot: content })
      }

      content.querySelector('#nc-single-section')!.addEventListener('click', e => {
        const tab = (e.target as Element).closest<HTMLElement>('[data-class]')
        if (!tab) return
        filter.classNum = Number(tab.dataset.class)
        updateView()
      })
    }
  }

  updateView()

  container.querySelector<HTMLSelectElement>('#nc-year')!.addEventListener('change', async e => {
    filter.year = Number((e.target as HTMLSelectElement).value)
    filter.classNum = 1
    if (filter.year < FIRST_MULTI_CUP_YEAR) {
      filter.cupType = 'NC'
      filter.view = 'singel'
      container.querySelector<HTMLSelectElement>('#nc-cuptype')!.value = 'NC'
    }
    container.querySelector<HTMLElement>('#nc-content')!.replaceChildren(createLoadingState())
    const ok = await fetchAndBufferData(filter.year)
    if (!ok) {
      container.querySelector<HTMLElement>('#nc-content')!.replaceChildren(createErrorBanner('Feil ved henting av data.'))
      return
    }
    updateView()
  })

  container.querySelector<HTMLSelectElement>('#nc-cuptype')!.addEventListener('change', e => {
    filter.cupType = (e.target as HTMLSelectElement).value
    filter.classNum = 1
    if (filter.cupType !== 'NC') filter.view = 'singel'
    updateView()
  })

  container.querySelector('#nc-view-tabs-container')!.addEventListener('click', e => {
    const tab = (e.target as Element).closest<HTMLElement>('[data-view]')
    if (!tab) return
    filter.view = tab.dataset.view as 'singel' | 'lag'
    updateView()
  })
}
