import { Capacitor } from "@capacitor/core";
import { logError } from "@/utils/logError";

let _loggedInExternalId: string | null = null;
let _initPromise: Promise<void> | null = null;

async function loadOneSignal() {
  return (await import("@onesignal/capacitor-plugin")).default;
}

// login()/logout()/requestPermission() are no-ops (or fail silently) if called
// before initialize() has actually completed on the native side. A cached
// session's INITIAL_SESSION auth event can fire before that finishes, so every
// other OneSignal call routes through this to wait on the same in-flight init.
function ensureInitialized(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  if (!_initPromise) {
    _initPromise = (async () => {
      const OneSignal = await loadOneSignal();
      await OneSignal.initialize(import.meta.env.VITE_ONESIGNAL_APP_ID);
      OneSignal.Notifications.addEventListener("click", (event) => {
        const route = (event.notification.additionalData as { route?: string } | null)?.route;
        location.hash = route ? `#${route}` : "#/minside";
      });
    })().catch((err) => {
      logError("initPushNotifications", err);
    });
  }
  return _initPromise;
}

export async function initPushNotifications(): Promise<void> {
  await ensureInitialized();
}

export async function syncPushLogin(userId: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || _loggedInExternalId === userId) return;
  await ensureInitialized();
  try {
    const OneSignal = await loadOneSignal();
    await OneSignal.login(userId);
    _loggedInExternalId = userId;
  } catch (err) {
    logError("syncPushLogin", err);
  }
}

export async function syncPushLogout(): Promise<void> {
  if (!Capacitor.isNativePlatform() || _loggedInExternalId === null) return;
  await ensureInitialized();
  try {
    const OneSignal = await loadOneSignal();
    await OneSignal.logout();
    _loggedInExternalId = null;
  } catch (err) {
    logError("syncPushLogout", err);
  }
}

export async function ensurePushPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  await ensureInitialized();
  try {
    const OneSignal = await loadOneSignal();
    return await OneSignal.Notifications.requestPermission(true);
  } catch (err) {
    logError("ensurePushPermission", err);
    return false;
  }
}
