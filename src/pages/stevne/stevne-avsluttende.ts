import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { hentAvsluttendeMetodeNamn } from '@/services/stevneService'

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState())

  const { namn, error } = await hentAvsluttendeMetodeNamn(id)

  if (error) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  if (namn.includes('cup')) {
    const { render: r } = await import('./avsluttende/cup')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (namn.includes('kongelag')) {
    const { render: r } = await import('./avsluttende/kongelag')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (namn.includes('nordhordland')) {
    const { render: r } = await import('./avsluttende/nordhordland')
    await r(container, { id, isAdmin }, bannerSlot)
  } else {
    container.replaceChildren(createErrorBanner(`Ukjend avsluttande kastemetode: ${namn || '(ikkje sett)'}`))
  }
}
