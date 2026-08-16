import { showToast } from "@/components/Toast";
import { errorMessage } from "@/utils/errorMessage";
import { setRegistrationConfirmedForThrower } from "@/services/pameldingService";
import {
  attendanceOpenDelay,
  attendanceOpensAt,
  formatClock,
  isAttendanceOpen,
} from "@/utils/oppmote";

export interface OppmoteButtonProps {
  tournamentId: number;
  throwerId: number;
  /** Tournament date (YYYY-MM-DD) and optional start time — together they open the window */
  dato: string;
  tid: string | null | undefined;
  confirmed: boolean;
  /** Trigger-stamped moment of confirmation; null for rows confirmed before it existed */
  confirmedAt: string | null;
  onChange?: (confirmed: boolean) => void;
}

export interface OppmoteButtonHandle {
  element: HTMLElement;
}

export function createOppmoteButton(props: OppmoteButtonProps): OppmoteButtonHandle {
  const { tournamentId, throwerId, dato, tid, onChange } = props;

  let confirmed = props.confirmed;
  let confirmedAt = props.confirmedAt;
  let busy = false;
  let openTimer: ReturnType<typeof setTimeout> | undefined;

  const opensAt = attendanceOpensAt(dato, tid);

  const element = document.createElement("div");
  element.className = "oppmote-panel";

  async function setConfirmed(next: boolean): Promise<void> {
    if (busy) return;
    busy = true;
    render();

    const { bekreftetAt, error } = await setRegistrationConfirmedForThrower(
      tournamentId,
      throwerId,
      next,
    );
    busy = false;

    if (error) {
      showToast(
        next
          ? "Kunne ikkje stadfeste oppmøte: " + errorMessage(error)
          : "Kunne ikkje angre oppmøte: " + errorMessage(error),
        "error",
      );
      render();
      return;
    }

    confirmed = next;
    confirmedAt = bekreftetAt;
    showToast(next ? "Oppmøte stadfesta." : "Oppmøte angra.", "success");
    render();
    onChange?.(next);
  }

  function renderConfirmed(): void {
    const badge = document.createElement("span");
    badge.className = "oppmote-badge";
    badge.textContent = "✓";

    const label = document.createElement("span");
    const clock = formatClock(confirmedAt);
    label.textContent = clock ? `Oppmøte bekrefta ${clock}` : "Oppmøte bekrefta";

    const undo = document.createElement("button");
    undo.type = "button";
    undo.className = "oppmote-undo ms-auto";
    undo.textContent = busy ? "Angrar…" : "Angre";
    undo.disabled = busy;
    undo.addEventListener("click", () => void setConfirmed(false));

    const row = document.createElement("div");
    row.className = "oppmote-confirmed";
    row.append(badge, label, undo);
    element.replaceChildren(row);
  }

  function renderPending(): void {
    const open = isAttendanceOpen(opensAt);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `oppmote-btn${open ? "" : " oppmote-btn-locked"}`;
    btn.textContent = busy ? "Stadfestar…" : "Bekreft oppmøte";
    btn.disabled = !open || busy;
    btn.addEventListener("click", () => void setConfirmed(true));

    element.replaceChildren(btn);

    if (!open && opensAt) {
      const hint = document.createElement("div");
      hint.className = "oppmote-hint";
      hint.textContent = tid
        ? `Opnar ${formatClock(opensAt)}, to timar før start.`
        : "Opnar på stevnedagen.";
      element.appendChild(hint);
    }
  }

  function render(): void {
    clearTimeout(openTimer);
    openTimer = undefined;

    if (confirmed) {
      renderConfirmed();
      return;
    }

    renderPending();

    // Unlock the button on its own, so someone waiting on the stevne page does
    // not sit in front of a locked button after the window has opened.
    const delay = attendanceOpenDelay(opensAt);
    if (delay === null) return;
    openTimer = setTimeout(() => {
      if (element.isConnected) render();
    }, delay);
  }

  render();
  return { element };
}
