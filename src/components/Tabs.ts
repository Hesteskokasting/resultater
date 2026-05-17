export interface TabDef {
  id: string
  label: string
  panel: HTMLElement
}

export interface TabsProps {
  tabs: TabDef[]
  activeId?: string
}

export function createTabs({ tabs, activeId }: TabsProps): HTMLElement {
  if (!tabs.length) return document.createElement('div')

  let activeIdx = Math.max(tabs.findIndex(t => t.id === (activeId ?? '')), 0)

  const wrapper = document.createElement('div')

  const nav = document.createElement('ul')
  nav.className = 'nav nav-tabs mb-3'
  nav.setAttribute('role', 'tablist')

  const buttons: HTMLButtonElement[] = []
  const panelWrappers: HTMLElement[] = []

  tabs.forEach((tab, i) => {
    const isActive = i === activeIdx

    const li = document.createElement('li')
    li.className = 'nav-item'
    li.setAttribute('role', 'presentation')

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'nav-link' + (isActive ? ' active' : '')
    btn.id = `tab-${tab.id}`
    btn.setAttribute('role', 'tab')
    btn.setAttribute('aria-selected', String(isActive))
    btn.setAttribute('aria-controls', `tabpanel-${tab.id}`)
    btn.setAttribute('tabindex', isActive ? '0' : '-1')
    btn.textContent = tab.label
    li.appendChild(btn)
    nav.appendChild(li)
    buttons.push(btn)

    const panelEl = document.createElement('div')
    panelEl.id = `tabpanel-${tab.id}`
    panelEl.setAttribute('role', 'tabpanel')
    panelEl.setAttribute('aria-labelledby', `tab-${tab.id}`)
    if (!isActive) panelEl.classList.add('d-none')
    panelEl.appendChild(tab.panel)
    panelWrappers.push(panelEl)
  })

  function activate(idx: number): void {
    activeIdx = idx
    buttons.forEach((btn, i) => {
      const active = i === idx
      btn.classList.toggle('active', active)
      btn.setAttribute('aria-selected', String(active))
      btn.setAttribute('tabindex', active ? '0' : '-1')
    })
    panelWrappers.forEach((panel, i) => {
      panel.classList.toggle('d-none', i !== idx)
    })
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(i))
  })

  nav.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const next = e.key === 'ArrowRight'
      ? (activeIdx + 1) % tabs.length
      : (activeIdx - 1 + tabs.length) % tabs.length
    activate(next)
    buttons[next].focus()
  })

  wrapper.appendChild(nav)
  panelWrappers.forEach(p => wrapper.appendChild(p))

  return wrapper
}
