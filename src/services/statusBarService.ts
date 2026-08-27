import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { logError } from "@/utils/logError";

/**
 * Keeps the native status bar icon color in sync with the app theme.
 * Capacitor's own SystemBars picks its style from the OS night mode, not from
 * our theme, so a light app theme on a dark-mode phone would leave light icons
 * on a light header. No status bar in browsers — no-op outside the native apps.
 */
export function initStatusBarThemeSync(): void {
  if (!Capacitor.isNativePlatform()) return;

  const applyStyle = (): void => {
    const theme = document.documentElement.getAttribute("data-theme") ?? "light";
    // Dark = light icons (for dark backgrounds), Light = dark icons
    SystemBars.setStyle({
      style: theme === "dark" ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    }).catch((error: unknown) => logError("statusBarService.applyStyle", error));
  };

  applyStyle();
  new MutationObserver(applyStyle).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
