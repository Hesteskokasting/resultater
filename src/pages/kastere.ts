import type { PageRenderFn } from '@/types'
import { renderListe } from './_kastereListe'
import { renderDetalj, destroyChart } from './_kastereDetalj'

export const render: PageRenderFn = async (container, params) => {
  destroyChart()
  if (params.id) {
    await renderDetalj(container, Number(params.id))
  } else {
    await renderListe(container)
  }
}
