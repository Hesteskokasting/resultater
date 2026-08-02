/**
 * Contract shared by the three admin entity forms. Each form renders into
 * `container` and reports back through the callbacks, so the very same form
 * serves both its own route (`#/stevne/ny`) and the dashboard's overlay — the
 * page wrapper navigates on save, the overlay closes and refreshes its list.
 */
export interface AdminFormHost {
  container: HTMLElement;
  /** Rendered as a heading above the form. Omit in a modal, which has its own. */
  heading?: string;
  /** Wrapper element class, e.g. the page's "container py-4 admin-form-lg". */
  wrapperClass?: string;
  /** `created` is false for an update. */
  onSaved?: (id: number, created: boolean) => void;
  onDeleted?: () => void;
  /** When set, the form renders an "Avbryt" button that calls this. */
  onCancel?: () => void;
}

/** The form's outer element plus the slot its fields go into. */
export function formShell(host: AdminFormHost): { wrapper: HTMLElement; headingHtml: string } {
  const wrapper = document.createElement("div");
  wrapper.className = host.wrapperClass ?? "admin-form-modal";
  return {
    wrapper,
    headingHtml: host.heading ? `<h2 class="mb-4">${escapeHeading(host.heading)}</h2>` : "",
  };
}

function escapeHeading(text: string): string {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}
