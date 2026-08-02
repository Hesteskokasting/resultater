import { mountThrowerForm } from "./forms/kasterForm";
import { renderFormRoute } from "./forms/_formRoute";
import type { Params } from "@/types";

/**
 * Standalone route for the thrower form (`#/kaster/ny`, `#/kaster/:id/admin`).
 * The dashboard mounts the same form in an overlay.
 */
export function render(container: HTMLElement, params: Params = {}): Promise<void> {
  return renderFormRoute(container, params, {
    mount: mountThrowerForm,
    heading: (isNew) => (isNew ? "Ny utøvar" : "Rediger utøvar"),
    wrapperClass: "container py-4 admin-form-md",
    createdHash: (id) => `#/kaster/${id}/admin`,
    deletedHash: "#/kastere",
    nameFields: ["fornavn", "etternavn"],
  });
}
