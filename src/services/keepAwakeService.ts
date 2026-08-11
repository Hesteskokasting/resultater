import { Capacitor } from "@capacitor/core";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { logError } from "@/utils/logError";

/**
 * Kamp- og stevnesidene held skjermen på, så operatørar som registrerer resultat
 * ikkje må skru opp skjermtidsavbrotet på telefonen. Andre sider let skjermen sove
 * som normalt, så vanleg blaing i lister ikkje tappar batteriet.
 *
 * Native app only. Both platforms scope this to the foreground themselves —
 * Android's FLAG_KEEP_SCREEN_ON only applies while the window is visible, and iOS
 * ignores the idle timer flag when the app isn't active — so no background handling
 * is needed here.
 */
const AWAKE_ROUTES = /^\/(kamp|stevne)\//;

let awake = false;

export function applyKeepAwakeForRoute(hash: string): void {
  if (!Capacitor.isNativePlatform()) return;

  const shouldStayAwake = AWAKE_ROUTES.test(hash);
  if (shouldStayAwake === awake) return;

  awake = shouldStayAwake;
  const call = shouldStayAwake ? KeepAwake.keepAwake() : KeepAwake.allowSleep();
  call.catch((error: unknown) => {
    // Roll back so the next navigation retries instead of trusting a failed call.
    awake = !shouldStayAwake;
    logError("keepAwakeService.applyKeepAwakeForRoute", error);
  });
}
