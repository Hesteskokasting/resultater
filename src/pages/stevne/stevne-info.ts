import { getUser } from '@/services/authService'
import { formaterDatoNumeric, formaterTid } from '@/utils/shared'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import { escHtml } from '@/utils/escHtml'
import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { hentInfoStevne, oppdaterStevneFase } from '@/services/stevneService'
import { hentAntallPameldingar, hentAntallUbekrefta, hentMinPameldingForStevne } from '@/services/pameldingService'
import { createPameldingKnapp } from '@/components/PameldingKnapp'
import { genererInnledendeKamper } from '@/services/kampGenereringInnledendeService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(fase: string | null, erfullfort: boolean | null): string {
  if (erfullfort) return '<span class="badge bg-success">Fullført</span>'
  if (fase === 'avsluttende') return '<span class="badge bg-warning text-dark">Avsluttande fase</span>'
  if (fase === 'innledende')  return '<span class="badge bg-primary">Innledande fase</span>'
  return '<span class="badge bg-secondary">Ikkje starta</span>'
}

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
    const erLag       = stevne.kategori?.erlagbasert ?? false

    // ── Start-stevne-knapp (admin, ikkje starta) ──────────────────────────────

    if (bannerSlot && ikkjeStarta && isAdmin) {
      bannerSlot.innerHTML = `<button id="start-stevne-btn" class="btn btn-sm btn-success">Start stevne</button>`
      const startBtn = bannerSlot.querySelector<HTMLButtonElement>('#start-stevne-btn')!
      startBtn.addEventListener('click', async () => {
        if (!stevne.kastemetodeInnl) {
          showToast('Du må velje kastemetode for innledande fase. Gå til Innstillingar for å endre.', 'error')
          return
        }
        if (erLag ? antall < 4 : antall < 2) {
          showToast(
            erLag
              ? 'Stevnet treng minst 2 par (4 spelarar) for å startast.'
              : 'Stevnet må ha minst 2 spelarar for å startast.',
            'error',
          )
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
        startBtn.disabled = true
        startBtn.textContent = 'Starter…'
        try {
          await genererInnledendeKamper(id, metodeNavn, stevne.antall_runder_innl ?? 1, erLag)
        } catch (err) {
          showToast('Feil ved kampgenerering: ' + errorMessage(err), 'error')
          startBtn.disabled = false
          startBtn.textContent = 'Start stevne'
          return
        }
        const { error: faseErr } = await oppdaterStevneFase(id, 'innledende')
        if (faseErr) {
          showToast('Feil ved oppdatering av fase.', 'error')
          startBtn.disabled = false
          startBtn.textContent = 'Start stevne'
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
              <tr><th>Status</th><td>${statusBadge(stevne.stevne_fase, stevne.erfullfort)}</td></tr>
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
    if (auth?.profil?.kobling_status === 'godkjent' && ikkjeStarta) {
      const kasterid = auth.profil.kasterid
      if (kasterid === null) return

      const minPamelding = (await hentMinPameldingForStevne(id, kasterid)).data

      knapper.appendChild(createPameldingKnapp({
        stevneId: id,
        kasterid,
        brukerId: auth.user.id,
        isRegistered: minPamelding !== null,
        pameldingId: minPamelding?.id,
        onAction: () => { void render(container, { id, isAdmin }, bannerSlot) },
      }))
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
