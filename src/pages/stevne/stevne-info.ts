import { getUser } from '../../services/authService'
import { formaterDatoNumeric, formaterTid } from '../../utils/shared'
import { createErrorBanner } from '../../components/ErrorBanner'
import { createLoadingState } from '../../components/LoadingState'
import { escHtml } from '../../utils/escHtml'
import { logError } from '../../utils/logError'
import { showToast } from '../../components/Toast'
import { confirmDialog } from '../../components/ConfirmDialog'
import { hentInfoStevne, oppdaterStevneFase } from '../../services/stevneService'
import { hentAntallPameldingar, hentAntallUbekrefta } from '../../services/pameldingService'
import { genererInnledendeKamper } from '../../services/kampGenereringInnledendeService'

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState())

  try {
    const [stevneRes, antall, auth] = await Promise.all([
      hentInfoStevne(id),
      hentAntallPameldingar(id),
      getUser(),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    const stevne   = stevneRes.data
    const fase     = stevne.stevne_fase ?? null
    const ikkjeStarta = fase === null || fase === 'ikke_startet'
    const metodeNavn  = stevne.kastemetodeInnl?.navn ?? '—'
    const erCascade   = metodeNavn.toLowerCase().includes('gloppen')

    // ── Start-stevne-knapp (admin, ikkje starta) ──────────────────────────────

    if (bannerSlot && ikkjeStarta && isAdmin) {
      bannerSlot.innerHTML = `<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`
      bannerSlot.querySelector<HTMLButtonElement>('#start-stevne-btn')!.addEventListener('click', async () => {
        if (antall < 2) {
          showToast('Stevnet må ha minst 2 spelarar for å startast.', 'error')
          return
        }
        if (erCascade && !stevne.antall_runder_innl) {
          showToast('Du må setje antal rundar for innledande fase. Gå til Innstillingar for å endre.', 'error')
          return
        }
        const ubekrefta = await hentAntallUbekrefta(id)
        if (ubekrefta > 0) {
          const ok = await confirmDialog({ title: 'Ubekrefta spelarar', message: `${ubekrefta} spelar(ar) er ikkje bekrefta. Vil du starte stevnet likevel?` })
          if (!ok) return
        }
        try {
          await genererInnledendeKamper(id, metodeNavn, stevne.antall_runder_innl ?? 1)
        } catch (err) {
          showToast('Feil ved kampgenerering: ' + (err instanceof Error ? err.message : String(err)), 'error')
          return
        }
        const { error: faseErr } = await oppdaterStevneFase(id, 'innledende')
        if (faseErr) {
          showToast('Feil ved oppdatering av fase.', 'error')
          return
        }
        location.hash = `#/stevne/${id}/innledende`
      })
    }

    // ── Infokortet ────────────────────────────────────────────────────────────

    container.innerHTML = `
      <div class="card mb-3 org-max-480">
        <div class="card-body">
          <table class="table table-sm mb-0">
            <tbody>
              <tr><th>Stad</th><td>${escHtml(stevne.sted ?? '—')}</td></tr>
              <tr><th>Dato</th><td>${stevne.dato ? formaterDatoNumeric(stevne.dato) : '—'}</td></tr>
              <tr><th>Tid</th><td>${stevne.tid ? formaterTid(stevne.tid) : '—'}</td></tr>
              <tr><th>Kastemetode innledande</th><td>${escHtml(metodeNavn)}</td></tr>
              <tr><th>Kastemetode avsluttande</th><td>${escHtml(stevne.kastemetodeAvsl?.navn ?? '—')}</td></tr>
              <tr><th>Antal rundar innledande</th><td>${stevne.antall_runder_innl ?? '—'}</td></tr>
              <tr><th>Påmelde spelarar</th><td>${antall}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="info-handling-knapper" class="mb-3 d-flex gap-2 flex-wrap"></div>`

    // ── Handlingsknapper ──────────────────────────────────────────────────────

    const knapper = container.querySelector<HTMLElement>('#info-handling-knapper')!
    const erFerdig = stevne.erfullfort ?? false

    if (auth?.profil?.kobling_status === 'godkjent' && !erFerdig) {
      const knapp = document.createElement('a')
      knapp.href = `#/stevne/${id}/pamelding`
      knapp.className = 'btn btn-sm btn-primary'
      knapp.textContent = 'Meld deg på'
      knapper.appendChild(knapp)
    }

    const sjaaLenke = document.createElement('a')
    sjaaLenke.href = `#/stevne/${id}/pamelding`
    sjaaLenke.className = 'btn btn-sm btn-outline-secondary'
    sjaaLenke.textContent = 'Sjå påmeldingar'
    knapper.appendChild(sjaaLenke)
  } catch (err) {
    logError('stevne-info.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste info.'))
  }
}
