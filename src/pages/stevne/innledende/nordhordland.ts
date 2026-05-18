import { genererNesteSwissRunde } from '@/services/kampGenereringInnledendeService'
import { showToast } from '@/components/Toast'
import { logError } from '@/utils/logError'
import { createInnledendeRenderer, type InnledendeVariant } from './_innledendeBase'

let visAlleRundar = false

const variant: InnledendeVariant = {
  channelName: (id) => `stevne-innl-nhm-${id}`,
  logPrefix: 'nordhordland',
  erSwiss: true,
  onReset: () => { visAlleRundar = false },
  getBannerExtra: ({ rundeMap }) => {
    if (rundeMap.size <= 1) return ''
    const label = visAlleRundar ? 'Skjul tidlegare rundar' : `Vis alle rundar (${rundeMap.size})`
    return `<button class="btn btn-sm btn-outline-secondary" id="toggle-rundar-btn">${label}</button>`
  },
  bindBannerExtra: (slot, { stevneid, erAlleKamperBekreftet, reload }) => {
    slot.querySelector('#toggle-rundar-btn')?.addEventListener('click', () => {
      visAlleRundar = !visAlleRundar
      void reload()
    })
    slot.querySelector('#neste-runde-btn')?.addEventListener('click', async () => {
      if (!erAlleKamperBekreftet) { showToast('Nokre kampar er ikkje bekrefta!', 'error'); return }
      try {
        await genererNesteSwissRunde(stevneid)
        await reload()
      } catch (e) {
        logError('nordhordland:nesteRunde', e)
        showToast('Feil ved generering av neste runde', 'error')
      }
    })
  },
  filterRundar: (rundeMap) => {
    if (rundeMap.size <= 1 || visAlleRundar) return rundeMap
    const sisteRunde = Math.max(...rundeMap.keys())
    return new Map([[sisteRunde, rundeMap.get(sisteRunde) ?? []]])
  },
}

export const render = createInnledendeRenderer(variant)
