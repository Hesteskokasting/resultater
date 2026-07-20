import { Capacitor } from '@capacitor/core'
import type { AuthUser } from '@/types'
import { getUser } from '@/services/authService'
import { getScheduleTournaments, getFilterOptions, getRegistrationsForThrower } from '@/services/stevneService'
import type { ScheduleTournamentRow } from '@/services/stevneService'
import { formatDateLong, yearOptions, downloadExcel } from '@/utils/shared'
import { buildDropdownOptions } from '@/utils/buildDropdownOptions'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { registerRefetch } from '@/utils/refetchRegistry'
import { bindRegistrationSlots } from '@/components/PameldingKnapp'
import { createSearchInput } from '@/components/SearchInput'

type TournamentRow = ScheduleTournamentRow

// ── Sorting ───────────────────────────────────────────────────────────────────

const sort: { column: string; direction: 'asc' | 'desc' } = { column: 'dato', direction: 'asc' }

function sortValue(s: TournamentRow, column: string): string {
  switch (column) {
    case 'navn':          return s.navn ?? ''
    case 'dato':          return s.dato ?? ''
    case 'sted':          return s.sted ?? ''
    case 'metode':        return [s.innledende?.navn, s.avsluttende?.navn].filter((v): v is string => Boolean(v)).join(' ')
    case 'organizer':     return s.klubb?.navn ?? ''
    case 'type':          return s.stevnetype?.navn ?? ''
    case 'klassifisering': return s.kategori?.navn ?? ''
    default:              return ''
  }
}

