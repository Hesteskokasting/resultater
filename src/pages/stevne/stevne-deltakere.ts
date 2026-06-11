import { kasterNavn } from '@/utils/kaster'
import { createErrorBanner } from '@/components/ErrorBanner'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { hentKastereListeAktive } from '@/services/kasterService'
import type { KasterListeRow } from '@/services/kasterService'
import {
  hentPameldingStatusForStevne,
  leggTilPameldingAdmin,
  bekreftPameldingForKaster,
  fjernPameldingForKaster,
} from '@/services/pameldingService'
import { hentStevneHeader } from '@/services/stevneService'
import { createLoadingState } from '@/components/LoadingState'
import { createTabs } from '@/components/Tabs'
import { createParTab } from '@/pages/stevne/parTab'

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function sorterKastere(kastere: KasterListeRow[]): KasterListeRow[] {
  return [...kastere].sort((a, b) => {
    const klubbCmp = (a.klubb?.navn ?? '').localeCompare(b.klubb?.navn ?? '', 'nb')
    if (klubbCmp !== 0) return klubbCmp
    const etternavnCmp = (a.etternavn ?? '').localeCompare(b.etternavn ?? '', 'nb')
    if (etternavnCmp !== 0) return etternavnCmp
    return (a.fornavn ?? '').localeCompare(b.fornavn ?? '', 'nb')
  })
}

function filtrerTilgjengelege(
  kastere: KasterListeRow[],
  search: string,
  registrerte: Map<number, boolean>,
): KasterListeRow[] {
  const q = search.toLowerCase()
  return kastere.filter(p => {
    if (registrerte.has(p.id)) return false
    return !q || kasterNavn(p).toLowerCase().includes(q) || (p.klubb?.navn ?? '').toLowerCase().includes(q)
  })
}

// ── DOM-byggjarar ─────────────────────────────────────────────────────────────

function lagSpelarKolonne(tittel: string): {
  kolonne: HTMLDivElement
  tabell: HTMLTableElement
  tittelEl: HTMLHeadingElement
} {
  const kolonne = document.createElement('div')
  kolonne.className = 'd-flex flex-column flex-grow-1'

  const tittelEl = document.createElement('h6')
  tittelEl.textContent = tittel
  tittelEl.className = 'fw-bold mb-1'

  const tabellWrapper = document.createElement('div')
  tabellWrapper.className = 'border rounded deltaker-tabell-wrapper flex-grow-1 overflow-auto'

  const tabell = document.createElement('table')
  tabell.className = 'table table-sm table-hover table-bordered mb-0'

  tabellWrapper.appendChild(tabell)
  kolonne.appendChild(tittelEl)
  kolonne.appendChild(tabellWrapper)
  return { kolonne, tabell, tittelEl }
}

function lagPameldtRad(
  spelar: KasterListeRow,
  erBekreftet: boolean,
  onFjern: (s: KasterListeRow) => void,
  onBekreft: (s: KasterListeRow) => void,
  deaktivert: boolean,
): HTMLTableRowElement {
  const rad = document.createElement('tr')

  const bekreftCell = document.createElement('td')
  bekreftCell.className = 'text-center th-40'

  if (erBekreftet) {
    const hake = document.createElement('span')
    hake.className = 'text-success fw-bold'
    hake.textContent = '✓'
    bekreftCell.appendChild(hake)
  } else if (!deaktivert) {
    const bekreftBtn = document.createElement('button')
    bekreftBtn.textContent = '✓'
    bekreftBtn.className = 'btn btn-outline-danger btn-sm rounded-circle p-0 lh-1 deltaker-bekreft-btn'
    bekreftBtn.title = 'Bekreft spelar'
    bekreftBtn.addEventListener('click', e => { e.stopPropagation(); onBekreft(spelar) })
    bekreftCell.appendChild(bekreftBtn)
  }

  const navneCell = document.createElement('td')
  navneCell.textContent = kasterNavn(spelar)

  const klubbCell = document.createElement('td')
  klubbCell.textContent = spelar.klubb?.navn ?? ''

  const fjernCell = document.createElement('td')
  fjernCell.className = 'text-center th-40'

  if (!deaktivert) {
    const fjernBtn = document.createElement('button')
    fjernBtn.innerHTML = '&times;'
    fjernBtn.className = 'btn btn-danger btn-sm rounded-circle p-0 lh-1 deltaker-fjern-btn'
    fjernBtn.title = 'Fjern spelar'
    fjernBtn.addEventListener('click', e => { e.stopPropagation(); onFjern(spelar) })
    fjernCell.appendChild(fjernBtn)
  }

  rad.appendChild(bekreftCell)
  rad.appendChild(navneCell)
  rad.appendChild(klubbCell)
  rad.appendChild(fjernCell)
  return rad
}

