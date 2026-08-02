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
  savedMessage: (isNew: boolean) => string;
  deletedMessage: string;
  size?: "md" | "lg";
}

function openEditor(
  mount: Mount,
  props: EditorProps,
  id: number | undefined,
  onChanged: () => void,
) {
  const isNew = id === undefined;
  const modal = openAdminModal({ title: props.title(isNew), size: props.size });

  const finish = (message: string): void => {
    modal.close();
    showToast(message, "success");
    onChanged();
  };

  void mount(
    {
      container: modal.body,
      onSaved: (_savedId, created) => finish(props.savedMessage(created)),
      onDeleted: () => finish(props.deletedMessage),
      onCancel: () => modal.close(),
    },
    id,
  );
}

export function openTournamentEditor(id: number | undefined, onChanged: () => void): void {
  openEditor(
    mountTournamentForm,
    {
      title: (isNew) => (isNew ? "Nytt stevne" : "Rediger stevne"),
      savedMessage: (created) => (created ? "Stevnet er oppretta." : "Stevnet er lagra."),
      deletedMessage: "Stevnet er sletta.",
      size: "lg",
    },
    id,
    onChanged,
  );
}

export function openThrowerEditor(id: number | undefined, onChanged: () => void): void {
  openEditor(
    mountThrowerForm,
    {
      title: (isNew) => (isNew ? "Ny utøvar" : "Rediger utøvar"),
      savedMessage: (created) => (created ? "Utøvaren er oppretta." : "Utøvaren er lagra."),
      deletedMessage: "Utøvaren er sletta.",
      size: "lg",
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
      savedMessage: (created) => (created ? "Klubben er oppretta." : "Klubben er lagra."),
      deletedMessage: "Klubben er sletta.",
    },
    id,
    onChanged,
  );
}
