import { renderOrgNav } from './org-nav.js'

export async function render(container, { id } = {}) {
  container.innerHTML = `
    <div class="container-fluid py-3">
      ${renderOrgNav(Number(id), 'avsluttende')}
      <div class="alert alert-info mt-3">Avsluttande fase kjem snart.</div>
    </div>
  `
}
