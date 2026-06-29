import { formRowHtml, showSaveError, showSuccess, errMsg } from '@/utils/adminForms'
import { erAdmin, erKlubbadmin } from '@/services/authService'
import { escHtml } from '@/utils/escHtml'
import { createErrorBanner } from '@/components/ErrorBanner'
import { createLoadingState } from '@/components/LoadingState'
import {
  getClubForAdmin,
  updateClub,
  type ClubAdminRow,
} from '@/services/klubbService'
import type { Params } from '@/types'

export async function render(
  container: HTMLElement,
  params: Params = {},
): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined
  if (!id) { container.replaceChildren(createErrorBanner('Manglande ID.')); return }

  container.replaceChildren(createLoadingState())

  const { data: klubb, error } = await getClubForAdmin(id)

  if (error || !klubb) { container.replaceChildren(createErrorBanner('Klubb ikkje funne.')); return }

  if (!(await erAdmin()) && !(await erKlubbadmin(id))) {
    container.replaceChildren(createErrorBanner('Ingen tilgang til denne klubben.'))
    return
  }

  container.innerHTML = `
    <div class="container py-4 admin-skjema-sm">
      <h2 class="mb-4">Rediger klubb: ${escHtml(klubb.navn)}</h2>
      <form id="klubb-skjema">
        ${formRowHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(klubb.navn)}" required>`)}
        ${formRowHtml('Kortnavn', `<input type="text" class="form-control" name="kortnavn" value="${escHtml(klubb.kortnavn)}">`)}
        ${formRowHtml('Logo-URL', `<input type="url" class="form-control" name="logourl" value="${escHtml(klubb.logourl)}">`)}
        <div class="mb-3 form-check">
          <input class="form-check-input" type="checkbox" name="eraktiv" id="eraktiv"${klubb.eraktiv ? ' checked' : ''}>
          <label class="form-check-label" for="eraktiv">Er aktiv</label>
        </div>
        <button type="submit" class="btn btn-primary mt-2">Lagre</button>
      </form>
    </div>`

  container.querySelector<HTMLFormElement>('#klubb-skjema')!.addEventListener('submit', async e => {
    e.preventDefault()
    const fd = new FormData(e.target as HTMLFormElement)
    const payload: Omit<ClubAdminRow, 'id'> = {
      navn:     (fd.get('navn') as string).trim(),
      kortnavn: (fd.get('kortnavn') as string).trim(),
      logourl:  (fd.get('logourl') as string).trim() || null,
      eraktiv:  fd.get('eraktiv') === 'on',
    }
    const { error: saveError } = await updateClub(id, payload)
    if (saveError) { showSaveError(container, errMsg(saveError)); return }
    showSuccess(container, 'Klubben er lagra.')
  })
}
