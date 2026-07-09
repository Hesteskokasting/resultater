import { logError } from '@/utils/logError'
import { errorMessage } from '@/utils/errorMessage'
import { showToast } from '@/components/Toast'
import { confirmDialog } from '@/components/ConfirmDialog'
import { escHtml } from '@/utils/escHtml'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import {
  getTournamentSettings,
  getActiveThrowingMethods,
  updateTournamentSettings,
} from '@/services/stevneService'
import type { ActiveThrowingMethodRow } from '@/services/stevneService'
import { resetTournament } from '@/services/testDataService'
import { registerRefetch } from '@/utils/refetchRegistry'

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  registerRefetch(() => render(container, { id }))
  container.replaceChildren(createLoadingState())

  try {
    const [tournamentRes, methodsRes] = await Promise.all([
      getTournamentSettings(id),
      getActiveThrowingMethods(),
    ])

    if (tournamentRes.error || !tournamentRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    const stevne         = tournamentRes.data
    const methods        = methodsRes.data
    const initialMethods = methods.filter(m => m.er_innledende)
    const finalMethods   = methods.filter(m => m.er_avsluttende)

    function optionsHtml(list: ActiveThrowingMethodRow[], selectedId: number | null): string {
      return list.map(m =>
        `<option value="${m.id}"${m.id === selectedId ? ' selected' : ''}>${escHtml(m.navn)}</option>`
      ).join('')
    }

    container.innerHTML = `
      <div>
        <div class="mb-3">
          <a href="#/stevne/${id}/rediger" class="btn btn-outline-secondary btn-sm">Rediger stevne</a>
        </div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innleiande</label>
            <select id="innl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(initialMethods, stevne.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(finalMethods, stevne.avsluttendekastemetodeid)}
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Antal rundar innleiande</label>
            <input id="antall-rundar" type="number" min="1" class="form-control"
              value="${stevne.antall_runder_innl ?? ''}" placeholder="t.d. 6">
          </div>
          <button type="submit" class="btn btn-primary">Lagre</button>
          <span id="lagre-status" class="ms-3 text-success d-none">Lagra ✓</span>
          <hr class="my-4">
          <div class="border border-danger rounded p-3">
            <h6 class="text-danger mb-2">Farleg sone</h6>
            <p class="text-muted small mb-2">Slettar alle kampar og resultat, og set stevnet tilbake til starttilstanden.</p>
            <button type="button" id="nullstill-btn" class="btn btn-danger">Start på nytt!</button>
          </div>
        </form>
      </div>`

    container.querySelector<HTMLFormElement>('#innstillingar-form')!.addEventListener('submit', async e => {
      e.preventDefault()

      const initialId = container.querySelector<HTMLSelectElement>('#innl-metode')!.value || null
      const finalId   = container.querySelector<HTMLSelectElement>('#avsl-metode')!.value || null
      const rounds    = container.querySelector<HTMLInputElement>('#antall-rundar')!.value

      const { error } = await updateTournamentSettings(id, {
        innledendekastemetodeid:  initialId ? Number(initialId) : null,
        avsluttendekastemetodeid: finalId ? Number(finalId) : null,
        antall_runder_innl:       rounds ? Number(rounds) : null,
      })

      if (error) {
        logError('stevne-innstillingar.lagre', error)
        showToast('Feil ved lagring: ' + errorMessage(error), 'error')
        return
      }

      const status = container.querySelector<HTMLElement>('#lagre-status')!
      status.classList.remove('d-none')
      setTimeout(() => { status.classList.add('d-none') }, 2000)
    })

    container.querySelector<HTMLButtonElement>('#nullstill-btn')!.addEventListener('click', async e => {
      const btn = e.currentTarget as HTMLButtonElement
      if (!await confirmDialog({ title: 'Nullstill stevne', message: 'Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?', danger: true })) return
      btn.disabled = true
      const { error } = await resetTournament(id)
      if (error) { showToast('Feil ved nullstilling: ' + errorMessage(error), 'error'); btn.disabled = false; return }
      await render(container, { id })
    })
  } catch (err) {
    logError('stevne-innstillingar.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste innstillingar.'))
  }
}
