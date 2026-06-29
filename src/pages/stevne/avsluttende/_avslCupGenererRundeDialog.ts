import { escHtml } from '@/utils/escHtml'
import {
  generateCupRound1,
  generateNextCupRoundForGroup,
} from '@/services/kampGenereringCupService'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import type { RoundSetup, Round1FormatTyped } from '@/types'
import type { StandingRow } from '@/organizer/org-shared'

export function opnGenererRundeDialog(
  stevneid: number,
  gruppeNavn: string,
  stillingForGruppe: StandingRow[],
  runde: number,
  runde1Format: Round1FormatTyped | null,
  reload: () => Promise<void>,
): void {
  const aktive = stillingForGruppe.filter(r => r.runde_eliminert == null)
  const totalCount = stillingForGruppe.length
  const n = aktive.length

  const runde1Oppsett: RoundSetup | null = runde === 1 ? (runde1Format?.[gruppeNavn as 'A' | 'B'] ?? null) : null

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

  let dragPos: { left: number; top: number } | null = null
  let isDragging = false
  let dragOffsetX = 0
  let dragOffsetY = 0

  function onMouseMove(e: MouseEvent): void {
    if (!isDragging) return
    const card = modal.querySelector<HTMLElement>('.avsl-dialog-card-wide')
    if (!card) return
    const left = e.clientX - dragOffsetX
    const top = e.clientY - dragOffsetY
    dragPos = { left, top }
    card.style.left = `${left}px`
    card.style.top = `${top}px`
  }

  function onMouseUp(): void {
    if (!isDragging) return
    isDragging = false
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  function removeListeners(): void {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  function playerHtml(r: StandingRow): string {
    return `<div class="d-flex justify-content-between gap-2 py-1">
      <span class="small">${escHtml(r.navn ?? '')}</span>
      <span class="small text-muted text-nowrap">${r.kamp_poeng ?? 0}p (${r.score_poeng ?? 0})</span>
    </div>`
  }

  function renderModal(medSeeding: boolean | null): void {
    const walkoverPlayers = aktive.slice(0, wo)

    const walkoversHtml = walkoverPlayers.length > 0
      ? `<div class="mb-3">
          <strong class="d-block mb-1">Walkovers (går vidare utan kamp):</strong>
          ${walkoverPlayers.map(playerHtml).join('')}
        </div>`
      : ''

    const seedingInfoHtml = medSeeding === true && totalBaner > 0
      ? `<div class="alert alert-info small mb-3 py-2">
          Dette er seedinggrupper, ikkje kampar. Spelarar i same gruppe kan ikkje trekkast mot kvarandre. Kampane blir oppretta når du klikkar «Bekreft og opprett kampar».
        </div>`
      : ''

    const poolsSection = medSeeding === true && totalBaner > 0
      ? `<div class="d-flex gap-3 flex-wrap mb-3">
          ${[
            { label: 'Seeding 1', pool: pool1 },
            { label: 'Seeding 2', pool: pool2 },
            ...(pool3.length ? [{ label: 'Seeding 3', pool: pool3 }] : []),
          ].map(({ label, pool }) => `
            <div class="card flex-grow-1">
              <div class="card-body p-2">
                <strong class="d-block mb-2 small text-uppercase">${escHtml(label)}</strong>
                ${pool.map(playerHtml).join('')}
              </div>
            </div>`).join('')}
        </div>`
      : `<div class="avsl-player-columns mb-3">
          ${aktive.slice(wo).map((r, i) => `
            <div class="small d-flex justify-content-between gap-2">
              <span>${wo + i + 1}. ${escHtml(r.navn ?? '')}</span>
              <span class="text-muted text-nowrap">${r.kamp_poeng ?? 0}p (${r.score_poeng ?? 0})</span>
            </div>`).join('')}
        </div>`

    modal.innerHTML = `
      <div class="card avsl-dialog-card-wide">
        <div class="avsl-dialog-drag-handle">
          <p class="text-muted small text-uppercase fw-semibold mb-1">Trekning</p>
          <h5 class="mb-1">Gruppe ${escHtml(gruppeNavn)} — Runde ${runde}</h5>
          <p class="text-muted small mb-0">${n} av ${totalCount} spelarar igjen</p>
        </div>
        <div class="avsl-dialog-body">
          <div class="mb-3">
            <span class="form-label fw-semibold d-block mb-1">Bruk seeding</span>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-ja" value="ja" ${medSeeding === true ? 'checked' : ''}>
              <label class="form-check-label" for="seeding-ja">Ja</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="seeding-dlg" id="seeding-nei" value="nei" ${medSeeding === false ? 'checked' : ''}>
              <label class="form-check-label" for="seeding-nei">Nei</label>
            </div>
          </div>
          ${seedingInfoHtml}
          ${walkoversHtml}
          ${poolsSection}
        </div>
        <div class="avsl-dialog-footer">
          <div class="d-flex gap-2">
            <button id="bekreft-gen-btn" class="btn btn-primary" ${medSeeding === null ? 'disabled' : ''}>Bekreft og opprett kampar</button>
            <button id="avbryt-gen-btn" class="btn btn-secondary">Avbryt</button>
          </div>
        </div>
      </div>`

    const card = modal.querySelector<HTMLElement>('.avsl-dialog-card-wide')!

    if (dragPos) {
      card.style.position = 'fixed'
      card.style.left = `${dragPos.left}px`
      card.style.top = `${dragPos.top}px`
      card.style.margin = '0'
      card.style.zIndex = '10000'
    }

    card.querySelector<HTMLElement>('.avsl-dialog-drag-handle')!.addEventListener('mousedown', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      card.style.position = 'fixed'
      card.style.left = `${rect.left}px`
      card.style.top = `${rect.top}px`
      card.style.margin = '0'
      card.style.zIndex = '10000'
      dragOffsetX = e.clientX - rect.left
      dragOffsetY = e.clientY - rect.top
      dragPos = { left: rect.left, top: rect.top }
      isDragging = true
      document.body.style.userSelect = 'none'
    })

    modal.querySelector<HTMLInputElement>('#seeding-ja')!.addEventListener('change', () => renderModal(true))
    modal.querySelector<HTMLInputElement>('#seeding-nei')!.addEventListener('change', () => renderModal(false))
    modal.querySelector('#avbryt-gen-btn')!.addEventListener('click', () => {
      removeListeners()
      modal.remove()
    })
    modal.querySelector('#bekreft-gen-btn')!.addEventListener('click', async () => {
      if (medSeeding === null) return
      const btn = modal.querySelector<HTMLButtonElement>('#bekreft-gen-btn')!
      btn.disabled = true
      btn.textContent = 'Lagrer…'
      try {
        const spelarar = aktive.map((r, i) => ({ kasterid: r.kasterid, plassering: i + 1 }))
        if (runde === 1) {
          const runde1FormatRecord: Record<string, RoundSetup | undefined> = {
            A: runde1Format?.A ?? undefined,
            B: runde1Format?.B ?? undefined,
          }
          await generateCupRound1(
            stevneid,
            [{ gruppeNavn, spelarar, runde1Oppsett }],
            medSeeding,
            runde1Format ? runde1FormatRecord : null,
          )
        } else {
          await generateNextCupRoundForGroup(stevneid, gruppeNavn, medSeeding, spelarar)
        }
        removeListeners()
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

  renderModal(null)
}
