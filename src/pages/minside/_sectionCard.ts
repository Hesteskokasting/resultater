import { escHtml } from "@/utils/escHtml";
import { renderLinkGate } from "./_linkState";
import type { MinSideContext } from "./_linkState";

export interface SectionCardShell {
  throwerId: number;
  /** Content area that starts as a loading skeleton — fill it once data arrives. */
  slot: HTMLElement;
}

/**
 * Shared shell for min-side sections: link-gate check plus a card with title and
 * loading skeleton. Returns null when the user has no approved thrower link
 * (the gate rendered its own UI instead).
 */
export function renderSectionCard(
  container: HTMLElement,
  ctx: MinSideContext,
  title: string,
): SectionCardShell | null {
  const throwerId = renderLinkGate(container, ctx);
  if (throwerId == null) return null;

  container.innerHTML = `
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">${escHtml(title)}</h5>
        <div data-slot="content"><div class="skeleton-block skeleton-block--card"></div></div>
      </div>
    </div>`;
  return { throwerId, slot: container.querySelector<HTMLElement>('[data-slot="content"]')! };
}
