import { createLoadingState } from '../../components/LoadingState'
import { createErrorBanner } from '../../components/ErrorBanner'
import { hentInnledendeMetodeNamn } from '../../services/stevneService'

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState())

  const { namn, error } = await hentInnledendeMetodeNamn(id)

  if (error) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  if (namn.includes('gloppen')) {
    const { render: r } = await import('./innledende/gloppen')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (namn.includes('nordhordland')) {
    const { render: r } = await import('./innledende/nordhordland')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (namn.includes('x-kast') || namn.includes('minimatch') || namn.includes('halvmatch') || namn.includes('heilmatch')) {
    const { render: r } = await import('./innledende/xkast')
    await r(container, { id, isAdmin }, bannerSlot)
  } else {
    container.replaceChildren(createErrorBanner(`Ukjend innledande kastemetode: ${namn || '(ikkje sett)'}`))
  }
}
