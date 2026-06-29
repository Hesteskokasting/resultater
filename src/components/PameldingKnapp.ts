import { confirmDialog } from '@/components/ConfirmDialog'
import { showToast } from '@/components/Toast'
import { registerForTournament, removeRegistration, getMyRegistrationForTournament } from '@/services/pameldingService'

export interface PameldingKnappProps {
  stevneId: number
  kasterid: number
  brukerId: string
  isRegistered: boolean
  pameldingId: number | undefined
  onAction?: (isNowRegistered: boolean, pameldingId: number | undefined) => void
}

export function createPameldingKnapp(props: PameldingKnappProps): HTMLButtonElement {
  const btn = document.createElement('button')
  let isRegistered = props.isRegistered
  let pameldingId = props.pameldingId

  function update() {
    btn.className = isRegistered ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-primary'
    btn.textContent = isRegistered ? 'Meld av' : 'Meld på'
  }

  update()

  btn.addEventListener('click', async () => {
    btn.disabled = true

    if (isRegistered) {
      const ok = await confirmDialog({ title: 'Meld av', message: 'Er du sikker på at du vil melde deg av stevnet?' })
      if (!ok) { btn.disabled = false; return }

      if (pameldingId === undefined) {
        const { data } = await getMyRegistrationForTournament(props.stevneId, props.kasterid)
        if (!data) {
          showToast('Kunne ikkje finne påmeldinga.', 'error')
          btn.disabled = false
          return
        }
        pameldingId = data.id
      }

      const { error } = await removeRegistration(pameldingId)
      if (error) {
        showToast('Kunne ikkje melde av. Prøv igjen.', 'error')
        btn.disabled = false
        return
      }
      isRegistered = false
      pameldingId = undefined
      showToast('Du er meldt av stevnet.', 'success')
    } else {
      const { error, id } = await registerForTournament(props.stevneId, props.kasterid, props.brukerId)
      if (error) {
        showToast('Kunne ikkje melde på. Prøv igjen.', 'error')
        btn.disabled = false
        return
      }
      isRegistered = true
      pameldingId = id ?? undefined
      showToast('Du er meldt på stevnet.', 'success')
    }

    props.onAction?.(isRegistered, pameldingId)
    update()
    btn.disabled = false
  })

  return btn
}

export function bindPameldingSlots(
  container: HTMLElement,
  kasterid: number,
  brukerId: string,
  pameldteMap: Map<number, number>,
): void {
  container.querySelectorAll<HTMLElement>('[data-pm-slot]').forEach(slot => {
    const stevneId = Number(slot.dataset.pmSlot)
    const pameldingId = pameldteMap.get(stevneId)
    const knapp = createPameldingKnapp({
      stevneId,
      kasterid,
      brukerId,
      isRegistered: pameldingId !== undefined,
      pameldingId,
      onAction: (isNow, newId) => {
        if (isNow && newId !== undefined) pameldteMap.set(stevneId, newId)
        else pameldteMap.delete(stevneId)
      },
    })
    slot.replaceWith(knapp)
  })
}
