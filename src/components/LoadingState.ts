export function createLoadingState(message = 'Laster…'): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'laster'
  p.textContent = message
  return p
}
