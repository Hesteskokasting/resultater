import { printStartkort } from '../../../organizer/startkort-print'
import { createInnledendeRenderer, type InnledendeVariant } from './_innledendeBase'

const variant: InnledendeVariant = {
  channelName: (id) => `stevne-innl-gloppen-${id}`,
  logPrefix: 'gloppen',
  erSwiss: false,
  getBannerExtra: ({ isAdmin }) =>
    isAdmin ? `<button class="btn btn-sm btn-outline-info" id="startkort-btn">Startkort</button>` : '',
  bindBannerExtra: (slot, { stevne, alleKamper, rundeMap, startnrMap, stilling }) => {
    slot.querySelector('#startkort-btn')?.addEventListener('click', () => {
      printStartkort(stevne as never, alleKamper as never, rundeMap as never, startnrMap, stilling)
    })
  },
}

export const render = createInnledendeRenderer(variant)
