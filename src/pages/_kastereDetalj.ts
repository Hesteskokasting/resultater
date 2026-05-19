import { Chart, registerables } from 'chart.js'
import { kasterNavn } from '@/utils/kaster'
import { getUser } from '@/services/authService'
import { formaterDato, formaterProsent } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { hentKasterDetalj } from '@/services/kasterService'
import type { KasterDetaljRow, ResultatDetaljRow } from '@/services/kasterService'
import {
  FOERSTE_RING_AR, MAX_RING,
  hentAr, harMetode, beregnStatistikk,
  hentTidlegareKlubbar, beregnGrafVerdi, byggGrafData,
} from '@/utils/kasterDetaljLogikk'
import type { MetodeNamn } from '@/utils/kasterDetaljLogikk'

Chart.register(...registerables)

// ── Modul-tilstand ────────────────────────────────────────────────────────────

const filtreDetalj = {
  aktiv:       'resultater',
  ar:          'alle',
  stevnetype:  'alle',
  grafMetrikk: 'plassering',
  grafMetode:  'kongelag' as MetodeNamn,
  grafFra:     null as string | null,
  grafTil:     null as string | null,
}

let aktivChart: Chart | null = null

// ── Opprydding ────────────────────────────────────────────────────────────────

export function destroyChart(): void {
  if (aktivChart) {
    aktivChart.destroy()
    aktivChart = null
  }
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function detaljSkelettHtml(kaster: KasterDetaljRow, resultater: ResultatDetaljRow[]): string {
  const namn = escHtml(kasterNavn(kaster))
  const nr   = kaster.medlemsnummer ? ` ${kaster.medlemsnummer}` : ''
  const ar   = [...new Set(resultater.map(r => hentAr(r.stevne?.dato)).filter((a): a is number => a !== null))].sort((a, b) => b - a)
  const typar = [...new Map(
    resultater.map(r => r.stevne?.stevnetype).filter((t): t is { id: number; navn: string } => t != null).map(t => [t.id, t.navn])
  ).entries()].sort((a, b) => a[1].localeCompare(b[1]))

  const metodeSkjult = filtreDetalj.grafMetrikk !== 'prosent' ? ' d-none' : ''

  return `
    <div class="nc-side">
      <div class="mb-3">
        <a href="#/kastere" class="btn btn-sm btn-outline-secondary">← Tilbake</a>
      </div>
      <h1 class="kaster-detalj-tittel">${namn}${escHtml(nr)}</h1>
      <p class="kaster-detalj-klubb">${escHtml(kaster.klubb?.navn ?? '–')}</p>

      <div class="kaster-tab-rad">
        <button class="btn btn-sm kaster-tab-knapp${filtreDetalj.aktiv === 'resultater' ? ' active' : ''}" data-tab="resultater">Resultat</button>
        <button class="btn btn-sm kaster-tab-knapp${filtreDetalj.aktiv === 'statistikk' ? ' active' : ''}" data-tab="statistikk">Statistikk</button>
        <button class="btn btn-sm kaster-tab-knapp${filtreDetalj.aktiv === 'graf' ? ' active' : ''}" data-tab="graf">Vis graf</button>
      </div>
      <hr>

      <div id="kd-tab-resultater" class="kd-tab${filtreDetalj.aktiv === 'resultater' ? '' : ' kd-skjult'}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-ar" class="tl-select">
            <option value="alle">Vel årstal</option>
            ${ar.map(a => `<option value="${a}"${filtreDetalj.ar == String(a) ? ' selected' : ''}>${a}</option>`).join('')}
          </select>
          <select id="kd-type" class="tl-select">
            <option value="alle">Alle stevnetypar</option>
            ${typar.map(([id, n]) => `<option value="${id}">${escHtml(n)}</option>`).join('')}
          </select>
        </div>
        <div id="kd-resultat-tabell"></div>
      </div>

      <div id="kd-tab-statistikk" class="kd-tab${filtreDetalj.aktiv === 'statistikk' ? '' : ' kd-skjult'}">
        <div id="kd-stat-innhald"></div>
      </div>

      <div id="kd-tab-graf" class="kd-tab${filtreDetalj.aktiv === 'graf' ? '' : ' kd-skjult'}">
        <div class="nc-filter-rad mb-3">
          <select id="kd-graf-metrikk" class="tl-select">
            <option value="plassering"${filtreDetalj.grafMetrikk === 'plassering' ? ' selected' : ''}>Plassering</option>
            <option value="prosent"${filtreDetalj.grafMetrikk === 'prosent' ? ' selected' : ''}>% Ring (frå 2017)</option>
          </select>
          <select id="kd-graf-metode" class="tl-select${metodeSkjult}">
            <option value="kongelag"${filtreDetalj.grafMetode === 'kongelag' ? ' selected' : ''}>Kongelag</option>
            <option value="minimatch"${filtreDetalj.grafMetode === 'minimatch' ? ' selected' : ''}>Minimatch</option>
            <option value="halvmatch"${filtreDetalj.grafMetode === 'halvmatch' ? ' selected' : ''}>Halvmatch</option>
            <option value="heilmatch"${filtreDetalj.grafMetode === 'heilmatch' ? ' selected' : ''}>Heilmatch</option>
          </select>
          <select id="kd-graf-fra" class="tl-select">
            <option value="">Frå år</option>
            ${ar.map(a => `<option value="${a}"${filtreDetalj.grafFra == String(a) ? ' selected' : ''}>${a}</option>`).join('')}
          </select>
          <select id="kd-graf-til" class="tl-select">
            <option value="">Til år</option>
            ${ar.map(a => `<option value="${a}"${filtreDetalj.grafTil == String(a) ? ' selected' : ''}>${a}</option>`).join('')}
          </select>
        </div>
        <div class="kaster-graf-wrapper">
          <canvas id="kd-graf-canvas"></canvas>
        </div>
      </div>
    </div>`
}

function resultatTabellHtml(resultater: ResultatDetaljRow[], arFilter: string, typeFilter: string): string {
  let filtrert = resultater
  if (arFilter !== 'alle') filtrert = filtrert.filter(r => String(hentAr(r.stevne?.dato)) === arFilter)
  if (typeFilter !== 'alle') filtrert = filtrert.filter(r => String(r.stevne?.stevnetype?.id) === typeFilter)

  const ant      = filtrert.length
  const infoHtml = `
    <div class="kaster-resultat-info">
      <span>Antal: <strong>${ant}</strong></span>
      <span class="kaster-resultat-hint">Antal ringar i parentes (frå ${FOERSTE_RING_AR})</span>
    </div>`

  if (!ant) return infoHtml + '<p class="empty-state">Ingen resultat funnet.</p>'

  const ringTekst = (poeng: number | null, ring: number | null): string => {
    if (poeng == null) return ''
    return ring != null ? `${poeng} (${ring})` : `${poeng}`
  }

  const rader = filtrert.map(r => {
    const s = r.stevne
    const stevneHtml = s?.id
      ? `<a href="#/stevne/${s.id}/resultat" class="tl-lenkje">${escHtml(s.navn ?? '')}</a>`
      : escHtml(s?.navn ?? '–')
    return `
      <tr>
        <td class="text-nowrap">${formaterDato(s?.dato)}</td>
        <td>${stevneHtml}</td>
        <td>${escHtml(s?.stevnetype?.navn ?? '–')}</td>
        <td>${escHtml(r.klubb?.navn ?? '–')}</td>
        <td class="text-center fw-bold">${r.plassering ?? '–'}</td>
        <td class="text-center">${ringTekst(r.poeng_kongelag, r.antall_ring_kongelag)}</td>
        <td class="text-center">${ringTekst(r.poeng_xkast, r.antall_ring_xkast)}</td>
      </tr>`
  }).join('')

  return infoHtml + `
    <div class="table-responsive">
      <table class="app-tabell">
        <thead class="app-thead">
          <tr>
            <th>Dato</th><th>Stevne</th><th>Type</th><th>Klubb</th>
            <th>Pl.</th><th>Kongelag</th><th>X-kast</th>
          </tr>
        </thead>
        <tbody>${rader}</tbody>
      </table>
    </div>`
}

function statistikkHtml(resultater: ResultatDetaljRow[], kaster: KasterDetaljRow): string {
  const stats     = beregnStatistikk(resultater)
  const tidlegare = hentTidlegareKlubbar(resultater, kaster.klubb?.id ?? null)

  const statsRader = stats.map(({ label, rekord, snittPoeng, snittProsent }) => `
    <tr>
      <td>${label}</td>
      <td class="text-center">${rekord ?? '–'}</td>
      <td class="text-center">${snittPoeng ?? '–'}</td>
      <td class="text-center">${snittProsent != null ? formaterProsent(snittProsent) : '–'}</td>
    </tr>`).join('')

  const tidlegareHtml = tidlegare.length
    ? `<div class="kaster-tidlegare-klubbar">
        <h4 class="kaster-tidlegare-tittel">Tidlegare klubbar</h4>
        <ul class="list-unstyled">${tidlegare.map(n => `<li>${escHtml(n)}</li>`).join('')}</ul>
      </div>`
    : ''

  return `
    <div class="kaster-stat-grid">
      <div>
        <h4>Statistikk</h4>
        <table class="app-tabell">
          <thead class="app-thead">
            <tr>
              <th></th><th>Rekord</th><th>Snitt Poeng</th><th>% Ring (frå ${FOERSTE_RING_AR})</th>
            </tr>
          </thead>
          <tbody>${statsRader}</tbody>
        </table>
      </div>
      ${tidlegareHtml}
    </div>`
}

// ── Graf-rendering ────────────────────────────────────────────────────────────

function teiknGraf(canvas: HTMLCanvasElement, resultater: ResultatDetaljRow[]): void {
  destroyChart()

  const { labels, stevneNamn, verdiar } = byggGrafData(
    resultater,
    filtreDetalj.grafMetrikk,
    filtreDetalj.grafMetode,
    filtreDetalj.grafFra ? Number(filtreDetalj.grafFra) : null,
    filtreDetalj.grafTil ? Number(filtreDetalj.grafTil) : null,
  )

  if (!verdiar.length) {
    const wrapper = canvas.parentElement
    if (wrapper) {
      const el = createEmptyState('Ingen data for valt filter.')
      el.classList.add('pt-3')
      wrapper.replaceChildren(el)
    }
    return
  }

  const erPlassering = filtreDetalj.grafMetrikk === 'plassering'
  const yLabel = erPlassering ? 'Plassering' : '% Ring'

  // Chart.js config uses JS color values — CSS variables cannot be used directly here
  aktivChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: yLabel,
        data: verdiar,
        borderColor: '#4e8fc7',
        backgroundColor: 'rgba(78,143,199,0.15)',
        pointBackgroundColor: '#4e8fc7',
        pointRadius: 4,
        tension: 0.1,
        fill: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { maxTicksLimit: 14, maxRotation: 45, color: '#ccc' },
          grid:  { color: 'rgba(255,255,255,0.08)' },
        },
        y: {
          reverse: erPlassering,
          ticks: { color: '#ccc' },
          grid:  { color: 'rgba(255,255,255,0.08)' },
          title: { display: true, text: yLabel, color: '#ccc' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => stevneNamn[items[0].dataIndex] ?? labels[items[0].dataIndex] ?? '',
            label: items => `${yLabel}: ${items.raw}`,
          },
        },
      },
    },
  })
}

