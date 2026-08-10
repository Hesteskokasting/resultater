import { printStartCard } from "@/organizer/startkort-print";
import { createInnledendeRenderer, type InnledendeVariant } from "./innledendeBase";

const variant: InnledendeVariant = {
  channelName: (id) => `stevne-innl-gloppen-${id}`,
  logPrefix: "gloppen",
  isSwiss: false,
  bannerMeta: ({ stevne, roundMap }) => {
    const rounds = stevne.antall_runder_innl ?? roundMap.size;
    return rounds ? `Gloppen - ${rounds} rundar` : "Gloppen";
  },
  getMenuItems: ({ isAdmin }) => (isAdmin ? [{ id: "startkort-btn", label: "Startkort" }] : []),
  bindBannerExtra: (slot, { stevne, allMatches, roundMap, startNumberMap, standing }) => {
    slot.querySelector("#startkort-btn")?.addEventListener("click", () => {
      printStartCard(
        stevne as never,
        allMatches as never,
        roundMap as never,
        startNumberMap,
        standing,
      );
    });
  },
};

export const render = createInnledendeRenderer(variant);
