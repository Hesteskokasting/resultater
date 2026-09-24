import { createEmptyState } from "@/components/states";
import { getUser } from "@/services/authService";
import { mountClubForm } from "../forms/klubbForm";

/** A klubbadmin's own club, edited in place. */
export async function render(el: HTMLElement): Promise<void> {
  const club = (await getUser())?.club ?? null;
  if (club === null) {
    el.replaceChildren(createEmptyState("Du har ikkje fått tildelt ein klubb."));
    return;
  }
  await mountClubForm({ container: el, wrapperClass: "admin-form-lg" }, club);
}
