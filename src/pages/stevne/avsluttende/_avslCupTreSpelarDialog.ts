import { bekreftCupKamp, type AvslKampRow, type AvslKampSpelarRow } from '@/services/kampService'
import { sideNavnHtml } from '@/organizer/org-shared'
import type { MatchSide } from '@/utils/kamp'
import { showToast } from '@/components/Toast'

type AvslSpelarKjent = AvslKampSpelarRow & { kasterid: number }

/**
 * Confirm a 3-side cup match: pick the two sides that advance, the remaining
 * side is eliminated. A side is one player (Singel) or a pair (Par/Mix).
 * Sides are identified by their rep's kasterid.
 */
export function opnTreSpelarBekreftDialog(
  kamp: AvslKampRow,
  sider: MatchSide<AvslSpelarKjent>[],
  stevneid: number,
  afterConfirm: () => Promise<void>,
): void {
  const navns = sider.map(side => sideNavnHtml(side, false))
  const valt: number[] = []  // rep kasterids of advancing sides, in rank order

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderDialog(): void {
    const eliminert = valt.length === 2 ? sider.find(s => !valt.includes(s.rep.kasterid)) : null
    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card">
        <h5 class="card-title mb-1">Bekreft 3-spelar kamp</h5>
        <p class="text-muted small mb-3">Vel dei to som går vidare. Den gjenverande er utslått.</p>
        <div class="d-flex flex-column gap-2 mb-3">
          ${sider.map((side, i) => {
            const idx = valt.indexOf(side.rep.kasterid)
            const erValt = idx !== -1
            const erEliminert = !!eliminert && eliminert.rep.kasterid === side.rep.kasterid
            const plasseringLabel = idx === 0 ? '1. plass' : idx === 1 ? '2. plass' : ''
            return `<button
              class="btn ${erValt ? 'btn-success' : erEliminert ? 'btn-outline-danger' : 'btn-outline-secondary'} text-start d-flex justify-content-between align-items-center"
              data-kasterid="${side.rep.kasterid}"
              ${erEliminert ? 'disabled' : ''}
            ><span>${navns[i]}</span>${
              plasseringLabel ? `<span class="badge bg-success-subtle text-success-emphasis">${plasseringLabel}</span>` :
              erEliminert ? `<span class="badge bg-danger">Utslått</span>` : ''
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
      const eliminertSide = sider.find(s => !valt.includes(s.rep.kasterid)) ?? null
      const vidareSider = valt
        .map(kid => sider.find(s => s.rep.kasterid === kid))
        .filter((s): s is MatchSide<AvslSpelarKjent> => s != null)
        .map(s => s.members.map(m => m.kasterid))
      const allKasterids = sider.flatMap(s => s.members.map(m => m.kasterid))
      modal.remove()
      const { error } = await bekreftCupKamp({
        kampId: kamp.id,
        stevneId: stevneid,
        rundeNummer: kamp.runde_nummer,
        rundeNavn: kamp.runde_navn,
        allKasterids,
        eliminertIds: eliminertSide?.members.map(m => m.kasterid) ?? [],
        vidareSider,
      })
      if (error) { showToast('DB-feil ved bekreft', 'error'); return }
      await afterConfirm()
    })
  }

  renderDialog()
}
