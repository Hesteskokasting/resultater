export function createErrorBanner(message: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = 'error-banner'
  p.textContent = message
  return p
}
