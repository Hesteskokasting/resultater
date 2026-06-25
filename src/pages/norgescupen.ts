import { kasterNavn } from '@/utils/kaster'
import { logError } from '@/utils/logError'
import { bindExpandableRows } from '@/utils/expandableRows'
import { formaterPoeng, byggSingelListe, byggLagListe } from '@/utils/norgescup'
import { hentRegler, hentStevnerOgResultater } from '@/services/norgescupService'
import { formaterDato, arOptions } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import type { Tables } from '@/types'
import type { ResultatMedRelasjonar, StevneForNc } from '@/services/norgescupService'
import type { SingelListeRad, LagListeRad } from '@/utils/norgescup'

const FOERSTE_AR = 2007
const FOERSTE_AR_MULTI_CUP = 2024

interface Filtre {
  ar: number
  cupType: string
  klasse: number
  visning: 'singel' | 'lag'
}

interface NcCache {
  ar: number | null
  regler: Tables<'antallTellendeNc'> | null
  stevner: StevneForNc[]
  resultater: ResultatMedRelasjonar[]
}

const filtre: Filtre = {
  ar: new Date().getFullYear(),
  cupType: 'NC',
  klasse: 1,
  visning: 'singel',
}

let cache: NcCache = {
  ar: null,
  regler: null,
  stevner: [],
  resultater: [],
}

// ── Data-henting ──────────────────────────────────────────────────────────────

