import { Capacitor, registerPlugin } from "@capacitor/core";
import { logError } from "@/utils/logError";

/**
 * Managed configuration pushed from an MDM (Intune) and read back through Android's
 * RestrictionsManager. The keys an admin can set are declared in
 * android/app/src/main/res/xml/app_restrictions.xml.
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

/** The e-mail the MDM wants this device to log in with, or "" when nothing was pushed. */
export async function getManagedLoginHint(): Promise<string> {
  const value = (await getManagedConfig())["loginHint"];
  return typeof value === "string" ? value.trim() : "";
}
