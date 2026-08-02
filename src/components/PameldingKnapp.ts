import { confirmDialog } from "@/components/ConfirmDialog";
import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import {
  registerForTournament,
  removeRegistration,
  getMyRegistrationForTournament,
} from "@/services/pameldingService";

export interface RegistrationButtonProps {
  tournamentId: number;
  throwerId: number;
  userId: string;
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

  btn.addEventListener("click", async () => {
    btn.disabled = true;

    if (isRegistered) {
      const ok = await confirmDialog({
        title: "Meld av",
        message: "Er du sikker på at du vil melde deg av stevnet?",
      });
      if (!ok) {
        btn.disabled = false;
        return;
      }

      if (registrationId === undefined) {
        const { data } = await getMyRegistrationForTournament(props.tournamentId, props.throwerId);
        if (!data) {
          showToast("Kunne ikkje finne påmeldinga.", "error");
          btn.disabled = false;
          return;
        }
        registrationId = data.id;
      }

      const { error } = await removeRegistration(registrationId);
      if (error) {
        showToast("Kunne ikkje melde av: " + errorMessage(error), "error");
        btn.disabled = false;
        return;
      }
      isRegistered = false;
      registrationId = undefined;
      showToast("Du er meldt av stevnet.", "success");
    } else {
      const { error, id } = await registerForTournament(props.tournamentId, props.throwerId);
      if (error) {
        showToast("Kunne ikkje melde på: " + errorMessage(error), "error");
        btn.disabled = false;
        return;
      }
      isRegistered = true;
      registrationId = id ?? undefined;
      showToast("Du er meldt på stevnet.", "success");
    }

    props.onAction?.(isRegistered, registrationId);
    update();
    btn.disabled = false;
  });

  return btn;
}

export function bindRegistrationSlots(
  container: HTMLElement,
  throwerId: number,
  userId: string,
  registrationsMap: Map<number, number>,
): void {
  container.querySelectorAll<HTMLElement>("[data-registration-slot]").forEach((slot) => {
    const tournamentId = Number(slot.dataset.registrationSlot);
    const registrationId = registrationsMap.get(tournamentId);
    const button = createRegistrationButton({
      tournamentId,
      throwerId,
      userId,
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
