import { logError } from '../../utils/logError'
import { showToast } from '../../components/Toast'
import { confirmDialog } from '../../components/ConfirmDialog'
import { escHtml } from '../../utils/escHtml'
import { createErrorBanner } from '../../components/ErrorBanner'
import { createLoadingState } from '../../components/LoadingState'
import {
  hentStevneInnstillingar,
  hentAktiveKastemetodar,
  oppdaterStevneInnstillingar,
} from '../../services/stevneService'
import type { AktivKastemetodeRow } from '../../services/stevneService'
import { nullstillStevne } from '../../services/testDataService'

// ── Render ────────────────────────────────────────────────────────────────────

export async function render(
  container: HTMLElement,
  { id }: { id: number; isAdmin?: boolean },
): Promise<void> {
  container.replaceChildren(createLoadingState())

  try {
    const [stevneRes, metodarRes] = await Promise.all([
      hentStevneInnstillingar(id),
      hentAktiveKastemetodar(),
    ])

    if (stevneRes.error || !stevneRes.data) {
      container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
      return
    }

    const stevne      = stevneRes.data
    const metodar     = metodarRes.data
    const innlMetodar = metodar.filter(m => m.er_innledende)
    const avslMetodar = metodar.filter(m => m.er_avsluttende)

    function optionsHtml(liste: AktivKastemetodeRow[], valdId: number | null): string {
      return liste.map(m =>
        `<option value="${m.id}"${m.id === valdId ? ' selected' : ''}>${escHtml(m.navn)}</option>`
      ).join('')
    }

    container.innerHTML = `
      <div>
        <h4 class="mb-3">Innstillingar</h4>
        <form id="innstillingar-form" class="org-max-480">
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode innledande</label>
            <select id="innl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(innlMetodar, stevne.innledendekastemetodeid)}
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Kastemetode avsluttande</label>
            <select id="avsl-metode" class="form-select">
              <option value="">— Ikkje vald —</option>
              ${optionsHtml(avslMetodar, stevne.avsluttendekastemetodeid)}
            </select>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Antal rundar innledande</label>
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

      const innlId = container.querySelector<HTMLSelectElement>('#innl-metode')!.value || null
      const avslId = container.querySelector<HTMLSelectElement>('#avsl-metode')!.value || null
      const rundar = container.querySelector<HTMLInputElement>('#antall-rundar')!.value

      const { error } = await oppdaterStevneInnstillingar(id, {
        innledendekastemetodeid:  innlId ? Number(innlId) : null,
        avsluttendekastemetodeid: avslId ? Number(avslId) : null,
        antall_runder_innl:       rundar ? Number(rundar) : null,
      })

      if (error) {
        logError('stevne-innstillingar.lagre', error)
        showToast('Feil ved lagring: ' + (error instanceof Error ? error.message : String(error)), 'error')
        return
      }

      const status = container.querySelector<HTMLElement>('#lagre-status')!
      status.classList.remove('d-none')
      setTimeout(() => { status.classList.add('d-none') }, 2000)
    })

    container.querySelector<HTMLButtonElement>('#nullstill-btn')!.addEventListener('click', async e => {
      if (!await confirmDialog({ title: 'Nullstill stevne', message: 'Dette slettar alle kampar og resultat og set stevnet tilbake til starttilstanden. Er du sikker?', danger: true })) return
      ;(e.currentTarget as HTMLButtonElement).disabled = true
      await nullstillStevne(id)
      await render(container, { id })
    })
  } catch (err) {
    logError('stevne-innstillingar.render', err)
    container.replaceChildren(createErrorBanner('Kunne ikkje laste innstillingar.'))
  }
}
