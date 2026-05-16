import { kasterNavn } from '../utils/kaster'
import { escHtml } from '../utils/escHtml'
import { logError } from '../utils/logError'
import { formaterPoeng, byggSingelListe, byggLagListe } from '../utils/norgescup'
import { hentRegler, hentStevnerOgResultater } from '../services/norgescupService'
import { formaterDato, arOptions } from '../utils/shared'
import { createErrorBanner } from '../components/ErrorBanner'
import { createLoadingState } from '../components/LoadingState'
import { createEmptyState } from '../components/EmptyState'
import type { Tables } from '../types'
import type { ResultatMedRelasjonar, StevneForNc } from '../services/norgescupService'
import type { SingelListeRad, LagListeRad } from '../utils/norgescup'

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

function singelTabellHtml(liste: SingelListeRad[]): string {
  if (liste.length === 0) return '<p class="empty-state">Ingen resultater funnet.</p>'

  const rader = liste.map((k, i) => {
    const detaljer = k.detaljRader.map(r => `
      <tr>
        <td>${formaterDato(r._stevne?.dato)}</td>
        <td>${escHtml(r._stevne?.typeNavn ?? '–')}</td>
        <td>${escHtml(r._stevne?.navn ?? '–')}</td>
        <td>${r.plassering ?? '–'}</td>
        <td>${formaterPoeng(r.nc_poeng)}</td>
      </tr>`).join('')

    return `
      <tr class="nc-singel-rad">
        <td class="nc-td-pl">${k.plassering}</td>
        <td>${escHtml(k.navn)}</td>
        <td>${escHtml(k.klubb)}</td>
        <td class="nc-td-poeng nc-poeng-celle" data-idx="${i}">${formaterPoeng(k.totalPoeng)}<span class="nc-chevron"> ▼</span></td>
      </tr>
      <tr class="nc-detalj-rad d-none" data-idx="${i}">
        <td colspan="4">
          <table class="nc-detalj-tabell">
            <thead><tr><th>Dato</th><th>Type</th><th>Stevne</th><th>Pl.</th><th>Poeng</th></tr></thead>
            <tbody>${detaljer}</tbody>
          </table>
        </td>
      </tr>`
  }).join('')

  return `
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Navn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${rader}</tbody>
    </table>`
}

function lagTabellHtml(lagListe: LagListeRad[]): string {
  if (lagListe.length === 0) return '<p class="empty-state">Ingen lag funnet.</p>'

  const rader = lagListe.map((lag, i) => {
    const bidrag = lag.bidragsytere.map(b =>
      `<tr><td>${escHtml(kasterNavn(b.kaster))}</td><td class="nc-td-poeng">${formaterPoeng(b.sum)}</td></tr>`
    ).join('')

    return `
      <tr class="nc-lag-rad">
        <td class="nc-td-pl">${lag.plassering}</td>
        <td>${escHtml(lag.klubb?.navn ?? '–')}</td>
        <td class="nc-td-poeng nc-lag-poeng-celle" data-lag-idx="${i}">${formaterPoeng(lag.lagTotal)}<span class="nc-chevron"> ▼</span></td>
      </tr>
      <tr class="nc-lag-detalj-rad d-none" data-lag-idx="${i}">
        <td colspan="3">
          <table class="nc-detalj-tabell">
            <tbody>${bidrag}</tbody>
          </table>
        </td>
      </tr>`
  }).join('')

  return `
    <table class="nc-tabell">
      <thead class="nc-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${rader}</tbody>
    </table>`
}

function sideSkelettHtml(ar: number, cupType: string): string {
  return `
    <div class="nc-side">
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
        lagContainer.innerHTML = lagTabellHtml(lagListe)
        lagContainer.addEventListener('click', e => {
          const celle = (e.target as Element).closest<HTMLElement>('.nc-lag-poeng-celle')
          if (!celle) return
          const idx = celle.dataset.lagIdx
          const detalj = content.querySelector<HTMLElement>(`.nc-lag-detalj-rad[data-lag-idx="${idx}"]`)
          if (!detalj) return
          const skjult = detalj.classList.contains('d-none')
          detalj.classList.toggle('d-none')
          celle.querySelector('.nc-chevron')!.textContent = skjult ? ' ▲' : ' ▼'
        })
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
        singelContainer.innerHTML = singelTabellHtml(singelListe)
        singelContainer.addEventListener('click', e => {
          const celle = (e.target as Element).closest<HTMLElement>('.nc-poeng-celle')
          if (!celle) return
          const idx = celle.dataset.idx
          const detalj = content.querySelector<HTMLElement>(`.nc-detalj-rad[data-idx="${idx}"]`)
          if (!detalj) return
          const skjult = detalj.classList.contains('d-none')
          detalj.classList.toggle('d-none')
          celle.querySelector('.nc-chevron')!.textContent = skjult ? ' ▲' : ' ▼'
        })
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
