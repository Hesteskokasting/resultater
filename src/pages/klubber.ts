import { throwerName, buildThrowerSlug, buildClubSlug } from '@/utils/kaster'
import { prependAdminLinkBar } from '@/components/AdminLinkBar'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { getClubs, getClubById } from '@/services/klubbService'
import { getActiveThrowerList, getClubMembers } from '@/services/kasterService'
import type { PageRenderFn } from '@/types'
import type { ClubListRow } from '@/services/klubbService'
import type { MemberRow } from '@/services/kasterService'

const PLACEHOLDER_LOGO = 'https://placehold.co/200x200/444/888?text=?'

const filtreListe = { sokeTekst: '' }
const filtreDetalj = { sokeTekst: '' }

// ── HTML-byggjarar: Liste ─────────────────────────────────────────────────────

function klubbKortHtml(k: ClubListRow): string {
  return `
    <a href="#/klubber/${buildClubSlug(k)}" class="kaster-kort">
      <img src="${escHtml(k.logourl || PLACEHOLDER_LOGO)}" alt="${escHtml(k.navn)}" loading="lazy">
      <div class="kaster-navn">${escHtml(k.navn)}</div>
    </a>`
}

function listeSkelettHtml(): string {
  return `
    <div class="content-page">
      <div class="kaster-liste-kontroller">
        <div class="nc-filter-rad">
          <input id="klubb-sok" type="text" class="tl-select" placeholder="Søk på klubbnavn eller utøvar" value="">
          <button id="klubb-sok-knapp" class="btn btn-secondary btn-sm">Søk</button>
        </div>
      </div>
      <div id="klubb-grid" class="kaster-grid"></div>
    </div>`
}

// ── HTML-byggjarar: Detalj ────────────────────────────────────────────────────

function detaljSkelettHtml(klubb: ClubListRow, antall: number): string {
  return `
    <div class="content-page">
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

function createMedlemTabell(medlemmar: MemberRow[], sokeTekst: string): HTMLElement {
  const sok = sokeTekst.trim().toLowerCase()
  const filtrert = sok
    ? medlemmar.filter(k => throwerName(k).toLowerCase().includes(sok))
    : medlemmar

  if (!filtrert.length) return createEmptyState('Ingen aktive utøvarar funnet.')

  const wrapper = document.createElement('div')
  wrapper.className = 'table-responsive'
  wrapper.appendChild(createTable<MemberRow>({
    rows: filtrert,
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
          a.className = 'tl-lenkje'
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

// ── Render: Liste ─────────────────────────────────────────────────────────────

async function renderListe(container: HTMLElement): Promise<void> {
  container.replaceChildren(createLoadingState('Laster klubbar...'))

  try {
    const [{ data: alleKlubbar, error }, { data: alleKastere }] = await Promise.all([
      getClubs(),
      getActiveThrowerList(),
    ])

    if (error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste klubbar.'))
      return
    }

    const kasterPerKlubb = new Map<number, string[]>()
    for (const k of alleKastere) {
      if (!k.klubb?.id) continue
      if (!kasterPerKlubb.has(k.klubb.id)) kasterPerKlubb.set(k.klubb.id, [])
      kasterPerKlubb.get(k.klubb.id)!.push(throwerName(k).toLowerCase())
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
        : '<p class="empty-state">Ingen klubbar funnet.</p>'
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

    prependAdminLinkBar(container, {
      href: '#/klubber/ny',
      label: '+ Ny klubb',
      variant: 'success',
      canShow: auth => auth.profil?.role === 'admin',
    })
  } catch (err) {
    logError('renderListe', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste klubbar.'))
  }
}

// ── Render: Detalj ────────────────────────────────────────────────────────────

async function renderDetalj(container: HTMLElement, id: number): Promise<void> {
  filtreDetalj.sokeTekst = ''
  container.replaceChildren(createLoadingState('Laster klubb...'))

  try {
    const [klubbRes, { data: medlemmar }] = await Promise.all([
      getClubById(id),
      getClubMembers(id),
    ])

    if (klubbRes.error || !klubbRes.data) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste klubb.'))
      return
    }

    const klubb = klubbRes.data

    container.innerHTML = detaljSkelettHtml(klubb, medlemmar.length)

    const listeContainer = container.querySelector<HTMLElement>('#klubb-detalj-liste')!
    const sokInput = container.querySelector<HTMLInputElement>('#klubb-detalj-sok')!

    function oppdaterListe(): void {
      listeContainer.replaceChildren(createMedlemTabell(medlemmar, filtreDetalj.sokeTekst))
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

    prependAdminLinkBar(container, {
      href: `#/klubber/${id}/admin`,
      label: 'Rediger klubb',
      variant: 'warning',
      canShow: auth => auth.profil?.role === 'admin' ||
        (auth.profil?.role === 'klubbadmin' && auth.klubber.includes(id)),
    })
  } catch (err) {
    logError('renderDetalj', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste klubb.'))
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
