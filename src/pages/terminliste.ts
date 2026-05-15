import type { AuthUser } from '../types'
import { getUser } from '../utils/auth'
import { hentTerminlisteStevner, hentFiltervalg, hentPameldteForBruker } from '../services/stevneService'
import type { TerminlisteStevneRow } from '../services/stevneService'
import { formaterDatoLang as formaterDato, arOptions, lastNedExcel as lastNedExcelFil } from '../utils/shared'
import { buildDropdownOptions } from '../utils/buildDropdownOptions'
import { lasterHtml, feilHtml } from '../utils/pageStates'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'

type StevneRow = TerminlisteStevneRow

// ── Sortering ─────────────────────────────────────────────────────────────────

const sortering: { kolonne: string; retning: 'asc' | 'desc' } = { kolonne: 'dato', retning: 'asc' }

function sorterVerdi(s: StevneRow, kolonne: string): string {
  switch (kolonne) {
    case 'navn': return s.navn ?? ''
    case 'dato': return s.dato ?? ''
    case 'sted': return s.sted ?? ''
    case 'metode': return [s.innledende?.navn, s.avsluttende?.navn].filter((v): v is string => Boolean(v)).join(' ')
    case 'arrangør': return s.klubb?.navn ?? ''
    case 'type': return s.stevnetype?.navn ?? ''
    case 'klassifisering': return s.kategori?.navn ?? ''
    default: return ''
  }
}

function sorterData(data: StevneRow[]): StevneRow[] {
  return [...data].sort((a, b) => {
    const va = sorterVerdi(a, sortering.kolonne)
    const vb = sorterVerdi(b, sortering.kolonne)
    const cmp = va.localeCompare(vb, 'nb')
    return sortering.retning === 'asc' ? cmp : -cmp
  })
}

// ── Filterobjekt ──────────────────────────────────────────────────────────────

const filtre = {
  ar: new Date().getFullYear(),
  tekst: '',
  stevnetypeId: '',
  kastemetodeId: '',
  klubbId: '',
  kategoriId: '',
}

let allData: StevneRow[] = []
let _auth: AuthUser | null = null
let _pameldteIds: Set<number> = new Set()

// ── Klient-side filtrering ────────────────────────────────────────────────────

function filtrerData(data: StevneRow[]): StevneRow[] {
  return data.filter(s => {
    if (filtre.tekst) {
      const soketekst = filtre.tekst.toLowerCase()
      const treffer = [
        s.navn, s.sted,
        s.klubb?.navn,
        s.stevnetype?.navn,
        s.kategori?.navn,
        s.innledende?.navn,
        s.avsluttende?.navn,
      ].some(felt => felt?.toLowerCase().includes(soketekst))
      if (!treffer) return false
    }

    if (filtre.stevnetypeId && String(s.stevnetype?.id) !== filtre.stevnetypeId) return false

    if (filtre.kastemetodeId) {
      const id = filtre.kastemetodeId
      const treff = String(s.innledende?.id) === id || String(s.avsluttende?.id) === id
      if (!treff) return false
    }

    if (filtre.klubbId && String(s.klubb?.id) !== filtre.klubbId) return false
    if (filtre.kategoriId && String(s.kategori?.id) !== filtre.kategoriId) return false

    return true
  })
}

// ── Excel-eksport ─────────────────────────────────────────────────────────────