function lagTilgjengeliRad(
  spelar: KasterListeRow,
  onVelg: (s: KasterListeRow) => void,
  deaktivert: boolean,
): HTMLTableRowElement {
  const rad = document.createElement('tr')

  const navneCell = document.createElement('td')
  navneCell.textContent = kasterNavn(spelar)

  const klubbCell = document.createElement('td')
  klubbCell.textContent = spelar.klubb?.navn ?? 'Ingen klubb'

  if (!deaktivert) {
    rad.classList.add('deltaker-rad')
    rad.addEventListener('click', () => onVelg(spelar))
  }

  rad.appendChild(navneCell)
  rad.appendChild(klubbCell)
  return rad
}

function lagTomRad(melding: string, kolSpan: number): HTMLTableRowElement {
  const rad = document.createElement('tr')
  const celle = document.createElement('td')
  celle.className = 'text-center text-muted fst-italic py-3'
  celle.textContent = melding
  celle.colSpan = kolSpan
  rad.appendChild(celle)
  return rad
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState())

  try {
    const [stevneRes, kastereRes, pameldingRes] = await Promise.all([
      hentStevneHeader(id),
      hentKastereListeAktive(),
      hentPameldingStatusForStevne(id),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }
    if (kastereRes.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste kasterliste.'))
      return
    }

    const fase      = stevneRes.data.stevne_fase ?? null
    const kanEndrast = isAdmin && (fase === null || fase === 'ikke_startet')
    const erLag     = stevneRes.data.kategori?.erlagbasert ?? false
    const alleSpelarar = kastereRes.data

    const pameldtMap = new Map<number, boolean>()
    const pairedIds = new Set<number>()
    for (const p of pameldingRes.data) {
      if (p.kasterid != null) {
        pameldtMap.set(p.kasterid, p.er_bekreftet ?? false)
        if (p.lag_id != null) pairedIds.add(p.kasterid)
      }
    }

    // Par tab renders lazily on first activation; true again whenever
    // enrollment changes so the next activation re-fetches
    let parTabDirty = true

    const wrapper = document.createElement('div')

    if (!kanEndrast) {
      const warning = document.createElement('div')
      warning.className = 'alert alert-warning py-2'
      warning.textContent = 'Spelarar kan ikkje endrast etter at stevnet er starta.'
      wrapper.appendChild(warning)
    }

    const layout = document.createElement('div')
    layout.className = 'row g-3'

    // ── Venstre kolonne: tilgjengelege spelarar ───────────────────────────────

    const leftWrapper = document.createElement('div')
    leftWrapper.className = 'col-md-6 d-flex flex-column'

    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.placeholder = 'Søk etter navn eller klubb…'
    searchInput.className = 'form-control mb-2'

    const { kolonne: leftCol, tabell: tilgjengeliTabell } = lagSpelarKolonne('Tilgjengelege spelarar')
    leftWrapper.appendChild(searchInput)
    leftWrapper.appendChild(leftCol)

    // ── Høgre kolonne: påmelde spelarar ──────────────────────────────────────

    const rightWrapper = document.createElement('div')
    rightWrapper.className = 'col-md-6 d-flex flex-column'

    const searchSpacer = document.createElement('input')
    searchSpacer.type = 'text'
    searchSpacer.className = 'form-control mb-2 deltaker-search-spacer'
    searchSpacer.tabIndex = -1
    searchSpacer.disabled = true

    const { kolonne: rightCol, tabell: pameldtTabell, tittelEl: pameldtTittel } = lagSpelarKolonne('Påmelde spelarar')
    rightWrapper.appendChild(searchSpacer)
    rightWrapper.appendChild(rightCol)

    // ── Renderfunksjonar ──────────────────────────────────────────────────────

    function renderPameldtListe(): void {
      pameldtTabell.innerHTML = ''
      const lista = sorterKastere(alleSpelarar.filter(p => pameldtMap.has(p.id)))
      pameldtTittel.textContent = `Påmelde spelarar: ${lista.length}`

      if (!lista.length) {
        pameldtTabell.appendChild(lagTomRad('Ingen spelarar påmelde', 4))
        return
      }

      for (const sp of lista) {
        pameldtTabell.appendChild(lagPameldtRad(
          sp,
          pameldtMap.get(sp.id) ?? false,
          async s => {
            if (pairedIds.has(s.id)) { showToast('Kan ikkje fjerne spelar som er i eit par. Slett paret fyrst.', 'error'); return }
            const { error } = await fjernPameldingForKaster(id, s.id)
            if (error) { showToast('Feil ved fjerning: ' + errorMessage(error), 'error'); return }
            pameldtMap.delete(s.id)
            parTabDirty = true
            renderPameldtListe()
            renderTilgjengeliListe()
          },
          async s => {
            const { error } = await bekreftPameldingForKaster(id, s.id)
            if (error) { showToast('Feil ved bekreftelse: ' + errorMessage(error), 'error'); return }
            pameldtMap.set(s.id, true)
            renderPameldtListe()
          },
          !kanEndrast,
        ))
      }
    }

    function renderTilgjengeliListe(): void {
      const filtrert = sorterKastere(filtrerTilgjengelege(alleSpelarar, searchInput.value, pameldtMap))
      tilgjengeliTabell.innerHTML = ''

      if (!filtrert.length) {
        tilgjengeliTabell.appendChild(lagTomRad('Ingen spelarar funne', 2))
        return
      }

      for (const sp of filtrert) {
        tilgjengeliTabell.appendChild(lagTilgjengeliRad(sp, async s => {
          const { error } = await leggTilPameldingAdmin(id, s.id)
          if (error) { showToast('Feil ved innmelding: ' + errorMessage(error), 'error'); return }
          pameldtMap.set(s.id, false)
          parTabDirty = true
          renderPameldtListe()
          renderTilgjengeliListe()
        }, !kanEndrast))
      }
    }

    layout.appendChild(leftWrapper)
    layout.appendChild(rightWrapper)

    if (erLag) {
      const parTab = createParTab({
        stevneId: id,
        isAdmin: kanEndrast,
        erMix: (stevneRes.data.kategori?.navn ?? '').toLowerCase().includes('mix'),
        getPameldtIds: () => new Set(pameldtMap.keys()),
        alleSpelarar,
        onPairsChanged: ids => {
          pairedIds.clear()
          for (const kid of ids) pairedIds.add(kid)
        },
      })
      wrapper.appendChild(createTabs({
        tabs: [
          { id: 'spelarar', label: 'Spelarar', panel: layout },
          { id: 'pairs', label: 'Administrer par', panel: parTab.element },
        ],
        onChange: tabId => {
          if (tabId === 'pairs' && parTabDirty) {
            parTabDirty = false
            parTab.refresh()
          }
        },
      }))
    } else {
      wrapper.appendChild(layout)
    }

    container.replaceChildren(wrapper)

    searchInput.addEventListener('input', renderTilgjengeliListe)
    renderPameldtListe()
    renderTilgjengeliListe()
  } catch (err) {
    logError('stevne-deltakere.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste deltakarliste.'))
  }
}
