import { escHtml } from '@/utils/escHtml'
import {
  genererCupRunde1,
  genererNesteCupRundeForGruppe,
} from '@/services/kampGenereringCupService'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import type { RundeOppsett, Runde1FormatTyped } from '@/types'
import type { StillingRad } from '@/organizer/org-shared'

export function opnGenererRundeDialog(
  stevneid: number,
  gruppeNavn: string,
  stillingForGruppe: StillingRad[],
  runde: number,
  runde1Format: Runde1FormatTyped | null,
  reload: () => Promise<void>,
): void {
  const aktive = stillingForGruppe.filter(r => r.runde_eliminert == null)
  const totalCount = stillingForGruppe.length
  const n = aktive.length

  const runde1Oppsett: RundeOppsett | null = runde === 1 ? (runde1Format?.[gruppeNavn as 'A' | 'B'] ?? null) : null

  const wo = runde1Oppsett?.walkovers ?? 0
  const c3 = runde1Oppsett ? runde1Oppsett.c3 : (n % 3 === 0 ? n / 3 : 0)
  const c2 = runde1Oppsett ? runde1Oppsett.c2 : (n % 3 === 0 ? 0 : n / 2)
  const totalBaner = c3 + c2
  const pool1 = aktive.slice(wo, wo + totalBaner)
  const pool2 = aktive.slice(wo + totalBaner, wo + 2 * totalBaner)
  const pool3 = aktive.slice(wo + 2 * totalBaner)

  const modal = document.createElement('div')
  modal.className = 'avsl-dialog-overlay'
  document.body.appendChild(modal)

  function renderModal(medSeeding: boolean): void {
    const poolsHtml = medSeeding && totalBaner > 0
      ? [
          { label: 'Seeding 1', pool: pool1 },
          { label: 'Seeding 2', pool: pool2 },
          ...(pool3.length ? [{ label: 'Seeding 3', pool: pool3 }] : []),
        ].map(({ label, pool }) => `
          <div class="flex-grow-1">
            <strong class="d-block mb-1">${escHtml(label)}</strong>
            ${pool.map(r => `<div class="small">${escHtml(r.navn ?? '')} — ${r.kamp_poeng ?? 0}p (${r.score_poeng ?? 0})</div>`).join('')}
          </div>`).join('')
      : aktive.map((r, i) => `<div class="small">${i + 1}. ${escHtml(r.navn ?? '')} — ${r.kamp_poeng ?? 0}p (${r.score_poeng ?? 0})</div>`).join('')

    modal.innerHTML = `
      <div class="card p-4 avsl-dialog-card-wide">
        <h5 class="mb-1">Gruppe ${escHtml(gruppeNavn)} — Runde ${runde}</h5>
        <p class="text-muted small mb-2">${n} av ${totalCount} spelarar igjen</p>
        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="seeding-dlg" ${medSeeding ? 'checked' : ''}>
          <label class="form-check-label" for="seeding-dlg">Bruk seeding</label>
        </div>
        <div class="d-flex gap-3 flex-wrap mb-3">${poolsHtml}</div>
        <div class="d-flex gap-2">
          <button id="bekreft-gen-btn" class="btn btn-primary">Bekreft og opprett kampar</button>
          <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
        </div>
      </div>`

    modal.querySelector<HTMLInputElement>('#seeding-dlg')!.addEventListener('change', e =>
      renderModal((e.target as HTMLInputElement).checked)
    )
    modal.querySelector('#avbryt-gen-btn')!.addEventListener('click', () => modal.remove())
    modal.querySelector('#bekreft-gen-btn')!.addEventListener('click', async () => {
      const medSeedingVal = modal.querySelector<HTMLInputElement>('#seeding-dlg')!.checked
      const btn = modal.querySelector<HTMLButtonElement>('#bekreft-gen-btn')!
      btn.disabled = true
      btn.textContent = 'Lagrer…'
      try {
        const spelarar = aktive.map((r, i) => ({ kasterid: r.kasterid, plassering: i + 1 }))
        if (runde === 1) {
          const runde1FormatRecord: Record<string, RundeOppsett | undefined> = {
            A: runde1Format?.A ?? undefined,
            B: runde1Format?.B ?? undefined,
          }
          await genererCupRunde1(
            stevneid,
            [{ gruppeNavn, spelarar, runde1Oppsett }],
            medSeedingVal,
            runde1Format ? runde1FormatRecord : null,
          )
        } else {
          await genererNesteCupRundeForGruppe(stevneid, gruppeNavn, medSeedingVal, spelarar)
        }
        modal.remove()
        await reload()
      } catch (e) {
        logError('cup:genererRunde', e)
        showToast('Feil ved generering av runde', 'error')
        btn.disabled = false
        btn.textContent = 'Bekreft og opprett kampar'
      }
    })
  }

  renderModal(true)
}
