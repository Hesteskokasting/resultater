import { supabase } from '../../supabase'
import { createLoadingState } from '../../components/LoadingState'
import { createErrorBanner } from '../../components/ErrorBanner'

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState())

  const { data, error } = await supabase
    .from('stevne')
    .select('kastemetode:innledendekastemetodeid(navn)')
    .eq('id', id)
    .single()

  if (error || !data) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  const namn = ((data.kastemetode as unknown as { navn: string } | null)?.navn ?? '').toLowerCase()

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
