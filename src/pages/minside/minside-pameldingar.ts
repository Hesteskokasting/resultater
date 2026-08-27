import { getMyRegistrations } from "@/services/pameldingService";
import { bindRegistrationSlots } from "@/components/stevne/RegistrationButton";
import { createEmptyState } from "@/components/states";
import { createTournamentCard } from "@/components/stevne/StevneCard";
import { renderSectionCard } from "./_sectionCard";
import type { MinSideContext } from "./_linkState";
import type { RegistrationRow } from "@/services/pameldingService";

interface RegistrationContent {
  node: HTMLElement;
  registeredMap: Map<number, number>;
}

async function buildRegistrationContent(throwerId: number): Promise<RegistrationContent> {
  const { data, error } = await getMyRegistrations(throwerId);
  const registeredMap = new Map<number, number>();
  if (error) {
    const p = document.createElement("p");
    p.className = "text-muted";
    p.textContent = "Kunne ikkje laste påmeldingar.";
    return { node: p, registeredMap };
  }
  const active = data.filter((p: RegistrationRow) => p.stevne?.erfullfort !== true);
  if (!active.length) return { node: createEmptyState("Ingen påmeldingar enno."), registeredMap };

  const sorted = [...active].sort((a: RegistrationRow, b: RegistrationRow) =>
    (a.stevne?.dato ?? "").localeCompare(b.stevne?.dato ?? ""),
  );

  const wrap = document.createElement("div");
  wrap.className = "stevne-card-list";
  for (const p of sorted) {
    const stevne = p.stevne;
    const tournamentId = stevne?.id;
    if (tournamentId != null) registeredMap.set(tournamentId, p.id);
    if (!stevne) continue;
    wrap.appendChild(
      createTournamentCard(stevne, {
        href: tournamentId != null ? `#/stevne/${tournamentId}/info` : "#",
        registrationSlotId: tournamentId ?? undefined,
      }),
    );
  }
  return { node: wrap, registeredMap };
}

export async function render(container: HTMLElement, ctx: MinSideContext): Promise<void> {
  const shell = renderSectionCard(container, ctx, "Påmeldingar");
  if (!shell) return;

  const { node, registeredMap } = await buildRegistrationContent(shell.throwerId);
  shell.slot.replaceChildren(node);
  bindRegistrationSlots(container, shell.throwerId, registeredMap);
}
