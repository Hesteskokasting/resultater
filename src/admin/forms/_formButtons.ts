import { confirmDialog } from "@/components/ConfirmDialog";
import { showAlert } from "@/utils/adminForms";
import { errorMessage } from "@/utils/errorMessage";
import type { AdminFormHost } from "./_formHost";

/** Wiring shared by the entity forms' secondary buttons. */

export function bindCancelButton(wrapper: HTMLElement, host: AdminFormHost): void {
  wrapper.querySelector<HTMLButtonElement>("#cancel-button")?.addEventListener("click", () => {
    host.onCancel?.();
  });
}

export interface DeleteBinding {
  title: string;
  message: string;
  remove: () => Promise<{ error: unknown }>;
  onDeleted?: () => void;
}

/** Confirm, delete, and hand the outcome back to the host — or show the error in place. */
export function bindDeleteButton(wrapper: HTMLElement, binding: DeleteBinding): void {
  wrapper
    .querySelector<HTMLButtonElement>("#delete-button")
    ?.addEventListener("click", async () => {
      const confirmed = await confirmDialog({
        title: binding.title,
        message: binding.message,
        danger: true,
      });
      if (!confirmed) return;

      const { error } = await binding.remove();
      if (error) {
        showAlert(wrapper, errorMessage(error), "danger");
        return;
      }
      binding.onDeleted?.();
    });
}
