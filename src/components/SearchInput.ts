export interface SearchInputProps {
  placeholder: string
  /** Initial value — pass persisted filter state so back-navigation restores it. */
  value?: string
  /** Fires on every keystroke (live filtering). */
  onInput: (text: string) => void
}

export function createSearchInput({ placeholder, value = '', onInput }: SearchInputProps): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'search'
  input.className = 'tl-select'
  input.placeholder = placeholder
  input.setAttribute('aria-label', placeholder)
  input.value = value
  input.addEventListener('input', () => onInput(input.value))
  return input
}
