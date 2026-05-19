import { formaterDato, arOptions, lastNedExcel as lastNedExcelFil, formaterProsent } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { logError } from '@/utils/logError'
import { bindExpandableRows } from '@/utils/expandableRows'
import { hentStevnerOgResultater } from '@/services/norgesrankingService'
import type { RankingStevneRow, RankingResultatRow } from '@/services/norgesrankingService'
import { MIN_STEVNER, lagStevnerMap, byggRankingListe } from '@/utils/norgesrankingLogikk'
import type { StevneInfo, RingInfo, RankingItem } from '@/utils/norgesrankingLogikk'

const FOERSTE_AR = 2018

// ── Tilstand ──────────────────────────────────────────────────────────────────

interface Cache {
  ar: number | null
  stevner: RankingStevneRow[]
  resultater: RankingResultatRow[]
}

const filtre = {
  ar: new Date().getFullYear(),
  sokeTekst: '',
  infoSynleg: false,
}

let cache: Cache = { ar: null, stevner: [], resultater: [] }

// ── Data-buffer ───────────────────────────────────────────────────────────────

async function hentOgBufferData(ar: number): Promise<boolean> {
  if (cache.ar === ar) return true

  try {
    const { stevner, resultater, error } = await hentStevnerOgResultater(ar)
    if (error) return false

    cache.ar = ar
    cache.stevner = stevner
    cache.resultater = resultater
    return true
  } catch (err) {
    logError('hentOgBufferData', err)
    return false
  }
}

// ── Excel-eksport ─────────────────────────────────────────────────────────────

