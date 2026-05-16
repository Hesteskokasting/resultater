let _container: HTMLElement | null = null

function getContainer(): HTMLElement {
  if (!_container) {
    _container = document.createElement('div')
    _container.id = 'toast-container'
    document.body.appendChild(_container)
  }
  return _container
}

export function showToast(message: string, type: 'error' | 'success' | 'info' = 'info'): void {
  const el = document.createElement('div')
  el.className = `toast-item toast-${type}`
  el.textContent = message
  el.addEventListener('click', () => el.remove())
  getContainer().appendChild(el)
  setTimeout(() => { el.remove() }, 4000)
}
