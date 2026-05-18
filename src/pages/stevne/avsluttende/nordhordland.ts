import { createErrorBanner } from '@/components/ErrorBanner'

export async function render(
  container: HTMLElement,
  _opts: { id: number; isAdmin?: boolean },
  _bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createErrorBanner('Nordhordlandsmetoden som avsluttande fase er ikkje implementert enno.'))
}
