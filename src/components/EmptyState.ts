export function createEmptyState(message: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'empty-state'
  p.textContent = message
  return p
}
