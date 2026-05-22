import { escHtml } from '@/utils/escHtml'
import { bekreftCupKamp, type AvslKampRow, type AvslKampSpelarRow } from '@/services/kampService'
import { showToast } from '@/components/Toast'

export function opnTreSpelarBekreftDialog(
  kamp: AvslKampRow,
  sp: AvslKampSpelarRow[],
  stevneid: number,
  afterConfirm: () => Promise<void>,
): void {
  const navns = sp.map(s =>
    s?.kaster
      ? `${escHtml(s.kaster.fornavn)} ${escHtml(s.kaster.etternavn)}`
      : 'Spelar ?'
  )
  const valt: number[] = []

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderDialog(): void {
    const eliminert = valt.length === 2 ? sp.find(s => s.kasterid != null && !valt.includes(s.kasterid)) : null
    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er eliminert.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${sp.map((s, i) => {
            const idx = s.kasterid != null ? valt.indexOf(s.kasterid) : -1
            const erValt = idx !== -1
            const erEliminert = !!eliminert && eliminert.kasterid === s.kasterid
            const plasseringLabel = idx === 0 ? '1. plass' : idx === 1 ? '2. plass' : ''
            return `<button
              class="btn ${erValt ? 'btn-success' : erEliminert ? 'btn-outline-danger' : 'btn-outline-secondary'} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${s.kasterid}"
              ${erEliminert ? 'disabled' : ''}
            ><span>${navns[i]}</span>${
              plasseringLabel ? `<span class="badge bg-success-subtle text-success-emphasis">${plasseringLabel}</span>` :
              erEliminert ? `<span class="badge bg-danger">Eliminert</span>` : ''
            }</button>`
          }).join('')}
        </div>
        <div class="d-flex gap-2">
          <button id="bekreft-tre-btn" class="btn btn-success" ${valt.length !== 2 ? 'disabled' : ''}>Bekreft</button>
          <button id="avbryt-tre-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>
    `

    modal.querySelector('#avbryt-tre-btn')!.addEventListener('click', () => modal.remove())

    modal.querySelectorAll<HTMLElement>('[data-kasterid]').forEach(btn => {
      btn.addEventListener('click', () => {
        const kid = Number(btn.dataset.kasterid)
        const idx = valt.indexOf(kid)
        if (idx !== -1) valt.splice(idx, 1)
        else if (valt.length < 2) valt.push(kid)
        renderDialog()
      })
    })

    modal.querySelector('#bekreft-tre-btn')?.addEventListener('click', async () => {
      if (valt.length !== 2) return
      const eliminertId = sp.find(s => s.kasterid != null && !valt.includes(s.kasterid))?.kasterid ?? null
      const allKasterids = sp.map(s => s.kasterid).filter((id): id is number => id != null)
      modal.remove()
      const { error } = await bekreftCupKamp({
        kampId: kamp.id,
        stevneId: stevneid,
        rundeNummer: kamp.runde_nummer,
        rundeNavn: kamp.runde_navn,
        allKasterids,
        eliminertId,
        vidareIds: [...valt],
      })
      if (error) { showToast('DB-feil ved bekreft', 'error'); return }
      await afterConfirm()
    })
  }

  renderDialog()
}
