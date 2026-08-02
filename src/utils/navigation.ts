/** Runs `cleanup` once, the next time the user navigates to a different hash route. */
export function onNavigateAway(cleanup: () => void): void {
  window.addEventListener("hashchange", cleanup, { once: true });
}
