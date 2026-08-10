import { generateNextSwissRound } from "@/services/kampGenereringInnledendeService";
import { showToast } from "@/components/Toast";
import { logError } from "@/utils/logError";
import { createInnledendeRenderer, type InnledendeVariant } from "./innledendeBase";

let showAllRounds = false;

const variant: InnledendeVariant = {
  channelName: (id) => `stevne-innl-nhm-${id}`,
  logPrefix: "nordhordland",
  isSwiss: true,
  onReset: () => {
    showAllRounds = false;
  },
  bannerMeta: ({ roundMap, stevne }) => {
    if (roundMap.size === 0) return "NHM";
    const current = Math.max(...roundMap.keys());
    const total = stevne.antall_runder_innl;
    return total ? `NHM - ${current} av ${total} rundar` : `NHM - ${current} rundar`;
  },
  getMenuItems: ({ roundMap }) => {
    if (roundMap.size <= 1) return [];
    const label = showAllRounds ? "Skjul tidlegare rundar" : `Vis alle rundar (${roundMap.size})`;
    return [{ id: "toggle-rundar-btn", label }];
  },
  bindBannerExtra: (slot, { stevneid, allMatchesConfirmed, reload }) => {
    slot.querySelector("#toggle-rundar-btn")?.addEventListener("click", () => {
      showAllRounds = !showAllRounds;
      void reload();
    });
    const nextRoundBtn = slot.querySelector<HTMLButtonElement>("#neste-runde-btn");
    nextRoundBtn?.addEventListener("click", async () => {
      if (!allMatchesConfirmed) {
        showToast("Nokre kampar er ikkje bekrefta!", "error");
        return;
      }
      if (nextRoundBtn) {
        nextRoundBtn.disabled = true;
        nextRoundBtn.textContent = "Genererer…";
      }
      try {
        await generateNextSwissRound(stevneid);
        await reload();
      } catch (e) {
        logError("nordhordland:nesteRunde", e);
        showToast("Feil ved generering av neste runde", "error");
        if (nextRoundBtn) {
          nextRoundBtn.disabled = false;
          nextRoundBtn.textContent = "Generer neste runde";
        }
      }
    });
  },
  filterRounds: (roundMap) => {
    if (roundMap.size <= 1 || showAllRounds) return roundMap;
    const lastRound = Math.max(...roundMap.keys());
    return new Map([[lastRound, roundMap.get(lastRound) ?? []]]);
  },
};

export const render = createInnledendeRenderer(variant);
