import { confirmDialog } from "@/components/dialog/ConfirmDialog";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { logError } from "@/utils/logError";
import {
  registerForTournament,
  removeRegistration,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";

export interface RegistrationButtonProps {
  tournamentId: number;
  throwerId: number;
  isRegistered: boolean;
  registrationId: number | undefined;
  onAction?: (isNowRegistered: boolean, registrationId: number | undefined) => void;
}

export function createRegistrationButton(props: RegistrationButtonProps): HTMLButtonElement {
  const btn = document.createElement("button");
  let isRegistered = props.isRegistered;
  let registrationId = props.registrationId;

  function update() {
    btn.className = isRegistered ? "btn btn-sm btn-outline-danger" : "btn btn-sm btn-primary";
    btn.textContent = isRegistered ? "Meld av" : "Meld på";
  }

  update();

  /** Returns false when nothing changed, so the caller skips the onAction callback. */
  async function unregister(): Promise<boolean> {
    const ok = await confirmDialog({
      title: "Meld av",
      message: "Er du sikker på at du vil melde deg av stevnet?",
    });
    if (!ok) return false;

    // Cards built from a shared registrations map carry the id; a card built
    // straight from a tournament row has to look it up first.
    if (registrationId === undefined) {
      const { data } = await getMyRegistrationForTournament(props.tournamentId, props.throwerId);
      if (!data) {
        showToast("Kunne ikkje finne påmeldinga.", "error");
        return false;
      }
      registrationId = data.id;
    }

    const { error } = await removeRegistration(registrationId);
    if (error) {
      showToast("Kunne ikkje melde av: " + errorMessage(error), "error");
      return false;
    }

    isRegistered = false;
    registrationId = undefined;
    showToast("Du er meldt av stevnet.", "success");
    return true;
  }

  async function register(): Promise<boolean> {
    const { error, id } = await registerForTournament(props.tournamentId, props.throwerId);
    if (error) {
      showToast("Kunne ikkje melde på: " + errorMessage(error), "error");
      return false;
    }

    isRegistered = true;
    registrationId = id ?? undefined;
    showToast("Du er meldt på stevnet.", "success");
    return true;
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      if (!(await (isRegistered ? unregister() : register()))) return;
      props.onAction?.(isRegistered, registrationId);
      update();
    } catch (err) {
      // The services return errors rather than throwing, so this is the network
      // layer failing outright. Without it the click is lost in silence.
      logError("RegistrationButton", err);
      showToast("Noko gjekk gale. Prøv igjen.", "error");
    } finally {
      btn.disabled = false;
    }
  });

  return btn;
}

export function bindRegistrationSlots(
  container: HTMLElement,
  throwerId: number,
  registrationsMap: Map<number, number>,
): void {
  container.querySelectorAll<HTMLElement>("[data-registration-slot]").forEach((slot) => {
    const tournamentId = Number(slot.dataset.registrationSlot);
    const registrationId = registrationsMap.get(tournamentId);
    const button = createRegistrationButton({
      tournamentId,
      throwerId,
      isRegistered: registrationId !== undefined,
      registrationId,
      onAction: (isNow, newId) => {
        if (isNow && newId !== undefined) registrationsMap.set(tournamentId, newId);
        else registrationsMap.delete(tournamentId);
      },
    });
    slot.replaceWith(button);
  });
}
