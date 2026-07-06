import { Capacitor } from '@capacitor/core'
import { logError } from '@/utils/logError'

let _initialized = false
let _loggedInExternalId: string | null = null

async function loadOneSignal() {
  return (await import('@onesignal/capacitor-plugin')).default
}

export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _initialized) return
  _initialized = true

  try {
    const OneSignal = await loadOneSignal()
    await OneSignal.initialize(import.meta.env.VITE_ONESIGNAL_APP_ID)
    OneSignal.Notifications.addEventListener('click', (event) => {
      const route = (event.notification.additionalData as { route?: string } | null)?.route
      location.hash = route ? `#${route}` : '#/minside'
    })
  } catch (err) {
    logError('initPushNotifications', err)
  }
}

export async function syncPushLogin(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || _loggedInExternalId === userId) return
  try {
    const OneSignal = await loadOneSignal()
    await OneSignal.login(userId)
    _loggedInExternalId = userId
  } catch (err) {
    logError('syncPushLogin', err)
  }
}

export async function syncPushLogout(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _loggedInExternalId === null) return
  try {
    const OneSignal = await loadOneSignal()
    await OneSignal.logout()
    _loggedInExternalId = null
  } catch (err) {
    logError('syncPushLogout', err)
  }
}

export async function ensurePushPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const OneSignal = await loadOneSignal()
    return await OneSignal.Notifications.requestPermission(true)
  } catch (err) {
    logError('ensurePushPermission', err)
    return false
  }
}
