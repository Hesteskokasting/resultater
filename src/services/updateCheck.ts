import { showToast } from "@/components/Toast";

// The app is a hash-routed SPA: a tab left open never re-requests index.html, so
// old JS keeps running for as long as the tab lives (Edge's sleeping tabs make
// that hours). Poll the deployed index.html instead and compare the hashed entry
// module against the one we are running.

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

let notified = false;

function entryModule(doc: Document): string | null {
  return doc.querySelector('script[type="module"][src]')?.getAttribute("src") ?? null;
}

/** The deployed version when its entry module differs from ours, else null. */
export function findUpdate(running: string, html: string): string | null {
  const deployed = new DOMParser().parseFromString(html, "text/html");
  const src = entryModule(deployed);
  if (!src || src === running) return null;
  return deployed.querySelector(".menu-version")?.textContent?.trim() ?? "";
}

async function checkForUpdate(): Promise<void> {
  if (notified) return;
  const running = entryModule(document);
  if (!running) return;
  try {
    // pathname is the index itself — the route lives in the hash.
    const res = await fetch(location.pathname, { cache: "no-store" });
    if (!res.ok) return;
    const version = findUpdate(running, await res.text());
    if (version === null) return;
    notified = true;
    showToast(`Ny versjon ${version} – trykk for å laste inn på nytt`, "info", true, () => {
      location.reload();
    });
  } catch {
    // Offline or blocked — the next check retries.
  }
}

export function initUpdateCheck(): void {
  if (import.meta.env.DEV) return;
  setInterval(() => {
    void checkForUpdate();
  }, CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void checkForUpdate();
  });
}
