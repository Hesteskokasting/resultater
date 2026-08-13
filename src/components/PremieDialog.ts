// Asks how many prizes to draw: a percentage of the participants, or an exact
// number. Exactly one of the two — the radio pair decides which input counts, so
// the draw never has to guess which answer the admin meant.

import { createModalEl, createModalLifecycle } from "@/components/ModalBase";
import type { PremieMengd } from "@/services/resultatService";

export interface PremieDialogProps {
  /** Placed participants, so the dialog can say what the percentage applies to. */
  deltakarar: number;
}

let _el: HTMLElement | null = null;
let _resolve: ((value: PremieMengd | null) => void) | null = null;
const _modal = createModalLifecycle();

function getEl(): HTMLElement {
  if (_el) return _el;

  _el = createModalEl({
    role: "dialog",
    labelledBy: "premie-title",
    html: `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="premie-title">Trekk premiar</h5>
        </div>
        <div class="modal-body pt-2">
          <p class="premie-dialog__hjelp" id="premie-hjelp"></p>
          <div class="premie-dialog__val">
            <label class="premie-dialog__rad">
              <input type="radio" name="premie-modus" value="prosent" checked />
              <span>Prosent av deltakarane</span>
            </label>
            <input type="number" class="form-control" id="premie-prosent" min="1" max="100" step="1" value="10" />
          </div>
          <div class="premie-dialog__val">
            <label class="premie-dialog__rad">
              <input type="radio" name="premie-modus" value="antal" />
              <span>Eksakt tal på premiar</span>
            </label>
            <input type="number" class="form-control" id="premie-antal" min="1" step="1" disabled />
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="premie-cancel">Avbryt</button>
          <button type="button" class="btn btn-primary" id="premie-confirm">Trekk</button>
        </div>
      </div>
    </div>
  `,
  });

  const prosentInput = _el.querySelector<HTMLInputElement>("#premie-prosent")!;
  const antalInput = _el.querySelector<HTMLInputElement>("#premie-antal")!;

  // Only the chosen mode's field is live, so there is never a stale second value.
  for (const radio of _el.querySelectorAll<HTMLInputElement>('input[name="premie-modus"]')) {
    radio.addEventListener("change", () => {
      const prosentValt = radio.value === "prosent" && radio.checked;
      prosentInput.disabled = !prosentValt;
      antalInput.disabled = prosentValt;
      (prosentValt ? prosentInput : antalInput).focus();
    });
  }

  _el.querySelector("#premie-cancel")!.addEventListener("click", () => {
    dismiss(null);
  });
  _el.querySelector("#premie-confirm")!.addEventListener("click", confirm);
  for (const input of [prosentInput, antalInput]) {
    input.addEventListener("keydown", (e) => {
      if ((e as KeyboardEvent).key === "Enter") {
        e.preventDefault();
        confirm();
      }
    });
  }
  return _el;
}

function selectedMode(): "prosent" | "antal" {
  const checked = _el?.querySelector<HTMLInputElement>('input[name="premie-modus"]:checked');
  return checked?.value === "antal" ? "antal" : "prosent";
}

function confirm(): void {
  const mode = selectedMode();
  const raw = _el?.querySelector<HTMLInputElement>(`#premie-${mode}`)?.value ?? "";
  const value = Number(raw.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return;
  if (mode === "prosent" && value > 100) return;
  dismiss(mode === "prosent" ? { prosent: value } : { antal: Math.round(value) });
}

function dismiss(value: PremieMengd | null): void {
  if (!_el || !_resolve) return;
  const resolve = _resolve;
  _resolve = null;
  _modal.close(_el);
  resolve(value);
}

export function premieDialog({ deltakarar }: PremieDialogProps): Promise<PremieMengd | null> {
  const el = getEl();
  el.querySelector<HTMLElement>("#premie-hjelp")!.textContent =
    `${deltakarar} deltakarar er plasserte. Prosenten blir runda ned, og dei tre fremste blir ikkje trekte. Runden kan berre trekkjast éin gong.`;

  const prosentInput = el.querySelector<HTMLInputElement>("#premie-prosent")!;
  const antalInput = el.querySelector<HTMLInputElement>("#premie-antal")!;
  el.querySelector<HTMLInputElement>('input[name="premie-modus"][value="prosent"]')!.checked = true;
  prosentInput.disabled = false;
  prosentInput.value = "10";
  antalInput.disabled = true;
  antalInput.value = String(Math.floor(deltakarar / 10) || 1);

  return new Promise((resolve) => {
    _resolve = resolve;
    _modal.open(el, {
      focus: "#premie-prosent",
      onEscape: () => {
        dismiss(null);
      },
    });
  });
}
