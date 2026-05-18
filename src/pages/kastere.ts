import type { PageRenderFn } from '../types'
import { renderListe } from './_kastereListe'
import { renderDetalj, ødeleggChart } from './_kastereDetalj'

export const render: PageRenderFn = async (container, params) => {
  ødeleggChart()
  if (params.id) {
    await renderDetalj(container, Number(params.id))
  } else {
    await renderListe(container)
  }
}
