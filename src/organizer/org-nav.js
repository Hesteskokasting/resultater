const faner = [
  { nøkkel: 'info',              label: 'Info' },
  { nøkkel: 'spillere',      label: 'Spelarar' },
  { nøkkel: 'innledende',    label: 'Innledande' },
  { nøkkel: 'avsluttende',   label: 'Avsluttande' },
  { nøkkel: 'innstillinger', label: 'Innstillingar' },
]

export function renderOrgNav(stevneid, aktiv) {
  const items = faner.map(({ nøkkel, label }) => `
    <li class="nav-item">
      <a class="nav-link${aktiv === nøkkel ? ' active' : ''}"
         href="#/stevne/${stevneid}/organizer/${nøkkel}">${label}</a>
    </li>`).join('')
  return `<ul class="nav nav-tabs mb-3">${items}</ul>`
}
