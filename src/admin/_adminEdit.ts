import { showToast } from "@/components/Toast";
import { openAdminModal } from "./_adminModal";
import { mountClubForm } from "./forms/klubbForm";
import { mountThrowerForm } from "./forms/kasterForm";
import { mountTournamentForm } from "./forms/stevneForm";
import type { AdminFormHost } from "./forms/_formHost";

/**
 * Opens an entity form in the dashboard overlay. Saving or deleting closes the
 * overlay and calls `onChanged`, so the panel behind it refreshes in place —
 * the admin keeps their tab, filters and scroll position throughout.
 */

type Mount = (host: AdminFormHost, id?: number) => Promise<void>;

interface EditorProps {
  title: (isNew: boolean) => string;
  deletedMessage: string;
}

function openEditor(
  mount: Mount,
  props: EditorProps,
  id: number | undefined,
  onChanged: () => void,
  onDeleted?: () => void,
) {
  const isNew = id === undefined;
  const modal = openAdminModal({ title: props.title(isNew) });

  const finish = (message: string, after: () => void): void => {
    modal.close();
    showToast(message, "success");
    after();
  };

  void mount(
    {
      container: modal.body,
      // The form announces the save itself; the overlay only has to get out of the way.
      onSaved: () => {
        modal.close();
        onChanged();
      },
      // A caller viewing the deleted row itself has to leave, not just refresh.
      onDeleted: () => finish(props.deletedMessage, onDeleted ?? onChanged),
      onCancel: () => modal.close(),
    },
    id,
  );
}

export function openTournamentEditor(
  id: number | undefined,
  onChanged: () => void,
  onDeleted?: () => void,
): void {
  openEditor(
    mountTournamentForm,
    {
      title: (isNew) => (isNew ? "Nytt stevne" : "Rediger stevne"),
      deletedMessage: "Stevnet er sletta.",
    },
    id,
    onChanged,
    onDeleted,
  );
}

export function openThrowerEditor(id: number | undefined, onChanged: () => void): void {
  openEditor(
    mountThrowerForm,
    {
      title: (isNew) => (isNew ? "Ny utøvar" : "Rediger utøvar"),
      deletedMessage: "Utøvaren er sletta.",
    },
    id,
    onChanged,
  );
}

export function openClubEditor(id: number | undefined, onChanged: () => void): void {
  openEditor(
    mountClubForm,
    {
      title: (isNew) => (isNew ? "Ny klubb" : "Rediger klubb"),
      deletedMessage: "Klubben er sletta.",
    },
    id,
    onChanged,
  );
}
