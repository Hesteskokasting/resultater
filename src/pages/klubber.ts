import { throwerName, buildThrowerSlug, buildClubSlug } from '@/utils/kaster'
import { prependAdminLinkBar } from '@/components/AdminLinkBar'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { setPageTitle } from '@/utils/pageTitle'
import { getClubs, getClubById } from '@/services/klubbService'
import { getActiveThrowerList, getClubMembers } from '@/services/kasterService'
import type { PageRenderFn } from '@/types'
import type { ClubListRow } from '@/services/klubbService'
import type { MemberRow } from '@/services/kasterService'

const PLACEHOLDER_LOGO = 'https://placehold.co/200x200/444/888?text=?'

const filterList   = { searchText: '' }
const filterDetail = { searchText: '' }

// ── HTML builders: List ───────────────────────────────────────────────────────

function clubCardHtml(k: ClubListRow): string {
  return `
    <a href="#/klubber/${buildClubSlug(k)}" class="thrower-card">
      <img src="${escHtml(k.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(k.navn)}" loading="lazy">
      <div class="thrower-name">${escHtml(k.navn)}</div>
    </a>`
}

function listSkeletonHtml(): string {
  return `
    <div class="content-page">
      <div class="thrower-list-controls">
        <div class="nc-filter-rad">
          <input id="club-search" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="club-search-button" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="club-grid" class="thrower-grid"></div>
    </div>`
}

// ── HTML builders: Detail ─────────────────────────────────────────────────────

function detailSkeletonHtml(club: ClubListRow, count: number): string {
  return `
    <div class="content-page">
      <div class="club-detail-header">
        <img src="${escHtml(club.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(club.navn)}" class="club-logo-large">
        <h1 class="club-detail-title">${escHtml(club.navn)}</h1>
      </div>
      <h3 class="mb-2">Aktive utøvarar (${count})</h3>
      <div class="nc-filter-rad mb-3">
        <input id="club-detail-search" type="text" class="tl-select" placeholder="Søk på utøvar" value="">
        <button id="club-detail-search-button" class="btn btn-secondary btn-sm">Søk</button>
      </div>
      <div id="club-detail-list"></div>
    </div>`
}

function createMemberTable(members: MemberRow[], searchText: string): HTMLElement {
  const search   = searchText.trim().toLowerCase()
  const filtered = search
    ? members.filter(k => throwerName(k).toLowerCase().includes(search))
    : members

  if (!filtered.length) return createEmptyState('Ingen aktive utøvarar funnet.')

  const wrapper = document.createElement('div')
  wrapper.className = 'table-responsive'
  wrapper.appendChild(createTable<MemberRow>({
    rows: filtered,
    columns: [
      {
        label: '#',
        render: (_, i) => String(i + 1),
      },
      {
        label: 'Utøvar',
        render: item => {
          const a = document.createElement('a')
          a.href = `#/kastere/${buildThrowerSlug(item)}`
          a.className = 'tl-link'
          a.textContent = throwerName(item)
          return a
        },
      },
      {
        label: 'Klasse',
        render: item => item.klasse?.navn ?? '–',
      },
      {
        label: 'Nr.',
        render: item => String(item.medlemsnummer ?? '–'),
      },
    ],
  }))
  return wrapper
}

// ── Render: List ──────────────────────────────────────────────────────────────

async function renderList(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState('Laster klubbar...'))

  try {
    const [{ data: allClubs, error }, { data: allThrowers }] = await Promise.all([
      getClubs(),
      getActiveThrowerList(),
    ])

    if (error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste klubbar.'))
      return
    }

    const throwersPerClub = new Map<number, string[]>()
    for (const k of allThrowers) {
      if (!k.klubb?.id) continue
      if (!throwersPerClub.has(k.klubb.id)) throwersPerClub.set(k.klubb.id, [])
      throwersPerClub.get(k.klubb.id)!.push(throwerName(k).toLowerCase())
    }

    container.innerHTML = listSkeletonHtml()

    const grid        = container.querySelector<HTMLElement>('#club-grid')!
    const searchInput = container.querySelector<HTMLInputElement>('#club-search')!

    function filterAndRender(): void {
      const search   = filterList.searchText.trim().toLowerCase()
      const filtered = search
        ? allClubs.filter(k =>
            k.navn.toLowerCase().includes(search) ||
            (throwersPerClub.get(k.id) ?? []).some(n => n.includes(search))
          )
        : allClubs
      grid.innerHTML = filtered.length
        ? filtered.map(clubCardHtml).join('')
        : '<p class="empty-state">Ingen klubbar funnet.</p>'
    }

    filterAndRender()

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        filterList.searchText = searchInput.value
        filterAndRender()
      }
    })

    container.querySelector('#club-search-button')!.addEventListener('click', () => {
      filterList.searchText = searchInput.value
      filterAndRender()
    })

    prependAdminLinkBar(container, {
      href: '#/klubber/ny',
      label: '+ Ny klubb',
      variant: 'success',
      canShow: auth => auth.profil?.role === 'admin',
    })
  } catch (err) {
    logError('renderList', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste klubbar.'))
  }
}

// ── Render: Detail ────────────────────────────────────────────────────────────

async function renderDetail(container: HTMLElement, id: number): Promise<void> {
  filterDetail.searchText = ''
  container.replaceChildren(createLoadingState('Laster klubb...'))

  try {
    const [clubRes, { data: members }] = await Promise.all([
      getClubById(id),
      getClubMembers(id),
    ])

    if (clubRes.error || !clubRes.data) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste klubb.'))
      return
    }

    const club = clubRes.data

    setPageTitle(club.navn)

    container.innerHTML = detailSkeletonHtml(club, members.length)

    const listContainer = container.querySelector<HTMLElement>('#club-detail-list')!
    const searchInput   = container.querySelector<HTMLInputElement>('#club-detail-search')!

    function updateList(): void {
      listContainer.replaceChildren(createMemberTable(members, filterDetail.searchText))
    }

    updateList()

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        filterDetail.searchText = searchInput.value
        updateList()
      }
    })

    container.querySelector('#club-detail-search-button')!.addEventListener('click', () => {
      filterDetail.searchText = searchInput.value
      updateList()
    })

    prependAdminLinkBar(container, {
      href: `#/klubber/${id}/admin`,
      label: 'Rediger klubb',
      variant: 'warning',
      canShow: auth => auth.profil?.role === 'admin' ||
        (auth.profil?.role === 'klubbadmin' && auth.clubs.includes(id)),
    })
  } catch (err) {
    logError('renderDetail', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste klubb.'))
  }
}

// ── Main function ─────────────────────────────────────────────────────────────

export const render: PageRenderFn = async (container, params) => {
  if (params.id) {
    await renderDetail(container, Number(params.id))
  } else {
    await renderList(container)
  }
}
