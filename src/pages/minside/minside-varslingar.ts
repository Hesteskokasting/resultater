import { Capacitor } from '@capacitor/core'
import { showToast } from '@/components/Toast'
import { errorMessage } from '@/utils/errorMessage'
import { getNotificationPreferences, updateNotificationPreference } from '@/services/notificationPreferencesService'
import { ensurePushPermission } from '@/services/pushNotificationService'
import type { MinSideContext } from './_linkState'
import type { NotificationPreferencesRow } from '@/services/notificationPreferencesService'

function notificationSettingsHtml(prefs: NotificationPreferencesRow): string {
  return `
    <div class="form-check form-switch mb-2">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-stevne-start"${prefs.varsle_stevne_start ? ' checked' : ''}>
      <label class="form-check-label" for="varsle-stevne-start">Varsle når eit stevne startar</label>
    </div>
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="varsle-kamp-opprettet"${prefs.varsle_kamp_opprettet ? ' checked' : ''}>
      <label class="form-check-label" for="varsle-kamp-opprettet">Varsle når kampar for meg blir oppretta</label>
    </div>`
}

function bindNotificationToggles(container: HTMLElement, userId: string): void {
  const toggles: [string, keyof NotificationPreferencesRow][] = [
    ['varsle-stevne-start', 'varsle_stevne_start'],
    ['varsle-kamp-opprettet', 'varsle_kamp_opprettet'],
  ]
  for (const [elementId, field] of toggles) {
    const input = container.querySelector<HTMLInputElement>(`#${elementId}`)
    if (!input) continue
    input.addEventListener('change', async () => {
      const value = input.checked
      input.disabled = true
      if (value) await ensurePushPermission()
      const { error } = await updateNotificationPreference(userId, field, value)
      input.disabled = false
      if (error) {
        input.checked = !value
        showToast(`Kunne ikkje lagre varslingsinnstilling: ${errorMessage(error)}`, 'error')
      }
    })
  }
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  // Push only works through the native OneSignal subscription — this page's bundle
  // is also served on the public website, where these toggles would do nothing.
  if (!Capacitor.isNativePlatform()) {
    container.innerHTML = '<p class="text-muted">Varslingar er berre tilgjengelege i appen.</p>'
    return
  }

  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Varslingar</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`
  const slot = container.querySelector<HTMLElement>('[data-slot="content"]')!

  const { data: prefs } = await getNotificationPreferences(ctx.user.id)
  if (!prefs) {
    slot.innerHTML = '<p class="text-muted">Kunne ikkje laste varslingsinnstillingar.</p>'
    return
  }
  slot.innerHTML = notificationSettingsHtml(prefs)
  bindNotificationToggles(container, ctx.user.id)
}
