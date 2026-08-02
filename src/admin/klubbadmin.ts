import { mountClubForm } from "./forms/klubbForm";
import { renderFormRoute } from "./forms/_formRoute";
import type { Params } from "@/types";

/**
 * Standalone route for the club form (`#/klubber/ny`, `#/klubber/:id/admin`).
 * The dashboard mounts the same form in an overlay.
 */
export function render(container: HTMLElement, params: Params = {}): Promise<void> {
  return renderFormRoute(container, params, {
    mount: mountClubForm,
    heading: (isNew) => (isNew ? "Ny klubb" : "Rediger klubb"),
    wrapperClass: "container py-4 admin-form-sm",
    createdHash: (id) => `#/klubber/${id}/admin`,
    nameFields: ["navn"],
  });
}
