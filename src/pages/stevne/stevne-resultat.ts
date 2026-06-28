import { kasterNavn, lagKasterSlug } from '@/utils/kaster'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { createEmptyState } from '@/components/EmptyState'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { hentStevneMedDetaljer, hentResultaterForStevne } from '@/services/resultatService'
import type { ResultatRad } from '@/services/resultatService'

// ── Typar ─────────────────────────────────────────────────────────────────────

interface GruppeEntry {
  label: string
  rader: ResultatRad[]
}

interface ColFlags {
  isParMix: boolean
  showKpSp: boolean
  showNc: boolean
}

const NC_STEVNETYPER = new Set(['NC', 'SNC', 'DNC'])
const KP_SP_INNLEDENDE = new Set(['Gloppen', 'Nordhordlandsmetoden'])

// ── Hjelpefunksjonar ──────────────────────────────────────────────────────────

/** Club display for a pair — "Klubb A / Klubb B" if different, "Klubb A" if same. */
function parKlubbDisplay(par: ResultatRad[]): string {
  const seen = new Set<string>()
  const names: string[] = []
  for (const r of par) {
    const name = r.klubb?.navn ?? '–'
    if (!seen.has(name)) { seen.add(name); names.push(name) }
  }
  return names.map(escHtml).join(' / ')
}

/** Groups rows within a gruppe by startnummer for Par/Mix display. */
function grupperParVis(rader: ResultatRad[]): ResultatRad[][] {
  const map = new Map<number | string, ResultatRad[]>()
  let fallbackIdx = 0
  for (const r of rader) {
    const key = r.startnummer != null ? r.startnummer : `_${fallbackIdx++}`
    const group = map.get(key) ?? []
    group.push(r)
    map.set(key, group)
  }
  return [...map.values()]
}

function grupperResultater(resultater: ResultatRad[], erFoer2026: boolean): GruppeEntry[] {
  const grupper = new Map<string, GruppeEntry>()

  for (const r of resultater) {
    const gruppeNavn = r.gruppe?.navn ?? '–'
    const klasseNavn = r.klasse?.navn ?? null
    const key = erFoer2026 ? `${klasseNavn ?? ''}|${gruppeNavn}` : gruppeNavn
    const label  = erFoer2026 ? `${klasseNavn ? klasseNavn + ' ' : ''}${gruppeNavn}` : gruppeNavn

    if (!grupper.has(key)) grupper.set(key, { label, rader: [] })
    grupper.get(key)!.rader.push(r)
  }

  return [...grupper.values()].sort((a, b) => a.label.localeCompare(b.label, 'nb'))
}

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function mobilMetaHtml(rep: ResultatRad, cols: ColFlags): string {
  const parts: string[] = []
  if (cols.showKpSp) parts.push(`KP ${rep.kamp_poeng_innl ?? '–'}`, `SP ${rep.score_poeng_innl ?? '–'}`)
  if (cols.showNc)   parts.push(`NC ${rep.nc_poeng ?? '–'}`)
  return parts.length ? `<span class="res-meta">${parts.join('  ')}</span>` : ''
}

function mobilGruppeHtml(gruppe: GruppeEntry, cols: ColFlags): string {
  const rader = cols.isParMix
    ? grupperParVis(gruppe.rader).map(par => {
        const rep = par[0]!
        const navneHtml = par.map(r => escHtml(kasterNavn(r.kaster) || '–')).join(' og ')
        return `
          <div class="res-rad">
            <span class="res-pl">${rep.plassering ?? '–'}.</span>
            <div class="res-info">
              <span class="res-navn">${navneHtml}</span>
              <span class="res-klubb">${parKlubbDisplay(par)}</span>
              ${mobilMetaHtml(rep, cols)}
            </div>
          </div>`
      }).join('')
    : gruppe.rader.map(r => `
        <div class="res-rad">
          <span class="res-pl">${r.plassering ?? '–'}.</span>
          <div class="res-info">
            <span class="res-navn">${escHtml(kasterNavn(r.kaster) || '–')}</span>
            <span class="res-klubb">${escHtml(r.klubb?.navn ?? '–')}</span>
            ${mobilMetaHtml(r, cols)}
          </div>
        </div>`).join('')

  return `
    <div class="res-gruppe">
      <h2 class="res-gruppe-tittel">${escHtml(gruppe.label)}</h2>
      <div class="res-gruppe-rader">${rader}</div>
    </div>`
}

