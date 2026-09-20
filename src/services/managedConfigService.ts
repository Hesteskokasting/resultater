import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/supabase";
import { logError } from "@/utils/logError";

/**
 * Managed configuration pushed from an MDM (Intune) and read back through Android's
 * RestrictionsManager. The keys an admin can set are declared in
 * android/app/src/main/res/xml/app_restrictions.xml.
 *
 * The only key so far is `deviceKey`: a device is registered in kiosk_device and
 * exchanges that key for a session on its club account, so no password is ever
 * pushed to a device and a lost tablet is cut off by deactivating one row.
 *
 * Android-only: iOS managed app config would need its own native read, and there is
 * no managed enrolment on that platform yet.
 */
interface ManagedConfigPlugin {
  get(): Promise<Record<string, unknown>>;
}

const ManagedConfig = registerPlugin<ManagedConfigPlugin>("ManagedConfig");

export async function getManagedConfig(): Promise<Record<string, unknown>> {
  if (Capacitor.getPlatform() !== "android") return {};
  try {
    return await ManagedConfig.get();
  } catch (error) {
    // An unmanaged device is the normal case — never let it block the UI it feeds.
    logError("managedConfigService.getManagedConfig", error);
    return {};
  }
}

/**
 * Logs a managed device in as its club account. No-op on every device without a
 * pushed key, and on a device that already has a session — a kiosk keeps the
 * session supabase-js stores and refreshes, so this only runs on a cold start
 * after enrolment or after someone logged out.
 */
export async function autoLoginFromManagedConfig(): Promise<void> {
  const deviceKey = (await getManagedConfig())["deviceKey"];
  if (typeof deviceKey !== "string" || !deviceKey) return;

  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) return;

  const { data, error } = await supabase.functions.invoke<{ tokenHash: string }>("device-login", {
    body: { deviceKey },
  });
  if (error || !data) {
    // A deactivated or unknown device lands here: leave the app signed out rather
    // than retrying, so the login page still works for a human at the same tablet.
    logError("managedConfigService.deviceLogin", error);
    return;
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.tokenHash,
  });
  if (verifyError) logError("managedConfigService.verifyDeviceToken", verifyError);
}
