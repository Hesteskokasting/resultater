import { escHtml } from './escHtml.js'

export function lagFormRadHtml(label: string, inputHtml: string): string {
  return `<div class="mb-3"><label class="form-label fw-semibold">${escHtml(label)}</label>${inputHtml}</div>`
}

export function visLagreFeil(container: HTMLElement, melding: string): void {
  let el = container.querySelector<HTMLDivElement>('.admin-feil')
  if (!el) {
    el = document.createElement('div')
    el.className = 'alert alert-danger admin-feil mt-3'
    container.querySelector('form')?.append(el)
  }
  el.textContent = melding
  el.style.display = ''
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

export function visSuksess(container: HTMLElement, melding: string): void {
  let el = container.querySelector<HTMLDivElement>('.admin-suksess')
  if (!el) {
    el = document.createElement('div')
    el.className = 'alert alert-success admin-suksess mt-3'
    container.querySelector('form')?.append(el)
  }
  el.textContent = melding
  el.style.display = ''
  const elRef = el
  setTimeout(() => { elRef.style.display = 'none' }, 4000)
}