function desktopRadHtml(
  plassering: number | null,
  navneHtml: string,
  klubbHtml: string,
  rep: ResultatRad,
  cols: ColFlags,
): string {
  return `
    <tr>
      <td class="res-td-pl">${plassering ?? '–'}</td>
      <td class="res-td-navn">${navneHtml}</td>
      <td class="res-td-klubb">${klubbHtml}</td>
      ${cols.showKpSp ? `<td class="res-td-kp">${rep.kamp_poeng_innl ?? ''}</td><td class="res-td-sp">${rep.score_poeng_innl ?? ''}</td>` : ''}
      ${cols.showNc   ? `<td class="res-td-nc">${rep.nc_poeng ?? ''}</td>` : ''}
    </tr>`
}

function desktopGruppeHtml(gruppe: GruppeEntry, cols: ColFlags): string {
  const rader = cols.isParMix
    ? grupperParVis(gruppe.rader).map(par => {
        const rep = par[0]!
        const navneHtml = par.map(r => {
          const k = r.kaster
          return k
            ? `<a href="#/kastere/${lagKasterSlug(k)}" class="res-kaster-lenke">${escHtml(kasterNavn(k))}</a>`
            : '–'
        }).join(' og ')
        return desktopRadHtml(rep.plassering, navneHtml, parKlubbDisplay(par), rep, cols)
      }).join('')
    : gruppe.rader.map(r => {
        const k = r.kaster
        const navneHtml = k
          ? `<a href="#/kastere/${lagKasterSlug(k)}" class="res-kaster-lenke">${escHtml(kasterNavn(k))}</a>`
          : '–'
        return desktopRadHtml(r.plassering, navneHtml, escHtml(r.klubb?.navn ?? '–'), r, cols)
      }).join('')

  const colspan = 3 + (cols.showKpSp ? 2 : 0) + (cols.showNc ? 1 : 0)

  return `
    <div class="res-tabell-seksjon">
      <table class="res-tabell">
        <thead>
          <tr class="res-thead-gruppe">
            <td colspan="${colspan}" class="res-td-gruppe-header">${escHtml(gruppe.label)}</td>
          </tr>
          <tr class="res-thead-kolonner">
            <th class="res-td-pl">Pl</th>
            <th class="res-td-navn">NAVN</th>
            <th class="res-td-klubb">KLUBB</th>
            ${cols.showKpSp ? '<th class="res-td-kp">KP</th><th class="res-td-sp">SP</th>' : ''}
            ${cols.showNc   ? '<th class="res-td-nc">NC</th>' : ''}
          </tr>
        </thead>
        <tbody>${rader}</tbody>
      </table>
    </div>`
}

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState('Laster resultat…'))

  try {
    const [stevneRes, resultatRes] = await Promise.all([
      hentStevneMedDetaljer(id),
      hentResultaterForStevne(id),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste stevnet.'))
      return
    }
    if (resultatRes.error) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste resultat.'))
      return
    }

    const stevne  = stevneRes.data
    const resultater = resultatRes.data

    if (!resultater.length) {
      container.replaceChildren(createEmptyState(
        stevne.erfullfort ? 'Ingen resultat registrert.' : 'Turneringa er ikkje avslutta enno.',
      ))
      return
    }

    const aar  = stevne.dato ? new Date(stevne.dato + 'T12:00:00').getFullYear() : 9999
    const grupper = grupperResultater(resultater, aar < 2026)
    const antall  = resultater.length
    const cols: ColFlags = {
      isParMix: stevne.kategori?.erlagbasert ?? false,
      showNc:   NC_STEVNETYPER.has(stevne.stevnetype?.navn ?? ''),
      showKpSp: KP_SP_INNLEDENDE.has(stevne.innledende?.navn ?? ''),
    }

    const pdfHtml = stevne.resultaturl?.startsWith('http')
      ? `<a class="res-pdf-lenke" href="${escHtml(stevne.resultaturl)}" target="_blank" rel="noopener">Resultat som pdf 📄</a>`
      : ''

    const juryHtml = stevne.juryleder
      ? `<p class="res-klassifisering">Juryleder: ${escHtml(stevne.juryleder)}</p>`
      : ''

    container.innerHTML = `
      <div class="res-side">
        <div class="res-felles">
          ${pdfHtml}
          ${juryHtml}
          <p class="res-antall"><strong>Antall deltakarar: ${antall}</strong></p>
        </div>
        <div class="res-mobil-blokk">
          ${grupper.map(g => mobilGruppeHtml(g, cols)).join('')}
        </div>
        <div class="res-desktop-blokk">
          ${grupper.map(g => desktopGruppeHtml(g, cols)).join('')}
        </div>
      </div>`
  } catch (err) {
    logError('stevne-resultat.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste resultat.'))
  }
}