function sortData(data: TournamentRow[]): TournamentRow[] {
  return [...data].sort((a, b) => {
    const va = sortValue(a, sort.column)
    const vb = sortValue(b, sort.column)
    const cmp = va.localeCompare(vb, 'nb')
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

// ── Filter state ──────────────────────────────────────────────────────────────

const filter = {
  year:             new Date().getFullYear(),
  searchText:       '',
  tournamentTypeId: '',
  throwingMethodId: '',
  clubId:           '',
  categoryId:       '',
}

let allData: TournamentRow[] = []
let _auth: AuthUser | null = null
let _registeredMap: Map<number, number> = new Map()

// ── Client-side filtering ─────────────────────────────────────────────────────

function filterData(data: TournamentRow[]): TournamentRow[] {
  return data.filter(s => {
    if (filter.searchText) {
      const search = filter.searchText.toLowerCase()
      const matched = [
        s.navn, s.sted,
        s.klubb?.navn,
        s.stevnetype?.navn,
        s.kategori?.navn,
        s.innledende?.navn,
        s.avsluttende?.navn,
      ].some(field => field?.toLowerCase().includes(search))
      if (!matched) return false
    }

    if (filter.tournamentTypeId && String(s.stevnetype?.id) !== filter.tournamentTypeId) return false

    if (filter.throwingMethodId) {
      const id = filter.throwingMethodId
      const matched = String(s.innledende?.id) === id || String(s.avsluttende?.id) === id
      if (!matched) return false
    }

    if (filter.clubId     && String(s.klubb?.id)    !== filter.clubId)     return false
    if (filter.categoryId && String(s.kategori?.id) !== filter.categoryId) return false

    return true
  })
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function exportToExcel(filtered: TournamentRow[]): Promise<void> {
  const rows = filtered.map(s => ({
    'Dato': s.dato ? new Date(s.dato).toLocaleDateString('nb-NO') : '',
    'Navn': s.navn ?? '',
    'Sted': s.sted ?? '',
    'Arrangør': s.klubb?.navn ?? '',
    'Stevnetype': s.stevnetype?.navn ?? '',
    'Kastemetode (innledende)': s.innledende?.navn ?? '',
    'Kastemetode (avsluttende)': s.avsluttende?.navn ?? '',
    'Kategori': s.kategori?.navn ?? '',
    'NM': s.ernm ? 'Ja' : 'Nei',
    'InnbydelseUrl': s.innbydelseurl ?? '',
  }))
  await downloadExcel(rows, `terminliste-${filter.year}.xlsx`, 'Terminliste')
}

// ── Table (desktop) ───────────────────────────────────────────────────────────

const tableColumns = [
  { id: 'navn',          label: 'Stevne' },
  { id: 'dato',          label: 'Dato' },
  { id: 'sted',          label: 'Sted' },
  { id: 'metode',        label: 'Metode' },
  { id: 'organizer',     label: 'Arrangør' },
  { id: 'type',          label: 'Type' },
  { id: 'klassifisering', label: 'Klassifisering' },
]

function sortIconHtml(column: string): string {
  if (sort.column !== column) return '<span class="tl-sort-icon">↕</span>'
  return sort.direction === 'asc'
    ? '<span class="tl-sort-icon active">↑</span>'
    : '<span class="tl-sort-icon active">↓</span>'
}

function tableRowHtml(s: TournamentRow): string {
  const date     = s.dato ? new Date(s.dato + 'T12:00:00').toLocaleDateString('nb-NO') : ''
  const method   = [s.innledende?.navn, s.avsluttende?.navn].filter((v): v is string => Boolean(v)).join(' \\ ')
  const nm       = s.ernm ? '<span class="tl-nm-merke">NM</span> ' : ''
  const invitation = s.innbydelseurl
    ? `<a href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener" class="tl-invitation-icon" title="Innbydelse">📄</a>`
    : ''
  return `<tr class="tl-tr">
    <td><a class="tl-link" href="#/stevne/${s.id}/resultat">${nm}${escHtml(s.navn ?? '')}</a></td>
    <td>${date}</td>
    <td>${escHtml(s.sted ?? '')}</td>
    <td>${escHtml(method)}</td>
    <td>${escHtml(s.klubb?.navn ?? '')}</td>
    <td>${escHtml(s.stevnetype?.navn ?? '')}</td>
    <td>${escHtml(s.kategori?.navn ?? '')}</td>
    <td>${invitation}</td>
  </tr>`
}

function tableHtml(filtered: TournamentRow[]): string {
  if (filtered.length === 0) return '<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>'
  const thead = `<thead><tr>
    ${tableColumns.map(k => `<th class="tl-th" data-column="${k.id}">${k.label}${sortIconHtml(k.id)}</th>`).join('')}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`
  const tbody = `<tbody>${sortData(filtered).map(tableRowHtml).join('')}</tbody>`
  return `<table class="tl-table">${thead}${tbody}</table>`
}

function buildView(filtered: TournamentRow[]): string {
  return window.innerWidth > 600 ? tableHtml(filtered) : buildList(filtered)
}

// ── Card (mobile) ─────────────────────────────────────────────────────────────

function cardHtml(s: TournamentRow): string {
  const date     = formatDateLong(s.dato)
  const place    = s.sted ? `<p class="tl-detail">Sted: ${escHtml(s.sted)}</p>` : ''
  const organizer = s.klubb ? `<p class="tl-detail">Arrangør: ${escHtml(s.klubb.navn ?? '')}</p>` : ''
  const type     = s.stevnetype ? `<p class="tl-detail">Type: ${escHtml(s.stevnetype.navn ?? '')}</p>` : ''
  const nm       = s.ernm ? '<span class="tl-nm-merke">NM</span>' : ''
  const invitation = s.innbydelseurl
    ? `<a class="tl-invitation-link" href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`
    : ''
  const result   = s.resultaturl
    ? `<a class="tournament-link" href="#/stevne/${s.id}/resultat">Vis resultat</a>`
    : ''

  const isUpcoming   = s.dato && new Date(s.dato + 'T12:00:00') > new Date()
  const notStarted   = s.stevne_fase === null || s.stevne_fase === 'ikke_startet'
  const hasAccess    = _auth?.profil?.kobling_status === 'godkjent'
  const registrationSlot = hasAccess && isUpcoming && notStarted && !s.erfullfort
    ? `<span data-registration-slot="${s.id}"></span>`
    : ''

  return `
    <div class="tournament-card tl-kort">
      <a class="tl-name tl-name-link" href="#/stevne/${s.id}/resultat">${nm}${escHtml(s.navn ?? '')}</a>
      <p class="tournament-date">${date}</p>
      ${place}${organizer}${type}
      ${invitation}${result}${registrationSlot}
    </div>
  `
}

function buildList(filtered: TournamentRow[]): string {
  if (filtered.length === 0) {
    return '<p class="empty-state">Ingen stevner funnet med valgte filtre.</p>'
  }
  return `<div class="tournament-list">${filtered.map(cardHtml).join('')}</div>`
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  registerRefetch(() => render(container))
  container.replaceChildren(createLoadingState('Laster terminliste…'))

  try {
    const [{ data, error }, { data: filterOptions }, auth] = await Promise.all([
      getScheduleTournaments(filter.year),
      getFilterOptions(),
      getUser(),
    ])
    _auth = auth
    _registeredMap = auth?.profil?.kasterid != null
      ? await getRegistrationsForThrower(auth.profil.kasterid)
      : new Map()

    if (error) {
      logError('terminliste.render', error)
      container.replaceChildren(createErrorBanner('Kunne ikkje laste terminliste.'))
      return
    }

    allData = data ?? []

    const isNative = Capacitor.isNativePlatform()
    const excelButtonHtml = isNative ? '' : '<button class="tl-excel-button" id="tl-excel-desktop">⬇ Excel</button>'
    const excelButtonMobileHtml = isNative ? '' : '<button class="tl-excel-button" id="tl-excel-mobile">⬇ Excel</button>'

    // Same select set renders twice: desktop filter row ('') and mobile bottom sheet ('-mobil')
    function filterSelects(suffix: '' | '-mobil'): Record<'year' | 'tournamentType' | 'throwingMethod' | 'organizer' | 'category', string> {
      return {
        year:           `<select class="tl-select" id="tl-year${suffix}">${yearOptions(filter.year, 1983, new Date().getFullYear() + 1)}</select>`,
        tournamentType: `<select class="tl-select" id="tl-tournamenttype${suffix}">${buildDropdownOptions(filterOptions.stevnetyper, filter.tournamentTypeId, 'Alle typer')}</select>`,
        throwingMethod: `<select class="tl-select" id="tl-throwingmethod${suffix}">${buildDropdownOptions(filterOptions.kastemetoder, filter.throwingMethodId, 'Alle metoder')}</select>`,
        organizer:      `<select class="tl-select" id="tl-organizer${suffix}">${buildDropdownOptions(filterOptions.klubber, filter.clubId, 'Alle arrangører')}</select>`,
        category:       `<select class="tl-select" id="tl-category${suffix}">${buildDropdownOptions(filterOptions.kategorier, filter.categoryId, 'Alle kategorier')}</select>`,
      }
    }
    const desktopSel = filterSelects('')
    const mobileSel  = filterSelects('-mobil')

    container.innerHTML = `
      <div class="terminliste">
        <h1 class="tl-title">Terminliste ${filter.year}</h1>

        <!-- Desktop filter row -->
        <div class="tl-filter-row">
          ${desktopSel.year}
          <span id="tl-text-slot"></span>
          ${desktopSel.tournamentType}
          ${desktopSel.throwingMethod}
          ${desktopSel.organizer}
          ${desktopSel.category}
          ${excelButtonHtml}
        </div>

        <!-- Mobile row -->
        <div class="tl-mobile-row">
          <span id="tl-text-mobile-slot"></span>
          <button class="tl-filter-button" id="tl-filter-open">Filter ≡</button>
          ${excelButtonMobileHtml}
        </div>

        <p class="tl-count"></p>

        <div class="tl-list-container"></div>
      </div>

      <!-- Bottom sheet for mobile filters -->
      <div class="tl-sheet-backdrop" id="tl-backdrop"></div>
      <div class="tl-sheet" id="tl-sheet">
        <div class="tl-sheet-content">
          <h2 class="tl-sheet-title">Filtre</h2>
          <label class="tl-label">År
            ${mobileSel.year}
          </label>
          <label class="tl-label">Stevnetype
            ${mobileSel.tournamentType}
          </label>
          <label class="tl-label">Kastemetode
            ${mobileSel.throwingMethod}
          </label>
          <label class="tl-label">Arrangør
            ${mobileSel.organizer}
          </label>
          <label class="tl-label">Kategori
            ${mobileSel.category}
          </label>
          <div class="tl-sheet-buttons">
            <button class="tl-reset-button" id="tl-reset">Tilbakestill</button>
            <button class="tl-apply-button" id="tl-apply">Bruk filter</button>
          </div>
        </div>
      </div>
    `

    function updateList(): TournamentRow[] {
      const filtered = filterData(allData)
      const listEl   = container.querySelector<HTMLElement>('.tl-list-container')
      if (!listEl) return filtered
      listEl.innerHTML = buildView(filtered)
      const countEl     = container.querySelector('.tl-count')
      if (countEl) countEl.textContent = `${filtered.length} stevner`
      const throwerId = _auth?.profil?.kasterid
      const userId    = _auth?.user.id
      if (throwerId != null && userId) bindRegistrationSlots(listEl, throwerId, userId, _registeredMap)
      return filtered
    }

    updateList()

    if (auth?.profil && (auth.profil.role === 'admin' || auth.profil.role === 'klubbadmin')) {
      const bar = document.createElement('div')
      bar.className = 'mb-3 px-2 d-flex gap-2'
      bar.innerHTML = '<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>'
      container.querySelector('.terminliste')?.prepend(bar)
    }

    // ── Event listeners ──

    const textInput = createSearchInput({
      slot: container.querySelector('#tl-text-slot')!,
      state: filter,
      onInput: () => updateList(),
    })
    const textMobileInput = createSearchInput({
      slot: container.querySelector('#tl-text-mobile-slot')!,
      state: filter,
      onInput: () => updateList(),
    })

    const listContainer           = container.querySelector<HTMLElement>('.tl-list-container')!
    const yearSelect              = container.querySelector<HTMLSelectElement>('#tl-year')!
    const tournamentTypeSelect    = container.querySelector<HTMLSelectElement>('#tl-tournamenttype')!
    const throwingMethodSelect    = container.querySelector<HTMLSelectElement>('#tl-throwingmethod')!
    const organizerSelect         = container.querySelector<HTMLSelectElement>('#tl-organizer')!
    const categorySelect          = container.querySelector<HTMLSelectElement>('#tl-category')!
    const filterOpenBtn           = container.querySelector<HTMLButtonElement>('#tl-filter-open')!
    const sheet                   = container.querySelector<HTMLElement>('#tl-sheet')!
    const backdrop                = container.querySelector<HTMLElement>('#tl-backdrop')!
    const resetBtn                = container.querySelector<HTMLButtonElement>('#tl-reset')!
    const applyBtn                = container.querySelector<HTMLButtonElement>('#tl-apply')!
    const yearMobileSelect        = container.querySelector<HTMLSelectElement>('#tl-year-mobil')!
    const tournamentTypeMobSelect = container.querySelector<HTMLSelectElement>('#tl-tournamenttype-mobil')!
    const throwingMethodMobSelect = container.querySelector<HTMLSelectElement>('#tl-throwingmethod-mobil')!
    const organizerMobSelect      = container.querySelector<HTMLSelectElement>('#tl-organizer-mobil')!
    const categoryMobSelect       = container.querySelector<HTMLSelectElement>('#tl-category-mobil')!

    listContainer.addEventListener('click', e => {
      const th = (e.target as Element).closest<HTMLElement>('[data-column]')
      if (!th) return
      const column = th.dataset.column!
      if (sort.column === column) {
        sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
      } else {
        sort.column    = column
        sort.direction = 'asc'
      }
      updateList()
    })

    let resizeTimer: number | null = null
    function handleResize(): void {
      if (!container.querySelector('.tl-list-container')) {
        window.removeEventListener('resize', handleResize)
        return
      }
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(updateList, 200)
    }
    window.addEventListener('resize', handleResize)

    async function reloadYear(logContext: string): Promise<boolean> {
      container.querySelector('.tl-title')!.textContent = `Terminliste ${filter.year}`
      container.querySelector('.tl-list-container')!.replaceChildren(createLoadingState('Laster...'))
      const { data: newData, error: newError } = await getScheduleTournaments(filter.year)
      if (newError) {
        logError(logContext, newError)
        container.querySelector<HTMLElement>('.tl-list-container')!.replaceChildren(createErrorBanner('Feil ved henting.'))
        return false
      }
      allData = newData ?? []
      return true
    }

    yearSelect.addEventListener('change', async () => {
      filter.year = Number(yearSelect.value)
      if (await reloadYear('terminliste.yearChange')) updateList()
    })

    tournamentTypeSelect.addEventListener('change', () => { filter.tournamentTypeId = tournamentTypeSelect.value; updateList() })
    throwingMethodSelect.addEventListener('change', () => { filter.throwingMethodId = throwingMethodSelect.value; updateList() })
    organizerSelect.addEventListener('change',      () => { filter.clubId           = organizerSelect.value;     updateList() })
    categorySelect.addEventListener('change',       () => { filter.categoryId       = categorySelect.value;      updateList() })

    if (!isNative) {
      const excelHandler = () => exportToExcel(filterData(allData))
      container.querySelector<HTMLButtonElement>('#tl-excel-desktop')!.addEventListener('click', excelHandler)
      container.querySelector<HTMLButtonElement>('#tl-excel-mobile')!.addEventListener('click',  excelHandler)
    }

    function openSheet() { sheet.classList.add('active'); backdrop.classList.add('active') }
    function closeSheet() { sheet.classList.remove('active'); backdrop.classList.remove('active') }

    filterOpenBtn.addEventListener('click', openSheet)
    backdrop.addEventListener('click', closeSheet)

    resetBtn.addEventListener('click', () => {
      filter.searchText       = ''
      filter.tournamentTypeId = ''
      filter.throwingMethodId = ''
      filter.clubId           = ''
      filter.categoryId       = ''
      tournamentTypeMobSelect.value = ''
      throwingMethodMobSelect.value = ''
      organizerMobSelect.value      = ''
      categoryMobSelect.value       = ''
      textMobileInput.value = ''
      textInput.value       = ''
      updateList()
    })

    applyBtn.addEventListener('click', async () => {
      const newYear    = Number(yearMobileSelect.value)
      const yearChanged = newYear !== filter.year
      filter.year             = newYear
      filter.tournamentTypeId = tournamentTypeMobSelect.value
      filter.throwingMethodId = throwingMethodMobSelect.value
      filter.clubId           = organizerMobSelect.value
      filter.categoryId       = categoryMobSelect.value
      closeSheet()

      if (yearChanged && !await reloadYear('terminliste.applyFilter')) return
      updateList()
    })
  } catch (err) {
    logError('terminliste.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste terminliste.'))
  }
}