// ── Render: Detalj ────────────────────────────────────────────────────────────

export async function renderDetalj(container: HTMLElement, id: number): Promise<void> {
  filtreDetalj.aktiv       = 'resultater'
  filtreDetalj.ar          = 'alle'
  filtreDetalj.stevnetype  = 'alle'
  filtreDetalj.grafMetrikk = 'plassering'
  filtreDetalj.grafMetode  = 'kongelag'
  filtreDetalj.grafFra     = null
  filtreDetalj.grafTil     = null
  destroyChart()

  container.replaceChildren(createLoadingState('Laster utøvar...'))

  try {
    const { kaster: kasterNullable, resultater, error } = await hentKasterDetalj(id)
    if (error || !kasterNullable) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste utøvar.'))
      return
    }
    // Re-assign to const so TypeScript narrows the type into closures below
    const kaster = kasterNullable

    container.innerHTML = detaljSkelettHtml(kaster, resultater)

    const arSelect   = container.querySelector<HTMLSelectElement>('#kd-ar')!
    const typeSelect = container.querySelector<HTMLSelectElement>('#kd-type')!
    const metodeEl   = container.querySelector<HTMLSelectElement>('#kd-graf-metode')!

    function oppdaterResultatar(): void {
      container.querySelector<HTMLElement>('#kd-resultat-tabell')!.innerHTML =
        resultatTabellHtml(resultater, filtreDetalj.ar, filtreDetalj.stevnetype)
    }

    function oppdaterStatistikk(): void {
      container.querySelector<HTMLElement>('#kd-stat-innhald')!.innerHTML =
        statistikkHtml(resultater, kaster)
    }

    function oppdaterGraf(): void {
      const canvas = container.querySelector<HTMLCanvasElement>('#kd-graf-canvas')
      if (!canvas) return
      teiknGraf(canvas, resultater)
    }

    function byttTab(tab: string): void {
      filtreDetalj.aktiv = tab
      container.querySelectorAll('.kaster-tab-knapp').forEach(k => {
        k.classList.toggle('active', (k as HTMLElement).dataset.tab === tab)
      })
      container.querySelectorAll('.kd-tab').forEach(el => {
        el.classList.toggle('kd-skjult', el.id !== `kd-tab-${tab}`)
      })
      if (tab === 'statistikk') oppdaterStatistikk()
      if (tab === 'graf') oppdaterGraf()
    }

    oppdaterResultatar()

    arSelect.addEventListener('change', () => {
      filtreDetalj.ar = arSelect.value
      oppdaterResultatar()
    })

    typeSelect.addEventListener('change', () => {
      filtreDetalj.stevnetype = typeSelect.value
      oppdaterResultatar()
    })

    container.querySelectorAll<HTMLElement>('.kaster-tab-knapp').forEach(k => {
      k.addEventListener('click', () => byttTab(k.dataset.tab ?? ''))
    })

    const metrikkEl = container.querySelector<HTMLSelectElement>('#kd-graf-metrikk')!
    metrikkEl.addEventListener('change', () => {
      filtreDetalj.grafMetrikk = metrikkEl.value
      metodeEl.classList.toggle('d-none', metrikkEl.value !== 'prosent')
      oppdaterGraf()
    })

    metodeEl.addEventListener('change', () => {
      filtreDetalj.grafMetode = metodeEl.value as MetodeNamn
      oppdaterGraf()
    })

    const fraEl = container.querySelector<HTMLSelectElement>('#kd-graf-fra')!
    const tilEl = container.querySelector<HTMLSelectElement>('#kd-graf-til')!

    fraEl.addEventListener('change', () => {
      filtreDetalj.grafFra = fraEl.value || null
      oppdaterGraf()
    })

    tilEl.addEventListener('change', () => {
      filtreDetalj.grafTil = tilEl.value || null
      oppdaterGraf()
    })

    void getUser().then(auth => {
      if (!auth?.profil) return
      const kanRedigere = auth.profil.rolle === 'admin' ||
        (auth.profil.rolle === 'klubbadmin' && auth.klubber.includes(kaster.klubbid ?? -1))
      if (!kanRedigere) return
      const bar = document.createElement('div')
      bar.className = 'mb-2 px-2'
      bar.innerHTML = `<a href="#/kaster/${id}/admin" class="btn btn-sm btn-warning">Rediger utøvar</a>`
      container.querySelector('.nc-side')?.prepend(bar)
    })
  } catch (err) {
    logError('renderDetalj', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste utøvar.'))
  }
}
