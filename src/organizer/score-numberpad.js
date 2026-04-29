export function opnNumberpad(p1Namn, p2Namn, s1Init, s2Init, onLagre) {
  let s1 = s1Init
  let s2 = s2Init
  let steg = 0 // 0 = P1, 1 = P2 (mobil)

  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: '#1e4976', color: 'white',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 8px 24px', overflowY: 'auto',
  })

  function tegn() {
    overlay.innerHTML = ''
    const isMobil = window.matchMedia('(max-width: 767px)').matches
    const visP1 = !isMobil || steg === 0
    const visP2 = !isMobil || steg === 1

    // X-knapp
    const xBtn = lagEl('button', 'X', {
      position: 'absolute', top: '10px', right: '14px',
      background: 'none', border: 'none', color: 'white',
      fontSize: '1.3rem', cursor: 'pointer', lineHeight: '1', padding: '4px 8px',
    })
    xBtn.addEventListener('click', () => document.body.removeChild(overlay))
    overlay.appendChild(xBtn)

    // Lagre-knapp
    const lagreBtn = lagEl('button', 'Lagre', {
      margin: '0 auto 16px', padding: '8px 40px',
      fontSize: '1rem', fontWeight: '700',
      background: 'white', color: '#1e4976',
      border: 'none', borderRadius: '6px', cursor: 'pointer',
    })
    lagreBtn.addEventListener('click', () => { document.body.removeChild(overlay); onLagre(s1, s2) })
    overlay.appendChild(lagreBtn)

    // Pads
    const wrap = lagEl('div', null, {
      display: 'flex', gap: '32px', justifyContent: 'center',
      width: '100%', maxWidth: '1200px', flexWrap: 'wrap',
    })
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
      const navBtn = lagEl('button', steg === 0 ? 'Neste →' : '← Tilbake', {
        marginTop: '16px', padding: '10px 32px', fontSize: '1rem',
        background: 'rgba(255,255,255,0.15)', color: 'white',
        border: '1px solid white', borderRadius: '6px', cursor: 'pointer',
      })
      navBtn.addEventListener('click', () => { steg ^= 1; tegn() })
      overlay.appendChild(navBtn)
    }
  }

  tegn()
  document.body.appendChild(overlay)
}

function lagPad(namn, initScore) {
  const pad = lagEl('div', null, {
    background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
    padding: '16px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
    minWidth: '300px', flex: '1', maxWidth: '520px',
  })

  pad.appendChild(lagEl('h3', namn, {
    margin: '0', fontSize: '1.5rem', textAlign: 'center',
  }))

  const scoreEl = lagEl('div', String(initScore), {
    fontSize: '5rem', fontWeight: '700', lineHeight: '1', margin: '8px 0',
  })
  scoreEl.dataset.scoreEl = '1'
  pad.appendChild(scoreEl)

  const resetBtn = lagEl('button', 'Reset', {
    padding: '4px 20px', background: 'rgba(255,255,255,0.25)',
    color: 'white', border: 'none', borderRadius: '4px',
    cursor: 'pointer', fontSize: '0.85rem',
    opacity: initScore === 0 ? '0.4' : '1',
  })
  resetBtn.disabled = initScore === 0
  resetBtn.dataset.resetBtn = '1'
  pad.appendChild(resetBtn)

  const grid = lagEl('div', null, {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px', width: '100%', marginTop: '4px',
  })
  for (let i = 1; i <= 9; i++) {
    const btn = lagEl('button', String(i), NUM_BTN_STIL)
    btn.dataset.val = String(i)
    grid.appendChild(btn)
  }
  // 0-rad: mellomrom, 0, mellomrom
  grid.appendChild(document.createElement('div'))
  const nulBtn = lagEl('button', '0', NUM_BTN_STIL)
  nulBtn.dataset.val = '0'
  grid.appendChild(nulBtn)
  grid.appendChild(document.createElement('div'))

  pad.appendChild(grid)
  return pad
}

function fiksKnappar(pad, getScore, setScore) {
  const scoreEl = pad.querySelector('[data-score-el]')
  const resetBtn = pad.querySelector('[data-reset-btn]')

  for (const btn of pad.querySelectorAll('[data-val]')) {
    btn.addEventListener('click', () => {
      const curr = getScore()
      const ny = curr === 0 ? Number(btn.dataset.val) : parseInt(String(curr) + btn.dataset.val)
      setScore(ny)
      scoreEl.textContent = ny
      resetBtn.disabled = false
      resetBtn.style.opacity = '1'
    })
  }

  resetBtn.addEventListener('click', () => {
    setScore(0)
    scoreEl.textContent = '0'
    resetBtn.disabled = true
    resetBtn.style.opacity = '0.4'
  })
}

function lagEl(tag, tekst, stils) {
  const el = document.createElement(tag)
  if (tekst != null) el.textContent = tekst
  if (stils) Object.assign(el.style, stils)
  return el
}

const NUM_BTN_STIL = {
  padding: '20px', fontSize: '1.7rem', fontWeight: '600',
  background: 'white', color: '#1e4976',
  border: 'none', borderRadius: '8px', cursor: 'pointer',
}
