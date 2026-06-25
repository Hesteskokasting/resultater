import { createLoadingState } from '@/components/LoadingState'
import { createErrorBanner } from '@/components/ErrorBanner'
import { hentInnledendeMetodeNamn } from '@/services/stevneService'

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState())

  const { navn, error } = await hentInnledendeMetodeNamn(id)

  if (error) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  if (navn.includes('gloppen')) {
    const { render: r } = await import('./innledende/gloppen')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (navn.includes('nordhordland')) {
    const { render: r } = await import('./innledende/nordhordland')
    await r(container, { id, isAdmin }, bannerSlot)
  } else if (navn.includes('x-kast') || navn.includes('minimatch') || navn.includes('halvmatch') || navn.includes('heilmatch')) {
    const { render: r } = await import('./innledende/xkast')
    await r(container, { id, isAdmin }, bannerSlot)
  } else {
    container.replaceChildren(createErrorBanner(`Ukjend innleiande kastemetode: ${navn || '(ikkje sett)'}`))
  }
}
