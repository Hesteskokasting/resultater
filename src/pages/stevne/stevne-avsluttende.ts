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
    .select('avsluttendemetode:avsluttendekastemetodeid(navn)')
    .eq('id', id)
    .single()

  if (error || !data) {
    container.replaceChildren(createErrorBanner('Stevne ikkje funne.'))
    return
  }

  const namn = ((data.avsluttendemetode as unknown as { navn: string } | null)?.navn ?? '').toLowerCase()

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
