import type { PageRenderFn } from "@/types";
import { renderList } from "./_kastereListe";
import { renderDetail, destroyChart } from "./_kastereDetalj";

export const render: PageRenderFn = async (container, params) => {
  destroyChart();
  if (params.id) {
    await renderDetail(container, Number(params.id));
  } else {
    await renderList(container);
  }
};
