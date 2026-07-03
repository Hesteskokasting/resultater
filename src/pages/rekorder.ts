import { throwerName, buildThrowerSlug } from '@/utils/kaster'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { registerRefetch } from '@/utils/refetchRegistry'
import { getAllRecords } from '@/services/rekorderService'
import type { RecordRow } from '@/services/rekorderService'

// ── Constants ─────────────────────────────────────────────────────────────────

interface MethodConfig {
  value: string
  label: string
  maxPoints: number
}

const METHODS: MethodConfig[] = [
  { value: 'kongelag',  label: 'Kongelag',  maxPoints: 200 },
  { value: 'minimatch', label: 'Minimatch', maxPoints: 300 },
  { value: 'halvmatch', label: 'Halvmatch', maxPoints: 500 },
  { value: 'heilmatch', label: 'Heilmatch', maxPoints: 1000 },
]

// ── Types ─────────────────────────────────────────────────────────────────────

interface RecordsFilter {
  method: string
  gender: 'alle' | 'herrer' | 'damer'
  searchText: string
}

type RankedRow = RecordRow & { placement: number }

// ── State ─────────────────────────────────────────────────────────────────────

const filter: RecordsFilter = { method: 'kongelag', gender: 'alle', searchText: '' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function isFemale(item: RecordRow): boolean {
  return (item.kjonn_navn ?? '').toLowerCase().includes('dame')
}

// ── Filtering and ranking ─────────────────────────────────────────────────────

function buildAndFilterList(allData: RecordRow[]): RankedRow[] {
  const search = filter.searchText.trim().toLowerCase()

  const filtered = allData.filter(item => {
    if (item.metode !== filter.method) return false
    if (filter.gender === 'damer' && !isFemale(item)) return false
    if (filter.gender === 'herrer' && isFemale(item)) return false
    if (search) {
      const name = throwerName({ fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' }).toLowerCase()
      const club = (item.klubb_navn ?? '').toLowerCase()
      if (!name.includes(search) && !club.includes(search)) return false
    }
    return true
  })

  filtered.sort((a, b) => (b.poeng ?? 0) - (a.poeng ?? 0))

  let pl = 1
  return filtered.map((item, i) => {
    if (i > 0 && (item.poeng ?? 0) < (filtered[i - 1]?.poeng ?? 0)) pl = i + 1
    return { ...item, placement: pl }
  })
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function createRecordTable(list: RankedRow[]): HTMLElement {
  if (!list.length) return createEmptyState('Ingen rekorder funnet.')

  const wrapper = document.createElement('div')
  wrapper.className = 'record-table-wrapper'
  wrapper.appendChild(createTable<RankedRow>({
    rows: list,
    rowClass: item => isFemale(item) ? 'record-female-row' : undefined,
    columns: [
      {
        label: 'Pl.',
        thClass: 'record-th-placement',
        render: item => String(item.placement),
      },
      {
        label: 'Navn',
        render: item => {
          const slug = buildThrowerSlug({ id: item.kasterid ?? 0, fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' })
          const a = document.createElement('a')
          a.href = `#/kastere/${slug}`
          a.className = 'tl-link'
          a.textContent = throwerName({ fornavn: item.fornavn ?? '', etternavn: item.etternavn ?? '' })
          return a
        },
      },
      {
        label: 'Klubb',
        render: item => item.klubb_navn ?? '–',
      },
      {
        label: 'Poeng',
        thClass: 'record-th-points',
        render: item => {
          if (!item.stevne_id) return String(item.poeng ?? '–')
          const span = document.createElement('span')
          span.className = 'record-points-cell'
          span.title = item.stevne_navn ?? ''
          span.dataset.tournamentId = String(item.stevne_id)
          span.textContent = String(item.poeng ?? '–')
          return span
        },
      },
      {
        label: 'År',
        thClass: 'record-th-year',
        render: item => String(item.ar ?? '–'),
      },
    ],
  }))
  return wrapper
}

function pageSkeletonHtml(): string {
  const methodOptions = METHODS.map(m =>
    `<option value="${m.value}"${m.value === filter.method ? ' selected' : ''}>${escHtml(m.label)}</option>`
  ).join('')

  return `
    <div class="content-page">
      <h1 class="record-title">Rekorder</h1>
      <p id="record-max-text" class="record-max-text"></p>
      <div class="nc-filter-rad">
        <select id="record-method" class="tl-select">${methodOptions}</select>
        <select id="record-gender" class="tl-select">
          <option value="alle">Alle</option>
          <option value="herrer">Herrer</option>
          <option value="damer">Damer</option>
        </select>
        <input id="record-search" type="text" class="tl-select" placeholder="Søk på etternavn/klubb" value="">
      </div>
      <div id="record-table-container"></div>
    </div>`
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  registerRefetch(() => render(container))
  filter.method = 'kongelag'
  filter.gender = 'alle'
  filter.searchText = ''

  container.replaceChildren(createLoadingState('Laster rekorder…'))

  try {
    const { data, error } = await getAllRecords()
    if (error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste rekorder.'))
      return
    }

    container.innerHTML = pageSkeletonHtml()

    function updateMaxText(): void {
      const method = METHODS.find(m => m.value === filter.method)!
      container.querySelector<HTMLElement>('#record-max-text')!.textContent = `(Maks poengsum: ${method.maxPoints})`
    }

    function updateTable(): void {
      container.querySelector<HTMLElement>('#record-table-container')!.replaceChildren(createRecordTable(buildAndFilterList(data)))
    }

    updateMaxText()
    updateTable()

    container.querySelector<HTMLSelectElement>('#record-method')!.addEventListener('change', e => {
      filter.method = (e.target as HTMLSelectElement).value
      updateMaxText()
      updateTable()
    })

    container.querySelector<HTMLSelectElement>('#record-gender')!.addEventListener('change', e => {
      filter.gender = (e.target as HTMLSelectElement).value as RecordsFilter['gender']
      updateTable()
    })

    container.querySelector<HTMLInputElement>('#record-search')!.addEventListener('input', e => {
      filter.searchText = (e.target as HTMLInputElement).value
      updateTable()
    })

    container.addEventListener('click', e => {
      const cell = (e.target as Element).closest<HTMLElement>('.record-points-cell')
      if (cell?.dataset.tournamentId) {
        location.hash = `#/stevne/${cell.dataset.tournamentId}/resultat`
      }
    })
  } catch (err) {
    logError('rekorder.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste rekorder.'))
  }
}
