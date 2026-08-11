import { signOut } from "@/services/authService";
import { createEl } from "@/utils/createEl";

/** Button that signs the user out and returns to the front page. */
export function createLogoutButton(klasse = "btn btn-sm btn-outline-secondary"): HTMLButtonElement {
  const knapp = createEl("button", "Logg ut", klasse);
  knapp.type = "button";
  knapp.addEventListener("click", async () => {
    knapp.disabled = true;
    try {
      await signOut();
    } finally {
      location.hash = "#/";
    }
  });
  return knapp;
}
