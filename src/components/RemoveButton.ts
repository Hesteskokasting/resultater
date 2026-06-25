interface RemoveButtonProps {
  title?: string
  onClick: () => void
}

export function createRemoveButton({ title = 'Fjern', onClick }: RemoveButtonProps): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.innerHTML = '&times;'
  btn.className = 'btn btn-sm rounded-circle p-0 lh-1 remove-btn'
  btn.title = title
  btn.addEventListener('click', e => { e.stopPropagation(); onClick() })
  return btn
}
