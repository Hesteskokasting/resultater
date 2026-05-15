export function createErrorBanner(message: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'feil'
  p.textContent = message
  return p
}
