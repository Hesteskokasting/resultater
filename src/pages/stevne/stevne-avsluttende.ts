import { createLoadingState } from "@/components/LoadingState";
import { createErrorBanner } from "@/components/ErrorBanner";
import { getFinalMethodName } from "@/services/stevneService";

export async function render(
  container: HTMLElement,
  { id, isAdmin = false }: { id: number; isAdmin?: boolean },
  bannerSlot: HTMLElement | null = null,
): Promise<void> {
  container.replaceChildren(createLoadingState());

  const { navn, error } = await getFinalMethodName(id);

  if (error) {
    container.replaceChildren(createErrorBanner("Stevne ikkje funne."));
    return;
  }

  if (navn.includes("cup")) {
    const { render: r } = await import("./avsluttende/cup");
    await r(container, { id, isAdmin }, bannerSlot);
  } else if (navn.includes("kongelag")) {
    const { render: r } = await import("./avsluttende/kongelag");
    await r(container, { id, isAdmin }, bannerSlot);
  } else if (navn.includes("nordhordland")) {
    const { render: r } = await import("./avsluttende/nordhordland");
    await r(container, { id, isAdmin }, bannerSlot);
  } else {
    container.replaceChildren(
      createErrorBanner(`Ukjend avsluttande kastemetode: ${navn || "(ikkje sett)"}`),
    );
  }
}
