import { createModalEl, createModalLifecycle } from "@/components/ModalBase";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

let _el: HTMLElement | null = null;
let _resolve: ((value: boolean) => void) | null = null;
const _modal = createModalLifecycle();

function getEl(): HTMLElement {
  if (_el) {
    // The element is reused across dialogs; re-attach it if something detached it.
    if (!_el.isConnected) document.body.appendChild(_el);
    return _el;
  }

  _el = createModalEl({
    role: "alertdialog",
    labelledBy: "cd-title",
    describedBy: "cd-message",
    html: `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="cd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <p class="mb-0" id="cd-message"></p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="cd-cancel"></button>
          <button type="button" class="btn btn-primary" id="cd-confirm"></button>
        </div>
      </div>
    </div>
  `,
  });
  _el.querySelector("#cd-cancel")!.addEventListener("click", () => {
    dismiss(false);
  });
  _el.querySelector("#cd-confirm")!.addEventListener("click", () => {
    dismiss(true);
  });
  return _el;
}

function dismiss(value: boolean): void {
  if (!_el || !_resolve) return;
  const resolve = _resolve;
  _resolve = null;
  _modal.close(_el);
  resolve(value);
}

export function confirmDialog(props: ConfirmDialogProps): Promise<boolean> {
  const { title, message, confirmText = "OK", cancelText = "Avbryt", danger = false } = props;
  const el = getEl();

  el.querySelector<HTMLElement>("#cd-title")!.textContent = title;
  el.querySelector<HTMLElement>("#cd-message")!.textContent = message;
  el.querySelector<HTMLButtonElement>("#cd-cancel")!.textContent = cancelText;
  const confirmBtn = el.querySelector<HTMLButtonElement>("#cd-confirm")!;
  confirmBtn.textContent = confirmText;
  confirmBtn.className = `btn ${danger ? "btn-danger" : "btn-primary"}`;

  return new Promise((resolve) => {
    _resolve = resolve;
    _modal.open(el, {
      focus: "#cd-confirm",
      onEscape: () => {
        dismiss(false);
      },
    });
  });
}
