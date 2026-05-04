import { supabase } from '../supabase.js'

const POENG_VERDIAR = [1, 2, 3, 4, 6]

export async function renderScoreboard(container, kamp, p1ks, p2ks, { erArrangor = false, erDeltakar = false, onBekreft = null, omgangEl = null } = {}) {
  let omgangar = []
  let val1 = null
  let val2 = null
  let kampFerdig = kamp.er_bekreftet

  const kanRedigere = erArrangor || (erDeltakar && !kamp.er_bekreftet)

  await lastOmgangar()
  tegn()

  const spelarIds = [p1ks?.id, p2ks?.id].filter(Boolean)

  let kanal = null
  if (!kanRedigere && spelarIds.length) {
    kanal = supabase
      .channel(`scoreboard-kamp-${kamp.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kamp_omgang' },
        async (payload) => {
          const endraId = payload.new?.kamp_spelar_id ?? payload.old?.kamp_spelar_id
          if (!endraId || spelarIds.includes(endraId)) {
            await lastOmgangar()
            tegn()
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kamp', filter: `id=eq.${kamp.id}` },
        async (payload) => {
          if (payload.new?.er_bekreftet) {
            kamp.er_bekreftet = true
            await lastOmgangar()
            tegn()
          }
        }
      )
      .subscribe()
  }

  const pollId = setInterval(async () => {
    if (document.visibilityState !== 'visible') return
    if (kanRedigere && (val1 !== null || val2 !== null)) return
    await lastOmgangar()
    tegn()
  }, 3000)

  window.addEventListener('hashchange', () => {
    clearInterval(pollId)
    if (kanal) supabase.removeChannel(kanal)
  }, { once: true })

  async function lastOmgangar() {
    const ids = [p1ks?.id, p2ks?.id].filter(Boolean)
    if (!ids.length) return

    const { data } = await supabase
      .from('kamp_omgang')
      .select('id, kamp_spelar_id, omgang, score, antall_ringer')
      .in('kamp_spelar_id', ids)
      .order('omgang')

    const omgMap = {}
    for (const r of (data ?? [])) {
      if (!omgMap[r.omgang]) omgMap[r.omgang] = { omgang: r.omgang, s1: 0, s2: 0, r1: 0, r2: 0 }
      if (r.kamp_spelar_id === p1ks?.id) {
        omgMap[r.omgang].s1 = r.score ?? 0
        omgMap[r.omgang].r1 = r.antall_ringer ?? 0
      } else {
        omgMap[r.omgang].s2 = r.score ?? 0
        omgMap[r.omgang].r2 = r.antall_ringer ?? 0
      }
    }
    omgangar = Object.values(omgMap).sort((a, b) => a.omgang - b.omgang)

    const [t1, t2] = beregnTotalar()
    kampFerdig = erVinnarKondisjon(t1, t2) || kamp.er_bekreftet
  }

  function beregnTotalar() {
    return [
      omgangar.reduce((s, o) => s + o.s1, 0),
      omgangar.reduce((s, o) => s + o.s2, 0),
    ]
  }

  function beregnRingarTotalar() {
    return [
      omgangar.reduce((s, o) => s + o.r1, 0),
      omgangar.reduce((s, o) => s + o.r2, 0),
    ]
  }

  function erVinnarKondisjon(t1, t2) {
    if (kamp.fase === 'innledende') return t1 >= 21 || t2 >= 21
    return (t1 >= 21 && t1 - t2 >= 2) || (t2 >= 21 && t2 - t1 >= 2)
  }

  function noverAndeOmgang() {
    return omgangar.length > 0 ? omgangar[omgangar.length - 1].omgang + 1 : 1
  }

  function bereknKnappStatus(v1, v2) {
    const p1Dis = new Set()
    const p2Dis = new Set()

    if (v1 !== null) {
      POENG_VERDIAR.forEach(n => { if (n !== v1) p1Dis.add(n) })
      if ([1, 2, 4].includes(v1)) POENG_VERDIAR.forEach(n => p2Dis.add(n))
      else [1, 2, 4].forEach(n => p2Dis.add(n))
    }

    if (v2 !== null) {
      POENG_VERDIAR.forEach(n => { if (n !== v2) p2Dis.add(n) })
      if ([1, 2, 4].includes(v2)) POENG_VERDIAR.forEach(n => p1Dis.add(n))
      else [1, 2, 4].forEach(n => p1Dis.add(n))
    }

    return { p1Dis, p2Dis }
  }

  function p1Namn() {
    return p1ks?.kaster ? `${p1ks.kaster.fornavn} ${p1ks.kaster.etternavn}` : 'Spelar 1'
  }

  function p2Namn() {
    return p2ks?.kaster ? `${p2ks.kaster.fornavn} ${p2ks.kaster.etternavn}` : 'Spelar 2'
  }

  function tegn() {
    container.innerHTML = ''

    const [t1, t2] = beregnTotalar()
    const [r1, r2] = beregnRingarTotalar()
    const nr = noverAndeOmgang()
    const { p1Dis, p2Dis } = bereknKnappStatus(val1, val2)
    const kanNeste = kanRedigere && !kampFerdig && (val1 !== null || val2 !== null)
    const kanBekrefte = kampFerdig && !kamp.er_bekreftet && (erArrangor || erDeltakar) && !!onBekreft
    const maxRinger = omgangar.length*2

    if (omgangEl) {
      omgangEl.textContent = kamp.er_bekreftet ? 'Fullført' : (kampFerdig ? 'Ferdig' : `Omgang ${nr}`)
    }

    const wrap = lagEl('div', null, 'sb-wrap')
    wrap.appendChild(lagSpelerPanel(p1Namn(), t1, r1, maxRinger, val1, p1Dis, !kanRedigere, 1))
    wrap.appendChild(lagSpelerPanel(p2Namn(), t2, r2, maxRinger, val2, p2Dis, !kanRedigere, 2))
    container.appendChild(wrap)

    if (kanRedigere) {
      const angreRad = lagEl('div', null, 'sb-angre-rad')

      if (omgangar.length > 0) {
        const omgBtns = lagEl('div', null, 'sb-omg-btns')
        for (const omg of omgangar) {
          const btn = lagEl('button', String(omg.omgang), 'sb-omg-btn')
          btn.title = `Slett frå omgang ${omg.omgang}`
          btn.addEventListener('click', () => slettOmgangFra(omg.omgang))
          omgBtns.appendChild(btn)
        }
        angreRad.appendChild(omgBtns)
      }

      const angreBtn = lagEl('button', '↩', 'sb-angre-btn')
      angreBtn.title = 'Angre val for denne omgangen'
      angreBtn.disabled = val1 === null && val2 === null
      angreBtn.addEventListener('click', () => { val1 = null; val2 = null; tegn() })
      angreRad.appendChild(angreBtn)

      container.appendChild(angreRad)
    }

    if (kanBekrefte) {
      const bekreftBtn = lagEl('button', 'Bekreft kamp', 'sb-neste-btn sb-neste-btn--bekreft')
      bekreftBtn.addEventListener('click', async () => {
        bekreftBtn.disabled = true
        bekreftBtn.textContent = 'Lagrar…'
        await onBekreft()
      })
      container.appendChild(bekreftBtn)
    } else if (kanRedigere) {
      const nesteBtn = lagEl('button', 'Neste omgang', 'sb-neste-btn')
      nesteBtn.disabled = !kanNeste
      nesteBtn.addEventListener('click', nesteOmgang)
      container.appendChild(nesteBtn)
    }

    container.querySelectorAll('[data-spelar]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spelar = parseInt(btn.dataset.spelar)
        const v = parseInt(btn.dataset.val)
        if (spelar === 1) val1 = v
        else val2 = v
        tegn()
      })
    })
  }

  function lagSpelerPanel(namn, total, ringer, maxRinger, val, disabledSet, lesvisning, spelarNr) {
    const panel = lagEl('div', null, 'sb-spelar-panel')
    panel.appendChild(lagEl('div', namn, 'sb-spelar-namn'))
    panel.appendChild(lagEl('div', String(total), 'sb-score'))

    const ringerPct = maxRinger > 0 ? Math.round(ringer / maxRinger * 100) : 0
    panel.appendChild(lagEl('p', `Ring: ${ringer} av ${maxRinger} ( ${ringerPct}% )`, 'sb-ringer-info'))

    if (!lesvisning) {
      const knappar = lagEl('div', null, 'sb-knappar')
      for (const n of POENG_VERDIAR) {
        const btn = lagEl('button', String(n), 'sb-poeng-btn')
        btn.dataset.spelar = String(spelarNr)
        btn.dataset.val = String(n)
        if (disabledSet.has(n)) btn.disabled = true
        if (val === n) btn.classList.add('sb-valgt')
        knappar.appendChild(btn)
      }
      panel.appendChild(knappar)
    }
    return panel
  }

  async function nesteOmgang() {
    const nr = noverAndeOmgang()
    const s1 = val1 ?? 0
    const s2 = val2 ?? 0
    const r1 = s1 === 3 ? 1 : s1 === 6 ? 2 : 0
    const r2 = s2 === 3 ? 1 : s2 === 6 ? 2 : 0

    const inserts = []
    if (p1ks?.id) inserts.push({ kamp_spelar_id: p1ks.id, omgang: nr, score: s1, antall_ringer: r1 })
    if (p2ks?.id) inserts.push({ kamp_spelar_id: p2ks.id, omgang: nr, score: s2, antall_ringer: r2 })

    const { error } = await supabase.from('kamp_omgang').insert(inserts)
    if (error) { alert('Feil ved lagring: ' + error.message); return }

    omgangar.push({ omgang: nr, s1, s2, r1, r2 })
    val1 = null
    val2 = null

    const [newT1, newT2] = beregnTotalar()
    if (erVinnarKondisjon(newT1, newT2)) kampFerdig = true

    tegn()
  }

  async function slettOmgangFra(fraNr) {
    if (!confirm(`Slett omgang ${fraNr} og alle etter? Dette kan ikkje angrast.`)) return

    const ids = [p1ks?.id, p2ks?.id].filter(Boolean)
    const { error } = await supabase.from('kamp_omgang').delete()
      .in('kamp_spelar_id', ids)
      .gte('omgang', fraNr)

    if (error) { alert('Feil ved sletting: ' + error.message); return }

    omgangar = omgangar.filter(o => o.omgang < fraNr)
    val1 = null
    val2 = null

    const [t1, t2] = beregnTotalar()
    kampFerdig = erVinnarKondisjon(t1, t2)
    tegn()
  }
}

function lagEl(tag, tekst, klasse) {
  const el = document.createElement(tag)
  if (tekst != null) el.textContent = tekst
  if (klasse) el.className = klasse
  return el
}
