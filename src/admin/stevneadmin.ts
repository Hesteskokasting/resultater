import { mountTournamentForm } from "./forms/stevneForm";
import { renderFormRoute } from "./forms/_formRoute";
import type { Params } from "@/types";

/**
 * Standalone route for the tournament form (`#/stevne/ny`, `#/stevne/:id/rediger`).
 * The dashboard mounts the same form in an overlay.
 */
export function render(container: HTMLElement, params: Params = {}): Promise<void> {
  return renderFormRoute(container, params, {
    mount: mountTournamentForm,
    heading: (isNew) => (isNew ? "Nytt stevne" : "Rediger stevne"),
    wrapperClass: "container py-4 admin-form-lg",
    createdHash: (id) => `#/stevne/${id}/rediger`,
    deletedHash: "#/terminliste",
    nameFields: ["navn"],
  });
}
