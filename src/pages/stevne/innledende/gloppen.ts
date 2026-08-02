import { printStartCard } from "@/organizer/startkort-print";
import { createInnledendeRenderer, type InnledendeVariant } from "./innledendeBase";

const variant: InnledendeVariant = {
  channelName: (id) => `stevne-innl-gloppen-${id}`,
  logPrefix: "gloppen",
  isSwiss: false,
  getBannerExtra: ({ isAdmin }) =>
    isAdmin
      ? `<button class="btn btn-sm btn-outline-info" id="startkort-btn">Startkort</button>`
      : "",
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