function lastNedExcel(filtrert: StevneRow[]): void {
  const rader = filtrert.map(s => ({
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
  lastNedExcelFil(rader, `terminliste-${filtre.ar}.xlsx`, 'Terminliste')
}

// ── Tabell (desktop) ──────────────────────────────────────────────────────────

const tabellKolonner = [
  { id: 'navn', label: 'Stevne' },
  { id: 'dato', label: 'Dato' },
  { id: 'sted', label: 'Sted' },
  { id: 'metode', label: 'Metode' },
  { id: 'arrangør', label: 'Arrangør' },
  { id: 'type', label: 'Type' },
  { id: 'klassifisering', label: 'Klassifisering' },
]

function sortikonHtml(kolonne: string): string {
  if (sortering.kolonne !== kolonne) return '<span class="tl-sort-ikon">↕</span>'
  return sortering.retning === 'asc'
    ? '<span class="tl-sort-ikon aktiv">↑</span>'
    : '<span class="tl-sort-ikon aktiv">↓</span>'
}

function tabellRadHtml(s: StevneRow): string {
  const dato = s.dato ? new Date(s.dato + 'T12:00:00').toLocaleDateString('nb-NO') : ''
  const metode = [s.innledende?.navn, s.avsluttende?.navn].filter((v): v is string => Boolean(v)).join(' \\ ')
  const nm = s.ernm ? '<span class="tl-nm-merke">NM</span> ' : ''
  const innbydelse = s.innbydelseurl
    ? `<a href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener" class="tl-innbydelse-ikon" title="Innbydelse">📄</a>`
    : ''
  return `<tr class="tl-tr">
    <td><a class="tl-lenkje" href="#/stevne/${s.id}/resultat">${nm}${escHtml(s.navn ?? '')}</a></td>
    <td>${dato}</td>
    <td>${escHtml(s.sted ?? '')}</td>
    <td>${escHtml(metode)}</td>
    <td>${escHtml(s.klubb?.navn ?? '')}</td>
    <td>${escHtml(s.stevnetype?.navn ?? '')}</td>
    <td>${escHtml(s.kategori?.navn ?? '')}</td>
    <td>${innbydelse}</td>
  </tr>`
}

function tabellHtml(filtrert: StevneRow[]): string {
  if (filtrert.length === 0) return '<p class="laster">Ingen stevner funnet med valgte filtre.</p>'
  const thead = `<thead><tr>
    ${tabellKolonner.map(k => `<th class="tl-th" data-kolonne="${k.id}">${k.label}${sortikonHtml(k.id)}</th>`).join('')}
    <th class="tl-th">Innbydelse</th>
  </tr></thead>`
  const tbody = `<tbody>${sorterData(filtrert).map(tabellRadHtml).join('')}</tbody>`
  return `<table class="tl-tabell">${thead}${tbody}</table>`
}

function byggVisning(filtrert: StevneRow[]): string {
  return window.innerWidth > 600 ? tabellHtml(filtrert) : byggListe(filtrert)
}

// ── Kort (mobil) ──────────────────────────────────────────────────────────────

function kortHtml(s: StevneRow): string {
  const dato = formaterDato(s.dato)
  const sted = s.sted ? `<p class="tl-detalj">Sted: ${escHtml(s.sted)}</p>` : ''
  const arrangør = s.klubb ? `<p class="tl-detalj">Arrangør: ${escHtml(s.klubb.navn ?? '')}</p>` : ''
  const type = s.stevnetype ? `<p class="tl-detalj">Type: ${escHtml(s.stevnetype.navn ?? '')}</p>` : ''
  const nm = s.ernm ? '<span class="tl-nm-merke">NM</span>' : ''
  const innbydelse = s.innbydelseurl
    ? `<a class="tl-innbydelse-lenke" href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse 📄</a>`
    : ''
  const resultat = s.resultaturl
    ? `<a class="stevne-lenke" href="#/stevne/${s.id}/resultat">Vis resultat</a>`
    : ''

  const erKomande = s.dato && new Date(s.dato + 'T12:00:00') > new Date()
  const rolle = _auth?.profil?.rolle
  const harTilgang = _auth?.profil?.kobling_status === 'godkjent' || rolle === 'admin' || rolle === 'klubbadmin'
  const erPameldt = _pameldteIds.has(s.id)
  const pameldingLenke = !harTilgang ? ''
    : erPameldt
      ? `<a class="stevne-lenke" href="#/stevne/${s.id}/pamelding">Påmeldt ✓</a>`
      : erKomande && !s.erfullfort
        ? `<a class="stevne-lenke" href="#/stevne/${s.id}/pamelding">Meld meg på</a>`
        : ''

  return `
    <div class="stevne-kort tl-kort">
      <a class="tl-navn tl-navn-lenke" href="#/stevne/${s.id}/resultat">${nm}${escHtml(s.navn ?? '')}</a>
      <p class="stevne-dato">${dato}</p>
      ${sted}${arrangør}${type}
      ${innbydelse}${resultat}${pameldingLenke}
    </div>
  `
}

function byggListe(filtrert: StevneRow[]): string {
  if (filtrert.length === 0) {
    return '<p class="laster">Ingen stevner funnet med valgte filtre.</p>'
  }
  return `<div class="stevne-liste">${filtrert.map(kortHtml).join('')}</div>`
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = lasterHtml('Laster terminliste…')

  try {
    const [{ data, error }, { data: filtervalg }, auth] = await Promise.all([
      hentTerminlisteStevner(filtre.ar),
      hentFiltervalg(),
      getUser(),
    ])
    _auth = auth
    _pameldteIds = auth?.user ? await hentPameldteForBruker(auth.user.id) : new Set()

    if (error) {
      logError('terminliste.render', error)
      container.innerHTML = feilHtml('Kunne ikkje laste terminliste.')
      return
    }

    allData = data ?? []

    container.innerHTML = `
      <div class="terminliste">
        <h1 class="tl-tittel">Terminliste ${filtre.ar}</h1>

        <!-- Desktop-filterrad -->
        <div class="tl-filter-rad">
          <select class="tl-select" id="tl-ar">${arOptions(filtre.ar, 1983, new Date().getFullYear() + 1)}</select>
          <input class="tl-input" id="tl-tekst" type="search" placeholder="Søk..." value="${escHtml(filtre.tekst)}">
          <select class="tl-select" id="tl-stevnetype">${buildDropdownOptions(filtervalg.stevnetyper, filtre.stevnetypeId, 'Alle typer')}</select>
          <select class="tl-select" id="tl-kastemetode">${buildDropdownOptions(filtervalg.kastemetoder, filtre.kastemetodeId, 'Alle metoder')}</select>
          <select class="tl-select" id="tl-arrangorklubb">${buildDropdownOptions(filtervalg.klubber, filtre.klubbId, 'Alle arrangører')}</select>
          <select class="tl-select" id="tl-kategori">${buildDropdownOptions(filtervalg.kategorier, filtre.kategoriId, 'Alle kategorier')}</select>
          <button class="tl-excel-knapp" id="tl-excel-desktop">⬇ Excel</button>
        </div>

        <!-- Mobil-rad -->
        <div class="tl-mobil-rad">
          <input class="tl-input" id="tl-tekst-mobil" type="search" placeholder="Søk..." value="${escHtml(filtre.tekst)}">
          <button class="tl-filter-knapp" id="tl-filter-aapne">Filter ≡</button>
          <button class="tl-excel-knapp" id="tl-excel-mobil">⬇ Excel</button>
        </div>

        <p class="tl-antall"></p>

        <div class="tl-liste-container"></div>
      </div>

      <!-- Bunnark for mobilfiltre -->
      <div class="tl-bunnark-bakgrunn" id="tl-bakgrunn"></div>
      <div class="tl-bunnark" id="tl-bunnark">
        <div class="tl-bunnark-innhold">
          <h2 class="tl-bunnark-tittel">Filtre</h2>
          <label class="tl-label">År
            <select class="tl-select" id="tl-ar-mobil">${arOptions(filtre.ar, 1983, new Date().getFullYear() + 1)}</select>
          </label>
          <label class="tl-label">Stevnetype
            <select class="tl-select" id="tl-stevnetype-mobil">${buildDropdownOptions(filtervalg.stevnetyper, filtre.stevnetypeId, 'Alle typer')}</select>
          </label>
          <label class="tl-label">Kastemetode
            <select class="tl-select" id="tl-kastemetode-mobil">${buildDropdownOptions(filtervalg.kastemetoder, filtre.kastemetodeId, 'Alle metoder')}</select>
          </label>
          <label class="tl-label">Arrangør
            <select class="tl-select" id="tl-arrangorklubb-mobil">${buildDropdownOptions(filtervalg.klubber, filtre.klubbId, 'Alle arrangører')}</select>
          </label>
          <label class="tl-label">Kategori
            <select class="tl-select" id="tl-kategori-mobil">${buildDropdownOptions(filtervalg.kategorier, filtre.kategoriId, 'Alle kategorier')}</select>
          </label>
          <div class="tl-bunnark-knapper">
            <button class="tl-tilbakestill-knapp" id="tl-tilbakestill">Tilbakestill</button>
            <button class="tl-bruk-knapp" id="tl-bruk">Bruk filter</button>
          </div>
        </div>
      </div>
    `

    function oppdaterListe(): StevneRow[] {
      const filtrert = filtrerData(allData)
      container.querySelector<HTMLElement>('.tl-liste-container')!.innerHTML = byggVisning(filtrert)
      const antall = container.querySelector('.tl-antall')
      if (antall) antall.textContent = `${filtrert.length} stevner`
      return filtrert
    }

    oppdaterListe()

    if (auth?.profil && (auth.profil.rolle === 'admin' || auth.profil.rolle === 'klubbadmin')) {
      const bar = document.createElement('div')
      bar.className = 'mb-3 px-2 d-flex gap-2'
      bar.innerHTML = '<a href="#/stevne/ny" class="btn btn-sm btn-success">+ Nytt stevne</a>'
      container.querySelector('.terminliste')?.prepend(bar)
    }

    // ── Event-lyttarar ──

    const listeContainer = container.querySelector<HTMLElement>('.tl-liste-container')!
    const arSelect = container.querySelector<HTMLSelectElement>('#tl-ar')!
    const tekstInput = container.querySelector<HTMLInputElement>('#tl-tekst')!
    const tekstMobilInput = container.querySelector<HTMLInputElement>('#tl-tekst-mobil')!
    const stevnetypeSelect = container.querySelector<HTMLSelectElement>('#tl-stevnetype')!
    const kastemetodeSelect = container.querySelector<HTMLSelectElement>('#tl-kastemetode')!
    const arrangorklubbSelect = container.querySelector<HTMLSelectElement>('#tl-arrangorklubb')!
    const kategoriSelect = container.querySelector<HTMLSelectElement>('#tl-kategori')!
    const excelDesktopBtn = container.querySelector<HTMLButtonElement>('#tl-excel-desktop')!
    const excelMobilBtn = container.querySelector<HTMLButtonElement>('#tl-excel-mobil')!
    const filterAapneBtn = container.querySelector<HTMLButtonElement>('#tl-filter-aapne')!
    const bunnark = container.querySelector<HTMLElement>('#tl-bunnark')!
    const bakgrunn = container.querySelector<HTMLElement>('#tl-bakgrunn')!
    const tilbakestillBtn = container.querySelector<HTMLButtonElement>('#tl-tilbakestill')!
    const brukBtn = container.querySelector<HTMLButtonElement>('#tl-bruk')!
    const arMobilSelect = container.querySelector<HTMLSelectElement>('#tl-ar-mobil')!
    const stevnetypeMobilSelect = container.querySelector<HTMLSelectElement>('#tl-stevnetype-mobil')!
    const kastemetodeMobilSelect = container.querySelector<HTMLSelectElement>('#tl-kastemetode-mobil')!
    const arrangorklubbMobilSelect = container.querySelector<HTMLSelectElement>('#tl-arrangorklubb-mobil')!
    const kategoriMobilSelect = container.querySelector<HTMLSelectElement>('#tl-kategori-mobil')!

    listeContainer.addEventListener('click', e => {
      const th = (e.target as Element).closest<HTMLElement>('[data-kolonne]')
      if (!th) return
      const kolonne = th.dataset.kolonne!
      if (sortering.kolonne === kolonne) {
        sortering.retning = sortering.retning === 'asc' ? 'desc' : 'asc'
      } else {
        sortering.kolonne = kolonne
        sortering.retning = 'asc'
      }
      oppdaterListe()
    })

    let resizeTimer: number | null = null
    window.addEventListener('resize', () => {
      if (resizeTimer !== null) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(oppdaterListe, 200)
    })

    arSelect.addEventListener('change', async () => {
      filtre.ar = Number(arSelect.value)
      container.querySelector('.tl-tittel')!.textContent = `Terminliste ${filtre.ar}`
      container.querySelector('.tl-liste-container')!.innerHTML = '<p class="laster">Laster...</p>'
      const { data: nyData, error: nyFeil } = await hentTerminlisteStevner(filtre.ar)
      if (nyFeil) {
        logError('terminliste.arChange', nyFeil)
        container.querySelector<HTMLElement>('.tl-liste-container')!.innerHTML = feilHtml('Feil ved henting.')
        return
      }
      allData = nyData ?? []
      oppdaterListe()
    })

    tekstInput.addEventListener('input', () => {
      filtre.tekst = tekstInput.value
      oppdaterListe()
    })

    tekstMobilInput.addEventListener('input', () => {
      filtre.tekst = tekstMobilInput.value
      tekstInput.value = tekstMobilInput.value
      oppdaterListe()
    })

    stevnetypeSelect.addEventListener('change', () => { filtre.stevnetypeId = stevnetypeSelect.value; oppdaterListe() })
    kastemetodeSelect.addEventListener('change', () => { filtre.kastemetodeId = kastemetodeSelect.value; oppdaterListe() })
    arrangorklubbSelect.addEventListener('change', () => { filtre.klubbId = arrangorklubbSelect.value; oppdaterListe() })
    kategoriSelect.addEventListener('change', () => { filtre.kategoriId = kategoriSelect.value; oppdaterListe() })

    const excelHandler = () => lastNedExcel(filtrerData(allData))
    excelDesktopBtn.addEventListener('click', excelHandler)
    excelMobilBtn.addEventListener('click', excelHandler)

    function apneBunnark() { bunnark.classList.add('aktiv'); bakgrunn.classList.add('aktiv') }
    function lukkBunnark() { bunnark.classList.remove('aktiv'); bakgrunn.classList.remove('aktiv') }

    filterAapneBtn.addEventListener('click', apneBunnark)
    bakgrunn.addEventListener('click', lukkBunnark)

    tilbakestillBtn.addEventListener('click', () => {
      filtre.tekst = ''
      filtre.stevnetypeId = ''
      filtre.kastemetodeId = ''
      filtre.klubbId = ''
      filtre.kategoriId = ''
      stevnetypeMobilSelect.value = ''
      kastemetodeMobilSelect.value = ''
      arrangorklubbMobilSelect.value = ''
      kategoriMobilSelect.value = ''
      tekstMobilInput.value = ''
      tekstInput.value = ''
      oppdaterListe()
    })

    brukBtn.addEventListener('click', async () => {
      const nyttAr = Number(arMobilSelect.value)
      const arEndret = nyttAr !== filtre.ar
      filtre.ar = nyttAr
      filtre.stevnetypeId = stevnetypeMobilSelect.value
      filtre.kastemetodeId = kastemetodeMobilSelect.value
      filtre.klubbId = arrangorklubbMobilSelect.value
      filtre.kategoriId = kategoriMobilSelect.value
      lukkBunnark()

      if (arEndret) {
        container.querySelector('.tl-tittel')!.textContent = `Terminliste ${filtre.ar}`
        container.querySelector('.tl-liste-container')!.innerHTML = '<p class="laster">Laster...</p>'
        const { data: nyData, error: nyFeil } = await hentTerminlisteStevner(filtre.ar)
        if (nyFeil) {
          logError('terminliste.brukFilter', nyFeil)
          container.querySelector<HTMLElement>('.tl-liste-container')!.innerHTML = feilHtml('Feil ved henting.')
          return
        }
        allData = nyData ?? []
      }
      oppdaterListe()
    })
  } catch (err) {
    logError('terminliste.render', err)
    container.innerHTML = feilHtml('Kunne ikkje laste terminliste.')
  }
}
