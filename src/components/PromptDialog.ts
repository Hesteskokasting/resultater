import { createModalEl, createModalLifecycle } from "@/components/ModalBase";

export interface PromptDialogProps {
  title: string;
  message: string;
  defaultValue?: string;
  inputType?: string;
}

let _el: HTMLElement | null = null;
let _resolve: ((value: string | null) => void) | null = null;
const _modal = createModalLifecycle();

function getEl(): HTMLElement {
  if (_el) return _el;

  _el = createModalEl({
    role: "dialog",
    labelledBy: "pd-title",
    html: `
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title" id="pd-title"></h5>
        </div>
        <div class="modal-body pt-2">
          <label class="form-label" id="pd-message" for="pd-input"></label>
          <input type="text" class="form-control" id="pd-input" autocomplete="off" />
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary" id="pd-cancel">Avbryt</button>
          <button type="button" class="btn btn-primary" id="pd-confirm">OK</button>
        </div>
      </div>
    </div>
  `,
  });
  _el.querySelector("#pd-cancel")!.addEventListener("click", () => {
    dismiss(null);
  });
  _el.querySelector("#pd-confirm")!.addEventListener("click", () => {
    confirm();
  });
  _el.querySelector("#pd-input")!.addEventListener("keydown", (e) => {
    if ((e as KeyboardEvent).key === "Enter") {
      e.preventDefault();
      confirm();
    }
  });
  return _el;
}

function confirm(): void {
  const value = _el?.querySelector<HTMLInputElement>("#pd-input")?.value ?? "";
  dismiss(value);
}

function dismiss(value: string | null): void {
  if (!_el || !_resolve) return;
  const resolve = _resolve;
  _resolve = null;
  _modal.close(_el);
  resolve(value);
}

export function promptDialog(props: PromptDialogProps): Promise<string | null> {
  const { title, message, defaultValue = "", inputType = "text" } = props;
  const el = getEl();

  el.querySelector<HTMLElement>("#pd-title")!.textContent = title;
  el.querySelector<HTMLElement>("#pd-message")!.textContent = message;
  const input = el.querySelector<HTMLInputElement>("#pd-input")!;
  input.type = inputType;
  input.value = defaultValue;

  return new Promise((resolve) => {
    _resolve = resolve;
    _modal.open(el, {
      focus: "#pd-input",
      onEscape: () => {
        dismiss(null);
      },
    });
  });
}
