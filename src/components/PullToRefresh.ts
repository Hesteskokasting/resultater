import { Capacitor } from "@capacitor/core";

type RefreshFn = () => void | Promise<void>;

const PULL_THRESHOLD = 64;
const MAX_PULL = 90;
const DRAG_RESISTANCE = 1.8;

/** Wires up a native-style pull-to-refresh gesture above #app. Android-only — mobile
 * browsers already have their own overscroll refresh, and desktop has no touch input. */
export function initPullToRefresh(onRefresh: RefreshFn): void {
  if (!Capacitor.isNativePlatform()) return;

  const headerEl = document.querySelector(".top-header");
  const appEl = document.getElementById("app");
  if (!headerEl || !appEl) return;
  const header: Element = headerEl;
  const app: HTMLElement = appEl;

  const indicator = document.createElement("div");
  indicator.className = "ptr-indicator";
  indicator.innerHTML = '<div class="spinner-border ptr-indicator__spinner" role="status"></div>';
  header.insertAdjacentElement("afterend", indicator);
  const spinner = indicator.querySelector<HTMLElement>(".ptr-indicator__spinner")!;

  let startX = 0;
  let startY = 0;
  let pulling = false;
  let refreshing = false;

  function atRefreshableTop(target: EventTarget | null): boolean {
    if (window.scrollY > 0 || refreshing) return false;
    if (app.classList.contains("sb-fullskjerm-modus")) return false;
    return !(target instanceof Element && target.closest(".sidepanel, .meny-bakgrunn, .modal"));
  }

  function reset(): void {
    pulling = false;
    indicator.style.height = "0px";
    spinner.style.opacity = "0";
  }

  window.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch || !atRefreshableTop(e.target)) return;
      startX = touch.clientX;
      startY = touch.clientY;
      pulling = true;
      indicator.style.transition = "none";
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!pulling || refreshing || !touch) return;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      if (deltaY <= 0 || Math.abs(deltaX) > Math.abs(deltaY) || window.scrollY > 0) {
        reset();
        return;
      }

      e.preventDefault();
      const pull = Math.min(deltaY / DRAG_RESISTANCE, MAX_PULL);
      indicator.style.height = `${pull}px`;
      spinner.style.opacity = `${Math.min(pull / PULL_THRESHOLD, 1)}`;
    },
    { passive: false },
  );

  window.addEventListener("touchend", () => {
    if (!pulling || refreshing) return;
    pulling = false;

    indicator.style.transition = "height 0.2s ease";

    const pulledFarEnough = parseFloat(indicator.style.height || "0") >= PULL_THRESHOLD;
    if (!pulledFarEnough) {
      reset();
      return;
    }

    refreshing = true;
    indicator.style.height = `${PULL_THRESHOLD}px`;
    spinner.style.opacity = "1";

    void Promise.resolve(onRefresh()).finally(() => {
      refreshing = false;
      reset();
    });
  });
}
