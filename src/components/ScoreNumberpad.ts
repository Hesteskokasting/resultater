import { createEl } from '@/utils/createEl'

export function showNumberpad(
  p1Namn: string,
  p2Namn: string,
  s1Init: number,
  s2Init: number,
  onLagre: (s1: number, s2: number) => Promise<void>,
): void {
  let s1 = s1Init
  let s2 = s2Init
  let steg = 0 // 0 = P1, 1 = P2 (mobil)

  const overlay = document.createElement('div')
  overlay.className = 'np-overlay'

  function tegn(): void {
    overlay.innerHTML = ''
    const isMobil = window.matchMedia('(max-width: 767px)').matches
    const visP1 = !isMobil || steg === 0
    const visP2 = !isMobil || steg === 1

    const xBtn = createEl('button', 'X', 'np-lukk-btn')
    xBtn.addEventListener('click', () => document.body.removeChild(overlay))
    overlay.appendChild(xBtn)

    const lagreBtn = createEl('button', 'Lagre', 'np-lagre-btn') as HTMLButtonElement
    lagreBtn.addEventListener('click', async () => {
      lagreBtn.disabled = true
      lagreBtn.textContent = 'Lagrer…'
      await onLagre(s1, s2)
      document.body.removeChild(overlay)
    })
    overlay.appendChild(lagreBtn)

    const wrap = createEl('div', null, 'np-wrap')
    overlay.appendChild(wrap)

    if (visP1) {
      const pad1 = lagPad(p1Namn, s1)
      wrap.appendChild(pad1)
      fiksKnappar(pad1, () => s1, v => { s1 = v })
    }
    if (visP2) {
      const pad2 = lagPad(p2Namn, s2)
      wrap.appendChild(pad2)
      fiksKnappar(pad2, () => s2, v => { s2 = v })
    }

    if (isMobil) {
      const navBtn = createEl('button', steg === 0 ? 'Neste →' : '← Tilbake', 'np-nav-btn')
      navBtn.addEventListener('click', () => { steg ^= 1; tegn() })
      overlay.appendChild(navBtn)
    }
  }

  tegn()
  document.body.appendChild(overlay)
}

function lagPad(navn: string, initScore: number): HTMLElement {
  const pad = createEl('div', null, 'np-pad')

  pad.appendChild(createEl('h3', navn, 'np-navn'))

  const scoreEl = createEl('div', String(initScore), 'np-score')
  scoreEl.dataset.scoreEl = '1'
  pad.appendChild(scoreEl)

  const resetBtn = createEl('button', 'Reset', 'np-reset-btn') as HTMLButtonElement
  resetBtn.disabled = initScore === 0
  resetBtn.dataset.resetBtn = '1'
  pad.appendChild(resetBtn)

  const grid = createEl('div', null, 'np-grid')
  for (let i = 1; i <= 9; i++) {
    const btn = createEl('button', String(i), 'np-num-btn') as HTMLButtonElement
    btn.dataset.val = String(i)
    grid.appendChild(btn)
  }
  grid.appendChild(document.createElement('div'))
  const nulBtn = createEl('button', '0', 'np-num-btn') as HTMLButtonElement
  nulBtn.dataset.val = '0'
  grid.appendChild(nulBtn)
  grid.appendChild(document.createElement('div'))

  pad.appendChild(grid)
  return pad
}

function fiksKnappar(
  pad: HTMLElement,
  getScore: () => number,
  setScore: (v: number) => void,
): void {
  const scoreEl = pad.querySelector<HTMLElement>('[data-score-el]')!
  const resetBtn = pad.querySelector<HTMLButtonElement>('[data-reset-btn]')!

  for (const btn of pad.querySelectorAll<HTMLButtonElement>('[data-val]')) {
    btn.addEventListener('click', () => {
      const curr = getScore()
      const ny = curr === 0 ? Number(btn.dataset.val) : parseInt(String(curr) + btn.dataset.val)
      setScore(ny)
      scoreEl.textContent = String(ny)
      resetBtn.disabled = false
    })
  }

  resetBtn.addEventListener('click', () => {
    setScore(0)
    scoreEl.textContent = '0'
    resetBtn.disabled = true
  })
}

