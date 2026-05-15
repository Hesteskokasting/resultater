import { escHtml } from './escHtml'

export function errMsg(e: unknown): string {
  return e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : 'Ukjend feil'
}

export function lagFormRadHtml(label: string, inputHtml: string): string {
  return `<div class="mb-3"><label class="form-label fw-semibold">${escHtml(label)}</label>${inputHtml}</div>`
}

export function visLagreFeil(container: HTMLElement, melding: string): void {
  let el = container.querySelector<HTMLDivElement>('.admin-feil')
  if (!el) {
    el = document.createElement('div')
    el.className = 'alert alert-danger admin-feil mt-3 d-none'
    container.querySelector('form')?.append(el)
  }
  el.textContent = melding
  el.classList.remove('d-none')
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

export function visSuksess(container: HTMLElement, melding: string): void {
  let el = container.querySelector<HTMLDivElement>('.admin-suksess')
  if (!el) {
    el = document.createElement('div')
    el.className = 'alert alert-success admin-suksess mt-3 d-none'
    container.querySelector('form')?.append(el)
  }
  el.textContent = melding
  el.classList.remove('d-none')
  const elRef = el
  setTimeout(() => { elRef.classList.add('d-none') }, 4000)
}