function lastNedExcel(): void {
  const stevnerMap = lagStevnerMap(cache.stevner)
  const liste = byggRankingListe(cache.resultater, stevnerMap)
  const rader = liste.map(k => ({
    'Plass': k.erGyldig ? k.plassering : '–',
    'Kaster': k.navn,
    'Klubb': k.klubb,
    'Snitt %': k.snittProsent,
    'Antal stevner': k.antallStevner,
  }))
  lastNedExcelFil(rader, `norgesranking-${filtre.ar}.xlsx`, 'Norgesranking')
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function infoHtml(synleg: boolean): string {
  return `
    <div id="nr-info-seksjon"${synleg ? '' : ' class="d-none"'}>
      <p class="nc-info-tekst">
        Norgesranking er ein konkurranse som pågår innanfor eit kalenderår, dvs. 1. januar – 31. desember.
        <strong>Dei ${MIN_STEVNER} beste prosentane er teljande.</strong>
      </p>
      <p class="nc-info-tekst">
        For å få eit gyldig årsresultat skal kasteren minst ha vore gjennom ${MIN_STEVNER} rankingrunder.
      </p>
      <p class="nc-info-tekst nc-info-tekst--advarsel">
        Resultater merket med rødt er ikkje gyldig (mindre enn ${MIN_STEVNER} runder).
      </p>
    </div>`
}

function createRankingTabell(liste: RankingItem[], sokeTekst: string): HTMLElement {
  const sok = sokeTekst.trim().toLowerCase()
  const filtrert = sok
    ? liste.filter(k => k.navn.toLowerCase().includes(sok) || k.klubb.toLowerCase().includes(sok))
    : liste

  if (filtrert.length === 0) return createEmptyState('Ingen resultater funnet.')

  return createTable<RankingItem>({
    rows: filtrert,
    rowClass: item => item.erGyldig ? 'nc-singel-rad' : 'nc-singel-rad nc-rad--ugyldig',
    rowAttrs: (_, i) => ({ 'data-idx': String(i) }),
    detailRowClass: 'nc-detalj-rad d-none',
    detailRow: item => createTable<RingInfo>({
      rows: item.detaljRader,
      tableClass: 'detalj-tabell',
      theadClass: '',
      columns: [
        { label: 'Dato',   render: r => formaterDato(r._stevne?.dato) },
        { label: 'Type',   render: r => r._stevne?.typeNamn ?? '–' },
        { label: 'Stevne', render: r => r._stevne?.navn ?? '–' },
        { label: 'Metode', render: r => r.metodeNamn },
        { label: 'Ring',   render: r => String(r.antallRing) },
        { label: '%Ring',  render: r => formaterProsent(r.prosent) },
      ],
    }),
    columns: [
      {
        label: 'Pl.',
        thClass: 'nc-td-pl',
        cellClass: 'nc-td-pl',
        render: item => item.erGyldig ? String(item.plassering ?? '–') : '–',
      },
      {
        label: 'Navn',
        render: item => item.navn,
      },
      {
        label: 'Klubb',
        render: item => item.klubb,
      },
      {
        label: 'Stevner',
        thClass: 'nc-td-sentrum',
        cellClass: 'nc-td-sentrum',
        render: item => String(item.antallStevner),
      },
      {
        label: '%Snitt',
        thClass: 'nc-td-poeng',
        cellClass: 'nc-td-poeng nc-poeng-celle',
        cellAttrs: (_, i) => ({ 'data-idx': String(i) }),
        render: item => {
          const frag = document.createDocumentFragment()
          frag.appendChild(document.createTextNode(formaterProsent(item.snittProsent)))
          const chevron = document.createElement('span')
          chevron.className = 'nc-chevron'
          chevron.textContent = ' ▼'
          frag.appendChild(chevron)
          return frag
        },
      },
    ],
  })
}

function sideSkelettHtml(ar: number): string {
  return `
    <div class="nc-side">
      <h1 class="nc-hovudtittel">Norgesranking ${ar}</h1>
      <div class="nc-info-knapp-rad">
        <button id="nr-info-knapp" class="btn btn-sm btn-outline-secondary">Vis info</button>
      </div>
      <hr>
      ${infoHtml(false)}
      <hr>
      <div class="nc-filter-rad">
        <select id="nr-ar" class="tl-select">${arOptions(ar, FOERSTE_AR)}</select>
        <input id="nr-sok" type="text" class="tl-select" placeholder="Søk på navn/klubb..." value="">
        <button class="tl-excel-knapp" id="nr-excel">⬇ Excel</button>
      </div>
      <div class="nc-klikk-hint-rad">
        <span class="nc-klikk-hint">Klikk prosent for å vise detaljer</span>
      </div>
      <div id="nr-tabell-container"></div>
    </div>`
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  filtre.ar = new Date().getFullYear()
  filtre.sokeTekst = ''
  filtre.infoSynleg = false
  cache = { ar: null, stevner: [], resultater: [] }

  container.replaceChildren(createLoadingState('Laster Norgesranking…'))

  try {
    const ok = await hentOgBufferData(filtre.ar)
    if (!ok) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste data for Norgesranking.'))
      return
    }

    container.innerHTML = sideSkelettHtml(filtre.ar)

    function oppdaterTabell(): void {
      const stevnerMap = lagStevnerMap(cache.stevner)
      const liste = byggRankingListe(cache.resultater, stevnerMap)
      const tabellEl = container.querySelector<HTMLElement>('#nr-tabell-container')!
      const inner = document.createElement('div')
      inner.id = 'nr-tabell-inner'
      inner.appendChild(createRankingTabell(liste, filtre.sokeTekst))
      tabellEl.replaceChildren(inner)
      bindExpandableRows(inner, { triggerSel: '.nc-poeng-celle', idAttr: 'idx', detailSel: '.nc-detalj-rad' })
    }

    oppdaterTabell()

    const arSelect = container.querySelector<HTMLSelectElement>('#nr-ar')!
    const sokInput = container.querySelector<HTMLInputElement>('#nr-sok')!
    const excelBtn = container.querySelector<HTMLButtonElement>('#nr-excel')!
    const infoKnapp = container.querySelector<HTMLButtonElement>('#nr-info-knapp')!

    arSelect.addEventListener('change', async () => {
      filtre.ar = Number(arSelect.value)
      filtre.sokeTekst = ''
      sokInput.value = ''
      container.querySelector('.nc-hovudtittel')!.textContent = `Norgesranking ${filtre.ar}`
      container.querySelector('#nr-tabell-container')!.replaceChildren(createLoadingState("Laster..."))
      try {
        const ok = await hentOgBufferData(filtre.ar)
        if (!ok) {
          container.querySelector('#nr-tabell-container')!.replaceChildren(createErrorBanner('Feil ved henting av data.'))
          return
        }
        oppdaterTabell()
      } catch (err) {
        logError('norgesranking.arChange', err)
        container.querySelector('#nr-tabell-container')!.replaceChildren(createErrorBanner('Feil ved henting av data.'))
      }
    })

    sokInput.addEventListener('input', () => {
      filtre.sokeTekst = sokInput.value
      oppdaterTabell()
    })

    excelBtn.addEventListener('click', lastNedExcel)

    infoKnapp.addEventListener('click', () => {
      filtre.infoSynleg = !filtre.infoSynleg
      container.querySelector('#nr-info-seksjon')!.classList.toggle('d-none', !filtre.infoSynleg)
      infoKnapp.textContent = filtre.infoSynleg ? 'Skjul info' : 'Vis info'
    })
  } catch (err) {
    logError('norgesranking.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste Norgesranking.'))
  }
}