async function hentOgBufferData(ar: number): Promise<boolean> {
  if (cache.ar === ar) return true

  try {
    const [{ data: regler, error: e1 }, { stevner, resultater, error: e2 }] = await Promise.all([
      hentRegler(ar),
      hentStevnerOgResultater(ar),
    ])

    if (e1 || e2) return false

    cache.ar = ar
    cache.regler = regler
    cache.stevner = stevner
    cache.resultater = resultater
    return true
  } catch (err) {
    logError('hentOgBufferData', err)
    return false
  }
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function beskrivelsesTekst(regler: Tables<'antallTellendeNc'>, cupType: string): string {
  if (cupType === 'SNC') return `Dei ${regler.max_snc} beste SNC-stevna er teljande`
  if (cupType === 'DNC') return `Dei ${regler.max_dnc} beste DNC-stevna er teljande`
  return `Dei ${regler.maxtotal} beste stevna, herav maks ${regler.max_nc_total} NC-stevner og ${regler.max_snc_total} SNC-stevner er teljande`
}

function visningTabsHtml(valgtVisning: string): string {
  return `
    <div class="nc-klasse-tabs nc-visning-tabs">
      <button class="nc-klasse-tab${valgtVisning === 'singel' ? ' aktiv' : ''}" data-visning="singel">Singel</button>
      <button class="nc-klasse-tab${valgtVisning === 'lag' ? ' aktiv' : ''}" data-visning="lag">Lag</button>
    </div>`
}

function klasseTabsHtml(valgtKlasse: number, ar: number): string {
  return `
    <div class="nc-klasse-tabs-wrapper">
      <div class="nc-klasse-tabs">
        <button class="nc-klasse-tab${valgtKlasse === 1 ? ' aktiv' : ''}" data-klasse="1">Klasse 1</button>
        ${ar <= 2025 ? `<button class="nc-klasse-tab${valgtKlasse === 2 ? ' aktiv' : ''}" data-klasse="2">Klasse 2</button>` : ''}
      </div>
      <span class="nc-klikk-hint">Klikk poengsum for å vise detaljer</span>
    </div>`
}

function lagPoengCelleInnhald(poeng: number): DocumentFragment {
  const frag = document.createDocumentFragment()
  frag.appendChild(document.createTextNode(formaterPoeng(poeng)))
  const chevron = document.createElement('span')
  chevron.className = 'nc-chevron'
  chevron.textContent = ' ▼'
  frag.appendChild(chevron)
  return frag
}

function createSingelTabell(liste: SingelListeRad[]): HTMLElement {
  if (liste.length === 0) return createEmptyState('Ingen resultater funnet.')

  return createTable<SingelListeRad>({
    rows: liste,
    rowClass: 'nc-singel-rad',
    rowAttrs: (_, i) => ({ 'data-idx': String(i) }),
    detailRowClass: 'nc-detalj-rad d-none',
    detailRow: item => createTable({
      rows: item.detaljRader,
      tableClass: 'detalj-tabell',
      theadClass: '',
      columns: [
        { label: 'Dato',   render: r => formaterDato(r._stevne?.dato) },
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
        thClass: 'nc-td-poeng',
        cellClass: 'nc-td-poeng nc-poeng-celle',
        cellAttrs: (_, i) => ({ 'data-idx': String(i) }),
        render: item => lagPoengCelleInnhald(item.totalPoeng),
      },
    ],
  })
}

function createLagTabell(lagListe: LagListeRad[]): HTMLElement {
  if (lagListe.length === 0) return createEmptyState('Ingen lag funnet.')

  return createTable<LagListeRad>({
    rows: lagListe,
    rowClass: 'nc-lag-rad',
    rowAttrs: (_, i) => ({ 'data-lag-idx': String(i) }),
    detailRowClass: 'nc-lag-detalj-rad d-none',
    detailRow: item => createTable({
      rows: item.bidragsytere,
      tableClass: 'detalj-tabell',
      showHeader: false,
      columns: [
        { label: '', render: b => kasterNavn(b.kaster) },
        { label: '', cellClass: 'nc-td-poeng', render: b => formaterPoeng(b.sum) },
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
        thClass: 'nc-td-poeng',
        cellClass: 'nc-td-poeng nc-lag-poeng-celle',
        cellAttrs: (_, i) => ({ 'data-lag-idx': String(i) }),
        render: item => lagPoengCelleInnhald(item.lagTotal),
      },
    ],
  })
}

function sideSkelettHtml(ar: number, cupType: string): string {
  return `
    <div class="content-page">
      <h1 class="nc-hovudtittel">Norgescupen ${ar}</h1>
      <div class="nc-filter-rad">
        <select id="nc-ar" class="tl-select">${arOptions(ar, FOERSTE_AR)}</select>
        <select id="nc-cuptype" class="tl-select${ar < FOERSTE_AR_MULTI_CUP ? ' d-none' : ''}">
          <option value="NC"${cupType === 'NC' ? ' selected' : ''}>NC</option>
          <option value="SNC"${cupType === 'SNC' ? ' selected' : ''}>SNC</option>
          <option value="DNC"${cupType === 'DNC' ? ' selected' : ''}>DNC (Uoffisiell)</option>
        </select>
      </div>
      <div id="nc-visning-tabs-container"></div>
      <div id="nc-content"></div>
    </div>`
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filtre.ar = new Date().getFullYear()
  filtre.cupType = 'NC'
  filtre.klasse = 1
  filtre.visning = 'singel'
  cache = { ar: null, regler: null, stevner: [], resultater: [] }

  container.replaceChildren(createLoadingState('Laster Norgescupen...'))

  const ok = await hentOgBufferData(filtre.ar)
  if (!ok) {
    container.replaceChildren(createErrorBanner('Kunne ikkje laste data for Norgescupen.'))
    return
  }

  container.innerHTML = sideSkelettHtml(filtre.ar, filtre.cupType)

  function oppdaterVisning(): void {
    const { ar, cupType, klasse, visning } = filtre
    const { regler } = cache
    const content = container.querySelector<HTMLElement>('#nc-content')!

    ;(container.querySelector('.nc-hovudtittel') as HTMLElement).textContent = `Norgescupen ${ar}`
    container.querySelector('#nc-cuptype')!.classList.toggle('d-none', ar < FOERSTE_AR_MULTI_CUP)

    container.querySelector('#nc-visning-tabs-container')!.innerHTML =
      cupType === 'NC' ? visningTabsHtml(visning) : ''

    if (visning === 'lag' && cupType === 'NC') {
      content.innerHTML = `
        <section>
          <h2 class="nc-seksjon-tittel">NC Lag ${ar} (Kun klasse 1)</h2>
          <p class="nc-beskriving">Dei 4 beste poengsummene frå kvar klubb.</p>
          <div class="nc-klikk-hint nc-klikk-hint-rad">Klikk poengsum for å vise detaljar</div>
          <div id="nc-lag-tabell-container"></div>
        </section>`

      const lagContainer = content.querySelector<HTMLElement>('#nc-lag-tabell-container')!
      if (!regler) {
        lagContainer.replaceChildren(createEmptyState('Ingen data.'))
      } else {
        const lagListe = byggLagListe(cache.resultater, cache.stevner, regler)
        lagContainer.replaceChildren(createLagTabell(lagListe))
        bindExpandableRows(lagContainer, { triggerSel: '.nc-lag-poeng-celle', idAttr: 'lag-idx', detailSel: '.nc-lag-detalj-rad', lookupRoot: content })
      }
    } else {
      content.innerHTML = `
        <section id="nc-singel-seksjon">
          <h2 class="nc-seksjon-tittel">${cupType} Singel ${ar} - Klasse ${klasse}</h2>
          <p class="nc-beskriving">${regler ? beskrivelsesTekst(regler, cupType) : `Ingen telleregel funnet for ${ar}`}</p>
          <div id="nc-klasse-tabs-container">${klasseTabsHtml(klasse, ar)}</div>
          <div id="nc-singel-tabell-container"></div>
        </section>`

      const singelContainer = content.querySelector<HTMLElement>('#nc-singel-tabell-container')!
      if (!regler) {
        singelContainer.replaceChildren(createEmptyState('Ingen data.'))
      } else {
        const singelListe = byggSingelListe(cache.resultater, cache.stevner, regler, cupType, klasse)
        singelContainer.replaceChildren(createSingelTabell(singelListe))
        bindExpandableRows(singelContainer, { triggerSel: '.nc-poeng-celle', idAttr: 'idx', detailSel: '.nc-detalj-rad', lookupRoot: content })
      }

      content.querySelector('#nc-singel-seksjon')!.addEventListener('click', e => {
        const tab = (e.target as Element).closest<HTMLElement>('[data-klasse]')
        if (!tab) return
        filtre.klasse = Number(tab.dataset.klasse)
        oppdaterVisning()
      })
    }
  }

  oppdaterVisning()

  container.querySelector<HTMLSelectElement>('#nc-ar')!.addEventListener('change', async e => {
    filtre.ar = Number((e.target as HTMLSelectElement).value)
    filtre.klasse = 1
    if (filtre.ar < FOERSTE_AR_MULTI_CUP) {
      filtre.cupType = 'NC'
      filtre.visning = 'singel'
      container.querySelector<HTMLSelectElement>('#nc-cuptype')!.value = 'NC'
    }
    container.querySelector<HTMLElement>('#nc-content')!.replaceChildren(createLoadingState())
    const ok = await hentOgBufferData(filtre.ar)
    if (!ok) {
      container.querySelector<HTMLElement>('#nc-content')!.replaceChildren(createErrorBanner('Feil ved henting av data.'))
      return
    }
    oppdaterVisning()
  })

  container.querySelector<HTMLSelectElement>('#nc-cuptype')!.addEventListener('change', e => {
    filtre.cupType = (e.target as HTMLSelectElement).value
    filtre.klasse = 1
    if (filtre.cupType !== 'NC') filtre.visning = 'singel'
    oppdaterVisning()
  })

  container.querySelector('#nc-visning-tabs-container')!.addEventListener('click', e => {
    const tab = (e.target as Element).closest<HTMLElement>('[data-visning]')
    if (!tab) return
    filtre.visning = tab.dataset.visning as 'singel' | 'lag'
    oppdaterVisning()
  })
}
