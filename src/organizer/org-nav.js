const faner = [
  { nøkkel: 'info',              label: 'Info' },
  { nøkkel: 'spillere',      label: 'Spelarar' },
  { nøkkel: 'innledende',    label: 'Innledande' },
  { nøkkel: 'avsluttende',   label: 'Avsluttande' },
  { nøkkel: 'innstillinger', label: 'Innstillingar' },
]

const ADMIN_FANER = new Set(['innstillinger'])

export function renderOrgNav(stevneid, aktiv, visFull = true, basePath = 'organizer') {
  const items = faner
    .filter(f => visFull || !ADMIN_FANER.has(f.nøkkel))
    .map(({ nøkkel, label }) => `
      <li class="nav-item">
        <a class="nav-link${aktiv === nøkkel ? ' active' : ''}"
           href="#/stevne/${stevneid}/${basePath}/${nøkkel}">${label}</a>
      </li>`).join('')
  return `<ul class="nav nav-tabs mb-3">${items}</ul>`
}
