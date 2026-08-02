import { createEl } from "@/utils/createEl";

export interface NumberpadEntry {
  /** Display name shown above the pad. */
  name: string;
  /** Prefilled score. */
  score: number;
}

export interface NumberpadOverlay {
  overlay: HTMLDivElement;
  /** Removes the overlay and unwinds the history entry pushed on open. */
  close: () => void;
}

/**
 * Fullscreen numberpad overlay shell. Opening pushes a history entry so the
 * device back button closes the pad instead of leaving the page. Shared by
 * showNumberpad (np-overlay) and OmgangNumberpad (onp-overlay).
 */
export function createNumberpadOverlay(className = "np-overlay"): NumberpadOverlay {
  const overlay = document.createElement("div");
  overlay.className = className;

  history.pushState({ numberpad: true }, "");

  function handlePopState(): void {
    window.removeEventListener("popstate", handlePopState);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
  }

  function close(): void {
    window.removeEventListener("popstate", handlePopState);
    if (document.body.contains(overlay)) document.body.removeChild(overlay);
    if ((history.state as { numberpad?: boolean } | null)?.numberpad) history.back();
  }

  window.addEventListener("popstate", handlePopState);
  return { overlay, close };
}

/**
 * Fullscreen numberpad for direct score entry. Supports any number of
 * participants (kamp uses 2 sides, X-kast courts have 1–3 players).
 * Mobile shows one participant at a time ("→" advances, Save on the last);
 * desktop shows all pads side by side.
 */
export function showNumberpad(
  entries: NumberpadEntry[],
  onSave: (scores: number[]) => Promise<void>,
): void {
  const scores = entries.map((e) => e.score);
  let step = 0;

  const { overlay, close } = createNumberpadOverlay();

  function makeSaveBtn(className: string): HTMLButtonElement {
    const btn = createEl("button", "Lagre", className) as HTMLButtonElement;
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Lagrer…";
      await onSave(scores);
      close();
    });
    return btn;
  }

  function render(): void {
    overlay.innerHTML = "";
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobile) {
      const xBtn = createEl("button", "×", "np-lukk-btn");
      xBtn.addEventListener("click", close);
      overlay.appendChild(xBtn);
      overlay.appendChild(makeSaveBtn("np-lagre-btn"));
    }

    const wrap = createEl("div", null, "np-wrap");
    overlay.appendChild(wrap);

    if (isMobile) {
      const closeBtn = createEl("button", "×", "np-num-btn np-grid-btn np-grid-close-btn");
      closeBtn.addEventListener("click", close);

      let actionBtn: HTMLElement;
      if (step < entries.length - 1) {
        const nextBtn = createEl("button", "→", "np-num-btn");
        nextBtn.addEventListener("click", () => {
          step++;
          render();
        });
        actionBtn = nextBtn;
      } else {
        actionBtn = makeSaveBtn("np-num-btn");
      }

      const entry = entries[step];
      if (!entry) return;
      const idx = step;
      const pad = createPad(entry.name, scores[idx] ?? 0, closeBtn, actionBtn);
      wrap.appendChild(pad);
      bindPadButtons(
        pad,
        () => scores[idx] ?? 0,
        (v) => {
          scores[idx] = v;
        },
      );
    } else {
      entries.forEach((entry, idx) => {
        const pad = createPad(entry.name, scores[idx] ?? 0);
        wrap.appendChild(pad);
        bindPadButtons(
          pad,
          () => scores[idx] ?? 0,
          (v) => {
            scores[idx] = v;
          },
        );
      });
    }
  }

  render();
  document.body.appendChild(overlay);
}

/** Builds one numberpad card. Shared with OmgangNumberpad's sequential wizard. */
export function createPad(
  name: string,
  initScore: number,
  bottomLeft?: HTMLElement,
  bottomRight?: HTMLElement,
): HTMLElement {
  const pad = createEl("div", null, "np-pad");

  pad.appendChild(createEl("h3", name, "np-navn"));

  const scoreEl = createEl("div", String(initScore), "np-score");
  scoreEl.dataset.scoreEl = "1";
  pad.appendChild(scoreEl);

  const resetBtn = createEl("button", "Reset", "np-reset-btn") as HTMLButtonElement;
  resetBtn.disabled = initScore === 0;
  resetBtn.dataset.resetBtn = "1";
  pad.appendChild(resetBtn);

  const grid = createEl("div", null, "np-grid");
  for (let i = 1; i <= 9; i++) {
    const btn = createEl("button", String(i), "np-num-btn") as HTMLButtonElement;
    btn.dataset.val = String(i);
    grid.appendChild(btn);
  }
  grid.appendChild(bottomLeft ?? document.createElement("div"));
  const zeroBtn = createEl("button", "0", "np-num-btn") as HTMLButtonElement;
  zeroBtn.dataset.val = "0";
  grid.appendChild(zeroBtn);
  grid.appendChild(bottomRight ?? document.createElement("div"));

  pad.appendChild(grid);
  return pad;
}

/** Wires digit/reset buttons. `max` silently ignores presses that would exceed it. */
export function bindPadButtons(
  pad: HTMLElement,
  getScore: () => number,
  setScore: (v: number) => void,
  max?: number,
): void {
  const scoreEl = pad.querySelector<HTMLElement>("[data-score-el]")!;
  const resetBtn = pad.querySelector<HTMLButtonElement>("[data-reset-btn]")!;

  for (const btn of pad.querySelectorAll<HTMLButtonElement>("[data-val]")) {
    btn.addEventListener("click", () => {
      const curr = getScore();
      const next = curr === 0 ? Number(btn.dataset.val) : parseInt(String(curr) + btn.dataset.val);
      if (max !== undefined && next > max) return;
      setScore(next);
      scoreEl.textContent = String(next);
      resetBtn.disabled = false;
    });
  }

  resetBtn.addEventListener("click", () => {
    setScore(0);
    scoreEl.textContent = "0";
    resetBtn.disabled = true;
  });
}
