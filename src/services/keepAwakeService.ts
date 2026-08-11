import { Capacitor } from "@capacitor/core";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { logError } from "@/utils/logError";

/**
 * Keeps the screen on while the app is in the foreground, so operators entering
 * results don't have to raise their phone's screen timeout.
 *
 * Native app only. Both platforms scope this to the foreground themselves —
 * Android's FLAG_KEEP_SCREEN_ON only applies while the window is visible, and iOS
 * ignores the idle timer flag when the app isn't active — so one call is enough.
 */
export function initKeepScreenAwake(): void {
  if (!Capacitor.isNativePlatform()) return;

  KeepAwake.keepAwake().catch((error: unknown) => logError("keepAwakeService.keepAwake", error));
}
