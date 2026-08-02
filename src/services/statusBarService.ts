import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { logError } from "@/utils/logError";

/**
 * Keeps the iOS status bar icon color in sync with the app theme.
 * Android manages its own status bar styling natively, and in browsers
 * there is no status bar — no-op outside the iOS app.
 */
export function initStatusBarThemeSync(): void {
  if (Capacitor.getPlatform() !== "ios") return;

  const applyStyle = (): void => {
    const theme = document.documentElement.getAttribute("data-theme") ?? "light";
    // Style.Dark = light icons (for dark backgrounds), Style.Light = dark icons
    StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light }).catch(
      (error: unknown) => logError("statusBarService.applyStyle", error),
    );
  };

  applyStyle();
  new MutationObserver(applyStyle).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
