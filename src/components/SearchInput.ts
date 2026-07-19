export interface SearchInputProps {
  placeholder: string
  /** Initial value — pass persisted filter state so back-navigation restores it. */
  value?: string
  /** 'filter' matches the tl-select filter rows (default); 'form' matches bootstrap forms. */
  variant?: 'filter' | 'form'
  /** Fires on every keystroke (live filtering). Omit to bind externally via the returned element. */
  onInput?: (text: string) => void
}

export function createSearchInput({ placeholder, value = '', variant = 'filter', onInput }: SearchInputProps): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'search'
  // Width cap (.search-input) only applies in filter rows; bootstrap forms keep full width.
  input.className = variant === 'form' ? 'form-control' : 'tl-select search-input'
  input.placeholder = placeholder
  input.setAttribute('aria-label', placeholder)
  input.value = value
  if (onInput) input.addEventListener('input', () => onInput(input.value))
  return input
}
