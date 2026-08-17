import type { AdminFormHost } from "./_formHost";
import type { Params } from "@/types";

/**
 * Shared body of the three standalone form routes. They differ only in which
 * form they mount, where a create navigates afterwards, and which input holds
 * the name for the heading — everything else (page chrome, delete navigation)
 * is identical, and the dashboard overlay reuses the same form modules.
 */
export interface FormRouteProps {
  mount: (host: AdminFormHost, id?: number) => Promise<void>;
  /** e.g. `(isNew) => isNew ? "Nytt stevne" : "Rediger stevne"`. */
  heading: (isNew: boolean) => string;
  wrapperClass: string;
  /** Where a freshly created entity lands, e.g. `#/stevne/12/rediger`. */
  createdHash: (id: number) => string;
  /** Where a delete returns to. Omit for forms that cannot delete. */
  deletedHash?: string;
  /** Input names whose values make up the "Rediger X: <name>" heading suffix. */
  nameFields?: string[];
}

export async function renderFormRoute(
  container: HTMLElement,
  params: Params,
  props: FormRouteProps,
): Promise<void> {
  const id = params.id !== undefined ? Number(params.id) : undefined;

  await props.mount(
    {
      container,
      heading: props.heading(id === undefined),
      wrapperClass: props.wrapperClass,
      // The form's toast outlives the navigation, so a fresh entity can go
      // straight to its edit route.
      onSaved: (savedId, created) => {
        if (created) location.hash = props.createdHash(savedId);
      },
      onDeleted: props.deletedHash
        ? () => {
            location.hash = props.deletedHash!;
          }
        : undefined,
    },
    id,
  );

  if (id === undefined || !props.nameFields?.length) return;

  // The heading gains the entity's name once the form has loaded it, which
  // saves fetching the same row twice just to title the page.
  const name = props.nameFields
    .map((field) => container.querySelector<HTMLInputElement>(`[name="${field}"]`)?.value ?? "")
    .filter(Boolean)
    .join(" ")
    .trim();
  const title = container.querySelector("h2");
  if (title && name) title.textContent = `${props.heading(false)}: ${name}`;
}
