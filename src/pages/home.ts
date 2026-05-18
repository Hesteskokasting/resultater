import { formaterPoeng, byggSingelListe } from '@/utils/norgescup'
import { hentRegler, hentStevnerOgResultater } from '@/services/norgescupService'
import { formaterDatoLang as formaterDato } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { hentSisteResultater, hentLiveStevner, hentKommendeStevner } from '@/services/stevneService'
import type { SisteResultatRow, LiveStevneRow, KommendeStevneRow } from '@/services/stevneService'
import { logError } from '@/utils/logError'
import type { SingelListeRad } from '@/utils/norgescup'

// ── HTML-byggjarar ────────────────────────────────────────────────────────────

function ncTopp20Html(liste: SingelListeRad[]): string {
  if (liste.length === 0) return '<p class="empty-state">Ingen data.</p>'
  const rader = liste.slice(0, 20).map(k => `
    <tr>
      <td class="nc-td-pl">${k.plassering}</td>
      <td>${escHtml(k.navn)}</td>
      <td>${escHtml(k.klubb)}</td>
      <td class="nc-td-poeng">${formaterPoeng(k.totalPoeng)}</td>
    </tr>`).join('')
  return `
    <table class="app-tabell">
      <thead class="app-thead">
        <tr>
          <th class="nc-td-pl">Pl.</th>
          <th>Namn</th>
          <th>Klubb</th>
          <th class="nc-td-poeng">Poeng</th>
        </tr>
      </thead>
      <tbody>${rader}</tbody>
    </table>`
}

function liveKortHtml(s: LiveStevneRow): string {
  const tab = s.stevne_fase === 'avsluttende' ? 'avsluttende' : 'innledende'
  return `
    <a class="live-kort" href="#/stevne/${s.id}/${tab}">
      <span class="live-prikk"></span>
      <span>LIVE: ${escHtml(s.navn)}</span>
    </a>`
}

function resultatKortHtml(s: SisteResultatRow): string {
  return `
    <div class="stevne-kort">
      <p class="stevne-dato">${formaterDato(s.dato)}</p>
      <p class="stevne-navn">${escHtml(s.navn)}</p>
      <a class="stevne-lenke" href="#/stevne/${s.id}/resultat">Vis resultat</a>
    </div>`
}

function kommendeKortHtml(s: KommendeStevneRow): string {
  const innbydelse = s.innbydelseurl
    ? `<a class="stevne-lenke" href="${escHtml(s.innbydelseurl)}" target="_blank" rel="noopener">Innbydelse &#128196;</a>`
    : `<span class="stevne-lenke-inaktiv">Innbydelse er ikkje klar</span>`
  return `
    <div class="stevne-kort">
      <p class="stevne-dato">${formaterDato(s.dato)}</p>
      <a class="stevne-navn" href="#/stevne/${s.id}/resultat">${escHtml(s.navn)}</a>
      ${innbydelse}
    </div>`
}

// ── Hovudfunksjon ─────────────────────────────────────────────────────────────

export async function render(container: HTMLElement): Promise<void> {
  const ar = new Date().getFullYear()
  container.replaceChildren(createLoadingState('Laster framsida...'))

  let resultater: SisteResultatRow[]
  let kommende: KommendeStevneRow[]
  let live: LiveStevneRow[]
  let regler: Awaited<ReturnType<typeof hentRegler>>['data']
  let ncResultater: Awaited<ReturnType<typeof hentStevnerOgResultater>>['resultater']
  let stevner: Awaited<ReturnType<typeof hentStevnerOgResultater>>['stevner']

  try {
    const [
      { data: r1, error: e1 },
      { data: r2, error: e2 },
      { data: r3, error: e3 },
      { stevner: s4, resultater: r4, error: e4 },
      { data: r5, error: _e5 },
    ] = await Promise.all([
      hentSisteResultater(),
      hentKommendeStevner(),
      hentRegler(ar),
      hentStevnerOgResultater(ar),
      hentLiveStevner(),
    ])

    if (e1 || e2 || e3 || e4) {
      container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
      return
    }

    resultater  = r1
    kommende    = r2
    regler      = r3
    stevner     = s4
    ncResultater = r4
    live        = r5
  } catch (err) {
    logError('home.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste framsida.'))
    return
  }

  const ncListe = regler ? byggSingelListe(ncResultater, stevner, regler, 'NC', 1) : []

  container.innerHTML = `
    <div class="heimeside">
      ${live.length ? `<div class="live-banner">${live.map(liveKortHtml).join('')}</div>` : ''}
      <div class="heimeside-grid">
        <section class="heimeside-nc">
          <h2 class="heimeside-seksjon-tittel">Norgescupen Klasse 1 - Topp 20</h2>
          ${ncTopp20Html(ncListe)}
          <a class="heimeside-meir-lenke" href="#/norgescupen">Til detaljert liste</a>
        </section>
        <section class="heimeside-resultater">
          <h2 class="heimeside-seksjon-tittel">Siste resultat</h2>
          <div class="stevne-liste">${resultater.map(resultatKortHtml).join('')}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
        <section class="heimeside-kommende">
          <h2 class="heimeside-seksjon-tittel">Kommande konkurransar</h2>
          <div class="stevne-liste">${kommende.map(kommendeKortHtml).join('')}</div>
          <a class="heimeside-meir-lenke" href="#/terminliste">Vis terminliste</a>
        </section>
      </div>
    </div>`
}
