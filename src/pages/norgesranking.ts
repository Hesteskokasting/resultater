import { kasterNavn } from '@/utils/kaster'
import { formaterDato, arOptions, lastNedExcel as lastNedExcelFil } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { createTable } from '@/components/Table'
import { logError } from '@/utils/logError'
import { bindExpandableRows } from '@/utils/expandableRows'
import { hentStevnerOgResultater } from '@/services/norgesrankingService'
import type { RankingStevneRow, RankingResultatRow } from '@/services/norgesrankingService'

const FOERSTE_AR = 2018
const MIN_STEVNER = 5

// ── Typar ─────────────────────────────────────────────────────────────────────

interface StevneInfo {
  navn: string | null
  dato: string | null
  typeNamn: string
  innledMetode: string | null
  avslMetode: string | null
}

interface RingInfo {
  prosent: number
  metodeNamn: string
  antallRing: number
  _stevne: StevneInfo | undefined
}

interface RankingItem {
  navn: string
  klubb: string
  antallStevner: number
  snittProsent: number
  erGyldig: boolean
  plassering?: number
  detaljRader: RingInfo[]
}

interface Cache {
  ar: number | null
  stevner: RankingStevneRow[]
  resultater: RankingResultatRow[]
}

// ── Tilstand ──────────────────────────────────────────────────────────────────

const prosentFmt = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const filtre = {
  ar: new Date().getFullYear(),
  sokeTekst: '',
  infoSynleg: false,
}

let cache: Cache = { ar: null, stevner: [], resultater: [] }

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

function formaterProsent(p: number | null | undefined): string {
  if (p == null) return '–'
  return prosentFmt.format(p) + ' %'
}

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

// ── Ranking-algoritme ─────────────────────────────────────────────────────────

function lagStevnerMap(): Map<number, StevneInfo> {
  const m = new Map<number, StevneInfo>()
  for (const s of cache.stevner) {
    m.set(s.id, {
      navn: s.navn,
      dato: s.dato,
      typeNamn: s.stevnetype?.navn ?? '',
      innledMetode: s.innledendekastemetode?.navn ?? null,
      avslMetode: s.avsluttendekastemetode?.navn ?? null,
    })
  }
  return m
}

function regnUtRingInfo(r: RankingResultatRow, stevneInfo: StevneInfo | undefined): RingInfo[] {
  const innled = (stevneInfo?.innledMetode ?? '').toLowerCase()
  const avsl = (stevneInfo?.avslMetode ?? '').toLowerCase()
  const finn = (m: string) => innled === m || avsl === m
  const base = { _stevne: stevneInfo }
  const liste: RingInfo[] = []

  if (r.antall_ring_xkast != null) {
    if (finn('minimatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast / 60 * 100, metodeNamn: 'Minimatch', antallRing: r.antall_ring_xkast })
    else if (finn('halvmatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast, metodeNamn: 'Halvmatch', antallRing: r.antall_ring_xkast })
    else if (finn('heilmatch'))
      liste.push({ ...base, prosent: r.antall_ring_xkast / 200 * 100, metodeNamn: 'Heilmatch', antallRing: r.antall_ring_xkast })
  }
  if (r.antall_ring_kongelag != null)
    liste.push({ ...base, prosent: r.antall_ring_kongelag / 40 * 100, metodeNamn: 'Kongelag', antallRing: r.antall_ring_kongelag })

  return liste
}

function tildelPlassering(liste: RankingItem[]): void {
  let pl = 1
  for (let i = 0; i < liste.length; i++) {
    if (i > 0 && liste[i].snittProsent < liste[i - 1].snittProsent) pl = i + 1
    liste[i].plassering = pl
  }
}

function byggRankingListe(resultater: RankingResultatRow[], stevnerMap: Map<number, StevneInfo>): RankingItem[] {
  const kasterMap = new Map<number, { kaster: RankingResultatRow['kaster']; klubb: RankingResultatRow['klubb']; rader: RingInfo[] }>()

  for (const r of resultater) {
    if (r.kasterid == null) continue
    const ringInfoListe = regnUtRingInfo(r, r.stevneid != null ? stevnerMap.get(r.stevneid) : undefined)
    if (!ringInfoListe.length) continue
    if (!kasterMap.has(r.kasterid)) {
      kasterMap.set(r.kasterid, { kaster: r.kaster, klubb: r.klubb, rader: [] })
    }
    for (const ringInfo of ringInfoListe) {
      kasterMap.get(r.kasterid)!.rader.push(ringInfo)
    }
  }

  const gyldig: RankingItem[] = []
  const ugyldig: RankingItem[] = []

  for (const [, entry] of kasterMap) {
    const { rader } = entry
    const sorted = [...rader].sort((a, b) => b.prosent - a.prosent)
    const top5 = sorted.slice(0, MIN_STEVNER)
    const snittProsent = Math.round(top5.reduce((s, r) => s + r.prosent, 0) / top5.length * 100) / 100
    const antallStevner = rader.length
    const erGyldig = antallStevner >= MIN_STEVNER

    const item: RankingItem = {
      navn: kasterNavn(entry.kaster),
      klubb: entry.klubb?.navn ?? '–',
      antallStevner,
      snittProsent,
      erGyldig,
      detaljRader: sorted,
    }

    if (erGyldig) gyldig.push(item)
    else ugyldig.push(item)
  }

  gyldig.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  ugyldig.sort((a, b) => b.snittProsent - a.snittProsent || a.navn.localeCompare(b.navn))
  tildelPlassering(gyldig)

  return [...gyldig, ...ugyldig]
}

// ── Excel-eksport ─────────────────────────────────────────────────────────────

function lastNedExcel(): void {
  const stevnerMap = lagStevnerMap()
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
    detailRow: item => createTable({
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
      const stevnerMap = lagStevnerMap()
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
