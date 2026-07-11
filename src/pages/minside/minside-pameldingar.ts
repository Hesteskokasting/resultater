import { escHtml } from '@/utils/escHtml'
import { formatDate } from '@/utils/shared'
import { getMyRegistrations } from '@/services/pameldingService'
import { bindRegistrationSlots } from '@/components/PameldingKnapp'
import { renderLinkGate } from './_linkState'
import type { MinSideContext } from './_linkState'
import type { RegistrationRow } from '@/services/pameldingService'

interface RegistrationContent {
  html: string
  registeredMap: Map<number, number>
}

async function buildRegistrationContent(throwerId: number): Promise<RegistrationContent> {
  const { data, error } = await getMyRegistrations(throwerId)
  const registeredMap = new Map<number, number>()
  if (error) return { html: '<p class="text-muted">Kunne ikkje laste påmeldingar.</p>', registeredMap }
  const active = data.filter((p: RegistrationRow) => p.stevne?.erfullfort !== true)
  if (!active.length) return { html: '<p class="empty-state">Ingen påmeldingar enno.</p>', registeredMap }

  const sorted = [...active].sort((a: RegistrationRow, b: RegistrationRow) =>
    (a.stevne?.dato ?? '').localeCompare(b.stevne?.dato ?? ''),
  )

  const rows = sorted.map(p => {
    const date = formatDate(p.stevne?.dato)
    const tournamentId = p.stevne?.id
    if (tournamentId != null) registeredMap.set(tournamentId, p.id)
    return `<tr>
      <td><a href="#/stevne/${tournamentId ?? ''}/pamelding">${escHtml(p.stevne?.navn ?? '')}</a></td>
      <td>${escHtml(date)}</td>
      <td>${tournamentId != null ? `<span data-registration-slot="${tournamentId}"></span>` : ''}</td>
    </tr>`
  }).join('')

  return {
    html: `
      <table class="table table-sm">
        <thead><tr><th>Stevne</th><th>Dato</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`,
    registeredMap,
  }
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  const throwerId = renderLinkGate(container, ctx)
  if (throwerId == null) return

  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Påmeldingar</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`
  const slot = container.querySelector<HTMLElement>('[data-slot="content"]')!

  const { html, registeredMap } = await buildRegistrationContent(throwerId)
  slot.innerHTML = html
  bindRegistrationSlots(container, throwerId, ctx.user.id, registeredMap)
}
