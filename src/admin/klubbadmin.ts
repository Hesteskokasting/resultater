import { lagFormRadHtml, visLagreFeil, visSuksess } from '../utils/adminForms.js'
import { erAdmin, erKlubbadmin } from '../utils/auth'
import { escHtml } from '../utils/escHtml'
import { lasterHtml, feilHtml } from '../utils/pageStates'
import {
  hentKlubbForAdmin,
  oppdaterKlubb,
  type KlubbAdminRow,
} from '../services/klubbService'

function errMsg(e: unknown): string {
  return e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Ukjend feil'
}

export async function render(
  container: HTMLElement,
  { id }: { id?: number } = {},
): Promise<void> {
  if (!id) { container.innerHTML = feilHtml('Manglande ID.'); return }

  container.innerHTML = lasterHtml()

  const { data: klubb, error } = await hentKlubbForAdmin(id)

  if (error || !klubb) { container.innerHTML = feilHtml('Klubb ikkje funne.'); return }

  if (!(await erAdmin()) && !(await erKlubbadmin(id))) {
    container.innerHTML = feilHtml('Ingen tilgang til denne klubben.')
    return
  }

  container.innerHTML = `
    <div class="container py-4 admin-skjema-sm">
      <h2 class="mb-4">Rediger klubb: ${escHtml(klubb.navn)}</h2>
      <form id="klubb-skjema">
        ${lagFormRadHtml('Namn*', `<input type="text" class="form-control" name="navn" value="${escHtml(klubb.navn)}" required>`)}
        ${lagFormRadHtml('Kortnamn', `<input type="text" class="form-control" name="kortnavn" value="${escHtml(klubb.kortnavn)}">`)}
        ${lagFormRadHtml('Logo-URL', `<input type="url" class="form-control" name="logourl" value="${escHtml(klubb.logourl)}">`)}
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
    const payload: Omit<KlubbAdminRow, 'id'> = {
      navn:     (fd.get('navn') as string).trim(),
      kortnavn: (fd.get('kortnavn') as string).trim(),
      logourl:  (fd.get('logourl') as string).trim() || null,
      eraktiv:  fd.get('eraktiv') === 'on',
    }
    const { error: saveError } = await oppdaterKlubb(id, payload)
    if (saveError) { visLagreFeil(container, errMsg(saveError)); return }
    visSuksess(container, 'Klubben er lagra.')
  })
}
